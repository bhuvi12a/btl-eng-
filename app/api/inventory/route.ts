import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { inventoryStock, inventoryTransactions, products, warehouses, auditLogs } from '@/lib/db/schema';
import { createStockTransactionSchema } from '@/lib/validations/phase2';
import { requireAuth, getCurrentUser } from '@/lib/auth/session';
import { eq, desc, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const auth = await requireAuth(['super_admin', 'admin', 'manager']);
        if (auth.errorResponse) return auth.errorResponse;

        const { searchParams } = new URL(req.url);
        const warehouseId = searchParams.get('warehouseId');
        const lowStockOnly = searchParams.get('lowStock') === 'true';

        const stockItems = await db.query.inventoryStock.findMany({
            with: {
                product: {
                    with: {
                        category: true,
                    },
                },
                warehouse: true,
            },
            orderBy: [desc(inventoryStock.updatedAt)],
            limit: 150,
        });

        // Filter and calculate low-stock alerts
        const enriched = stockItems
            .filter((item) => {
                if (warehouseId && item.warehouseId !== warehouseId) return false;
                if (lowStockOnly) {
                    const qty = parseFloat(item.quantity);
                    const reorder = parseFloat(item.product?.reorderPoint || '0');
                    return qty <= reorder;
                }
                return true;
            })
            .map((item) => {
                const qty = parseFloat(item.quantity);
                const reorder = parseFloat(item.product?.reorderPoint || '0');
                const isLowStock = qty <= reorder;
                return {
                    ...item,
                    isLowStock,
                };
            });

        // Recent 20 transactions
        const recentTransactions = await db.query.inventoryTransactions.findMany({
            orderBy: [desc(inventoryTransactions.createdAt)],
            with: {
                product: true,
                fromWarehouse: true,
                toWarehouse: true,
                performedBy: {
                    columns: {
                        fullName: true,
                        email: true,
                    },
                },
            },
            limit: 20,
        });

        return NextResponse.json({
            success: true,
            stock: enriched,
            transactions: recentTransactions,
        });
    } catch (err: any) {
        console.error('Failed to fetch inventory:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to fetch inventory' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const auth = await requireAuth(['super_admin', 'admin', 'manager']);
        if (auth.errorResponse) return auth.errorResponse;
        const user = auth.user;

        const body = await req.json();

        const parsed = createStockTransactionSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Validation failed',
                    issues: parsed.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        const data = parsed.data;
        const qtyNum = parseFloat(data.quantity);
        if (isNaN(qtyNum) || qtyNum <= 0) {
            return NextResponse.json(
                { success: false, error: 'Quantity must be greater than zero' },
                { status: 400 }
            );
        }

        // Target warehouse
        const targetWarehouseId = data.toWarehouseId || data.fromWarehouseId;
        if (!targetWarehouseId) {
            return NextResponse.json(
                { success: false, error: 'A warehouse must be specified for this transaction' },
                { status: 400 }
            );
        }

        // Insert transaction audit record
        const [tx] = await db
            .insert(inventoryTransactions)
            .values({
                transactionType: data.transactionType,
                productId: data.productId,
                fromWarehouseId: data.fromWarehouseId || null,
                toWarehouseId: data.toWarehouseId || null,
                quantity: data.quantity,
                unitCost: data.unitCost || '0.00',
                referenceType: data.referenceType || 'manual_adjustment',
                referenceId: data.referenceId || null,
                batchNumber: data.batchNumber || null,
                notes: data.notes || null,
                performedById: user?.id || null,
            })
            .returning();

        // Update inventoryStock
        // Find existing record
        const existingStock = await db.query.inventoryStock.findFirst({
            where: and(
                eq(inventoryStock.productId, data.productId),
                eq(inventoryStock.warehouseId, targetWarehouseId)
            ),
        });

        let newQty = 0;
        if (['purchase_inward', 'production_return'].includes(data.transactionType)) {
            newQty = (existingStock ? parseFloat(existingStock.quantity) : 0) + qtyNum;
        } else if (['sales_dispatch', 'production_issue'].includes(data.transactionType)) {
            newQty = (existingStock ? parseFloat(existingStock.quantity) : 0) - qtyNum;
            if (newQty < 0) newQty = 0;
        } else if (data.transactionType === 'adjustment') {
            newQty = qtyNum; // Set directly
        } else {
            newQty = (existingStock ? parseFloat(existingStock.quantity) : 0) + qtyNum;
        }

        if (existingStock) {
            await db
                .update(inventoryStock)
                .set({
                    quantity: newQty.toFixed(2),
                    batchNumber: data.batchNumber || existingStock.batchNumber,
                    binLocation: data.binLocation || existingStock.binLocation,
                    updatedAt: new Date(),
                })
                .where(eq(inventoryStock.id, existingStock.id));
        } else {
            await db.insert(inventoryStock).values({
                productId: data.productId,
                warehouseId: targetWarehouseId,
                quantity: newQty.toFixed(2),
                binLocation: data.binLocation || null,
                batchNumber: data.batchNumber || null,
            });
        }

        if (user) {
            await db.insert(auditLogs).values({
                userId: user.id,
                userEmail: user.email,
                action: 'stock_transaction',
                entity: 'inventory',
                entityId: tx.id,
                newValue: { transaction: tx, newQuantity: newQty },
            }).catch(() => {});
        }

        return NextResponse.json({
            success: true,
            transaction: tx,
            newQuantity: newQty.toFixed(2),
        }, { status: 201 });
    } catch (err: any) {
        console.error('Failed to record stock transaction:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to record stock transaction' },
            { status: 500 }
        );
    }
}


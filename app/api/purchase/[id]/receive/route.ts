import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { purchaseOrders, inventoryStock, inventoryTransactions, auditLogs } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth/session';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const currentUser = await getCurrentUser();
        const body = await req.json();
        const { warehouseId, receivedItems, batchNumber, binLocation, notes } = body;

        const po = await db.query.purchaseOrders.findFirst({
            where: eq(purchaseOrders.id, id),
            with: { supplier: true },
        });

        if (!po) {
            return NextResponse.json({ success: false, error: 'Purchase Order not found' }, { status: 404 });
        }

        const currentItems = Array.isArray(po.items) ? (po.items as any[]) : [];
        let allFulfilled = true;

        const updatedItems = currentItems.map((item) => {
            const receivedNow = Number(receivedItems?.[item.partNumber] || 0);
            const totalReceived = Number(item.receivedQuantity || 0) + receivedNow;
            if (totalReceived < item.quantity) {
                allFulfilled = false;
            }
            return {
                ...item,
                receivedQuantity: totalReceived,
            };
        });

        // Update PO Status
        const newStatus = allFulfilled ? 'received' : 'partially_received';
        await db
            .update(purchaseOrders)
            .set({
                status: newStatus,
                items: updatedItems,
                updatedAt: new Date(),
            })
            .where(eq(purchaseOrders.id, id));

        // For each item received, update or create inventory_stock & inventory_transactions
        if (warehouseId && receivedItems) {
            for (const item of updatedItems) {
                const receivedQty = Number(receivedItems[item.partNumber] || 0);
                if (receivedQty > 0 && item.productId) {
                    // Check if stock row exists
                    const existingStock = await db.query.inventoryStock.findFirst({
                        where: and(
                            eq(inventoryStock.productId, item.productId),
                            eq(inventoryStock.warehouseId, warehouseId)
                        ),
                    });

                    if (existingStock) {
                        const newStockQty = parseFloat(existingStock.quantity) + receivedQty;
                        await db
                            .update(inventoryStock)
                            .set({
                                quantity: newStockQty.toFixed(2),
                                batchNumber: batchNumber || existingStock.batchNumber,
                                binLocation: binLocation || existingStock.binLocation,
                                updatedAt: new Date(),
                            })
                            .where(eq(inventoryStock.id, existingStock.id));
                    } else {
                        await db.insert(inventoryStock).values({
                            productId: item.productId,
                            warehouseId,
                            quantity: receivedQty.toFixed(2),
                            batchNumber: batchNumber || 'LOT-INWARD',
                            binLocation: binLocation || 'BAY1-RAW',
                        });
                    }

                    // Log transaction
                    await db.insert(inventoryTransactions).values({
                        transactionType: 'purchase_inward',
                        productId: item.productId,
                        toWarehouseId: warehouseId,
                        quantity: receivedQty.toFixed(2),
                        unitCost: String(item.unitPrice || '0.00'),
                        referenceType: 'purchase_order',
                        referenceId: po.poNumber,
                        notes: notes || `Inward receipt from ${po.supplier.companyName}`,
                        performedById: currentUser?.id || null,
                    });
                }
            }
        }

        // Audit Log
        if (currentUser) {
            await db.insert(auditLogs).values({
                userId: currentUser.id,
                userEmail: currentUser.email,
                action: 'PURCHASE_GRN_INWARD',
                entity: 'purchase_orders',
                entityId: id,
                newValue: {
                    poNumber: po.poNumber,
                    newStatus,
                    receivedItems,
                },
            });
        }

        return NextResponse.json({
            success: true,
            message: `GRN Inward successfully posted! Warehouse stock incremented for ${po.poNumber}.`,
            status: newStatus,
        });
    } catch (err: any) {
        console.error('Failed to receive purchase order:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to process inward receipt' },
            { status: 500 }
        );
    }
}


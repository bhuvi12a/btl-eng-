import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { purchaseOrders, suppliers, products, auditLogs } from '@/lib/db/schema';
import { requireAuth, getCurrentUser } from '@/lib/auth/session';
import { desc, eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const auth = await requireAuth(['super_admin', 'admin', 'manager']);
        if (auth.errorResponse) return auth.errorResponse;

        const { searchParams } = new URL(req.url);
        const supplierId = searchParams.get('supplier_id');
        const status = searchParams.get('status');

        const conditions = [];
        if (supplierId) {
            conditions.push(eq(purchaseOrders.supplierId, supplierId));
        }
        if (status && status !== 'all') {
            conditions.push(eq(purchaseOrders.status, status));
        }

        const poList = await db.query.purchaseOrders.findMany({
            where: conditions.length > 0 ? and(...conditions) : undefined,
            with: {
                supplier: true,
            },
            orderBy: [desc(purchaseOrders.orderDate), desc(purchaseOrders.createdAt)],
            limit: 100,
        });

        const totalProcurementValue = poList.reduce(
            (sum, po) => sum + parseFloat(po.totalAmount || '0'),
            0
        );

        return NextResponse.json({
            success: true,
            purchaseOrders: poList,
            summary: {
                totalCount: poList.length,
                totalValue: totalProcurementValue,
                pendingCount: poList.filter((p) => p.status === 'sent' || p.status === 'partially_received').length,
                receivedCount: poList.filter((p) => p.status === 'received').length,
            },
        });
    } catch (err: any) {
        console.error('Failed to fetch purchase orders:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to fetch purchase orders' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const auth = await requireAuth(['super_admin', 'admin', 'manager']);
        if (auth.errorResponse) return auth.errorResponse;
        const currentUser = auth.user;

        const body = await req.json();
        const {
            supplierId,
            orderDate,
            expectedDeliveryDate,
            items,
            notes,
        } = body;

        if (!supplierId || !items || items.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Supplier and items are required' },
                { status: 400 }
            );
        }

        let subtotal = 0;
        const processedItems = items.map((item: any) => {
            const qty = Number(item.quantity) || 1;
            const price = Number(item.unitPrice) || 0;
            const lineTotal = qty * price;
            subtotal += lineTotal;

            return {
                productId: item.productId || null,
                partNumber: item.partNumber || 'RAW-MAT',
                description: item.description || item.partNumber,
                quantity: qty,
                unitPrice: price,
                receivedQuantity: 0,
                uom: item.uom || 'KG',
                lineTotal,
            };
        });

        const taxAmount = subtotal * 0.18; // 18% GST standard for raw steel/tools
        const totalAmount = subtotal + taxAmount;

        const year = new Date().getFullYear();
        const randomSeq = Math.floor(1000 + Math.random() * 9000);
        const poNumber = `PO-BTL-${year}-${randomSeq}`;

        const [created] = await db
            .insert(purchaseOrders)
            .values({
                poNumber,
                supplierId,
                orderDate: orderDate || new Date().toISOString().split('T')[0],
                expectedDeliveryDate: expectedDeliveryDate || new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
                subtotal: subtotal.toFixed(2),
                taxAmount: taxAmount.toFixed(2),
                totalAmount: totalAmount.toFixed(2),
                status: 'sent',
                items: processedItems,
                notes: notes || null,
                createdById: currentUser?.id || null,
            })
            .returning();

        // Audit Log
        if (currentUser) {
            await db.insert(auditLogs).values({
                userId: currentUser.id,
                userEmail: currentUser.email,
                action: 'PURCHASE_ORDER_ISSUED',
                entity: 'purchase_orders',
                entityId: created.id,
                newValue: created,
            });
        }

        return NextResponse.json({
            success: true,
            purchaseOrder: created,
            message: `Purchase Order ${poNumber} generated and issued to vendor.`,
        }, { status: 201 });
    } catch (err: any) {
        console.error('Failed to create purchase order:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to create purchase order' },
            { status: 500 }
        );
    }
}


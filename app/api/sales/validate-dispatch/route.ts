import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { inventoryStock, products } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const auth = await requireAuth(['super_admin', 'admin', 'manager']);
        if (auth.errorResponse) return auth.errorResponse;

        const body = await req.json();
        const { items } = body as { items: Array<{ productId: string; quantity: number }> };

        if (!items || items.length === 0) {
            return NextResponse.json({ success: false, error: 'No order items provided' }, { status: 400 });
        }

        const blockedItems: Array<{
            partNumber: string;
            productName: string;
            required: number;
            available: number;
            shortfall: number;
        }> = [];

        for (const item of items) {
            const product = await db.query.products.findFirst({
                where: eq(products.id, item.productId),
            });

            // Find stock across warehouses
            const stocks = await db.query.inventoryStock.findMany({
                where: eq(inventoryStock.productId, item.productId),
            });

            const totalAvailable = stocks.reduce((sum, s) => sum + parseFloat(s.quantity || '0'), 0);

            if (totalAvailable < item.quantity) {
                blockedItems.push({
                    partNumber: product?.partNumber || 'Unknown Part',
                    productName: product?.name || 'Machined Component',
                    required: item.quantity,
                    available: totalAvailable,
                    shortfall: item.quantity - totalAvailable,
                });
            }
        }

        if (blockedItems.length > 0) {
            return NextResponse.json({
                success: false,
                canDispatch: false,
                isBlocked: true,
                message: `Invoice Creation Blocked: ${blockedItems.length} component(s) have insufficient finished goods inventory. Production run required before generating tax invoice.`,
                blockedItems,
            }, { status: 422 });
        }

        return NextResponse.json({
            success: true,
            canDispatch: true,
            isBlocked: false,
            message: 'All line items verified in inventory. Invoice generation and dispatch challan approved.',
        });
    } catch (err: any) {
        console.error('Dispatch validation error:', err);
        return NextResponse.json({ success: false, error: err?.message || 'Failed to validate dispatch' }, { status: 500 });
    }
}


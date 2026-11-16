import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customers, products, inventoryStock, auditLogs } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth/session';
import { desc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// Mock storage for demo orders in memory/session if sales_orders table is not yet modeled
// In a full production implementation, these persist to sales_orders
interface SalesOrderRecord {
    id: string;
    orderNumber: string;
    customerName: string;
    customerGstin: string;
    orderDate: string;
    deliveryDate: string;
    status: 'draft' | 'confirmed' | 'dispatched' | 'cancelled';
    items: Array<{
        productId: string;
        partNumber: string;
        name: string;
        quantity: number;
        unitPrice: number;
        availableStock: number;
    }>;
    totalAmount: number;
    dispatchBlocked: boolean;
    blockReason?: string;
}

// Initial demonstration orders representing OEM Automotive contracts in Hosur
let memoryOrders: SalesOrderRecord[] = [
    {
        id: 'ord-001',
        orderNumber: 'SO-BTL-2026-081',
        customerName: 'Ashok Leyland Limited - Hosur Unit II',
        customerGstin: '33AAACA1234F1Z8',
        orderDate: '2026-11-10',
        deliveryDate: '2026-11-20',
        status: 'confirmed',
        items: [
            {
                productId: 'p-1',
                partNumber: 'BTL-AERO-01',
                name: 'Titanium Ti-6Al-4V Flange Fitting',
                quantity: 50,
                unitPrice: 3450,
                availableStock: 12, // Insufficient -> triggers dispatch blocking
            },
        ],
        totalAmount: 172500,
        dispatchBlocked: true,
        blockReason: 'Shortfall: 38 units required. Current stock in Hosur Central Warehouse is only 12 units.',
    },
    {
        id: 'ord-002',
        orderNumber: 'SO-BTL-2026-082',
        customerName: 'Sundaram Fasteners Precision Division',
        customerGstin: '33AABCS5678B1Z2',
        orderDate: '2026-11-11',
        deliveryDate: '2026-11-18',
        status: 'confirmed',
        items: [
            {
                productId: 'p-2',
                partNumber: 'BTL-VMC-04',
                name: 'EN24 Hardened Spline Drive Shaft',
                quantity: 25,
                unitPrice: 2200,
                availableStock: 40, // Sufficient -> dispatch permitted
            },
        ],
        totalAmount: 55000,
        dispatchBlocked: false,
    },
];

export async function GET() {
    try {
        const custList = await db.query.customers.findMany({
            orderBy: [desc(customers.createdAt)],
            limit: 50,
        });

        const prodList = await db.query.products.findMany({
            orderBy: [desc(products.createdAt)],
            limit: 50,
        });

        return NextResponse.json({
            success: true,
            orders: memoryOrders,
            customers: custList,
            products: prodList,
        });
    } catch (err: any) {
        console.error('Failed to fetch sales data:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to fetch sales orders' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const currentUser = await getCurrentUser();
        const body = await req.json();
        const { customerName, customerGstin, items, deliveryDate } = body;

        if (!customerName || !items || items.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Customer and items are required' },
                { status: 400 }
            );
        }

        const newId = `ord-${Date.now()}`;
        const orderNumber = `SO-BTL-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

        let totalAmount = 0;
        let isAnyBlocked = false;
        let blockNotes: string[] = [];

        // Validate inventory for each item
        const processedItems = items.map((item: any) => {
            const qty = Number(item.quantity) || 1;
            const price = Number(item.unitPrice) || 0;
            const stock = Number(item.availableStock) || 0;
            totalAmount += qty * price;

            if (stock < qty) {
                isAnyBlocked = true;
                blockNotes.push(`${item.partNumber}: required ${qty}, available ${stock} (Shortfall: ${qty - stock})`);
            }

            return {
                productId: item.productId || `p-${Math.random()}`,
                partNumber: item.partNumber,
                name: item.name,
                quantity: qty,
                unitPrice: price,
                availableStock: stock,
            };
        });

        const newOrder: SalesOrderRecord = {
            id: newId,
            orderNumber,
            customerName,
            customerGstin: customerGstin || '33AAACB9999Z1Z0',
            orderDate: new Date().toISOString().split('T')[0],
            deliveryDate: deliveryDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
            status: 'confirmed',
            items: processedItems,
            totalAmount,
            dispatchBlocked: isAnyBlocked,
            blockReason: isAnyBlocked ? blockNotes.join('; ') : undefined,
        };

        memoryOrders.unshift(newOrder);

        // Record audit trail
        if (currentUser) {
            await db.insert(auditLogs).values({
                userId: currentUser.id,
                userEmail: currentUser.email,
                action: 'SALES_ORDER_CREATED',
                entity: 'sales_orders',
                entityId: newId,
                newValue: newOrder,
            });
        }

        return NextResponse.json({
            success: true,
            order: newOrder,
            message: isAnyBlocked
                ? 'Sales Order generated. Note: Dispatch is automatically blocked due to insufficient finished goods stock.'
                : 'Sales Order generated and cleared for immediate dispatch.',
        }, { status: 201 });
    } catch (err: any) {
        console.error('Failed to create sales order:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to create sales order' },
            { status: 500 }
        );
    }
}


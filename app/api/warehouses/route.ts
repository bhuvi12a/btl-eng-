import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { warehouses } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/session';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const initialWarehouses = [
    { name: 'Hosur Main Plant Store', code: 'WH-MAIN', location: 'Hosur Manufacturing Facility, Tamil Nadu' },
    { name: 'Raw Material Yard (Steel/Al/SS)', code: 'WH-RM', location: 'Hosur Plant Bay 1, Tamil Nadu' },
    { name: 'Finished Components Vault', code: 'WH-FG', location: 'Hosur Plant Bay 3, Tamil Nadu' },
];

export async function GET() {
    try {
        const auth = await requireAuth(['super_admin', 'admin', 'manager']);
        if (auth.errorResponse) return auth.errorResponse;

        let items = await db.query.warehouses.findMany({
            where: eq(warehouses.isActive, true),
            orderBy: [desc(warehouses.createdAt)],
        });

        if (items.length === 0) {
            await db.insert(warehouses).values(initialWarehouses).onConflictDoNothing();
            items = await db.query.warehouses.findMany({
                where: eq(warehouses.isActive, true),
            });
        }

        return NextResponse.json({ success: true, warehouses: items });
    } catch (err: any) {
        console.error('Failed to fetch warehouses:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to fetch warehouses' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const auth = await requireAuth(['super_admin', 'admin', 'manager']);
        if (auth.errorResponse) return auth.errorResponse;

        const body = await req.json();
        const { name, code, location } = body;

        if (!name || !code) {
            return NextResponse.json(
                { success: false, error: 'Warehouse name and code are required' },
                { status: 400 }
            );
        }

        const [created] = await db
            .insert(warehouses)
            .values({
                name,
                code,
                location: location || 'Hosur Plant, Tamil Nadu',
            })
            .returning();

        return NextResponse.json({ success: true, warehouse: created }, { status: 201 });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to create warehouse' },
            { status: 500 }
        );
    }
}


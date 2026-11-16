import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { suppliers, auditLogs } from '@/lib/db/schema';
import { createSupplierSchema } from '@/lib/validations/phase2';
import { getCurrentUser } from '@/lib/auth/session';
import { ilike, or, eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status');

        const conditions = [];

        if (search) {
            conditions.push(
                or(
                    ilike(suppliers.companyName, `%${search}%`),
                    ilike(suppliers.contactPerson, `%${search}%`),
                    ilike(suppliers.email, `%${search}%`),
                    ilike(suppliers.phone, `%${search}%`),
                    ilike(suppliers.city, `%${search}%`)
                )
            );
        }

        if (status && ['active', 'inactive', 'blacklisted'].includes(status)) {
            conditions.push(eq(suppliers.status, status as 'active' | 'inactive' | 'blacklisted'));
        }

        const data = await db.query.suppliers.findMany({
            where: conditions.length > 0 ? (conditions.length === 1 ? conditions[0] : undefined) : undefined,
            orderBy: [desc(suppliers.createdAt)],
            limit: 100,
        });

        return NextResponse.json({
            success: true,
            count: data.length,
            suppliers: data,
        });
    } catch (err: any) {
        console.error('Failed to fetch suppliers:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to fetch suppliers' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        const body = await req.json();

        const parsed = createSupplierSchema.safeParse(body);
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

        const [created] = await db
            .insert(suppliers)
            .values(parsed.data)
            .returning();

        if (user) {
            await db.insert(auditLogs).values({
                userId: user.id,
                userEmail: user.email,
                action: 'create',
                entity: 'supplier',
                entityId: created.id,
                newValue: created,
            }).catch(() => {});
        }

        return NextResponse.json({
            success: true,
            supplier: created,
        }, { status: 201 });
    } catch (err: any) {
        console.error('Failed to create supplier:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to create supplier' },
            { status: 500 }
        );
    }
}


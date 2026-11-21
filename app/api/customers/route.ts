import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customers, auditLogs } from '@/lib/db/schema';
import { createCustomerSchema } from '@/lib/validations/phase2';
import { requireAuth, getCurrentUser } from '@/lib/auth/session';
import { ilike, or, eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const auth = await requireAuth(['super_admin', 'admin', 'manager']);
        if (auth.errorResponse) return auth.errorResponse;

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status');

        let query = db.select().from(customers);

        const conditions = [];

        if (search) {
            conditions.push(
                or(
                    ilike(customers.companyName, `%${search}%`),
                    ilike(customers.contactPerson, `%${search}%`),
                    ilike(customers.email, `%${search}%`),
                    ilike(customers.phone, `%${search}%`),
                    ilike(customers.city, `%${search}%`),
                    ilike(customers.gstNumber, `%${search}%`)
                )
            );
        }

        if (status && ['active', 'inactive', 'lead'].includes(status)) {
            conditions.push(eq(customers.status, status as 'active' | 'inactive' | 'lead'));
        }

        const data = await db.query.customers.findMany({
            where: conditions.length > 0 ? (conditions.length === 1 ? conditions[0] : undefined) : undefined,
            orderBy: [desc(customers.createdAt)],
            limit: 100,
        });

        return NextResponse.json({
            success: true,
            count: data.length,
            customers: data,
        });
    } catch (err: any) {
        console.error('Failed to fetch customers:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to fetch customers' },
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

        const parsed = createCustomerSchema.safeParse(body);
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
            .insert(customers)
            .values({
                ...parsed.data,
                assignedToId: user?.id || null,
            })
            .returning();

        // Audit log
        if (user) {
            await db.insert(auditLogs).values({
                userId: user.id,
                userEmail: user.email,
                action: 'create',
                entity: 'customer',
                entityId: created.id,
                newValue: created,
            }).catch(() => {});
        }

        return NextResponse.json({
            success: true,
            customer: created,
        }, { status: 201 });
    } catch (err: any) {
        console.error('Failed to create customer:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to create customer' },
            { status: 500 }
        );
    }
}


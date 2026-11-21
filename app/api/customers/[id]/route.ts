import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customers, auditLogs } from '@/lib/db/schema';
import { updateCustomerSchema } from '@/lib/validations/phase2';
import { requireAuth, getCurrentUser } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireAuth(['super_admin', 'admin', 'manager']);
        if (auth.errorResponse) return auth.errorResponse;

        const { id } = await context.params;
        const customer = await db.query.customers.findFirst({
            where: eq(customers.id, id),
        });

        if (!customer) {
            return NextResponse.json(
                { success: false, error: 'Customer not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, customer });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to fetch customer' },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireAuth(['super_admin', 'admin', 'manager']);
        if (auth.errorResponse) return auth.errorResponse;
        const user = auth.user;

        const { id } = await context.params;
        const body = await req.json();

        const parsed = updateCustomerSchema.safeParse(body);
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

        const existing = await db.query.customers.findFirst({
            where: eq(customers.id, id),
        });

        if (!existing) {
            return NextResponse.json(
                { success: false, error: 'Customer not found' },
                { status: 404 }
            );
        }

        const [updated] = await db
            .update(customers)
            .set({
                ...parsed.data,
                updatedAt: new Date(),
            })
            .where(eq(customers.id, id))
            .returning();

        if (user) {
            await db.insert(auditLogs).values({
                userId: user.id,
                userEmail: user.email,
                action: 'update',
                entity: 'customer',
                entityId: id,
                oldValue: existing,
                newValue: updated,
            }).catch(() => {});
        }

        return NextResponse.json({ success: true, customer: updated });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to update customer' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireAuth(['super_admin', 'admin']);
        if (auth.errorResponse) return auth.errorResponse;
        const user = auth.user;

        const { id } = await context.params;

        const existing = await db.query.customers.findFirst({
            where: eq(customers.id, id),
        });

        if (!existing) {
            return NextResponse.json(
                { success: false, error: 'Customer not found' },
                { status: 404 }
            );
        }

        await db.delete(customers).where(eq(customers.id, id));

        if (user) {
            await db.insert(auditLogs).values({
                userId: user.id,
                userEmail: user.email,
                action: 'delete',
                entity: 'customer',
                entityId: id,
                oldValue: existing,
            }).catch(() => {});
        }

        return NextResponse.json({ success: true, message: 'Customer deleted successfully' });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to delete customer' },
            { status: 500 }
        );
    }
}


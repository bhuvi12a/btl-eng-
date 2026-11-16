import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { suppliers, auditLogs } from '@/lib/db/schema';
import { updateSupplierSchema } from '@/lib/validations/phase2';
import { getCurrentUser } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const supplier = await db.query.suppliers.findFirst({
            where: eq(suppliers.id, id),
        });

        if (!supplier) {
            return NextResponse.json(
                { success: false, error: 'Supplier not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, supplier });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to fetch supplier' },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const user = await getCurrentUser();
        const body = await req.json();

        const parsed = updateSupplierSchema.safeParse(body);
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

        const existing = await db.query.suppliers.findFirst({
            where: eq(suppliers.id, id),
        });

        if (!existing) {
            return NextResponse.json(
                { success: false, error: 'Supplier not found' },
                { status: 404 }
            );
        }

        const [updated] = await db
            .update(suppliers)
            .set({
                ...parsed.data,
                updatedAt: new Date(),
            })
            .where(eq(suppliers.id, id))
            .returning();

        if (user) {
            await db.insert(auditLogs).values({
                userId: user.id,
                userEmail: user.email,
                action: 'update',
                entity: 'supplier',
                entityId: id,
                oldValue: existing,
                newValue: updated,
            }).catch(() => {});
        }

        return NextResponse.json({ success: true, supplier: updated });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to update supplier' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const user = await getCurrentUser();

        const existing = await db.query.suppliers.findFirst({
            where: eq(suppliers.id, id),
        });

        if (!existing) {
            return NextResponse.json(
                { success: false, error: 'Supplier not found' },
                { status: 404 }
            );
        }

        await db.delete(suppliers).where(eq(suppliers.id, id));

        if (user) {
            await db.insert(auditLogs).values({
                userId: user.id,
                userEmail: user.email,
                action: 'delete',
                entity: 'supplier',
                entityId: id,
                oldValue: existing,
            }).catch(() => {});
        }

        return NextResponse.json({ success: true, message: 'Supplier deleted successfully' });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to delete supplier' },
            { status: 500 }
        );
    }
}


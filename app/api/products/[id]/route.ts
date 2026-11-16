import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, auditLogs } from '@/lib/db/schema';
import { updateProductSchema } from '@/lib/validations/phase2';
import { getCurrentUser } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const product = await db.query.products.findFirst({
            where: eq(products.id, id),
            with: {
                category: true,
            },
        });

        if (!product) {
            return NextResponse.json(
                { success: false, error: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, product });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to fetch product' },
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

        const parsed = updateProductSchema.safeParse(body);
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

        const existing = await db.query.products.findFirst({
            where: eq(products.id, id),
        });

        if (!existing) {
            return NextResponse.json(
                { success: false, error: 'Product not found' },
                { status: 404 }
            );
        }

        const [updated] = await db
            .update(products)
            .set({
                ...parsed.data,
                updatedAt: new Date(),
            })
            .where(eq(products.id, id))
            .returning();

        if (user) {
            await db.insert(auditLogs).values({
                userId: user.id,
                userEmail: user.email,
                action: 'update',
                entity: 'product',
                entityId: id,
                oldValue: existing,
                newValue: updated,
            }).catch(() => {});
        }

        return NextResponse.json({ success: true, product: updated });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to update product' },
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

        const existing = await db.query.products.findFirst({
            where: eq(products.id, id),
        });

        if (!existing) {
            return NextResponse.json(
                { success: false, error: 'Product not found' },
                { status: 404 }
            );
        }

        await db.delete(products).where(eq(products.id, id));

        if (user) {
            await db.insert(auditLogs).values({
                userId: user.id,
                userEmail: user.email,
                action: 'delete',
                entity: 'product',
                entityId: id,
                oldValue: existing,
            }).catch(() => {});
        }

        return NextResponse.json({ success: true, message: 'Product deleted successfully' });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to delete product' },
            { status: 500 }
        );
    }
}


import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, auditLogs } from '@/lib/db/schema';
import { createProductSchema } from '@/lib/validations/phase2';
import { getCurrentUser } from '@/lib/auth/session';
import { ilike, or, eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const categoryId = searchParams.get('categoryId');
        const material = searchParams.get('material');

        const allProducts = await db.query.products.findMany({
            orderBy: [desc(products.createdAt)],
            with: {
                category: true,
                images: true,
                documents: true,
            },
            limit: 100,
        });

        // Filter in memory or query
        const filtered = allProducts.filter((p) => {
            if (search) {
                const s = search.toLowerCase();
                const matches =
                    p.partNumber.toLowerCase().includes(s) ||
                    p.name.toLowerCase().includes(s) ||
                    (p.drawingNumber && p.drawingNumber.toLowerCase().includes(s)) ||
                    (p.hsnCode && p.hsnCode.toLowerCase().includes(s));
                if (!matches) return false;
            }
            if (categoryId && p.categoryId !== categoryId) return false;
            if (material && p.materialType !== material) return false;
            return true;
        });

        return NextResponse.json({
            success: true,
            count: filtered.length,
            products: filtered,
        });
    } catch (err: any) {
        console.error('Failed to fetch products:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to fetch products' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        const body = await req.json();

        const parsed = createProductSchema.safeParse(body);
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
            .insert(products)
            .values(parsed.data)
            .returning();

        if (user) {
            await db.insert(auditLogs).values({
                userId: user.id,
                userEmail: user.email,
                action: 'create',
                entity: 'product',
                entityId: created.id,
                newValue: created,
            }).catch(() => {});
        }

        return NextResponse.json({
            success: true,
            product: created,
        }, { status: 201 });
    } catch (err: any) {
        console.error('Failed to create product:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to create product' },
            { status: 500 }
        );
    }
}


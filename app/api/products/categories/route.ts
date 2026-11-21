import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { productCategories } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/session';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const initialCategories = [
    { name: 'Turned Components', code: 'CAT-TRN', description: 'Precision CNC lathe turned pins, shafts, bushings, and fittings', imageUrl: '/btl-precision-parts.jpg' },
    { name: 'Milled Housings & Manifolds', code: 'CAT-MIL', description: 'VMC milled engine brackets, sensor housings, and manifold blocks', imageUrl: '/cnc-machining.png' },
    { name: '4th-Axis Rotary Parts', code: 'CAT-4AX', description: 'Complex multi-angle indexable parts, helical cams, and splines', imageUrl: '/btl-precision-parts.jpg' },
    { name: 'Automotive Bushings & Spacers', code: 'CAT-BSH', description: 'Hardened steel and bronze automotive transmission bushings', imageUrl: '/automotive-parts.png' },
    { name: 'Aerospace Fasteners & Flanges', code: 'CAT-AER', description: 'Stainless steel and aerospace grade aluminium flanges', imageUrl: '/aerospace-parts.png' },
    { name: 'Raw Material Billets & Bars', code: 'CAT-RAW', description: 'Solid round bars of EN8, EN24, SS304, SS316, and Aluminium 6061', imageUrl: '/factory-floor.png' },
];

export async function GET() {
    try {
        let categories = await db.query.productCategories.findMany({
            where: eq(productCategories.isActive, true),
            orderBy: [desc(productCategories.createdAt)],
        });

        if (categories.length === 0) {
            await db.insert(productCategories).values(initialCategories).onConflictDoNothing();
            categories = await db.query.productCategories.findMany({
                where: eq(productCategories.isActive, true),
            });
        }

        return NextResponse.json({ success: true, categories });
    } catch (err: any) {
        console.error('Failed to fetch categories:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const auth = await requireAuth(['super_admin', 'admin', 'manager']);
        if (auth.errorResponse) return auth.errorResponse;

        const body = await req.json();
        const { name, code, description, imageUrl } = body;

        if (!name || !code) {
            return NextResponse.json(
                { success: false, error: 'Category name and code are required' },
                { status: 400 }
            );
        }

        const [created] = await db
            .insert(productCategories)
            .values({
                name,
                code: code.toUpperCase(),
                description: description || null,
                imageUrl: imageUrl || null,
            })
            .returning();

        return NextResponse.json({ success: true, category: created }, { status: 201 });
    } catch (err: any) {
        console.error('Failed to create product category:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to create category' },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, name, code, description, imageUrl } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Category ID is required' },
                { status: 400 }
            );
        }

        const [updated] = await db
            .update(productCategories)
            .set({
                ...(name && { name }),
                ...(code && { code: code.toUpperCase() }),
                ...(description !== undefined && { description }),
                ...(imageUrl !== undefined && { imageUrl }),
            })
            .where(eq(productCategories.id, id))
            .returning();

        return NextResponse.json({ success: true, category: updated });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to update category' },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, productImages, productDocuments, billOfMaterials, auditLogs } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth/session';
import { eq, desc } from 'drizzle-orm';

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
                images: {
                    orderBy: [desc(productImages.isPrimary), desc(productImages.createdAt)],
                },
                documents: {
                    orderBy: [desc(productDocuments.createdAt)],
                },
            },
        });

        if (!product) {
            return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }

        // Fetch BOM components
        const bomItems = await db.query.billOfMaterials.findMany({
            where: eq(billOfMaterials.parentProductId, id),
            with: {
                rawMaterial: true,
            },
        });

        return NextResponse.json({
            success: true,
            product,
            images: product.images || [],
            documents: product.documents || [],
            bomItems: bomItems || [],
        });
    } catch (err: any) {
        console.error('Failed to fetch product details:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to fetch product details' },
            { status: 500 }
        );
    }
}


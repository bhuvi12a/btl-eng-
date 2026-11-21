import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { productImages, products, auditLogs } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth/session';
import { eq, and } from 'drizzle-orm';
import { unlink } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';

// DELETE a product gallery image
export async function DELETE(
    _req: NextRequest,
    context: { params: Promise<{ id: string; imageId: string }> }
) {
    try {
        const currentUser = await getCurrentUser();
        if (currentUser && !['super_admin', 'admin', 'quality_inspector', 'engineer', 'store_manager'].includes(currentUser.role)) {
            return NextResponse.json(
                { success: false, error: 'Forbidden. Insufficient permissions to delete product images.' },
                { status: 403 }
            );
        }

        const { id: productId, imageId } = await context.params;

        const img = await db.query.productImages.findFirst({
            where: and(eq(productImages.id, imageId), eq(productImages.productId, productId)),
        });

        if (!img) {
            return NextResponse.json({ success: false, error: 'Image not found' }, { status: 404 });
        }

        // Delete from database
        await db.delete(productImages).where(eq(productImages.id, imageId));

        // Try deleting from local disk if stored locally
        if (img.imageUrl.startsWith('/uploads/products/')) {
            try {
                const localPath = join(process.cwd(), 'public', img.imageUrl.replace(/^\//, ''));
                await unlink(localPath);
            } catch (err) {
                console.warn('Could not unlink local file:', err);
            }
        }

        // Check if this was the mainImageUrl on products table
        const product = await db.query.products.findFirst({
            where: eq(products.id, productId),
        });

        if (product && product.mainImageUrl === img.imageUrl) {
            // Find another image to set as main image, or set to null
            const remainingImages = await db.query.productImages.findMany({
                where: eq(productImages.productId, productId),
                orderBy: (cols, { desc }) => [desc(cols.isPrimary), desc(cols.createdAt)],
                limit: 1,
            });

            const nextMainUrl = remainingImages.length > 0 ? remainingImages[0].imageUrl : null;
            await db.update(products).set({ mainImageUrl: nextMainUrl, updatedAt: new Date() }).where(eq(products.id, productId));
        }

        try {
            await db.insert(auditLogs).values({
                userId: currentUser?.id || null,
                userEmail: currentUser?.email || 'admin@btl.engineering',
                action: 'PRODUCT_IMAGE_DELETED',
                entity: 'product_images',
                entityId: imageId,
                oldValue: img,
            });
        } catch {}

        return NextResponse.json({
            success: true,
            message: 'Image removed successfully',
        });
    } catch (err: any) {
        console.error('Failed to delete product image:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to delete image' },
            { status: 500 }
        );
    }
}

// PATCH to set an image as primary / main image
export async function PATCH(
    _req: NextRequest,
    context: { params: Promise<{ id: string; imageId: string }> }
) {
    try {
        const currentUser = await getCurrentUser();
        if (currentUser && !['super_admin', 'admin', 'quality_inspector', 'engineer', 'store_manager'].includes(currentUser.role)) {
            return NextResponse.json(
                { success: false, error: 'Forbidden. Insufficient permissions.' },
                { status: 403 }
            );
        }

        const { id: productId, imageId } = await context.params;

        const targetImg = await db.query.productImages.findFirst({
            where: and(eq(productImages.id, imageId), eq(productImages.productId, productId)),
        });

        if (!targetImg) {
            return NextResponse.json({ success: false, error: 'Image not found' }, { status: 404 });
        }

        // Set all other images isPrimary to false
        await db.update(productImages).set({ isPrimary: false }).where(eq(productImages.productId, productId));

        // Set this image to true
        await db.update(productImages).set({ isPrimary: true }).where(eq(productImages.id, imageId));

        // Update product mainImageUrl
        await db.update(products).set({ mainImageUrl: targetImg.imageUrl, updatedAt: new Date() }).where(eq(products.id, productId));

        return NextResponse.json({
            success: true,
            message: 'Primary product image updated successfully',
            imageUrl: targetImg.imageUrl,
        });
    } catch (err: any) {
        console.error('Failed to set primary image:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to update primary image' },
            { status: 500 }
        );
    }
}

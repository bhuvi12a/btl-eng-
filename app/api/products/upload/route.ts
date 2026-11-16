import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { db } from '@/lib/db';
import { products, productImages, productDocuments, auditLogs } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_DOC_TYPES = [
    'application/pdf',
    'application/vnd.ms-excel',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream', // often CAD files (.dwg, .step)
    'text/plain',
];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DOC_SIZE = 25 * 1024 * 1024; // 25MB

export async function POST(req: NextRequest) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !['super_admin', 'admin', 'quality_inspector', 'operator'].includes(currentUser.role)) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized: Admin or Quality/Engineering role required to upload media' },
                { status: 403 }
            );
        }

        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const productId = formData.get('productId') as string | null;
        const uploadType = (formData.get('uploadType') as string) || 'image'; // 'image' or 'document'
        const documentType = (formData.get('documentType') as string) || 'technical_spec';
        const title = (formData.get('title') as string) || (file?.name || 'Technical Document');
        const isPrimary = formData.get('isPrimary') === 'true';

        if (!file || !productId) {
            return NextResponse.json(
                { success: false, error: 'File and target Product ID are required.' },
                { status: 400 }
            );
        }

        // Verify target product exists
        const product = await db.query.products.findFirst({
            where: eq(products.id, productId),
        });

        if (!product) {
            return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }

        // Validation
        if (uploadType === 'image') {
            if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                return NextResponse.json(
                    { success: false, error: `Invalid image type '${file.type}'. Supported formats: JPG, JPEG, PNG, WEBP.` },
                    { status: 400 }
                );
            }
            if (file.size > MAX_IMAGE_SIZE) {
                return NextResponse.json(
                    { success: false, error: `Image file exceeds maximum allowable size of 10 MB (${(file.size / 1024 / 1024).toFixed(1)} MB).` },
                    { status: 400 }
                );
            }
        } else {
            if (file.size > MAX_DOC_SIZE) {
                return NextResponse.json(
                    { success: false, error: `Document file exceeds maximum allowable size of 25 MB (${(file.size / 1024 / 1024).toFixed(1)} MB).` },
                    { status: 400 }
                );
            }
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Sanitize filename & create unique storage path
        const ext = file.name.split('.').pop()?.toLowerCase() || 'dat';
        const sanitizedBase = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
        const filename = `${uploadType}_${Date.now()}_${sanitizedBase}.${ext}`;

        // Save file locally in public/uploads/products/
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'products');
        await mkdir(uploadDir, { recursive: true });
        const filepath = join(uploadDir, filename);
        await writeFile(filepath, buffer);

        const fileUrl = `/uploads/products/${filename}`;

        if (uploadType === 'image') {
            // Record in product_images
            const [createdImage] = await db
                .insert(productImages)
                .values({
                    productId,
                    imageUrl: fileUrl,
                    thumbnailUrl: fileUrl,
                    fileName: file.name,
                    fileSize: file.size,
                    mimeType: file.type,
                    isPrimary,
                    sortOrder: 0,
                    uploadedById: currentUser.id,
                })
                .returning();

            // If designated primary or product has no main image, update products.main_image_url
            if (isPrimary || !product.mainImageUrl) {
                await db
                    .update(products)
                    .set({
                        mainImageUrl: fileUrl,
                        updatedAt: new Date(),
                    })
                    .where(eq(products.id, productId));
            }

            // Write audit log
            await db.insert(auditLogs).values({
                userId: currentUser.id,
                userEmail: currentUser.email,
                action: 'PRODUCT_IMAGE_UPLOADED',
                entity: 'product_images',
                entityId: createdImage.id,
                newValue: createdImage,
            });

            return NextResponse.json({
                success: true,
                message: 'Product image uploaded and attached to gallery successfully.',
                media: createdImage,
            }, { status: 201 });
        } else {
            // Record in product_documents
            const [createdDoc] = await db
                .insert(productDocuments)
                .values({
                    productId,
                    documentType,
                    title,
                    fileUrl,
                    fileName: file.name,
                    fileSize: file.size,
                    mimeType: file.type,
                    revision: 'Rev 0',
                    uploadedById: currentUser.id,
                })
                .returning();

            // Write audit log
            await db.insert(auditLogs).values({
                userId: currentUser.id,
                userEmail: currentUser.email,
                action: 'PRODUCT_DOCUMENT_UPLOADED',
                entity: 'product_documents',
                entityId: createdDoc.id,
                newValue: createdDoc,
            });

            return NextResponse.json({
                success: true,
                message: 'Technical specification / CAD document uploaded successfully.',
                media: createdDoc,
            }, { status: 201 });
        }
    } catch (err: any) {
        console.error('Product media upload failed:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to process file upload' },
            { status: 500 }
        );
    }
}


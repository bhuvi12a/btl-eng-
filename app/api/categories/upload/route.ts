import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Sanitize filename & add timestamp
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const sanitizedBase = file.name
            .replace(/\.[^/.]+$/, '')
            .replace(/[^a-zA-Z0-9_-]/g, '_');
        const filename = `cat_${Date.now()}_${sanitizedBase}.${ext}`;

        const uploadDir = join(process.cwd(), 'public', 'uploads', 'categories');
        await mkdir(uploadDir, { recursive: true });

        const filepath = join(uploadDir, filename);
        await writeFile(filepath, buffer);

        const publicUrl = `/uploads/categories/${filename}`;

        return NextResponse.json({
            success: true,
            url: publicUrl,
            filename,
        });
    } catch (err: any) {
        console.error('Category image upload error:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to upload image' },
            { status: 500 }
        );
    }
}


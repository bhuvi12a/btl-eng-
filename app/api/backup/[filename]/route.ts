import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { BACKUP_DIR } from '@/lib/backup/engine';
import { readFile, stat } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const dynamic = 'force-dynamic';

export async function GET(
    _req: NextRequest,
    context: { params: Promise<{ filename: string }> }
) {
    try {
        const currentUser = await getCurrentUser();
        // Strict guard: Admin only
        if (!currentUser || !['super_admin', 'admin'].includes(currentUser.role)) {
            return NextResponse.json(
                { success: false, error: 'Forbidden: Backup archive downloads are restricted to Administrators.' },
                { status: 403 }
            );
        }

        const { filename } = await context.params;
        // Prevent path traversal
        const safeName = filename.replace(/[^a-zA-Z0-9_.-]/g, '');
        const filePath = join(BACKUP_DIR, safeName);

        if (!existsSync(filePath)) {
            return NextResponse.json({ success: false, error: 'Backup archive not found' }, { status: 404 });
        }

        const fileBuffer = await readFile(filePath);
        const fileStat = await stat(filePath);

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="${safeName}"`,
                'Content-Length': String(fileStat.size),
                'Cache-Control': 'no-store, no-cache, must-revalidate',
            },
        });
    } catch (err: any) {
        console.error('Download failed:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to download backup' },
            { status: 500 }
        );
    }
}

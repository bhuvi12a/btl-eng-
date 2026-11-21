import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { hasModuleAccess } from '@/lib/auth/rbac';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const hasAccess = hasModuleAccess(currentUser.role, 'attendance') || ['admin', 'super_admin', 'hr', 'manager'].includes(currentUser.role);
        if (!hasAccess) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        const key = req.nextUrl.searchParams.get('key');
        if (!key) {
            return NextResponse.json({ success: false, error: 'Key required' }, { status: 400 });
        }

        const safeKey = key.replace(/\.\./g, '');
        const filePath = join(process.cwd(), 'private-storage', 'attendance-evidence', safeKey);

        try {
            const fileStat = await stat(filePath);
            const ext = filePath.split('.').pop()?.toLowerCase();
            const contentType = ext === 'webm' ? 'video/webm' : ext === 'mp4' ? 'video/mp4' : ext === 'png' ? 'image/png' : 'image/jpeg';

            const stream = createReadStream(filePath);
            // @ts-expect-error Node stream to Web ReadableStream
            return new NextResponse(stream, {
                status: 200,
                headers: {
                    'Content-Type': contentType,
                    'Content-Length': fileStat.size.toString(),
                    'Cache-Control': 'private, no-cache, no-store, must-revalidate',
                },
            });
        } catch {
            return NextResponse.json({ success: false, error: 'Evidence file not found' }, { status: 404 });
        }
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
    }
}

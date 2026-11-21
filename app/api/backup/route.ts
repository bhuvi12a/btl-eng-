import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { executeEnterpriseBackup, BACKUP_DIR } from '@/lib/backup/engine';
import { readdir, readFile, stat } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const dynamic = 'force-dynamic';

/**
 * GET: Lists previous backups (Admin only)
 */
export async function GET() {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !['super_admin', 'admin'].includes(currentUser.role)) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized: Backup access is restricted to Administrators.' },
                { status: 403 }
            );
        }

        if (!existsSync(BACKUP_DIR)) {
            return NextResponse.json({ success: true, backups: [] });
        }

        const files = await readdir(BACKUP_DIR);
        const manifestFiles = files.filter((f) => f.endsWith('-manifest.json'));

        const backupList = [];
        for (const mf of manifestFiles) {
            try {
                const content = await readFile(join(BACKUP_DIR, mf), 'utf-8');
                const manifest = JSON.parse(content);
                const zipName = `${manifest.backupId}.zip`;
                const zipPath = join(BACKUP_DIR, zipName);

                let byteSize = 0;
                if (existsSync(zipPath)) {
                    const st = await stat(zipPath);
                    byteSize = st.size;
                }

                backupList.push({
                    backupId: manifest.backupId,
                    createdAt: manifest.createdAt,
                    initiatedBy: manifest.initiatedBy,
                    totalTables: manifest.database.totalTables,
                    totalRecords: manifest.database.totalRecords,
                    totalFiles: manifest.storage.totalFiles,
                    byteSize,
                    checksum: manifest.integrity.packageSha256,
                    downloadUrl: `/api/backup/${zipName}`,
                });
            } catch (err) {
                console.error('Error reading manifest:', mf, err);
            }
        }

        backupList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json({ success: true, backups: backupList });
    } catch (err: any) {
        console.error('Failed to list backups:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to list backups' },
            { status: 500 }
        );
    }
}

/**
 * POST: Initiates a new comprehensive "Backup All" operation (Admin only)
 */
export async function POST(req: NextRequest) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !['super_admin', 'admin'].includes(currentUser.role)) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized: Only Administrators can create backups.' },
                { status: 403 }
            );
        }

        const result = await executeEnterpriseBackup({
            adminUser: {
                id: currentUser.id,
                email: currentUser.email,
                fullName: currentUser.fullName,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Enterprise Backup completed successfully.',
            backup: {
                backupId: result.backupId,
                archiveFileName: result.archiveFileName,
                createdAt: result.manifest.createdAt,
                totalTables: result.manifest.database.totalTables,
                totalRecords: result.manifest.database.totalRecords,
                totalStorageFiles: result.manifest.storage.totalFiles,
                storageBytes: result.manifest.storage.totalBytes,
                packageSha256: result.manifest.integrity.packageSha256,
                downloadUrl: `/api/backup/${result.archiveFileName}`,
            },
        });
    } catch (err: any) {
        console.error('Backup generation failed:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Backup generation failed' },
            { status: 500 }
        );
    }
}

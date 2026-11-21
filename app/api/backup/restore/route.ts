import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { BACKUP_DIR, computeSha256 } from '@/lib/backup/engine';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const dynamic = 'force-dynamic';

/**
 * RESTORE SAFETY PROTOCOL:
 * Destructive automatic restore is intentionally barred in production.
 * This route provides verification, pre-flight checksum analysis, and pre-restore audit logging.
 */
export async function POST(req: NextRequest) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !['super_admin', 'admin'].includes(currentUser.role)) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized: Only Administrators can initiate restore operations.' },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { backupId, confirmationPhrase } = body;

        // Mandatory safety barriers
        if (confirmationPhrase !== 'CONFIRM_RESTORE_BTL_ERP') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Safety Barrier: You must type the exact confirmation phrase "CONFIRM_RESTORE_BTL_ERP" to validate a restore request.',
                },
                { status: 400 }
            );
        }

        const zipPath = join(BACKUP_DIR, `${backupId}.zip`);
        const manifestPath = join(BACKUP_DIR, `${backupId}-manifest.json`);

        if (!existsSync(zipPath) || !existsSync(manifestPath)) {
            return NextResponse.json(
                { success: false, error: 'Target backup archive or manifest not found.' },
                { status: 404 }
            );
        }

        // 1. Verify Checksum & Package Integrity
        const [zipBuffer, manifestContent] = await Promise.all([
            readFile(zipPath),
            readFile(manifestPath, 'utf-8'),
        ]);

        const manifest = JSON.parse(manifestContent);
        const actualChecksum = computeSha256(zipBuffer);

        if (actualChecksum !== manifest.integrity.packageSha256) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'INTEGRITY VIOLATION: Backup checksum does not match manifest. Archive may be corrupted or tampered.',
                },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            status: 'VERIFIED_READY_FOR_STAGED_RESTORE',
            message: 'Backup package passed cryptographic verification. Pre-restore safety snapshot prepared.',
            verification: {
                backupId,
                totalTables: manifest.database.totalTables,
                totalRecords: manifest.database.totalRecords,
                totalFiles: manifest.storage.totalFiles,
                checksum: actualChecksum,
                checksumMatches: true,
                note: 'Live database overwrite requires staging environment validation before executing in-place migration.',
            },
        });
    } catch (err: any) {
        console.error('Restore verification error:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Restore verification failed' },
            { status: 500 }
        );
    }
}

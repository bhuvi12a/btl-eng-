import { createAdminClient } from '@/lib/supabase/admin';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export const ATTENDANCE_BUCKET = 'attendance-evidence';

// Validate file magic bytes to guarantee file signature matches format
export function validateMediaMagicBytes(buffer: Buffer, mimeType: string): boolean {
    if (!buffer || buffer.length < 4) return false;

    const lowerMime = (mimeType || '').toLowerCase();

    // JPEG: FF D8 FF
    if (lowerMime.includes('jpeg') || lowerMime.includes('jpg')) {
        return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    }

    // PNG: 89 50 4E 47
    if (lowerMime.includes('png')) {
        return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
    }

    // WEBP: starts with RIFF and bytes 8-11 are WEBP
    if (lowerMime.includes('webp')) {
        return buffer.length >= 12 && buffer.slice(0, 4).toString('ascii') === 'RIFF' && buffer.slice(8, 12).toString('ascii') === 'WEBP';
    }

    // WebM / Matroska: 1A 45 DF A3 (EBML Header)
    const isWebmHeader = buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3;
    if (lowerMime.includes('webm')) {
        return isWebmHeader;
    }

    // MP4 / QuickTime: 'ftyp' box signature usually at bytes 4-8
    const isMp4Header = buffer.length >= 8 && buffer.slice(4, 8).toString('ascii') === 'ftyp';
    if (lowerMime.includes('mp4')) {
        return isMp4Header;
    }

    // Generic video fallback: allow if buffer matches WebM or MP4 magic bytes
    if (lowerMime.startsWith('video/')) {
        return isWebmHeader || isMp4Header;
    }

    return false;
}

/**
 * Uploads attendance evidence (photo or video) to private Supabase Storage.
 * If Supabase Service Role is in placeholder mode, safely falls back to local secure storage.
 */
export async function uploadAttendanceEvidence({
    employeeCode,
    date,
    punchType,
    mediaType,
    fileBuffer,
    mimeType,
}: {
    employeeCode: string;
    date: string;
    punchType: 'check_in' | 'check_out';
    mediaType: 'selfie' | 'video';
    fileBuffer: Buffer;
    mimeType: string;
}): Promise<{ storageKey: string }> {
    const ext = mimeType.includes('webm') ? 'webm' : mimeType.includes('mp4') ? 'mp4' : mimeType.includes('png') ? 'png' : 'jpg';
    const timestamp = Date.now();
    const cleanCode = employeeCode.replace(/[^a-zA-Z0-9_-]/g, '_');
    const objectKey = `${cleanCode}/${date}/${punchType}_${mediaType}_${timestamp}.${ext}`;

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const isSupabaseConfigured = serviceKey && serviceKey !== 'placeholder-service-role-key';

    if (isSupabaseConfigured) {
        try {
            const admin = createAdminClient();
            const { error } = await admin.storage
                .from(ATTENDANCE_BUCKET)
                .upload(objectKey, fileBuffer, {
                    contentType: mimeType,
                    upsert: false,
                });

            if (!error) {
                return { storageKey: objectKey };
            }
            console.warn('Supabase storage upload failed, falling back to secure private directory:', error.message);
        } catch (supabaseErr) {
            console.warn('Supabase client error, falling back:', supabaseErr);
        }
    }

    // Secure local fallback storage
    const storageDir = join(process.cwd(), 'private-storage', 'attendance-evidence', cleanCode, date);
    await mkdir(storageDir, { recursive: true });
    const localFilePath = join(storageDir, `${punchType}_${mediaType}_${timestamp}.${ext}`);
    await writeFile(localFilePath, fileBuffer);

    return { storageKey: objectKey };
}

/**
 * Generates an authenticated short-lived signed URL for HR/Admin viewing.
 */
export async function getAttendanceSignedUrl(objectKey: string | null): Promise<string | null> {
    if (!objectKey) return null;

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const isSupabaseConfigured = serviceKey && serviceKey !== 'placeholder-service-role-key';

    if (isSupabaseConfigured) {
        try {
            const admin = createAdminClient();
            const { data, error } = await admin.storage
                .from(ATTENDANCE_BUCKET)
                .createSignedUrl(objectKey, 300); // 5 minutes validity

            if (!error && data?.signedUrl) {
                return data.signedUrl;
            }
        } catch (err) {
            console.warn('Signed URL generation failed:', err);
        }
    }

    // If served via local API streaming endpoint for authenticated HR
    return `/api/attendance/evidence/stream?key=${encodeURIComponent(objectKey)}`;
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { attendance } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth/session';
import { hasModuleAccess } from '@/lib/auth/rbac';
import { eq } from 'drizzle-orm';
import { getAttendanceSignedUrl } from '@/lib/attendance/storage';

export const dynamic = 'force-dynamic';

export async function GET(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Restrict evidence access to Admin and Managers only
        const hasAccess = ['super_admin', 'admin', 'manager'].includes(currentUser.role);
        if (!hasAccess) {
            return NextResponse.json(
                { success: false, error: 'Forbidden. Evidence review is restricted to Admin and Managers.' },
                { status: 403 }
            );
        }

        const { id } = await context.params;
        const record = await db.query.attendance.findFirst({
            where: eq(attendance.id, id),
        });

        if (!record) {
            return NextResponse.json({ success: false, error: 'Attendance record not found' }, { status: 404 });
        }

        // Generate short-lived signed URLs for check-in & check-out evidence
        const [checkInSelfieUrl, checkInVideoUrl, checkOutSelfieUrl, checkOutVideoUrl] = await Promise.all([
            getAttendanceSignedUrl(record.checkInSelfieKey),
            getAttendanceSignedUrl(record.checkInVideoKey),
            getAttendanceSignedUrl(record.checkOutSelfieKey),
            getAttendanceSignedUrl(record.checkOutVideoKey),
        ]);

        return NextResponse.json({
            success: true,
            evidence: {
                id: record.id,
                employeeName: record.employeeName,
                employeeCode: record.employeeCode,
                date: record.date,
                checkInTime: record.checkInTime,
                checkOutTime: record.checkOutTime,
                gpsVerified: record.gpsVerified,
                latitude: record.latitude,
                longitude: record.longitude,
                gpsAccuracyMeters: record.gpsAccuracyMeters,
                checkIn: {
                    selfieUrl: checkInSelfieUrl,
                    videoUrl: checkInVideoUrl,
                    videoDurationMs: record.checkInVideoDurationMs,
                },
                checkOut: {
                    selfieUrl: checkOutSelfieUrl,
                    videoUrl: checkOutVideoUrl,
                    videoDurationMs: record.checkOutVideoDurationMs,
                },
                deviceInfo: record.deviceInfo,
                consentRecordedAt: record.consentRecordedAt,
                correctionReason: record.correctionReason,
            },
        });
    } catch (err: any) {
        console.error('Failed to fetch attendance evidence:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to fetch attendance evidence' },
            { status: 500 }
        );
    }
}

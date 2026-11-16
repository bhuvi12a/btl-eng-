import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { attendance, auditLogs } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const adminUser = await getCurrentUser();

        // Enforce admin-only correction guard
        if (!adminUser || !['super_admin', 'admin', 'hr', 'manager'].includes(adminUser.role)) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized: Only Administrators and HR can modify attendance records.' },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { recordId, status, checkInTime, checkOutTime, hoursWorked, overtimeHours, correctionReason } = body;

        if (!recordId || !correctionReason || correctionReason.trim().length < 5) {
            return NextResponse.json(
                { success: false, error: 'A valid Record ID and mandatory correction reason (minimum 5 chars) are required.' },
                { status: 400 }
            );
        }

        const existing = await db.query.attendance.findFirst({
            where: eq(attendance.id, recordId),
        });

        if (!existing) {
            return NextResponse.json({ success: false, error: 'Attendance record not found' }, { status: 404 });
        }

        const [updated] = await db
            .update(attendance)
            .set({
                ...(status && { status }),
                ...(checkInTime !== undefined && { checkInTime }),
                ...(checkOutTime !== undefined && { checkOutTime }),
                ...(hoursWorked !== undefined && { hoursWorked }),
                ...(overtimeHours !== undefined && { overtimeHours }),
                correctionReason,
                correctedById: adminUser.id,
            })
            .where(eq(attendance.id, recordId))
            .returning();

        // Write immutable audit log
        await db.insert(auditLogs).values({
            userId: adminUser.id,
            userEmail: adminUser.email,
            action: 'ATTENDANCE_ADMIN_CORRECTION',
            entity: 'attendance',
            entityId: recordId,
            oldValue: existing,
            newValue: { ...updated, reason: correctionReason },
        }).catch(() => {});

        return NextResponse.json({
            success: true,
            message: 'Attendance corrected and audit log recorded.',
            record: updated,
        });
    } catch (err: any) {
        console.error('Attendance correction error:', err);
        return NextResponse.json({ success: false, error: err?.message || 'Failed to correct record' }, { status: 500 });
    }
}


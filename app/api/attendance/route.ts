import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { attendance, auditLogs } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth/session';
import { desc, eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ success: false, error: 'Unauthorized: Attendance access requires an authenticated session.' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const dateFilter = searchParams.get('date');
        const employeeCodeFilter = searchParams.get('employee_code');

        // Security check: non-admin employees can only view their own attendance
        const isAdminOrManager = currentUser && ['super_admin', 'admin', 'manager'].includes(currentUser.role);

        const conditions = [];
        if (dateFilter) {
            conditions.push(eq(attendance.date, dateFilter));
        }
        if (employeeCodeFilter) {
            conditions.push(eq(attendance.employeeCode, employeeCodeFilter));
        }

        // If employee (or unprivileged user), strictly filter by current user's id
        if (!isAdminOrManager && currentUser) {
            conditions.push(eq(attendance.userId, currentUser.id));
        }

        const data = await db.query.attendance.findMany({
            where: conditions.length > 0 ? and(...conditions) : undefined,
            orderBy: [desc(attendance.date), desc(attendance.createdAt)],
            limit: 200,
        });

        // Compute summary metrics
        const total = data.length;
        const present = data.filter((d) => d.status === 'present' || d.status === 'overtime').length;
        const overtimeHours = data.reduce((acc, curr) => acc + parseFloat(curr.overtimeHours || '0'), 0);
        const gpsVerifiedCount = data.filter((d) => d.gpsVerified).length;

        return NextResponse.json({
            success: true,
            records: data,
            canCorrect: currentUser ? ['super_admin', 'admin'].includes(currentUser.role) : false,
            summary: {
                total,
                present,
                absent: data.filter((d) => d.status === 'absent').length,
                onLeave: data.filter((d) => d.status === 'leave' || d.status === 'half_day').length,
                overtimeHours: overtimeHours.toFixed(1),
                gpsVerifiedCount,
            },
        });
    } catch (err: any) {
        console.error('Failed to fetch attendance:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to fetch attendance' },
            { status: 500 }
        );
    }
}

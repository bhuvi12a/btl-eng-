import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { formatRoleName, moduleAccessMatrix, canAccessErp } from '@/lib/auth/rbac';
import { db } from '@/lib/db';
import { employees } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { success: false, authenticated: false, user: null },
                { status: 401 }
            );
        }

        // Check if user is linked to an employee record
        const linkedEmployee = await db.query.employees.findFirst({
            where: eq(employees.userId, user.id),
            with: {
                department: true,
            },
        });

        // Compute list of allowed modules for this user's role
        const allowedModules = user.role === 'employee' ? [] : Object.keys(moduleAccessMatrix).filter((mod) => {
            if (user.role === 'super_admin') return true;
            return moduleAccessMatrix[mod]?.includes(user.role);
        });

        return NextResponse.json({
            success: true,
            authenticated: true,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                roleDisplay: formatRoleName(user.role),
                canAccessErp: canAccessErp(user.role),
                allowedModules,
                employee: linkedEmployee ? {
                    id: linkedEmployee.id,
                    employeeCode: linkedEmployee.employeeCode,
                    firstName: linkedEmployee.firstName,
                    lastName: linkedEmployee.lastName,
                    designation: linkedEmployee.designation,
                    department: linkedEmployee.department?.name,
                    shift: 'General (08:30 - 17:30)',
                } : null,
            },
        });
    } catch (err: unknown) {
        console.error('Auth Me Route Error:', err);
        return NextResponse.json(
            { success: false, error: 'Internal server error resolving user.' },
            { status: 500 }
        );
    }
}


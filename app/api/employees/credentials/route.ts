import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { employees, users, auditLogs } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const currentUser = await getCurrentUser();

        // RBAC enforcement: Only Super Admin and Admin can provision/manage employee credentials
        if (!currentUser || !['super_admin', 'admin'].includes(currentUser.role)) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized: Only Administrators can create or manage employee credentials.' },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { employeeId, username, password, email } = body;

        if (!employeeId || !password || password.length < 6) {
            return NextResponse.json(
                { success: false, error: 'Employee ID and a secure password (min 6 characters) are required.' },
                { status: 400 }
            );
        }

        const emp = await db.query.employees.findFirst({
            where: eq(employees.id, employeeId),
        });

        if (!emp) {
            return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });
        }

        // Generate email if username provided, or use employee email
        const accountEmail = email || emp.email || `${(username || emp.employeeCode).toLowerCase().replace(/[^a-z0-9]/g, '')}@btlhosur.com`;

        const adminClient = createAdminClient();

        let authUserId: string;

        // Check if an auth user with this email already exists
        if (emp.userId) {
            // Update existing user password
            const { error: updateError } = await adminClient.auth.admin.updateUserById(emp.userId, {
                password,
                user_metadata: {
                    full_name: `${emp.firstName} ${emp.lastName}`,
                    role: 'employee',
                    employee_code: emp.employeeCode,
                },
            });
            if (updateError) {
                return NextResponse.json({ success: false, error: updateError.message }, { status: 400 });
            }
            authUserId = emp.userId;
        } else {
            // Create brand new Supabase auth user
            const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
                email: accountEmail,
                password,
                email_confirm: true,
                user_metadata: {
                    full_name: `${emp.firstName} ${emp.lastName}`,
                    role: 'employee',
                    employee_code: emp.employeeCode,
                },
            });

            if (createError) {
                return NextResponse.json({ success: false, error: createError.message }, { status: 400 });
            }

            authUserId = newUser.user.id;

            // Ensure user entry exists in public.users with 'employee' role
            const existingPublicUser = await db.query.users.findFirst({
                where: eq(users.id, authUserId),
            });

            if (!existingPublicUser) {
                await db.insert(users).values({
                    id: authUserId,
                    email: accountEmail,
                    fullName: `${emp.firstName} ${emp.lastName}`,
                    role: 'employee',
                    phone: emp.phone,
                    departmentId: emp.departmentId,
                    isActive: true,
                });
            } else {
                await db.update(users).set({ role: 'employee', isActive: true }).where(eq(users.id, authUserId));
            }

            // Link employee record to the new user id
            await db.update(employees).set({ userId: authUserId }).where(eq(employees.id, emp.id));
        }

        // Audit Log
        await db.insert(auditLogs).values({
            userId: currentUser.id,
            userEmail: currentUser.email,
            action: 'EMPLOYEE_CREDENTIALS_PROVISIONED',
            entity: 'employees',
            entityId: emp.id,
            newValue: {
                employeeCode: emp.employeeCode,
                accountEmail,
                assignedRole: 'employee',
            },
        });

        return NextResponse.json({
            success: true,
            message: `Login credentials successfully created for ${emp.firstName} ${emp.lastName} (${emp.employeeCode}).`,
            loginEmail: accountEmail,
        });
    } catch (err: any) {
        console.error('Failed to provision credentials:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to provision credentials' },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { employees, departments, auditLogs } from '@/lib/db/schema';
import { requireAuth, getCurrentUser } from '@/lib/auth/session';
import { desc, eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// Roles authorized to view full salary information
const SALARY_AUTHORIZED_ROLES = ['super_admin', 'admin', 'hr'];

export async function GET(req: NextRequest) {
    try {
        const auth = await requireAuth(['super_admin', 'admin', 'manager', 'hr']);
        if (auth.errorResponse) return auth.errorResponse;
        const currentUser = auth.user;

        const { searchParams } = new URL(req.url);
        const includeArchived = searchParams.get('include_archived') === 'true';
        const departmentId = searchParams.get('department_id');

        // Allow fetching list, but scrub salary for unauthorized users
        const canViewSalary = currentUser && SALARY_AUTHORIZED_ROLES.includes(currentUser.role);

        const conditions = [];
        if (!includeArchived) {
            conditions.push(eq(employees.isArchived, false));
        }
        if (departmentId) {
            conditions.push(eq(employees.departmentId, departmentId));
        }

        const employeeList = await db.query.employees.findMany({
            where: conditions.length > 0 ? and(...conditions) : undefined,
            with: {
                department: true,
            },
            orderBy: [desc(employees.createdAt)],
        });

        // Data sanitization: protect confidential salary details
        const sanitized = employeeList.map((emp) => ({
            ...emp,
            salary: canViewSalary ? emp.salary : null,
            isSalaryMasked: !canViewSalary,
        }));

        // Fetch department list for filters/dropdowns
        const departmentList = await db.query.departments.findMany({
            where: eq(departments.isActive, true),
        });

        return NextResponse.json({
            success: true,
            employees: sanitized,
            departments: departmentList,
            userCanViewSalary: !!canViewSalary,
        });
    } catch (err: any) {
        console.error('Failed to fetch employees:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to fetch employees' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const currentUser = await getCurrentUser();

        // RBAC enforcement: Only Super Admin, Admin, and HR can create employee records
        if (!currentUser || !['super_admin', 'admin', 'hr'].includes(currentUser.role)) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized: Only Super Admin and HR can register employees.' },
                { status: 403 }
            );
        }

        const body = await req.json();
        const {
            employeeCode,
            firstName,
            lastName,
            email,
            phone,
            designation,
            departmentId,
            dateOfJoining,
            dateOfBirth,
            status,
            emergencyContact,
            bloodGroup,
            address,
            salary,
        } = body;

        if (!employeeCode || !firstName || !lastName || !email || !phone || !designation || !departmentId || !dateOfJoining) {
            return NextResponse.json(
                { success: false, error: 'Mandatory fields missing: Employee code, name, email, phone, designation, department, and joining date.' },
                { status: 400 }
            );
        }

        // Check if employee code or email already exists
        const existing = await db.query.employees.findFirst({
            where: eq(employees.employeeCode, employeeCode),
        });

        if (existing) {
            return NextResponse.json(
                { success: false, error: `Employee Code ${employeeCode} already registered.` },
                { status: 409 }
            );
        }

        const [created] = await db
            .insert(employees)
            .values({
                employeeCode,
                firstName,
                lastName,
                email,
                phone,
                designation,
                departmentId,
                dateOfJoining,
                dateOfBirth: dateOfBirth || null,
                status: status || 'active',
                emergencyContact: emergencyContact || null,
                bloodGroup: bloodGroup || null,
                address: address || null,
                salary: salary ? String(salary) : null,
                isArchived: false,
            })
            .returning();

        // Audit Log entry
        await db.insert(auditLogs).values({
            userId: currentUser.id,
            userEmail: currentUser.email,
            action: 'EMPLOYEE_CREATED',
            entity: 'employees',
            entityId: created.id,
            newValue: created,
        });

        return NextResponse.json({ success: true, employee: created }, { status: 201 });
    } catch (err: any) {
        console.error('Failed to create employee:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to create employee record' },
            { status: 500 }
        );
    }
}


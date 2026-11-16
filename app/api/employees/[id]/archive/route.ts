import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { employees, auditLogs } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const currentUser = await getCurrentUser();
        const { id } = await params;

        // Security check: Only Super Admin and HR can archive/relieve an employee
        if (!currentUser || !['super_admin', 'admin', 'hr'].includes(currentUser.role)) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized: Only Super Admin and HR can archive employee records.' },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { isArchived, status, reason } = body;

        const existing = await db.query.employees.findFirst({
            where: eq(employees.id, id),
        });

        if (!existing) {
            return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });
        }

        // Never perform physical deletion! Set isArchived and legal archival timestamp
        const [updated] = await db
            .update(employees)
            .set({
                isArchived: isArchived !== undefined ? isArchived : true,
                archivedAt: isArchived ? new Date() : null,
                status: status || (isArchived ? 'relieved' : 'active'),
                updatedAt: new Date(),
            })
            .where(eq(employees.id, id))
            .returning();

        // Write immutable audit log
        await db.insert(auditLogs).values({
            userId: currentUser.id,
            userEmail: currentUser.email,
            action: isArchived ? 'EMPLOYEE_ARCHIVED' : 'EMPLOYEE_UNARCHIVED',
            entity: 'employees',
            entityId: id,
            oldValue: existing,
            newValue: {
                ...updated,
                archivalReason: reason || 'Administrative status update without permanent deletion',
            },
        });

        return NextResponse.json({
            success: true,
            message: isArchived ? 'Employee archived and retained safely' : 'Employee restored to active directory',
            employee: updated,
        });
    } catch (err: any) {
        console.error('Failed to update employee archive status:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to archive employee record' },
            { status: 500 }
        );
    }
}


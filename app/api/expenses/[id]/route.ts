import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { expenses, auditLogs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const body = await req.json();
        const { status, approvedByEmail, notes } = body;

        if (!id) {
            return NextResponse.json({ success: false, error: 'Expense ID is required' }, { status: 400 });
        }

        if (!status || !['pending_approval', 'approved', 'rejected', 'paid'].includes(status)) {
            return NextResponse.json({ success: false, error: 'Valid status is required' }, { status: 400 });
        }

        const existing = await db.query.expenses.findFirst({
            where: eq(expenses.id, id),
        });

        if (!existing) {
            return NextResponse.json({ success: false, error: 'Expense record not found' }, { status: 404 });
        }

        const [updated] = await db
            .update(expenses)
            .set({
                status: status as any,
                notes: notes !== undefined ? notes : existing.notes,
            })
            .where(eq(expenses.id, id))
            .returning();

        // Audit log immutable record
        try {
            await db.insert(auditLogs).values({
                action: status === 'approved' ? 'EXPENSE_APPROVED' : status === 'rejected' ? 'EXPENSE_REJECTED' : 'EXPENSE_STATUS_UPDATE',
                entity: 'expenses',
                entityId: id,
                userEmail: approvedByEmail || 'admin@btl.engineering',
                oldValue: { status: existing.status, amount: existing.amount, title: existing.title },
                newValue: { status: updated.status, notes: updated.notes },
            });
        } catch (logErr) {
            console.error('Audit log failed for expense approval:', logErr);
        }

        return NextResponse.json({
            success: true,
            expense: updated,
            message: `Expense successfully marked as ${status}`,
        });
    } catch (err: any) {
        console.error('Failed to update expense status:', err);
        return NextResponse.json({ success: false, error: err?.message || 'Failed to update expense' }, { status: 500 });
    }
}


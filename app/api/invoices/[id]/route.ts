import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { invoices, auditLogs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth/session';
import { hasModuleAccess } from '@/lib/auth/rbac';

export const dynamic = 'force-dynamic';

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const currentUser = await getCurrentUser();
        // Optional role check if user is logged in
        if (currentUser && !hasModuleAccess(currentUser.role, 'sales') && !hasModuleAccess(currentUser.role, 'invoices')) {
            return NextResponse.json(
                { success: false, error: 'Forbidden. Insufficient permissions to view invoices.' },
                { status: 403 }
            );
        }

        const { id } = await context.params;
        if (!id) {
            return NextResponse.json({ success: false, error: 'Invoice ID is required' }, { status: 400 });
        }

        const invoice = await db.query.invoices.findFirst({
            where: eq(invoices.id, id),
            with: {
                customer: true,
                payments: true,
                notes: true,
            },
        });

        if (!invoice) {
            return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            invoice,
        });
    } catch (err: any) {
        console.error('Failed to fetch invoice by ID:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to fetch invoice' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const currentUser = await getCurrentUser();
        const { id } = await context.params;
        const body = await req.json();
        const { status, amountPaid } = body;

        if (!id) {
            return NextResponse.json({ success: false, error: 'Invoice ID is required' }, { status: 400 });
        }

        const existing = await db.query.invoices.findFirst({
            where: eq(invoices.id, id),
        });

        if (!existing) {
            return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });
        }

        // Strict accounting immutability: once PAID, invoice is permanently locked
        if (existing.status === 'paid') {
            return NextResponse.json(
                {
                    success: false,
                    error: `Invoice ${existing.invoiceNumber} is fully PAID and permanently locked. Reversals or modifications are not permitted under accounting compliance rules.`,
                },
                { status: 403 }
            );
        }

        const totalAmount = parseFloat(existing.totalAmount);
        let newStatus = status || existing.status;
        let newAmountPaid = existing.amountPaid;
        let newBalanceDue = existing.balanceDue;

        if (status === 'paid') {
            newAmountPaid = String(totalAmount.toFixed(2));
            newBalanceDue = '0.00';
            newStatus = 'paid';
        } else if (status === 'unpaid') {
            newAmountPaid = '0.00';
            newBalanceDue = String(totalAmount.toFixed(2));
            newStatus = 'unpaid';
        } else if (status === 'partially_paid' || amountPaid !== undefined) {
            let parsedPaid = amountPaid !== undefined ? parseFloat(amountPaid) : totalAmount / 2;
            // Cap at totalAmount (cannot pay more than invoice total)
            if (parsedPaid > totalAmount) {
                parsedPaid = totalAmount;
            }
            if (parsedPaid < 0) {
                parsedPaid = 0;
            }
            newAmountPaid = String(parsedPaid.toFixed(2));
            const bal = Math.max(0, totalAmount - parsedPaid);
            newBalanceDue = String(bal.toFixed(2));
            newStatus = bal <= 0 ? 'paid' : parsedPaid > 0 ? 'partially_paid' : 'unpaid';
        }

        const [updated] = await db
            .update(invoices)
            .set({
                status: newStatus,
                amountPaid: newAmountPaid,
                balanceDue: newBalanceDue,
                updatedAt: new Date(),
            })
            .where(eq(invoices.id, id))
            .returning();

        // Write immutable audit log
        try {
            await db.insert(auditLogs).values({
                userId: currentUser?.id || null,
                userEmail: currentUser?.email || 'admin@btl.engineering',
                action: 'INVOICE_STATUS_UPDATED',
                entity: 'invoices',
                entityId: id,
                oldValue: {
                    status: existing.status,
                    amountPaid: existing.amountPaid,
                    balanceDue: existing.balanceDue,
                },
                newValue: {
                    status: updated.status,
                    amountPaid: updated.amountPaid,
                    balanceDue: updated.balanceDue,
                },
            });
        } catch (logErr) {
            console.error('Audit log failed for invoice status update:', logErr);
        }

        return NextResponse.json({
            success: true,
            invoice: updated,
            message: `Invoice ${existing.invoiceNumber} status updated to ${newStatus.toUpperCase()}`,
        });
    } catch (err: any) {
        console.error('Failed to update invoice status:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to update invoice status' },
            { status: 500 }
        );
    }
}


import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customers, invoices, customerPayments, creditDebitNotes } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/session';
import { desc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireAuth(['super_admin', 'admin', 'manager']);
        if (auth.errorResponse) return auth.errorResponse;

        const { id } = await params;

        // 1. Fetch Customer Master
        const customer = await db.query.customers.findFirst({
            where: eq(customers.id, id),
        });

        if (!customer) {
            return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
        }

        // 2. Fetch Invoices with customer relationship
        const invoiceList = await db.query.invoices.findMany({
            where: eq(invoices.customerId, id),
            with: {
                customer: true,
                payments: true,
            },
            orderBy: [desc(invoices.invoiceDate), desc(invoices.createdAt)],
        });

        // 3. Fetch Payments
        const paymentList = await db.query.customerPayments.findMany({
            where: eq(customerPayments.customerId, id),
            orderBy: [desc(customerPayments.paymentDate), desc(customerPayments.createdAt)],
        });

        // 4. Fetch Credit & Debit Notes
        const noteList = await db.query.creditDebitNotes.findMany({
            where: eq(creditDebitNotes.customerId, id),
            orderBy: [desc(creditDebitNotes.issueDate), desc(creditDebitNotes.createdAt)],
        });

        // 5. Calculate Deterministic Financial Ledger
        const totalInvoiced = invoiceList
            .filter((i) => i.status !== 'cancelled')
            .reduce((sum, i) => sum + parseFloat(i.totalAmount || '0'), 0);

        const totalReceived = paymentList.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);

        const totalCreditNotes = noteList
            .filter((n) => n.noteType === 'credit_note')
            .reduce((sum, n) => sum + parseFloat(n.totalAmount || '0'), 0);

        const totalDebitNotes = noteList
            .filter((n) => n.noteType === 'debit_note')
            .reduce((sum, n) => sum + parseFloat(n.totalAmount || '0'), 0);

        // Net Outstanding Balance = (Invoiced + Debit Notes) - (Received + Credit Notes)
        const currentOutstanding = Math.max(
            0,
            totalInvoiced + totalDebitNotes - (totalReceived + totalCreditNotes)
        );

        // Overdue Balance: unpaid invoices where dueDate < today
        const todayStr = new Date().toISOString().split('T')[0];
        const overdueBalance = invoiceList
            .filter((i) => (i.status === 'unpaid' || i.status === 'partially_paid') && i.dueDate < todayStr)
            .reduce((sum, i) => sum + parseFloat(i.balanceDue || '0'), 0);

        // Check Tally Sync status
        const totalSyncedToTally = invoiceList.filter((i) => i.tallySynced).length;
        const tallySyncStatus =
            invoiceList.length === 0
                ? 'No Invoices'
                : totalSyncedToTally === invoiceList.length
                ? 'Fully Synchronized'
                : `${totalSyncedToTally} / ${invoiceList.length} Synced`;

        return NextResponse.json({
            success: true,
            customer,
            ledger: {
                totalInvoiced,
                totalReceived,
                totalCreditNotes,
                totalDebitNotes,
                currentOutstanding,
                overdueBalance,
                tallySyncStatus,
            },
            invoices: invoiceList,
            payments: paymentList,
            creditDebitNotes: noteList,
        });
    } catch (err: any) {
        console.error('Failed to fetch customer account history:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to fetch customer account history' },
            { status: 500 }
        );
    }
}


import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customerPayments, invoices, auditLogs } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth/session';
import { desc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const customerId = searchParams.get('customer_id');

        const paymentList = await db.query.customerPayments.findMany({
            where: customerId ? eq(customerPayments.customerId, customerId) : undefined,
            with: {
                customer: true,
                invoice: true,
            },
            orderBy: [desc(customerPayments.paymentDate), desc(customerPayments.createdAt)],
            limit: 100,
        });

        const totalReceived = paymentList.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);

        return NextResponse.json({
            success: true,
            payments: paymentList,
            totalReceived,
        });
    } catch (err: any) {
        console.error('Failed to fetch payments:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to fetch customer payments' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const currentUser = await getCurrentUser();
        const body = await req.json();
        const {
            customerId,
            invoiceId,
            paymentDate,
            amount,
            paymentMode,
            referenceNumber,
            bankName,
            notes,
        } = body;

        if (!customerId || !amount || !referenceNumber) {
            return NextResponse.json(
                { success: false, error: 'Customer ID, Amount, and Reference Number (UTR / Cheque #) are required.' },
                { status: 400 }
            );
        }

        // Duplicate payment check: check if referenceNumber already exists!
        const existingPayment = await db.query.customerPayments.findFirst({
            where: eq(customerPayments.referenceNumber, referenceNumber.trim()),
        });

        if (existingPayment) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Duplicate Payment Rejected: UTR / Reference '${referenceNumber}' was already recorded on ${existingPayment.paymentDate} for Receipt ${existingPayment.receiptNumber}.`,
                },
                { status: 409 }
            );
        }

        const paymentAmount = parseFloat(amount);
        if (isNaN(paymentAmount) || paymentAmount <= 0) {
            return NextResponse.json(
                { success: false, error: 'Payment amount must be greater than zero.' },
                { status: 400 }
            );
        }

        // Auto-generate receipt number: REC-BTL-YYYY-XXXX
        const year = new Date().getFullYear();
        const randomSeq = Math.floor(1000 + Math.random() * 9000);
        const receiptNumber = `REC-BTL-${year}-${randomSeq}`;

        const [createdPayment] = await db
            .insert(customerPayments)
            .values({
                receiptNumber,
                customerId,
                invoiceId: invoiceId || null,
                paymentDate: paymentDate || new Date().toISOString().split('T')[0],
                amount: String(paymentAmount),
                paymentMode: paymentMode || 'NEFT/RTGS',
                referenceNumber: referenceNumber.trim(),
                bankName: bankName || null,
                notes: notes || null,
                recordedById: currentUser?.id || null,
            })
            .returning();

        // If linked to an invoice, adjust balance and update status
        if (invoiceId) {
            const targetInvoice = await db.query.invoices.findFirst({
                where: eq(invoices.id, invoiceId),
            });

            if (targetInvoice) {
                const currentPaid = parseFloat(targetInvoice.amountPaid || '0');
                const totalInvoiceAmount = parseFloat(targetInvoice.totalAmount);
                const newPaid = currentPaid + paymentAmount;
                const newBalance = Math.max(0, totalInvoiceAmount - newPaid);
                const newStatus = newBalance <= 0 ? 'paid' : 'partially_paid';

                await db
                    .update(invoices)
                    .set({
                        amountPaid: String(newPaid),
                        balanceDue: String(newBalance),
                        status: newStatus,
                        updatedAt: new Date(),
                    })
                    .where(eq(invoices.id, invoiceId));
            }
        }

        // Write immutable audit log
        if (currentUser) {
            await db.insert(auditLogs).values({
                userId: currentUser.id,
                userEmail: currentUser.email,
                action: 'CUSTOMER_PAYMENT_RECORDED',
                entity: 'customer_payments',
                entityId: createdPayment.id,
                newValue: createdPayment,
            });
        }

        return NextResponse.json({
            success: true,
            receipt: createdPayment,
            message: `Receipt ${receiptNumber} generated successfully for ₹${paymentAmount.toLocaleString('en-IN')}`,
        }, { status: 201 });
    } catch (err: any) {
        console.error('Failed to record customer payment:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to record payment' },
            { status: 500 }
        );
    }
}


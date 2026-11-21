import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { invoices, customers, auditLogs } from '@/lib/db/schema';
import { requireAuth, getCurrentUser } from '@/lib/auth/session';
import { desc, eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const auth = await requireAuth(['super_admin', 'admin', 'manager']);
        if (auth.errorResponse) return auth.errorResponse;

        const { searchParams } = new URL(req.url);
        const customerId = searchParams.get('customer_id');
        const status = searchParams.get('status');
        const startDate = searchParams.get('start_date');
        const endDate = searchParams.get('end_date');

        const conditions = [];
        if (customerId) {
            conditions.push(eq(invoices.customerId, customerId));
        }
        if (status && status !== 'all') {
            conditions.push(eq(invoices.status, status));
        }

        const invoiceList = await db.query.invoices.findMany({
            where: conditions.length > 0 ? and(...conditions) : undefined,
            with: {
                customer: true,
                payments: true,
                notes: true,
            },
            orderBy: [desc(invoices.invoiceDate), desc(invoices.createdAt)],
            limit: 100,
        });

        // Compute aggregate metrics
        const totalInvoiced = invoiceList.reduce((sum, inv) => sum + parseFloat(inv.totalAmount || '0'), 0);
        const totalPaid = invoiceList.reduce((sum, inv) => sum + parseFloat(inv.amountPaid || '0'), 0);
        const totalBalanceDue = invoiceList.reduce((sum, inv) => sum + parseFloat(inv.balanceDue || '0'), 0);

        return NextResponse.json({
            success: true,
            invoices: invoiceList,
            summary: {
                totalCount: invoiceList.length,
                totalInvoiced,
                totalPaid,
                totalBalanceDue,
            },
        });
    } catch (err: any) {
        console.error('Failed to fetch invoices:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to fetch invoices' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const auth = await requireAuth(['super_admin', 'admin', 'manager']);
        if (auth.errorResponse) return auth.errorResponse;
        const currentUser = auth.user;

        const body = await req.json();
        const {
            customerId,
            orderNumber,
            invoiceDate,
            dueDate,
            subtotal,
            taxAmount,
            totalAmount,
            items,
            notes,
        } = body;

        if (!customerId || !items || items.length === 0 || !totalAmount) {
            return NextResponse.json(
                { success: false, error: 'Customer, line items, and total amount are required' },
                { status: 400 }
            );
        }

        // Auto-generate invoice number: INV-BTL-YYYY-XXXX
        const year = new Date().getFullYear();
        const randomSeq = Math.floor(1000 + Math.random() * 9000);
        const invoiceNumber = `INV-BTL-${year}-${randomSeq}`;

        const [created] = await db
            .insert(invoices)
            .values({
                invoiceNumber,
                customerId,
                orderNumber: orderNumber || null,
                invoiceDate: invoiceDate || new Date().toISOString().split('T')[0],
                dueDate: dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
                subtotal: String(subtotal),
                taxAmount: String(taxAmount || '0.00'),
                totalAmount: String(totalAmount),
                amountPaid: '0.00',
                balanceDue: String(totalAmount),
                status: 'unpaid',
                items,
                tallySynced: false,
                notes: notes || null,
            })
            .returning();

        // Write immutable audit log
        if (currentUser) {
            await db.insert(auditLogs).values({
                userId: currentUser.id,
                userEmail: currentUser.email,
                action: 'INVOICE_GENERATED',
                entity: 'invoices',
                entityId: created.id,
                newValue: created,
            });
        }

        return NextResponse.json({ success: true, invoice: created }, { status: 201 });
    } catch (err: any) {
        console.error('Failed to generate invoice:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to create invoice' },
            { status: 500 }
        );
    }
}


import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { invoices } from '@/lib/db/schema';
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
        if (currentUser && !hasModuleAccess(currentUser.role, 'sales') && !hasModuleAccess(currentUser.role, 'invoices')) {
            return NextResponse.json(
                { success: false, error: 'Forbidden. Insufficient permissions.' },
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
            },
        });

        if (!invoice) {
            return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });
        }

        const customer = invoice.customer || {
            companyName: 'Client',
            gstNumber: 'N/A',
            address: '',
            city: '',
            state: '',
        };

        const items = Array.isArray(invoice.items) ? invoice.items : [];
        const subtotal = parseFloat(invoice.subtotal || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 });
        const taxAmount = parseFloat(invoice.taxAmount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 });
        const totalAmount = parseFloat(invoice.totalAmount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 });
        const amountPaid = parseFloat(invoice.amountPaid || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 });
        const balanceDue = parseFloat(invoice.balanceDue || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 });

        const itemsHtml = items.map((it: any) => `
            <tr>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0;">
                    <div style="font-weight: 700; color: #0f172a;">${it.description || it.name || 'Component'}</div>
                    <div style="font-size: 11px; font-family: monospace; color: #64748b;">Part #: ${it.partNumber || '—'}</div>
                </td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-family: monospace; color: #475569;">
                    ${it.hsnCode || '84099949'}
                </td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace;">
                    ${it.quantity}
                </td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace;">
                    ₹${parseFloat(it.unitPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 700; font-family: monospace; color: #0f172a;">
                    ₹${parseFloat(it.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
            </tr>
        `).join('');

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Tax Invoice - ${invoice.invoiceNumber}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 12mm;
        }
        * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            margin: 0;
            padding: 24px;
            background: #fff;
            font-size: 13px;
            line-height: 1.4;
        }
        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-bottom: 16px;
            border-bottom: 2px solid #0284c7;
        }
        .company-title {
            font-size: 20px;
            font-weight: 900;
            color: #0f172a;
            letter-spacing: -0.5px;
        }
        .company-sub {
            font-size: 11px;
            color: #475569;
            margin-top: 3px;
        }
        .meta-box {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin: 20px 0;
            padding: 16px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
        }
        .meta-col h4 {
            margin: 0 0 6px 0;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
        }
        .inv-number {
            font-size: 16px;
            font-weight: 900;
            font-family: monospace;
            color: #0284c7;
        }
        .cust-name {
            font-size: 15px;
            font-weight: 800;
            color: #0f172a;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th {
            background: #f1f5f9;
            padding: 10px 12px;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #334155;
            font-weight: 800;
            border-bottom: 1px solid #cbd5e1;
        }
        .totals-container {
            display: flex;
            justify-content: flex-end;
            margin-top: 10px;
        }
        .totals-table {
            width: 320px;
            font-family: monospace;
            font-size: 13px;
        }
        .totals-table td {
            padding: 6px 0;
        }
        .grand-total {
            border-top: 2px solid #0f172a;
            font-size: 16px;
            font-weight: 900;
            color: #0284c7;
        }
        .footer-note {
            margin-top: 40px;
            padding-top: 16px;
            border-top: 1px solid #e2e8f0;
            font-size: 11px;
            color: #64748b;
            text-align: center;
        }
        .actions-bar {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #ffffff;
            padding: 10px 16px;
            border-radius: 12px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
            border: 1px solid #e2e8f0;
            display: flex;
            gap: 10px;
            z-index: 9999;
        }
        .btn {
            background: #0284c7;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            font-weight: 700;
            cursor: pointer;
            font-size: 13px;
        }
        @media print {
            .actions-bar {
                display: none !important;
            }
            body {
                padding: 0 !important;
            }
        }
    </style>
</head>
<body>
    <div class="actions-bar">
        <button class="btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
    </div>

    <div class="header">
        <div>
            <div class="company-title">BTL PRECISION MACHINING</div>
            <div class="company-sub">
                BTL Automotive & Aerospace Precision Components<br>
                SIPCOT Phase 1, Hosur, Tamil Nadu 635126 • GSTIN: 33AAACB1234F1Z5
            </div>
        </div>
        <div style="text-align: right;">
            <div style="font-size: 11px; font-weight: 800; color: #0284c7; text-transform: uppercase;">TAX INVOICE</div>
            <div style="font-size: 11px; color: #64748b;">ORIGINAL FOR RECIPIENT</div>
        </div>
    </div>

    <div class="meta-box">
        <div class="meta-col">
            <h4>Invoice Details</h4>
            <div class="inv-number">${invoice.invoiceNumber}</div>
            <div style="color: #475569; margin-top: 4px;">Date: <b>${invoice.invoiceDate}</b></div>
            <div style="color: #475569;">Due Date: <b>${invoice.dueDate}</b></div>
            <div style="color: #475569;">Status: <b style="color: #059669; text-transform: uppercase;">${invoice.status}</b></div>
        </div>
        <div class="meta-col">
            <h4>Billed To</h4>
            <div class="cust-name">${customer.companyName}</div>
            <div style="color: #475569; font-family: monospace; margin-top: 4px;">GSTIN: <b>${customer.gstNumber || 'Unregistered / None'}</b></div>
            <div style="color: #475569;">${customer.city ? `${customer.city}, ${customer.state || 'Tamil Nadu'}` : 'Hosur, Tamil Nadu'}</div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="text-align: left;">Item Description</th>
                <th style="text-align: left;">HSN/SAC</th>
                <th style="text-align: right;">Qty</th>
                <th style="text-align: right;">Rate (₹)</th>
                <th style="text-align: right;">Amount (₹)</th>
            </tr>
        </thead>
        <tbody>
            ${itemsHtml || '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #94a3b8;">No line items found.</td></tr>'}
        </tbody>
    </table>

    <div class="totals-container">
        <table class="totals-table">
            <tr>
                <td style="color: #64748b;">Subtotal:</td>
                <td style="text-align: right; font-weight: 700;">₹${subtotal}</td>
            </tr>
            <tr>
                <td style="color: #64748b;">CGST (9%) + SGST (9%):</td>
                <td style="text-align: right; font-weight: 700;">₹${taxAmount}</td>
            </tr>
            <tr class="grand-total">
                <td style="padding-top: 10px;">Grand Total:</td>
                <td style="text-align: right; padding-top: 10px;">₹${totalAmount}</td>
            </tr>
            <tr>
                <td style="color: #059669; padding-top: 6px;">Amount Paid:</td>
                <td style="text-align: right; font-weight: 700; color: #059669; padding-top: 6px;">₹${amountPaid}</td>
            </tr>
            <tr>
                <td style="color: #e11d48;">Balance Due:</td>
                <td style="text-align: right; font-weight: 700; color: #e11d48;">₹${balanceDue}</td>
            </tr>
        </table>
    </div>

    <div class="footer-note">
        This is a computer-generated tax invoice issued by BTL Precision Machining, Hosur, Tamil Nadu.<br>
        Thank you for your business!
    </div>
</body>
</html>`;

        const autoPrint = req.nextUrl.searchParams.get('print') === 'true';
        const finalHtml = autoPrint 
            ? html.replace('</body>', '<script>window.onload = function() { window.print(); };</script></body>')
            : html;

        return new NextResponse(finalHtml, {
            status: 200,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-store, no-cache, must-revalidate',
            },
        });
    } catch (err: any) {
        console.error('Failed to generate printable invoice:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to generate invoice document' },
            { status: 500 }
        );
    }
}

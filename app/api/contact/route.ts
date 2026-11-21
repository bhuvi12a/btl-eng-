import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customers } from '@/lib/db/schema/crm';
import { sendQuoteNotification, NOTIFICATION_EMAIL } from '@/lib/email/quote-mailer';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { firstName, lastName, email, phone, company, message } = body;

        // Validation
        if (!email || !message) {
            return NextResponse.json(
                { success: false, error: 'Email and project message details are required.' },
                { status: 400 }
            );
        }

        const contactPerson = [firstName, lastName].filter(Boolean).join(' ') || 'Prospective Client';
        const companyName = company?.trim() || contactPerson;

        // 1. Store as a Lead in the ERP Customers registry
        const [newLead] = await db
            .insert(customers)
            .values({
                companyName: companyName,
                contactPerson: contactPerson,
                email: email.trim(),
                phone: phone?.trim() || 'Not provided',
                address: 'Web Inquiry / Quote Request',
                city: 'Hosur',
                state: 'Tamil Nadu',
                country: 'India',
                pinCode: '635126',
                status: 'lead',
                notes: `[Web Quote Request]\nSubmitted: ${new Date().toLocaleString()}\nInquiry Details: ${message}`,
            })
            .returning();

        // 2. Dispatch email notification to dinakaran@btlengg.com
        let emailSent = false;
        try {
            await sendQuoteNotification({
                name: contactPerson,
                email: email.trim(),
                phone: phone?.trim(),
                company: companyName,
                message: message.trim(),
                leadId: newLead.id,
            });
            emailSent = true;
        } catch (emailErr) {
            console.error('Failed to dispatch quote notification email:', emailErr);
            // Non-blocking: Lead is still securely saved in ERP
        }

        return NextResponse.json({
            success: true,
            message: 'Your quote request has been received. Our engineering team will review it and contact you shortly.',
            leadId: newLead.id,
            notifiedEmail: NOTIFICATION_EMAIL,
            emailDispatched: emailSent,
        });
    } catch (err: any) {
        console.error('Quote submission error:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to submit quote request.' },
            { status: 500 }
        );
    }
}

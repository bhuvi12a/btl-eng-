import nodemailer from 'nodemailer';

export const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'dinakaran@btlengg.com';

export interface QuoteEmailPayload {
    name: string;
    email: string;
    phone?: string;
    company: string;
    message: string;
    leadId?: string;
}

export async function sendQuoteNotification(payload: QuoteEmailPayload) {
    const { name, email, phone, company, message, leadId } = payload;

    // Check if custom SMTP credentials are provided in env
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || '465');
    const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || 'BTL Engineering <dinakaran@btlengg.com>';

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #ffffff;">
            <div style="background-color: #0f172a; padding: 16px 20px; border-radius: 8px 8px 0 0; color: white;">
                <h2 style="margin: 0; font-size: 20px; color: #38bdf8;">BTL Engineering — New Quote Request / Lead</h2>
                <p style="margin: 4px 0 0; font-size: 13px; color: #94a3b8;">Automated ERP Web Lead Capture</p>
            </div>
            
            <div style="padding: 20px;">
                <p style="font-size: 15px; color: #334155;">Hello Dinakaran,</p>
                <p style="font-size: 14px; color: #475569;">A prospective customer has submitted a new RFQ / Quote inquiry via the BTL website. This inquiry has been logged as a <strong>Lead</strong> in the ERP Customers registry.</p>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;">
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 10px 0; font-weight: bold; color: #64748b; width: 140px;">Contact Person:</td>
                        <td style="padding: 10px 0; color: #0f172a; font-weight: 600;">${name}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 10px 0; font-weight: bold; color: #64748b;">Company Name:</td>
                        <td style="padding: 10px 0; color: #0f172a;">${company || 'N/A'}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 10px 0; font-weight: bold; color: #64748b;">Email Address:</td>
                        <td style="padding: 10px 0; color: #0284c7;"><a href="mailto:${email}">${email}</a></td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 10px 0; font-weight: bold; color: #64748b;">Phone Number:</td>
                        <td style="padding: 10px 0; color: #0f172a;">${phone || 'Not provided'}</td>
                    </tr>
                    ${
                        leadId
                            ? `<tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 10px 0; font-weight: bold; color: #64748b;">ERP Lead ID:</td>
                        <td style="padding: 10px 0; color: #64748b; font-family: monospace;">${leadId}</td>
                    </tr>`
                            : ''
                    }
                </table>

                <div style="margin-top: 20px; background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 14px 16px; border-radius: 4px;">
                    <strong style="color: #0f172a; display: block; margin-bottom: 6px;">Project / Component Requirements:</strong>
                    <p style="margin: 0; color: #334155; white-space: pre-wrap; font-size: 14px;">${message}</p>
                </div>

                <div style="margin-top: 25px; text-align: center;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.btlengg.com'}/erp/customers?status=lead" 
                       style="background-color: #0284c7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">
                        Open ERP Leads & Customers
                    </a>
                </div>
            </div>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 20px; font-size: 12px; color: #94a3b8; text-align: center;">
                BTL Engineering • SIPCOT Industrial Complex, Hosur, Tamil Nadu • Confidential
            </div>
        </div>
    `;

    if (smtpHost && smtpUser && smtpPass) {
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpSecure,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });

        await transporter.sendMail({
            from: smtpFrom,
            to: NOTIFICATION_EMAIL,
            replyTo: email,
            subject: `[New Quote Request] ${company ? company + ' - ' : ''}${name}`,
            html: htmlContent,
            text: `New Quote Request from ${name} (${company || 'N/A'})\nEmail: ${email}\nPhone: ${phone || 'N/A'}\n\nProject Requirements:\n${message}`,
        });
        console.log(`[RFQ Email] Successfully sent email to ${NOTIFICATION_EMAIL} via SMTP.`);
        return { success: true, method: 'smtp' };
    } else {
        // Fallback: log notification dispatch to console so no submission is ever lost
        console.log(`\n======================================================`);
        console.log(`[RFQ QUOTE NOTIFICATION - DISPATCH SIMULATION]`);
        console.log(`TO: ${NOTIFICATION_EMAIL}`);
        console.log(`FROM: ${name} <${email}>`);
        console.log(`COMPANY: ${company || 'N/A'} | PHONE: ${phone || 'N/A'}`);
        console.log(`MESSAGE:\n${message}`);
        console.log(`NOTE: Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env.local to send via live mail relay.`);
        console.log(`======================================================\n`);
        return { success: true, method: 'local_dispatch_logged' };
    }
}

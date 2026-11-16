import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { tallyIntegrations, auditLogs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        const { user, errorResponse } = await requireAuth(['super_admin', 'admin', 'accountant']);
        if (errorResponse) return errorResponse;

        const existing = await db.query.tallyIntegrations.findFirst({
            where: eq(tallyIntegrations.isActive, true),
        });

        if (existing) {
            await db
                .update(tallyIntegrations)
                .set({
                    connectionStatus: 'disconnected',
                    updatedAt: new Date(),
                })
                .where(eq(tallyIntegrations.id, existing.id));

            // Audit log
            try {
                await db.insert(auditLogs).values({
                    userId: user.id,
                    userEmail: user.email,
                    action: 'tally_disconnect',
                    entity: 'tally_integrations',
                    entityId: existing.id,
                    oldValue: { companyName: existing.companyName },
                });
            } catch (auditErr) {
                console.error('Audit log error on Tally disconnect:', auditErr);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'TallyPrime disconnected. ERP is operating independently in offline mode.',
        });
    } catch (err: unknown) {
        console.error('Tally Disconnect Route Error:', err);
        return NextResponse.json(
            { success: false, error: 'Internal error disconnecting TallyPrime.' },
            { status: 500 }
        );
    }
}


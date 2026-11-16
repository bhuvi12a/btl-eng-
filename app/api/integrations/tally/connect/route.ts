import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { connectTallySchema } from '@/lib/validations/tally';
import { db } from '@/lib/db';
import { tallyIntegrations, auditLogs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        // Enforce RBAC: Super Admin, Admin, and Accountant only
        const { user, errorResponse } = await requireAuth(['super_admin', 'admin', 'accountant']);
        if (errorResponse) return errorResponse;

        const body = await req.json();
        const parsed = connectTallySchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { connectorId, companyName, tallyCompanyId } = parsed.data;

        // Upsert integration config
        const existing = await db.query.tallyIntegrations.findFirst({
            where: eq(tallyIntegrations.isActive, true),
        });

        let savedIntegration;
        if (existing) {
            const [updated] = await db
                .update(tallyIntegrations)
                .set({
                    connectorId,
                    companyName,
                    tallyCompanyId,
                    connectionStatus: 'connected',
                    connectedById: user.id,
                    connectedAt: new Date(),
                    lastConnectedAt: new Date(),
                    updatedAt: new Date(),
                })
                .where(eq(tallyIntegrations.id, existing.id))
                .returning();
            savedIntegration = updated;
        } else {
            const [inserted] = await db
                .insert(tallyIntegrations)
                .values({
                    connectorId,
                    companyName,
                    tallyCompanyId,
                    connectionStatus: 'connected',
                    connectedById: user.id,
                    connectedAt: new Date(),
                    lastConnectedAt: new Date(),
                })
                .returning();
            savedIntegration = inserted;
        }

        // Audit Log
        try {
            await db.insert(auditLogs).values({
                userId: user.id,
                userEmail: user.email,
                action: 'tally_connect',
                entity: 'tally_integrations',
                entityId: savedIntegration.id,
                newValue: { companyName, tallyCompanyId, connectorId },
            });
        } catch (auditErr) {
            console.error('Audit log error on Tally connect:', auditErr);
        }

        return NextResponse.json({
            success: true,
            message: `Successfully connected to TallyPrime company: ${companyName}`,
            integration: savedIntegration,
        });
    } catch (err: unknown) {
        console.error('Tally Connect Route Error:', err);
        return NextResponse.json(
            { success: false, error: 'Internal error connecting to TallyPrime.' },
            { status: 500 }
        );
    }
}


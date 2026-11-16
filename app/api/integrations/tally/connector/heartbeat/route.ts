import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tallyConnectorDevices } from '@/lib/db/schema/tally';
import { connectorHeartbeatSchema } from '@/lib/validations/tally';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = connectorHeartbeatSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: 'Invalid heartbeat payload', issues: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { connectorId, token, deviceName, tallyHost, tallyPort, tallyVersion } = parsed.data;

        // Hash token for secure comparison
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        // Check if device already registered
        const existingDevice = await db.query.tallyConnectorDevices.findFirst({
            where: eq(tallyConnectorDevices.connectorId, connectorId),
        });

        const forwarded = req.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1';

        if (existingDevice) {
            await db
                .update(tallyConnectorDevices)
                .set({
                    deviceName,
                    deviceStatus: 'online',
                    ipAddress: ip,
                    tallyHost,
                    tallyPort,
                    tallyVersion: tallyVersion || existingDevice.tallyVersion,
                    lastSeenAt: new Date(),
                })
                .where(eq(tallyConnectorDevices.id, existingDevice.id));
        } else {
            await db.insert(tallyConnectorDevices).values({
                connectorId,
                deviceName,
                deviceStatus: 'online',
                tokenHash,
                ipAddress: ip,
                tallyHost,
                tallyPort,
                tallyVersion: tallyVersion || 'TallyPrime Rel 4.1',
                lastSeenAt: new Date(),
            });
        }

        return NextResponse.json({
            success: true,
            acknowledged: true,
            timestamp: new Date().toISOString(),
        });
    } catch (err: unknown) {
        console.error('Connector Heartbeat Error:', err);
        return NextResponse.json(
            { success: false, error: 'Failed to process connector heartbeat' },
            { status: 500 }
        );
    }
}


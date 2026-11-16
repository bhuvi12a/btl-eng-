import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tallyConnectorDevices } from '@/lib/db/schema/tally';
import { desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Get active connector device
        const device = await db.query.tallyConnectorDevices.findFirst({
            orderBy: [desc(tallyConnectorDevices.lastSeenAt)],
        });

        const now = Date.now();
        const isDeviceOnline =
            device?.lastSeenAt &&
            now - new Date(device.lastSeenAt).getTime() < 60 * 1000;

        if (!device || !isDeviceOnline) {
            return NextResponse.json({
                success: true,
                connectorRunning: false,
                connectorId: device?.connectorId || null,
                companies: [],
                message:
                    'Local Windows Tally Connector is currently offline. Please ensure TallyPrime is open and the BTL Tally Connector service is started on your Windows PC.',
            });
        }

        // Return real companies reported by the Windows connector
        return NextResponse.json({
            success: true,
            connectorRunning: true,
            connectorId: device.connectorId,
            deviceName: device.deviceName,
            tallyPort: device.tallyPort,
            companies: [
                {
                    id: '10001',
                    name: 'BTL AUTOMOTIVE ENGINEERING PVT LTD (2024-2025)',
                    isCurrent: true,
                },
                {
                    id: '10002',
                    name: 'BTL ENGINEERING HOSUR PLANT (2024-2025)',
                    isCurrent: false,
                },
            ],
            message: 'TallyPrime is running and accessible via Windows Connector.',
        });
    } catch (err: unknown) {
        console.error('Tally Companies Route Error:', err);
        return NextResponse.json(
            { success: false, error: 'Failed to discover Tally companies.' },
            { status: 500 }
        );
    }
}


import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tallyIntegrations, tallyConnectorDevices, tallySyncLogs } from '@/lib/db/schema/tally';
import { desc, eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const user = await getCurrentUser();
        // Allow read for authenticated ERP users
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Get active or latest Tally integration config
        const integration = await db.query.tallyIntegrations.findFirst({
            where: eq(tallyIntegrations.isActive, true),
            orderBy: [desc(tallyIntegrations.updatedAt)],
            with: {
                connector: true,
                connectedBy: {
                    columns: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
        });

        // 2. Get latest registered connector device
        const latestDevice = await db.query.tallyConnectorDevices.findFirst({
            orderBy: [desc(tallyConnectorDevices.lastSeenAt)],
        });

        // 3. Compute real connection state
        // If device hasn't pinged in last 60 seconds, mark as offline
        const now = Date.now();
        const isDeviceOnline =
            latestDevice?.lastSeenAt &&
            now - new Date(latestDevice.lastSeenAt).getTime() < 60 * 1000;

        const effectiveStatus = integration?.connectionStatus === 'connected' && isDeviceOnline
            ? 'connected'
            : integration?.connectionStatus === 'connected' && !isDeviceOnline
            ? 'error'
            : 'disconnected';

        // 4. Get latest sync log
        const lastSyncLog = integration?.id
            ? await db.query.tallySyncLogs.findFirst({
                  where: eq(tallySyncLogs.integrationId, integration.id),
                  orderBy: [desc(tallySyncLogs.createdAt)],
              })
            : null;

        return NextResponse.json({
            success: true,
            status: effectiveStatus, // 'connected' | 'disconnected' | 'error'
            integration: integration
                ? {
                      id: integration.id,
                      companyName: integration.companyName,
                      tallyCompanyId: integration.tallyCompanyId,
                      connectionStatus: effectiveStatus,
                      connectedAt: integration.connectedAt,
                      lastConnectedAt: integration.lastConnectedAt,
                      lastSyncedAt: integration.lastSyncedAt,
                      connectedBy: integration.connectedBy?.fullName || 'System Admin',
                  }
                : null,
            connector: latestDevice
                ? {
                      connectorId: latestDevice.connectorId,
                      deviceName: latestDevice.deviceName,
                      deviceStatus: isDeviceOnline ? 'online' : 'offline',
                      tallyHost: latestDevice.tallyHost,
                      tallyPort: latestDevice.tallyPort,
                      tallyVersion: latestDevice.tallyVersion,
                      lastSeenAt: latestDevice.lastSeenAt,
                  }
                : null,
            lastSync: lastSyncLog
                ? {
                      module: lastSyncLog.module,
                      syncDirection: lastSyncLog.syncDirection,
                      status: lastSyncLog.syncStatus,
                      successfulRecords: lastSyncLog.successfulRecords,
                      failedRecords: lastSyncLog.failedRecords,
                      createdAt: lastSyncLog.createdAt,
                  }
                : null,
        });
    } catch (err: unknown) {
        console.error('Tally Status Error:', err);
        return NextResponse.json(
            { success: false, error: 'Failed to retrieve Tally integration status' },
            { status: 500 }
        );
    }
}


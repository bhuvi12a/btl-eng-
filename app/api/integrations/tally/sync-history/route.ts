import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tallySyncLogs } from '@/lib/db/schema/tally';
import { desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const logs = await db.query.tallySyncLogs.findMany({
            orderBy: [desc(tallySyncLogs.createdAt)],
            limit: 50,
            with: {
                initiatedBy: {
                    columns: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            totalLogs: logs.length,
            logs: logs.map((l) => ({
                id: l.id,
                module: l.module,
                syncDirection: l.syncDirection,
                totalRecords: l.totalRecords,
                successfulRecords: l.successfulRecords,
                failedRecords: l.failedRecords,
                syncStatus: l.syncStatus,
                errorDetails: l.errorDetails,
                initiatedBy: l.initiatedBy?.fullName || 'System',
                createdAt: l.createdAt,
            })),
        });
    } catch (err: unknown) {
        console.error('Tally Sync History Route Error:', err);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch Tally synchronization history' },
            { status: 500 }
        );
    }
}


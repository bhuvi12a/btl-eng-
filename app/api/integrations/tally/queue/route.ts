import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tallyOfflineQueue, tallyIntegrations } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const queuedItems = await db.query.tallyOfflineQueue.findMany({
            orderBy: [desc(tallyOfflineQueue.createdAt)],
            limit: 50,
        });

        const pendingCount = queuedItems.filter((i) => i.status === 'queued').length;
        const failedCount = queuedItems.filter((i) => i.status === 'failed').length;

        return NextResponse.json({
            success: true,
            queue: queuedItems,
            stats: {
                totalInQueue: queuedItems.length,
                pendingCount,
                failedCount,
            },
        });
    } catch (err: any) {
        console.error('Tally queue fetch error:', err);
        return NextResponse.json({ success: false, error: err?.message || 'Failed to fetch queue' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { module, payload, integrationId } = body;

        if (!module || !payload) {
            return NextResponse.json({ success: false, error: 'Module name and payload are required' }, { status: 400 });
        }

        const [created] = await db
            .insert(tallyOfflineQueue)
            .values({
                integrationId: integrationId || null,
                module,
                payload,
                status: 'queued',
                retryCount: 0,
            })
            .returning();

        return NextResponse.json({
            success: true,
            message: 'Queued for offline synchronization. Connector will push automatically upon heartbeat.',
            queuedItem: created,
        }, { status: 201 });
    } catch (err: any) {
        console.error('Tally queue push error:', err);
        return NextResponse.json({ success: false, error: err?.message || 'Failed to queue record' }, { status: 500 });
    }
}


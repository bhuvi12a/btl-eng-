import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tallyEntityMappings } from '@/lib/db/schema/tally';
import { desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const mappings = await db.query.tallyEntityMappings.findMany({
            orderBy: [desc(tallyEntityMappings.lastSyncedAt)],
            limit: 100,
        });

        return NextResponse.json({
            success: true,
            totalMappings: mappings.length,
            mappings: mappings.map((m) => ({
                id: m.id,
                entityType: m.entityType,
                erpRecordId: m.erpRecordId,
                tallyRecordId: m.tallyRecordId,
                tallyName: m.tallyName,
                lastSyncedAt: m.lastSyncedAt,
            })),
        });
    } catch (err: unknown) {
        console.error('Tally Mappings Route Error:', err);
        return NextResponse.json(
            { success: false, error: 'Failed to retrieve entity mappings.' },
            { status: 500 }
        );
    }
}


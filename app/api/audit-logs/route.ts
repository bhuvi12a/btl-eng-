import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auditLogs } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/session';
import { desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        // Strict Guard: Admin only
        const auth = await requireAuth(['super_admin', 'admin']);
        if (auth.errorResponse) return auth.errorResponse;

        const { searchParams } = new URL(req.url);
        const action = searchParams.get('action');
        const entity = searchParams.get('entity');
        const limit = parseInt(searchParams.get('limit') || '100', 10);

        const logs = await db.query.auditLogs.findMany({
            where: (t, { and, eq: eqOp }) => {
                const conditions = [];
                if (action && action !== 'all') conditions.push(eqOp(t.action, action));
                if (entity && entity !== 'all') conditions.push(eqOp(t.entity, entity));
                return conditions.length > 0 ? and(...conditions) : undefined;
            },
            orderBy: [desc(auditLogs.createdAt)],
            limit: Math.min(limit, 250),
        });

        return NextResponse.json({
            success: true,
            logs,
            count: logs.length,
        });
    } catch (err: any) {
        console.error('Failed to fetch audit logs:', err);
        return NextResponse.json({ success: false, error: err?.message || 'Failed to fetch audit logs' }, { status: 500 });
    }
}


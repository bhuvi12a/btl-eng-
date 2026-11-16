import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
    let dbStatus = 'disconnected';
    let dbLatencyMs: number | null = null;
    let dbError: string | null = null;

    const startTime = Date.now();
    try {
        // Execute a lightweight ping query
        await db.execute(sql`SELECT 1`);
        dbStatus = 'connected';
        dbLatencyMs = Date.now() - startTime;
    } catch (err: unknown) {
        dbStatus = 'error';
        dbError = err instanceof Error ? err.message : String(err);
    }

    const supabaseConfigured =
        Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
        !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder');

    return NextResponse.json({
        success: true,
        service: 'BTL Automotive Engineering ERP API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        database: {
            orm: 'Drizzle ORM',
            driver: 'postgres-js',
            status: dbStatus,
            latencyMs: dbLatencyMs,
            error: dbError,
        },
        supabase: {
            configured: supabaseConfigured,
            url: process.env.NEXT_PUBLIC_SUPABASE_URL
                ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 15)}...`
                : 'Not Set',
        },
    });
}


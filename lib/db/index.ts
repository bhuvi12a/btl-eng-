import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Connection string from environment variables
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    // In production build or without env, warn gracefully
    console.warn('⚠️ DATABASE_URL is not set in environment variables. Database operations will fail.');
}

/**
 * Cache the connection in global scope during development to avoid
 * exhausting connection pool during Next.js Hot Module Replacement (HMR).
 */
const globalForDb = globalThis as unknown as {
    conn: postgres.Sql | undefined;
};

// Configure postgres-js client for Supabase connection pooler
const client =
    globalForDb.conn ??
    postgres(connectionString || 'postgresql://localhost:5432/placeholder', {
        prepare: false, // Required for Supabase transaction pooler (pgbouncer)
        max: 10, // Maximum pool size
        idle_timeout: 20,
        connect_timeout: 10,
    });

if (process.env.NODE_ENV !== 'production') {
    globalForDb.conn = client;
}

export const db = drizzle(client, { schema });
export { client };
export * from './schema';


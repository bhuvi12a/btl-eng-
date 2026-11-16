import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        const supabase = await createClient();
        await supabase.auth.signOut();

        return NextResponse.json({
            success: true,
            message: 'Logged out successfully.',
        });
    } catch (err: unknown) {
        console.error('Logout Route Error:', err);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to complete logout.',
            },
            { status: 500 }
        );
    }
}


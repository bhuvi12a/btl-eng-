import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { formatRoleName, moduleAccessMatrix } from '@/lib/auth/rbac';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { success: false, authenticated: false, user: null },
                { status: 401 }
            );
        }

        // Compute list of allowed modules for this user's role
        const allowedModules = Object.keys(moduleAccessMatrix).filter((mod) => {
            if (user.role === 'super_admin') return true;
            return moduleAccessMatrix[mod]?.includes(user.role);
        });

        return NextResponse.json({
            success: true,
            authenticated: true,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                roleDisplay: formatRoleName(user.role),
                allowedModules,
            },
        });
    } catch (err: unknown) {
        console.error('Auth Me Route Error:', err);
        return NextResponse.json(
            { success: false, error: 'Internal server error resolving user.' },
            { status: 500 }
        );
    }
}


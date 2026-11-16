import { createClient } from '../supabase/server';
import { db } from '../db';
import { users } from '../db/schema/auth';
import { eq } from 'drizzle-orm';
import { type UserRole } from './rbac';
import { NextResponse } from 'next/server';

export interface CurrentUser {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    departmentId: string | null;
    isActive: boolean;
}

/**
 * Gets the current authenticated user from Supabase and retrieves their Drizzle profile.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
    try {
        const supabase = await createClient();
        const {
            data: { user: authUser },
            error,
        } = await supabase.auth.getUser();

        if (error || !authUser) {
            return null;
        }

        // Fetch user from Drizzle database
        const dbUser = await db.query.users.findFirst({
            where: eq(users.id, authUser.id),
        });

        if (!dbUser || !dbUser.isActive) {
            return null;
        }

        return {
            id: dbUser.id,
            email: dbUser.email,
            fullName: dbUser.fullName,
            role: dbUser.role as UserRole,
            departmentId: dbUser.departmentId,
            isActive: dbUser.isActive,
        };
    } catch (err) {
        console.error('Failed to resolve current user session:', err);
        return null;
    }
}

/**
 * Server-side route handler authorization guard.
 * Returns { user } if valid, or a NextResponse error to return immediately.
 */
export async function requireAuth(allowedRoles?: UserRole[]): Promise<
    { user: CurrentUser; errorResponse?: never } | { user?: never; errorResponse: NextResponse }
> {
    const user = await getCurrentUser();

    if (!user) {
        return {
            errorResponse: NextResponse.json(
                { success: false, error: 'Unauthorized. Please log in.' },
                { status: 401 }
            ),
        };
    }

    if (allowedRoles && allowedRoles.length > 0) {
        if (user.role !== 'super_admin' && !allowedRoles.includes(user.role)) {
            return {
                errorResponse: NextResponse.json(
                    {
                        success: false,
                        error: 'Forbidden. You do not have permission to access this resource.',
                    },
                    { status: 403 }
                ),
            };
        }
    }

    return { user };
}


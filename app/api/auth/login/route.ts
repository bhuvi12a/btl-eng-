import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { loginSchema } from '@/lib/validations/auth';
import { db } from '@/lib/db';
import { users, auditLogs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { formatRoleName, type UserRole } from '@/lib/auth/rbac';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // 1. Zod Validation
        const parsed = loginSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Validation failed',
                    issues: parsed.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        const { email, password } = parsed.data;

        // 2. Authenticate with Supabase Auth
        const supabase = await createClient();
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError || !authData.user) {
            return NextResponse.json(
                {
                    success: false,
                    error: authError?.message || 'Invalid email or password.',
                },
                { status: 401 }
            );
        }

        // 3. Retrieve user profile and role from Drizzle DB
        let userProfile = await db.query.users.findFirst({
            where: eq(users.id, authData.user.id),
        });

        // Auto-provision user record on first login if not present in users table
        if (!userProfile) {
            const role: UserRole =
                (authData.user.user_metadata?.role as UserRole) || 'production_staff';

            const [newUser] = await db
                .insert(users)
                .values({
                    id: authData.user.id,
                    email: authData.user.email || email,
                    fullName: authData.user.user_metadata?.full_name || email.split('@')[0],
                    role,
                    lastLoginAt: new Date(),
                })
                .returning();

            userProfile = newUser;
        } else {
            // Update last login
            await db
                .update(users)
                .set({ lastLoginAt: new Date() })
                .where(eq(users.id, userProfile.id));
        }

        if (!userProfile.isActive) {
            await supabase.auth.signOut();
            return NextResponse.json(
                {
                    success: false,
                    error: 'Account deactivated. Please contact your system administrator.',
                },
                { status: 403 }
            );
        }

        // 4. Audit Log
        try {
            const forwarded = req.headers.get('x-forwarded-for');
            const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1';
            const userAgent = req.headers.get('user-agent') || 'unknown';

            await db.insert(auditLogs).values({
                userId: userProfile.id,
                userEmail: userProfile.email,
                action: 'login',
                entity: 'auth',
                entityId: userProfile.id,
                ipAddress: ip,
                userAgent,
            });
        } catch (auditErr) {
            console.error('Audit log error on login:', auditErr);
        }

        return NextResponse.json({
            success: true,
            message: 'Login successful',
            user: {
                id: userProfile.id,
                email: userProfile.email,
                fullName: userProfile.fullName,
                role: userProfile.role,
                roleDisplay: formatRoleName(userProfile.role as UserRole),
            },
        });
    } catch (err: unknown) {
        console.error('Login Route Error:', err);
        return NextResponse.json(
            {
                success: false,
                error: 'An unexpected internal error occurred. Please try again.',
            },
            { status: 500 }
        );
    }
}


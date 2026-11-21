import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { loginSchema } from '@/lib/validations/auth';
import { db } from '@/lib/db';
import { users, employees, auditLogs } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { formatRoleName, type UserRole } from '@/lib/auth/rbac';
import { checkLoginRateLimit, recordFailedAttempt, clearLoginAttempts, getClientIp } from '@/lib/auth/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const ip = getClientIp(req);
        const rateLimitKey = `login_ip_${ip}`;
        const rateLimit = checkLoginRateLimit(rateLimitKey);
        if (!rateLimit.allowed && rateLimit.errorResponse) {
            return rateLimit.errorResponse;
        }

        const body = await req.json();
        let emailInput = (body.email || body.username || '').trim();
        const password = body.password;

        if (!emailInput || !password) {
            return NextResponse.json(
                { success: false, error: 'Username or email and password are required.' },
                { status: 400 }
            );
        }

        // Account-level rate limiting
        const accountRateKey = `account_${emailInput.toLowerCase()}`;
        const accountLimit = checkLoginRateLimit(accountRateKey);
        if (!accountLimit.allowed && accountLimit.errorResponse) {
            return accountLimit.errorResponse;
        }

        // If not an email format, check if it matches an employee code or format as default domain
        let resolvedEmail = emailInput;
        if (!emailInput.includes('@')) {
            const cleanCode = emailInput.trim();
            const emp = await db.query.employees.findFirst({
                where: sql`UPPER(TRIM(${employees.employeeCode})) = ${cleanCode.toUpperCase()}`,
                with: { user: true },
            });
            if (emp && emp.user?.email) {
                resolvedEmail = emp.user.email;
            } else if (emp && emp.email) {
                resolvedEmail = emp.email;
            } else {
                resolvedEmail = `${cleanCode.toLowerCase().replace(/[^a-z0-9]/g, '')}@btlhosur.com`;
            }
        }

        // 2. Authenticate with Supabase Auth
        const supabase = await createClient();
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: resolvedEmail,
            password,
        });

        if (authError || !authData.user) {
            recordFailedAttempt(rateLimitKey);
            recordFailedAttempt(accountRateKey);

            return NextResponse.json(
                {
                    success: false,
                    error: authError?.message || 'Invalid email or password.',
                },
                { status: 401 }
            );
        }

        // Clear attempts on success
        clearLoginAttempts(rateLimitKey);
        clearLoginAttempts(accountRateKey);

        // 3. Retrieve user profile and role from Drizzle DB
        let userProfile = await db.query.users.findFirst({
            where: eq(users.id, authData.user.id),
        });

        // Auto-provision user record on first login if not present in users table
        if (!userProfile) {
            const role: UserRole =
                (authData.user.user_metadata?.role as UserRole) || 'employee';

            const [newUser] = await db
                .insert(users)
                .values({
                    id: authData.user.id,
                    email: authData.user.email || resolvedEmail,
                    fullName: authData.user.user_metadata?.full_name || resolvedEmail.split('@')[0],
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


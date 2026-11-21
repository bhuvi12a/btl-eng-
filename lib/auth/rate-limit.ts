import { NextRequest, NextResponse } from 'next/server';

/**
 * In-memory persistent velocity cache with auto-expiration
 * Tracks IP address and identifier (email or employee code)
 */
interface AttemptRecord {
    count: number;
    firstAttemptAt: number;
    lockedUntil: number;
}

const loginAttempts = new Map<string, AttemptRecord>();

// Clean up expired entries every 10 minutes to avoid memory leaks
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of loginAttempts.entries()) {
        if (now > record.lockedUntil && now - record.firstAttemptAt > 3600000) {
            loginAttempts.delete(key);
        }
    }
}, 600000);

export interface RateLimitResult {
    allowed: boolean;
    remainingAttempts: number;
    lockoutSeconds?: number;
    errorResponse?: NextResponse;
}

/**
 * Derives client IP address securely, handling common proxy headers
 */
export function getClientIp(req: NextRequest): string {
    const xff = req.headers.get('x-forwarded-for');
    if (xff) {
        return xff.split(',')[0].trim();
    }
    const realIp = req.headers.get('x-real-ip');
    if (realIp) {
        return realIp.trim();
    }
    return '127.0.0.1';
}

/**
 * Evaluates login attempt against progressive rate limit:
 * - 5 attempts per 15 minutes window
 * - After 5 failed attempts: temporary 15-minute cool-down
 */
export function checkLoginRateLimit(key: string, maxAttempts: number = 5, windowMinutes: number = 15): RateLimitResult {
    const now = Date.now();
    const record = loginAttempts.get(key);

    if (!record) {
        return { allowed: true, remainingAttempts: maxAttempts };
    }

    // Check if currently locked out
    if (now < record.lockedUntil) {
        const lockoutSeconds = Math.ceil((record.lockedUntil - now) / 1000);
        return {
            allowed: false,
            remainingAttempts: 0,
            lockoutSeconds,
            errorResponse: NextResponse.json(
                {
                    success: false,
                    error: `Too many failed login attempts. For your security, this account is temporarily paused. Please try again in ${lockoutSeconds} seconds.`,
                    locked: true,
                    retryAfter: lockoutSeconds,
                },
                {
                    status: 429,
                    headers: { 'Retry-After': String(lockoutSeconds) },
                }
            ),
        };
    }

    // Reset window if expired
    if (now - record.firstAttemptAt > windowMinutes * 60 * 1000) {
        loginAttempts.delete(key);
        return { allowed: true, remainingAttempts: maxAttempts };
    }

    const remaining = Math.max(0, maxAttempts - record.count);
    if (remaining === 0) {
        // Trigger cool-down lockout
        record.lockedUntil = now + windowMinutes * 60 * 1000;
        const lockoutSeconds = windowMinutes * 60;
        return {
            allowed: false,
            remainingAttempts: 0,
            lockoutSeconds,
            errorResponse: NextResponse.json(
                {
                    success: false,
                    error: `Too many consecutive failed login attempts. Account temporarily locked for ${windowMinutes} minutes.`,
                    locked: true,
                    retryAfter: lockoutSeconds,
                },
                {
                    status: 429,
                    headers: { 'Retry-After': String(lockoutSeconds) },
                }
            ),
        };
    }

    return { allowed: true, remainingAttempts: remaining };
}

/**
 * Records a failed attempt for the identifier
 */
export function recordFailedAttempt(key: string, windowMinutes: number = 15) {
    const now = Date.now();
    const record = loginAttempts.get(key);

    if (!record) {
        loginAttempts.set(key, {
            count: 1,
            firstAttemptAt: now,
            lockedUntil: 0,
        });
    } else {
        record.count += 1;
        if (record.count >= 5) {
            record.lockedUntil = now + windowMinutes * 60 * 1000;
        }
    }
}

/**
 * Resets attempt counter on successful login
 */
export function clearLoginAttempts(key: string) {
    loginAttempts.delete(key);
}

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // We protect all /erp routes on the server side
    if (pathname.startsWith('/erp')) {
        // Exclude the login page itself
        if (pathname === '/erp/login') {
            return NextResponse.next();
        }

        // Supabase authentication stores auth tokens in cookies matching sb-*-auth-token
        const cookies = request.cookies.getAll();
        const hasAuthCookie = cookies.some(
            (c) => c.name.includes('auth-token') || c.name.startsWith('sb-')
        );

        if (!hasAuthCookie) {
            // Immediate server-side redirect to login with return target
            const loginUrl = new URL('/erp/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/erp/:path*'],
};

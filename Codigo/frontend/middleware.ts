import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/login', '/forgot-password', '/reset-password'];

const ignoredPaths = [
    '/_next',
    '/api',
    '/favicon.ico',
    '/logo_fabianamoveis-01.png'
];

function isTokenExpired(token: string): boolean {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp < currentTime;
    } catch {
        return true;
    }
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname === '/') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (ignoredPaths.some(path => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    if (isPublicRoute) {
        return NextResponse.next();
    }

    const cookieToken = request.cookies.get('auth_token')?.value;
    const headerToken = request.headers.get('x-auth-token') ||
        request.headers.get('authorization')?.replace('Bearer ', '');

    const token = cookieToken || headerToken;


    if (!token || isTokenExpired(token)) {
        const callbackUrl = encodeURIComponent(pathname);
        const response = NextResponse.redirect(new URL(`/login?callback=${callbackUrl}`, request.url));

        if (cookieToken) {
            response.cookies.set('auth_token', '', {
                expires: new Date(0),
                path: '/'
            });
        }

        return response;
    }

    const response = NextResponse.next();

    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image).*)',
    ],
};
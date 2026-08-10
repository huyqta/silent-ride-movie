import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    if (request.nextUrl.pathname.startsWith('/api/vsmov/')) {
        const path = request.nextUrl.pathname.replace('/api/vsmov/', '');
        const url = new URL(`https://vsmov.com/api/${path}`);
        url.search = request.nextUrl.search;
        
        const requestHeaders = new Headers();
        requestHeaders.set('Host', 'vsmov.com');
        requestHeaders.set('Accept', 'application/json');
        
        // Forward User-Agent if present
        const userAgent = request.headers.get('user-agent');
        if (userAgent) {
            requestHeaders.set('User-Agent', userAgent);
        }
        
        return NextResponse.rewrite(url, {
            request: {
                headers: requestHeaders,
            },
        });
    }
}

export const config = {
    matcher: '/api/vsmov/:path*',
};

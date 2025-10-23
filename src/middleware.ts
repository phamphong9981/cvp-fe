import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Note: This middleware works with client-side authentication
// The actual auth checks happen in the page components using useAuth
export function middleware(request: NextRequest) {
    // Get the pathname
    const { pathname } = request.nextUrl

    // Allow all routes to pass through
    // Client-side components will handle authentication checks
    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files with extensions
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
    ],
}


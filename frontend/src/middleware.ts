import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Add security headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('X-Powered-By', 'MUTUALFUNDSGALATHAI');

  // Continue to the route
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

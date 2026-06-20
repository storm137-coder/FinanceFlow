import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/analytics', '/bills', '/calendar', '/notifications', '/profile', '/reports', '/search'];
const publicOnlyRoutes = ['/login', '/register', '/reset-password'];

export function proxy(request: NextRequest) {
  const session = request.cookies.get('session');
  const path = request.nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isPublicOnlyRoute = publicOnlyRoutes.some(route => path.startsWith(route));

  // If user is trying to access a protected route without a session
  if (isProtectedRoute && !session) {
    const loginUrl = new URL('/login', request.url);
    // Optionally preserve the requested path as a query param
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }

  // If user has a session and tries to access login/register
  if (isPublicOnlyRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

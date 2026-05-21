import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Check for Firebase token in Authorization header or cookie
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : request.cookies.get('firebase-token')?.value;

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/register');
  
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard');

  // Debug logging
  console.log('[Middleware]', {
    path: request.nextUrl.pathname,
    hasToken: !!token,
    isAuthPage,
    isDashboardPage,
    cookieValue: request.cookies.get('firebase-token')?.value?.substring(0, 20) + '...',
  });

  // Redirect to login if accessing dashboard without token
  if (isDashboardPage && !token) {
    console.log('[Middleware] Redirecting to login - no token');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to dashboard if accessing auth pages with token
  if (isAuthPage && token) {
    console.log('[Middleware] Redirecting to dashboard - has token');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};

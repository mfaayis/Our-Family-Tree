import { NextRequest, NextResponse } from 'next/server';

// Protected routes that require authentication
const PROTECTED_ROUTES = ['/tree', '/people', '/search', '/my-branch', '/gallery', '/activity', '/admin', '/profile'];
const ADMIN_ROUTES = ['/admin'];
const AUTH_ROUTES = ['/login', '/signup', '/forgot-password', '/join'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public routes
  if (pathname === '/' || AUTH_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.next();
  }
  
  // For protected routes, we rely on client-side auth guards
  // (Firebase Auth tokens are client-side; full server-side auth requires Admin SDK)
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};

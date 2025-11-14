import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const pathname = request.nextUrl.pathname;
  
  // Check if tokens are being passed via URL (cross-domain auth)
  const hasTokenInUrl = request.nextUrl.searchParams.has('token');

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    // Allow access if token is in cookie OR being passed via URL
    if (!token && !hasTokenInUrl) {
      // Redirect to main site login
      const mainUrl = process.env.NEXT_PUBLIC_MAIN_URL || 'http://localhost:3000';
      const loginUrl = new URL('/login', mainUrl);
      loginUrl.searchParams.set('redirect', '/dashboard');
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from login/register to dashboard
  if ((pathname === '/login' || pathname === '/register') && token) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};

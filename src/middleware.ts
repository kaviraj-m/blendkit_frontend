import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicPath = path === '/login' || path === '/' || path === '/register';

  // Get the token from the cookies
  const token = request.cookies.get('token')?.value || '';
  
  // Check for token in localStorage if not in cookies (for client-side auth)
  // Note: This won't work in middleware as it's server-side, but we keep the cookie check
  
  // If the user is not logged in and trying to access a protected route, redirect to login
  if (!isPublicPath && !token) {
    // Store the original URL to redirect back after login
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  
  // If the user is logged in and trying to access login or register, redirect to dashboard
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    // Match all dashboard routes
    '/dashboard/:path*',
    // Match authentication routes
    '/login',
    '/register',
    // Add any other protected routes here
  ],
};
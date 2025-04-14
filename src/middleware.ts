import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get path
  const path = request.nextUrl.pathname;
  
  // Define public paths that don't require authentication
  const isPublicPath = path === '/login' || path === '/' || path === '/register';
  
  // Get the token from the cookies
  const token = request.cookies.get('token')?.value || '';
  
  // If the path is protected and no token exists, redirect to login
  if (!isPublicPath && !token) {
    // Get the origin
    const origin = request.nextUrl.origin;
    
    // Create the URL for the login page with a callback parameter
    const loginUrl = new URL('/login', origin);
    loginUrl.searchParams.set('callbackUrl', path);
    
    return NextResponse.redirect(loginUrl);
  }
  
  // For authenticated users, let the application handle routing 
  // without middleware interference
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    // Match all dashboard routes for protection
    '/dashboard/:path*',
  ],
};
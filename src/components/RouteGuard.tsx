'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { hasPermission } from '@/utils/rbac';

interface RouteGuardProps {
  children: ReactNode;
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Auth check function
    const authCheck = () => {
      // Public paths that don't require authentication
      const publicPaths = ['/login', '/register', '/forgot-password'];
      const isPublicPath = publicPaths.includes(pathname);

      if (!isLoading) {
        if (!isAuthenticated && !isPublicPath) {
          // Not logged in and trying to access a protected route
          // Redirect to login page with return url
          setAuthorized(false);
          router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
        } else if (isAuthenticated && isPublicPath) {
          // User is logged in but on a public page, redirect to dashboard
          setAuthorized(false);
          router.push('/dashboard');
        } else if (isAuthenticated && pathname === '/') {
          // Redirect from root to dashboard if logged in
          setAuthorized(false);
          router.push('/dashboard');
        } else if (isAuthenticated && pathname.startsWith('/dashboard')) {
          // Check role-based access for dashboard routes
          let roleName = '';
          if (typeof user?.role === 'string') {
            roleName = user.role.toLowerCase();
            console.log('RouteGuard: Role is string', roleName);
          } else if (user?.role && typeof user.role === 'object' && 'name' in user.role) {
            roleName = (user.role.name as string).toLowerCase();
            console.log('RouteGuard: Role is object with name', roleName);
          }
          console.log('RouteGuard: Final role name for access check', roleName);
          console.log('RouteGuard: Current path', pathname);

          // Check staff-specific routes
          if (pathname.startsWith('/dashboard/staff') && roleName !== 'staff') {
            console.log('No permission to access staff routes, redirecting to dashboard');
            setAuthorized(false);
            router.push('/dashboard');
            return;
          }

          // Check HOD-specific routes
          if (pathname.startsWith('/dashboard/hod') && roleName !== 'hod') {
            console.log('No permission to access HOD routes, redirecting to dashboard');
            setAuthorized(false);
            router.push('/dashboard');
            return;
          }

          // Check specific permissions based on the route
          if (pathname.includes('/gym-posts') && !hasPermission(user?.role, 'view_gym_posts')) {
            console.log('No permission to view gym posts, redirecting to dashboard');
            setAuthorized(false);
            router.push('/dashboard');
            return;
          }

          if (pathname.includes('/gym-schedule') && !hasPermission(user?.role, 'view_gym_schedule')) {
            console.log('No permission to view gym schedule, redirecting to dashboard');
            setAuthorized(false);
            router.push('/dashboard');
            return;
          }

          if (pathname.includes('/equipment') && !hasPermission(user?.role, 'view_equipment')) {
            console.log('No permission to view equipment, redirecting to dashboard');
            setAuthorized(false);
            router.push('/dashboard');
            return;
          }

          // User is authorized to view the page
          setAuthorized(true);
        } else {
          // All other cases, allow access
          setAuthorized(true);
        }
      }
    };

    // Run auth check on initial load and route change
    authCheck();
  }, [isLoading, isAuthenticated, pathname, router, user]);

  // Show loading spinner if authorization is in progress
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    );
  }
  
  // If not authorized and not loading, show a simple message (this is important to avoid a black screen)
  if (!authorized && !isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="animate-pulse rounded-full h-16 w-16 bg-blue-200 mb-4 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-4V3" />
          </svg>
        </div>
        <p className="text-gray-700 text-lg font-medium mb-1">Redirecting...</p>
        <p className="text-gray-500 text-sm mb-6">Please wait while we redirect you to the appropriate page.</p>
        
        {/* Add a logout button to help users who might be stuck */}
        <button 
          onClick={() => {
            // Clear all auth data
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            
            // Force reload to clear any state
            window.location.href = '/login';
          }}
          className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded-md transition-colors duration-300"
        >
          Logout and restart
        </button>
      </div>
    );
  }

  // Return authorized content
  return authorized ? <>{children}</> : null;
} 
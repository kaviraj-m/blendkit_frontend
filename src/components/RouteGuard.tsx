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
          } else if (user?.role && typeof user.role === 'object' && 'name' in user.role) {
            roleName = (user.role.name as string).toLowerCase();
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

  // Show loading or authorized content
  return authorized ? <>{children}</> : null;
} 
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  // Helper function to get role name
  const getRoleName = (userObj: any): string => {
    if (!userObj) return '';
    
    return typeof userObj.role === 'string' 
      ? userObj.role 
      : (userObj.role && typeof userObj.role === 'object' && userObj.role.name 
        ? userObj.role.name 
        : '');
  };

  useEffect(() => {
    // If authentication check is complete and user is not logged in, redirect to login
    if (!isLoading && (!user || !token)) {
      router.push('/login');
      return;
    }
    
    // Role-based redirects from main dashboard page
    if (!isLoading && user && token && pathname === '/dashboard') {
      const roleName = getRoleName(user);
      
      // Redirect student to their dashboard
      if (roleName === 'student') {
        router.push('/dashboard/student');
      }
      
      // Redirect staff to their dashboard
      if (roleName === 'staff') {
        router.push('/dashboard/staff');
      }
      
      // Redirect hod to their dashboard
      if (roleName === 'hod') {
        router.push('/dashboard/hod');
      }
      
      // Redirect academic director to their dashboard
      if (roleName === 'academic_director') {
        router.push('/dashboard/academic-director');
      }
      
      // Redirect security to their dashboard
      if (roleName === 'security') {
        router.push('/dashboard/security');
      }
      
      // Redirect gym staff to their dashboard
      if (roleName === 'gym_staff') {
        router.push('/dashboard/gym-staff');
      }
      
      // Redirect executive director to their dashboard
      if (roleName === 'executive_director') {
        router.push('/dashboard/executive-director');
      }
    }
  }, [user, token, isLoading, router, pathname]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // If not authenticated, don't render children (will redirect in useEffect)
  if (!user || !token) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // If authenticated, render the dashboard layout with children
  return <DashboardLayout>{children}</DashboardLayout>;
}
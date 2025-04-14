'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function RedirectPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // User is not logged in, redirect to login
        router.push('/login');
        return;
      }

      // Get role name from user object
      let roleName = '';
      if (typeof user.role === 'string') {
        roleName = user.role.toLowerCase();
      } else if (user.role && typeof user.role === 'object' && 'name' in user.role) {
        roleName = user.role.name.toLowerCase();
      }

      // Redirect based on role
      switch (roleName) {
        case 'staff':
          router.push('/dashboard/staff');
          break;
        case 'student':
          router.push('/dashboard/student');
          break;
        case 'hod':
          router.push('/dashboard/hod');
          break;
        case 'gym_staff':
          router.push('/dashboard/gym-staff');
          break;
        case 'executive_director':
          router.push('/dashboard/executive-director');
          break;
        default:
          router.push('/dashboard');
          break;
      }
    }
  }, [user, isLoading, router]);

  // Display a loading indicator while redirecting
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
      <p className="text-gray-600">Redirecting to your dashboard...</p>
    </div>
  );
} 
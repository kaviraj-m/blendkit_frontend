'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/utils/rbac';

export default function Navigation() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Determine user permissions
  const canViewGymSchedule = user && hasPermission(user.role, 'view_gym_schedule');
  const canViewGymPosts = user && hasPermission(user.role, 'view_gym_posts');
  const canViewEquipment = user && hasPermission(user.role, 'view_equipment');
  const canViewAttendance = user && (
    hasPermission(user.role, 'view_attendance') || 
    hasPermission(user.role, 'view_own_attendance')
  );

  const isActive = (path: string) => {
    return pathname === path ? 'bg-indigo-700' : '';
  };

  return (
    <nav className="bg-indigo-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/dashboard" className="font-bold text-xl">Gym Management</Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link 
                  href="/dashboard" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard')} hover:bg-indigo-700`}
                >
                  Dashboard
                </Link>
                
                {canViewGymSchedule && (
                  <Link 
                    href="/dashboard/gym-schedule" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard/gym-schedule')} hover:bg-indigo-700`}
                  >
                    Schedule
                  </Link>
                )}
                
                {canViewGymPosts && (
                  <Link 
                    href="/dashboard/gym-posts" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard/gym-posts')} hover:bg-indigo-700`}
                  >
                    Workout Posts
                  </Link>
                )}
                
                {canViewEquipment && (
                  <Link 
                    href="/dashboard/equipment" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard/equipment')} hover:bg-indigo-700`}
                  >
                    Equipment
                  </Link>
                )}
                
                {canViewAttendance && (
                  <Link 
                    href="/dashboard/gym-attendance" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard/gym-attendance')} hover:bg-indigo-700`}
                  >
                    Attendance
                  </Link>
                )}
              </div>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <div className="relative">
                <div className="flex items-center">
                  <Link 
                    href="/dashboard/profile"
                    className="mr-4 text-sm hover:text-indigo-200 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </Link>
                  <span className="mr-3 text-sm">{user?.name}</span>
                  <button
                    onClick={logout}
                    className="bg-indigo-700 p-1 rounded-full text-white hover:bg-indigo-800 focus:outline-none"
                  >
                    <span className="px-2 py-1 text-sm">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-indigo-200 hover:text-white hover:bg-indigo-700 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link 
            href="/dashboard" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard')} hover:bg-indigo-700`}
            onClick={() => setIsMenuOpen(false)}
          >
            Dashboard
          </Link>
          
          {canViewGymSchedule && (
            <Link 
              href="/dashboard/gym-schedule" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard/gym-schedule')} hover:bg-indigo-700`}
              onClick={() => setIsMenuOpen(false)}
            >
              Schedule
            </Link>
          )}
          
          {canViewGymPosts && (
            <Link 
              href="/dashboard/gym-posts" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard/gym-posts')} hover:bg-indigo-700`}
              onClick={() => setIsMenuOpen(false)}
            >
              Workout Posts
            </Link>
          )}
          
          {canViewEquipment && (
            <Link 
              href="/dashboard/equipment" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard/equipment')} hover:bg-indigo-700`}
              onClick={() => setIsMenuOpen(false)}
            >
              Equipment
            </Link>
          )}
          
          {canViewAttendance && (
            <Link 
              href="/dashboard/gym-attendance" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard/gym-attendance')} hover:bg-indigo-700`}
              onClick={() => setIsMenuOpen(false)}
            >
              Attendance
            </Link>
          )}
        </div>
        
        {/* Mobile menu profile link */}
        <div className="pt-4 pb-3 border-t border-indigo-700">
          <div className="flex items-center px-5">
            <div className="ml-3">
              <div className="text-base font-medium leading-none">{user?.name}</div>
              <div className="text-sm font-medium leading-none text-indigo-200 mt-1">{user?.email}</div>
            </div>
          </div>
          <div className="mt-3 px-2 space-y-1">
            <Link
              href="/dashboard/profile"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-700 w-full text-left"
            >
              Profile
            </Link>
            <button
              onClick={() => {
                logout();
                setIsMenuOpen(false);
              }}
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-700 w-full text-left"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
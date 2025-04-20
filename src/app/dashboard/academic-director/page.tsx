'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { 
  RiDashboardLine,
  RiPassPendingLine,
  RiTimeLine,
  RiInformationLine,
  RiTimeFill,
  RiCalendarLine,
  RiMessageLine
} from 'react-icons/ri';
import axios from 'axios';

export default function AcademicDirectorDashboard() {
  const router = useRouter();
  const { user, isLoading, token } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      
      // Check if user has Academic Director role
      const roleName = typeof user.role === 'object' ? user.role.name : user.role;
      if (roleName !== 'academic_director') {
        router.push('/dashboard');
        return;
      }
      
      // Set greeting based on time of day
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        setGreeting('Good morning');
      } else if (hour >= 12 && hour < 17) {
        setGreeting('Good afternoon');
      } else if (hour >= 17 && hour < 21) {
        setGreeting('Good evening');
      } else {
        setGreeting('Good night');
      }

      // Update time and date
      const updateDateTime = () => {
        const now = new Date();
        setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
        setCurrentDate(now.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }));
      };

      updateDateTime();
      const interval = setInterval(updateDateTime, 1000);

      return () => clearInterval(interval);
    }
  }, [user, isLoading, router, token]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      {/* Welcome Banner */}
      <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-xl p-8 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 transform rotate-12"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 transform -rotate-12"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-white/5 rounded-full"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-3 flex items-center">
              {greeting}, <span className="ml-2 text-blue-100">{user?.name}!</span>
            </h1>
            <p className="text-blue-100 text-lg mb-6">
              Welcome to the Gate Pass Management Portal.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium">
                <RiDashboardLine className="mr-2" />
                Academic Director
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium">
                <RiCalendarLine className="mr-2" />
                {currentDate.split(',')[0]}
              </span>
            </div>
          </div>
          <div className="mt-6 md:mt-0 text-right">
            <div className="text-3xl font-semibold mb-2 flex items-center justify-end">
              <RiTimeFill className="mr-2 text-blue-200" />
              {currentTime}
            </div>
            <div className="text-blue-100 text-base">{currentDate}</div>
          </div>
        </div>
      </div>

      {/* Gate Pass Management */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-blue-100">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <RiPassPendingLine className="mr-2" />
            Gate Pass Management
          </h2>
          <p className="text-blue-100">Review and approve gate passes by requester type</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <Link 
              href="/dashboard/academic-director/gate-pass-by-type"
              className="flex items-center p-5 border border-gray-200 rounded-lg hover:bg-blue-50 transition-all duration-300 hover:shadow-md"
            >
              <div className="rounded-lg bg-blue-100 p-3 mr-4 shadow">
                <RiPassPendingLine className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Gate Pass Approvals By Type</h3>
                <p className="text-sm text-gray-600">Manage student, staff and HOD gate pass requests separately</p>
              </div>
            </Link>
          </div>
          
          <div className="mt-6 p-5 border border-blue-100 rounded-lg bg-blue-50">
            <div className="flex items-start mb-3">
              <div className="rounded-lg bg-blue-200 p-2 mr-3 mt-1">
                <RiInformationLine className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">Gate Pass Approval Process</h3>
                <ul className="text-sm text-blue-700 list-disc list-inside space-y-1.5">
                  <li>Filter requests by student, staff, or HOD</li>
                  <li>Review request details and reason</li>
                  <li>Verify request validity and duration</li>
                  <li>Approve or reject with comments if needed</li>
                  <li>Requesters will be notified of your decision</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debug information - only shown in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
          <h3 className="font-medium mb-2">Debug Info</h3>
          <p>User ID: {user?.id}</p>
          <p>Role: {typeof user?.role === 'object' ? user.role.name : user?.role}</p>
          <p>Token: {user ? 'Valid' : 'Invalid'}</p>
        </div>
      )}
    </>
  );
} 
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { 
  RiUserLine, 
  RiCalendarCheckLine, 
  RiLineChartLine, 
  RiUserSearchLine,
  RiDashboardLine,
  RiPassPendingLine,
  RiTeamLine,
  RiFileListLine,
  RiMessageLine
} from 'react-icons/ri';

export default function HodDashboard() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      
      // Check if user has HOD role
      const roleName = typeof user.role === 'object' ? user.role.name : user.role;
      if (roleName !== 'hod') {
        router.push('/dashboard');
        return;
      }
      
      // Set greeting based on time of day
      const hour = new Date().getHours();
      if (hour < 12) setGreeting('Good Morning');
      else if (hour < 18) setGreeting('Good Afternoon');
      else setGreeting('Good Evening');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          {greeting}, {user?.name || 'HOD'}
        </h1>
        <p className="text-gray-600">Welcome to your Head of Department dashboard</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <RiUserLine className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Department Students</p>
            <p className="text-2xl font-bold">182</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-green-100 p-3 mr-4">
            <RiTeamLine className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Department Staff</p>
            <p className="text-2xl font-bold">14</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-purple-100 p-3 mr-4">
            <RiLineChartLine className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Department Performance</p>
            <p className="text-2xl font-bold">89%</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-amber-100 p-3 mr-4">
            <RiPassPendingLine className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pending Approvals</p>
            <p className="text-2xl font-bold">8</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Approvals Section */}
        <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Department Management</h2>
          <div className="space-y-4">
            <Link href="/dashboard/hod/staff" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <div className="flex items-center">
                <RiTeamLine className="h-5 w-5 text-indigo-500 mr-3" />
                <div>
                  <h3 className="font-medium">Staff Management</h3>
                  <p className="text-sm text-gray-500">Manage and oversee department staff</p>
                </div>
              </div>
            </Link>
            
            <Link href="/dashboard/hod/students" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <div className="flex items-center">
                <RiUserLine className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <h3 className="font-medium">Student Overview</h3>
                  <p className="text-sm text-gray-500">View and manage department students</p>
                </div>
              </div>
            </Link>
            
            <Link href="/dashboard/hod/gate-pass" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <div className="flex items-center">
                <RiPassPendingLine className="h-5 w-5 text-amber-500 mr-3" />
                <div>
                  <h3 className="font-medium">Gate Pass Approvals</h3>
                  <p className="text-sm text-gray-500">Review and approve student gate pass requests</p>
                </div>
              </div>
            </Link>
            
            <Link href="/dashboard/hod/complaints" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <div className="flex items-center">
                <RiMessageLine className="h-5 w-5 text-rose-500 mr-3" />
                <div>
                  <h3 className="font-medium">Student Complaints</h3>
                  <p className="text-sm text-gray-500">Review and respond to student complaints</p>
                </div>
              </div>
            </Link>
            
            <Link href="/dashboard/hod/reports" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <div className="flex items-center">
                <RiFileListLine className="h-5 w-5 text-green-500 mr-3" />
                <div>
                  <h3 className="font-medium">Department Reports</h3>
                  <p className="text-sm text-gray-500">Generate and view reports for your department</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Highlights */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Department Highlights</h2>
          <div className="space-y-4">
            <div className="p-4 border border-blue-100 rounded-lg bg-blue-50">
              <h3 className="font-medium text-blue-700 mb-1">Academic Calendar</h3>
              <p className="text-sm text-blue-600 mb-2">Current Semester: Fall 2023</p>
              <div className="text-xs text-blue-500 flex justify-between">
                <span>Midterms: Oct 12-16</span>
                <span>Finals: Dec 5-15</span>
              </div>
            </div>
            
            <div className="p-4 border border-green-100 rounded-lg bg-green-50">
              <h3 className="font-medium text-green-700 mb-1">Department Performance</h3>
              <p className="text-sm text-green-600">Average GPA: 3.4/4.0</p>
              <div className="w-full bg-green-200 rounded-full h-2.5 mt-2">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            
            <div className="p-4 border border-purple-100 rounded-lg bg-purple-50">
              <h3 className="font-medium text-purple-700 mb-1">Recent Achievements</h3>
              <ul className="text-sm text-purple-600 list-disc list-inside">
                <li>Research grant awarded</li>
                <li>3 papers published</li>
                <li>Student team won Hackathon</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Debug information - only shown in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-200 rounded-lg">
          <h3 className="font-medium mb-2">Debug Info</h3>
          <p>User ID: {user?.id}</p>
          <p>Role: {typeof user?.role === 'object' ? user.role.name : user?.role}</p>
          <p>Department: {user?.department?.name || 'Unknown'}</p>
          <p>Token: {user ? 'Valid' : 'Invalid'}</p>
        </div>
      )}
    </>
  );
} 
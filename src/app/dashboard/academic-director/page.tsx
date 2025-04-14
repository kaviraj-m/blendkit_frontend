'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { 
  RiUserLine, 
  RiCalendarCheckLine, 
  RiLineChartLine, 
  RiPassPendingLine,
  RiTeamLine,
  RiFileListLine,
  RiMessageLine,
  RiBuilding4Line
} from 'react-icons/ri';

export default function AcademicDirectorDashboard() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [greeting, setGreeting] = useState('');

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
      if (hour < 12) setGreeting('Good Morning');
      else if (hour < 18) setGreeting('Good Afternoon');
      else setGreeting('Good Evening');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-800">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {greeting}, {user?.name || 'Academic Director'}
        </h1>
        <p className="text-gray-800">Welcome to your Academic Director dashboard</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <RiUserLine className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-700">Total Students</p>
            <p className="text-2xl font-bold text-gray-900">2,450</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-green-100 p-3 mr-4">
            <RiTeamLine className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-700">Faculty Members</p>
            <p className="text-2xl font-bold text-gray-900">125</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-purple-100 p-3 mr-4">
            <RiBuilding4Line className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-700">Departments</p>
            <p className="text-2xl font-bold text-gray-900">8</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-amber-100 p-3 mr-4">
            <RiPassPendingLine className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-700">Pending Approvals</p>
            <p className="text-2xl font-bold text-gray-900">12</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Management Section */}
        <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Academic Management</h2>
          <div className="space-y-4">
            <Link href="/dashboard/academic-director/departments" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <div className="flex items-center">
                <RiBuilding4Line className="h-5 w-5 text-indigo-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Department Overview</h3>
                  <p className="text-sm text-gray-700">Manage and oversee all academic departments</p>
                </div>
              </div>
            </Link>
            
            <Link href="/dashboard/academic-director/faculty" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <div className="flex items-center">
                <RiTeamLine className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Faculty Management</h3>
                  <p className="text-sm text-gray-700">Review and manage faculty information</p>
                </div>
              </div>
            </Link>
            
            <Link href="/dashboard/academic-director/gate-pass" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <div className="flex items-center">
                <RiPassPendingLine className="h-5 w-5 text-amber-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Gate Pass Approvals</h3>
                  <p className="text-sm text-gray-700">Review and approve student gate pass requests</p>
                </div>
              </div>
            </Link>
            
            <Link href="/dashboard/academic-director/complaints" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <div className="flex items-center">
                <RiMessageLine className="h-5 w-5 text-rose-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Student Complaints</h3>
                  <p className="text-sm text-gray-700">Review and respond to escalated student complaints</p>
                </div>
              </div>
            </Link>
            
            <Link href="/dashboard/academic-director/reports" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <div className="flex items-center">
                <RiFileListLine className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Academic Reports</h3>
                  <p className="text-sm text-gray-700">Generate and view reports for the institution</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Highlights */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Institution Highlights</h2>
          <div className="space-y-4">
            <div className="p-4 border border-blue-100 rounded-lg bg-blue-50">
              <h3 className="font-medium text-blue-800 mb-1">Academic Calendar</h3>
              <p className="text-sm text-blue-700 mb-2">Current Semester: Fall 2023</p>
              <div className="text-xs text-blue-600 flex justify-between">
                <span>Midterms: Oct 12-16</span>
                <span>Finals: Dec 5-15</span>
              </div>
            </div>
            
            <div className="p-4 border border-green-100 rounded-lg bg-green-50">
              <h3 className="font-medium text-green-800 mb-1">Institution Performance</h3>
              <p className="text-sm text-green-700">Average GPA: 3.5/4.0</p>
              <div className="w-full bg-green-200 rounded-full h-2.5 mt-2">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>
            
            <div className="p-4 border border-purple-100 rounded-lg bg-purple-50">
              <h3 className="font-medium text-purple-800 mb-1">Recent Achievements</h3>
              <ul className="text-sm text-purple-700 list-disc list-inside">
                <li>NAAC A++ Accreditation</li>
                <li>Ranked #5 in National Survey</li>
                <li>$2.5M Research Grant</li>
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
          <p>Token: {user ? 'Valid' : 'Invalid'}</p>
        </div>
      )}
    </>
  );
} 
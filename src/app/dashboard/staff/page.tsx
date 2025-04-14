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
  RiFilePaper2Line
} from 'react-icons/ri';
import axios from 'axios';

export default function StaffDashboard() {
  const router = useRouter();
  const { user, isLoading, token } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [pendingGatePasses, setPendingGatePasses] = useState(0);
  const [isLoadingGatePasses, setIsLoadingGatePasses] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      
      // Check if user has staff role
      const roleName = typeof user.role === 'object' ? user.role.name : user.role;
      if (roleName !== 'staff') {
        router.push('/dashboard');
        return;
      }
      
      // Set greeting based on time of day
      const hour = new Date().getHours();
      if (hour < 12) setGreeting('Good Morning');
      else if (hour < 18) setGreeting('Good Afternoon');
      else setGreeting('Good Evening');

      // Fetch pending gate passes count
      fetchPendingGatePassesCount();
    }
  }, [user, isLoading, router, token]);

  const fetchPendingGatePassesCount = async () => {
    if (!token) return;
    
    setIsLoadingGatePasses(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/gate-passes/pending-staff-approval`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingGatePasses(response.data?.length || 0);
    } catch (error) {
      console.error('Error fetching pending gate passes:', error);
    } finally {
      setIsLoadingGatePasses(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          {greeting}, {user?.name || 'Staff'}
        </h1>
        <p className="text-gray-600">Welcome to your staff dashboard</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <RiUserLine className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Students</p>
            <p className="text-2xl font-bold">324</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-green-100 p-3 mr-4">
            <RiCalendarCheckLine className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Today's Attendance</p>
            <p className="text-2xl font-bold">245</p>
          </div>
        </div>

        <Link href="/dashboard/staff/gate-pass" className="bg-white rounded-lg shadow p-6 flex items-center hover:bg-amber-50 transition duration-300 ease-in-out group">
          <div className="rounded-full bg-amber-100 p-3 mr-4 group-hover:bg-amber-200 transition-colors">
            <RiFilePaper2Line className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pending Gate Passes</p>
            <div className="flex items-center">
              <p className="text-2xl font-bold">{isLoadingGatePasses ? '...' : pendingGatePasses}</p>
              {pendingGatePasses > 0 && (
                <span className="ml-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">Action needed</span>
              )}
            </div>
          </div>
        </Link>

        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-purple-100 p-3 mr-4">
            <RiLineChartLine className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Student Progress</p>
            <p className="text-2xl font-bold">82%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Activity Section */}
        <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Student Management</h2>
          <div className="space-y-4">
            <Link href="/dashboard/staff/students" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <div className="flex items-center">
                <RiUserLine className="h-5 w-5 text-indigo-500 mr-3" />
                <div>
                  <h3 className="font-medium">View Students</h3>
                  <p className="text-sm text-gray-500">Access and manage student profiles</p>
                </div>
              </div>
            </Link>
            
            <Link href="/dashboard/staff/attendance" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <div className="flex items-center">
                <RiCalendarCheckLine className="h-5 w-5 text-green-500 mr-3" />
                <div>
                  <h3 className="font-medium">Attendance Management</h3>
                  <p className="text-sm text-gray-500">Track and update student attendance</p>
                </div>
              </div>
            </Link>
            
            <Link href="/dashboard/staff/progress" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <div className="flex items-center">
                <RiLineChartLine className="h-5 w-5 text-purple-500 mr-3" />
                <div>
                  <h3 className="font-medium">Progress Tracking</h3>
                  <p className="text-sm text-gray-500">Monitor student progress and performance</p>
                </div>
              </div>
            </Link>
            
            <Link href="/dashboard/staff/gate-pass" className="block p-4 border border-gray-200 bg-amber-50 rounded-lg hover:bg-amber-100 transition relative overflow-hidden">
              {pendingGatePasses > 0 && (
                <span className="absolute top-0 right-0 bg-amber-500 text-white text-xs px-2 py-1 m-2 rounded-full">
                  {pendingGatePasses} pending
                </span>
              )}
              <div className="flex items-center">
                <RiPassPendingLine className="h-5 w-5 text-amber-500 mr-3" />
                <div>
                  <h3 className="font-medium">Gate Pass Approvals</h3>
                  <p className="text-sm text-gray-500">Review and manage student gate pass requests</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Gym Resources</h2>
          <div className="space-y-4">
            <Link href="/dashboard/staff/gym" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <div className="flex items-center">
                <RiDashboardLine className="h-5 w-5 text-red-500 mr-3" />
                <div>
                  <h3 className="font-medium">Gym Management</h3>
                  <p className="text-sm text-gray-500">Manage gym schedules and equipment</p>
                </div>
              </div>
            </Link>
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
          <p>Pending Gate Passes: {pendingGatePasses}</p>
        </div>
      )}
    </>
  );
} 
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
  RiFilePaper2Line,
  RiToolsLine,
  RiTimeLine,
  RiTeamLine,
  RiCalendarEventLine,
  RiUserFollowLine,
  RiArticleLine,
  RiToolsFill,
  RiCheckLine,
  RiFileTextLine
} from 'react-icons/ri';
import axios from 'axios';

// Custom dumbbell icon for gym
const DumbbellIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24"
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="h-8 w-8 text-purple-500"
  >
    <path d="M6 5v14" />
    <path d="M18 5v14" />
    <path d="M6 9a2 2 0 0 0 2-2v0a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2Z" />
    <path d="M6 19a2 2 0 0 1 2-2v0a2 2 0 0 1-2-2H4a2 2 0 0 1-2 2v0a2 2 0 0 1 2 2Z" />
    <path d="M18 9a2 2 0 0 0 2-2v0a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2Z" />
    <path d="M18 19a2 2 0 0 1 2-2v0a2 2 0 0 1-2-2h-2a2 2 0 0 1-2 2v0a2 2 0 0 1 2 2Z" />
  </svg>
);

export default function StaffDashboard() {
  const router = useRouter();
  const { user, isLoading, token } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
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

      // Fetch pending gate passes count
      fetchPendingGatePassesCount();

      return () => clearInterval(interval);
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
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      {/* Welcome Banner */}
      <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-xl p-8 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 transform rotate-12"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 transform -rotate-12"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-3">
              {greeting}, {user?.name}!
            </h1>
            <p className="text-blue-100 text-lg mb-6">
              Welcome to the Staff Management Portal. Manage gate passes and gym activities from here.
            </p>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium">
                <RiDashboardLine className="mr-2" />
                Staff Dashboard
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium">
                <RiTimeLine className="mr-2" />
                {currentTime}
              </span>
            </div>
          </div>
          <div className="mt-6 md:mt-0 text-right">
            <div className="text-3xl font-semibold mb-2">{currentTime}</div>
            <div className="text-blue-100 text-lg">{currentDate}</div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        {/* Pending Gate Passes */}
        <Link 
          href="/dashboard/staff/gate-pass" 
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:bg-amber-50 border border-amber-100"
        >
          <div className="flex items-center">
            <div className="rounded-xl bg-amber-100 p-4 mr-4">
              <RiPassPendingLine className="h-8 w-8 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Pending Gate Passes</p>
              <div className="flex items-center">
                <p className="text-3xl font-bold text-gray-800">{isLoadingGatePasses ? '...' : pendingGatePasses}</p>
                {pendingGatePasses > 0 && (
                  <span className="ml-3 bg-amber-500 text-white text-xs px-3 py-1 rounded-full font-medium">Action needed</span>
                )}
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Gate Pass Management */}
        <div className="col-span-1 xl:col-span-2 bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-5 bg-gradient-to-r from-blue-600 to-blue-800">
            <h3 className="text-xl font-bold text-white">Gate Pass Management</h3>
            <p className="text-white mt-1">Manage leave and emergency pass requests</p>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">Manage Gate Passes</h3>
                    <p className="text-gray-700 mt-1">Review and approve student gate pass requests</p>
                  </div>
                  <div className="bg-blue-100 text-blue-800 p-2 rounded-full">
                    <RiCheckLine className="h-5 w-5" />
                  </div>
                </div>
                <button
                  onClick={() => router.push('/dashboard/staff/gate-pass')}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg w-full transition-colors"
                >
                  View Requests
                </button>
              </div>
              
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">Apply for Gate Pass</h3>
                    <p className="text-gray-700 mt-1">Submit your own gate pass requests</p>
                  </div>
                  <div className="bg-green-100 text-green-800 p-2 rounded-full">
                    <RiFileTextLine className="h-5 w-5" />
                  </div>
                </div>
                <button
                  onClick={() => router.push('/dashboard/staff/gate-pass/apply')}
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg w-full transition-colors"
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Gym Management */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-blue-100">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
            <h2 className="text-2xl font-bold text-white">Gym Management</h2>
            <p className="text-blue-100">Manage gym schedules, equipment, and posts</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <Link 
                href="/dashboard/gym-schedule"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-all duration-300 hover:shadow-md"
              >
                <div className="rounded-lg bg-blue-100 p-3 mr-4">
                  <RiTimeLine className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Gym Schedule</h3>
                  <p className="text-sm text-gray-600">Manage gym hours and class schedules</p>
                </div>
              </Link>
              
              <Link 
                href="/dashboard/equipment"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-all duration-300 hover:shadow-md"
              >
                <div className="rounded-lg bg-blue-100 p-3 mr-4">
                  <RiToolsFill className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Equipment Management</h3>
                  <p className="text-sm text-gray-600">Manage gym equipment and maintenance</p>
                </div>
              </Link>

              <Link 
                href="/dashboard/gym-posts"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-all duration-300 hover:shadow-md"
              >
                <div className="rounded-lg bg-blue-100 p-3 mr-4">
                  <RiArticleLine className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Gym Posts</h3>
                  <p className="text-sm text-gray-600">Create and manage workout posts and announcements</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 
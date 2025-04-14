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
  RiToolsFill
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
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-amber-100">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6">
            <h2 className="text-2xl font-bold text-white">Gate Pass Management</h2>
            <p className="text-amber-100">Review and manage student gate pass requests</p>
          </div>
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Pending Approvals</h3>
                <span className="bg-amber-100 text-amber-800 px-4 py-1 rounded-full text-sm font-medium">
                  {isLoadingGatePasses ? '...' : pendingGatePasses} requests
                </span>
              </div>
              <p className="text-gray-600 mb-6">
                Review and approve student gate pass requests. Ensure proper documentation and timing.
              </p>
              <Link 
                href="/dashboard/staff/gate-pass"
                className="inline-flex items-center px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium shadow-md hover:shadow-lg"
              >
                <RiPassPendingLine className="mr-2" />
                Manage Gate Passes
              </Link>
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
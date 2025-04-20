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
  RiFileList2Line
} from 'react-icons/ri';
import axios from 'axios';

export default function HodDashboard() {
  const router = useRouter();
  const { user, isLoading, token } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [pendingStaffGatePasses, setPendingStaffGatePasses] = useState(0);
  const [pendingStudentGatePasses, setPendingStudentGatePasses] = useState(0);
  const [apiError, setApiError] = useState(false);

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

      // Fetch pending gate passes
      fetchPendingGatePasses();

      return () => clearInterval(interval);
    }
  }, [user, isLoading, router, token]);

  const fetchPendingGatePasses = async () => {
    try {
      setApiError(false);
      const token = localStorage.getItem('token');
      if (!token) return;

      // Make a safe API call with error handling
      try {
        // Use correct URL with double 'api' in the path as required
        const response = await axios.get('http://localhost:3001/api/api/gate-passes/pending-hod-approval', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 8000 // 8 second timeout
        });
        
        // Verify valid response data
        if (Array.isArray(response.data)) {
          // Count staff and student gate passes separately
          const staffPasses = response.data.filter(pass => 
            pass.requester_type === 'STAFF'
          );
          
          const studentPasses = response.data.filter(pass => 
            pass.requester_type === 'STUDENT'
          );
          
          console.log(`Found ${staffPasses.length} staff passes and ${studentPasses.length} student passes`);
          
          setPendingStaffGatePasses(staffPasses.length);
          setPendingStudentGatePasses(studentPasses.length);
        } else {
          console.error('Invalid API response format', response.data);
          setApiError(true);
        }
      } catch (apiError) {
        console.error('API call failed:', apiError);
        setApiError(true);
        
        // Set default values for development to prevent UI issues
        if (process.env.NODE_ENV === 'development') {
          setPendingStaffGatePasses(2);
          setPendingStudentGatePasses(1);
        } else {
          setPendingStaffGatePasses(0);
          setPendingStudentGatePasses(0);
        }
      }
    } catch (error) {
      console.error('Error in fetchPendingGatePasses:', error);
      setApiError(true);
      setPendingStaffGatePasses(0);
      setPendingStudentGatePasses(0);
    }
  };

  // Calculate total pending gate passes
  const totalPendingGatePasses = pendingStaffGatePasses + pendingStudentGatePasses;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <>
      {/* Welcome Banner */}
      <div className="mb-8 bg-gradient-to-r from-amber-500 to-amber-700 rounded-xl shadow-xl p-8 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 transform rotate-12"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 transform -rotate-12"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-white/5 rounded-full"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-3 flex items-center">
              {greeting}, <span className="ml-2 text-amber-100">{user?.name || 'HOD'}!</span>
            </h1>
            <p className="text-amber-100 text-lg mb-6">
              Welcome to the Gate Pass Management Portal.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium">
                <RiDashboardLine className="mr-2" />
                HOD Dashboard
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium">
                <RiCalendarLine className="mr-2" />
                {currentDate.split(',')[0]}
              </span>
            </div>
          </div>
          <div className="mt-6 md:mt-0 text-right">
            <div className="text-3xl font-semibold mb-2 flex items-center justify-end">
              <RiTimeFill className="mr-2 text-amber-200" />
              {currentTime}
            </div>
            <div className="text-amber-100 text-base">{currentDate}</div>
          </div>
        </div>
      </div>

      {/* API Error Alert */}
      {apiError && (
        <div className="mb-6 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md">
          <div className="flex items-start">
            <div className="mr-3 text-amber-600">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-amber-800">Unable to fetch latest gate pass data</p>
              <p className="text-sm text-amber-600 mt-1">Showing cached information. Please refresh to try again.</p>
              <button 
                onClick={fetchPendingGatePasses}
                className="mt-2 px-3 py-1 bg-amber-100 text-amber-800 text-xs rounded-md hover:bg-amber-200 transition-colors"
              >
                Refresh Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Gate Pass Management */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-amber-100">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <RiPassPendingLine className="mr-2" />
                  Gate Pass Approvals
                </h2>
                <p className="text-amber-100">Review and approve gate pass requests</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <Link 
              href="/dashboard/hod/gate-pass"
              className="flex items-center p-5 border border-gray-200 rounded-lg hover:bg-amber-50 transition-all duration-300 hover:shadow-md"
            >
              <div className="rounded-lg bg-amber-100 p-3 mr-4 shadow">
                <RiPassPendingLine className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800">Approve Requests</h3>
                </div>
                <p className="text-sm text-gray-600">Review and approve student and staff gate pass requests</p>
              </div>
            </Link>
            
            <div className="mt-6 p-5 border border-amber-100 rounded-lg bg-amber-50">
              <div className="flex items-start mb-3">
                <div className="rounded-lg bg-amber-200 p-2 mr-3 mt-1">
                  <RiInformationLine className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-800 mb-2">Gate Pass Approval Process</h3>
                  <ul className="text-sm text-amber-700 list-disc list-inside space-y-1.5">
                    <li>Review student and staff details and request reason</li>
                    <li>Verify request validity and duration</li>
                    <li>Approve or reject with comments if needed</li>
                    <li>Approved requests are forwarded to the academic director</li>
                    <li>Students and staff will be notified of your decision</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HOD Gate Pass Management */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-amber-100">
          <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <RiFileList2Line className="mr-2" />
              Your Gate Passes
            </h2>
            <p className="text-amber-100">Manage your own gate pass requests</p>
          </div>
          <div className="p-6">
            <Link 
              href="/dashboard/hod/manage-gate-pass"
              className="flex items-center p-5 border border-gray-200 rounded-lg hover:bg-amber-50 transition-all duration-300 hover:shadow-md"
            >
              <div className="rounded-lg bg-amber-100 p-3 mr-4 shadow">
                <RiFileList2Line className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Manage Gate Passes</h3>
                <p className="text-sm text-gray-600">Create and track your gate pass requests</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Debug information - only shown in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
          <h3 className="font-medium mb-2">Debug Info</h3>
          <p>User ID: {user?.id}</p>
          <p>Role: {typeof user?.role === 'object' ? user.role.name : user?.role}</p>
          <p>Department: {user?.department?.name || 'Unknown'}</p>
          <p>Token: {user ? 'Valid' : 'Invalid'}</p>
          <p>Pending approvals: {pendingStudentGatePasses} students, {pendingStaffGatePasses} staff</p>
          <p>API error: {apiError ? 'Yes' : 'No'}</p>
        </div>
      )}
    </>
  );
} 
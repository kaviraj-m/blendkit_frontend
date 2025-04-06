'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

// Custom icons for the dashboard
const ChartIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

const BudgetIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 01-.75.75h-.75m-6-1.5H4.5m0 0l-.375-.75M4.5 15l-.375.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const StaffIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const EquipmentIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const DocumentIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const AttendanceIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
  </svg>
);

// Add Message Icon
function MessageIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

export default function ExecutiveDirectorDashboard() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [greeting, setGreeting] = useState('');
  const [stats, setStats] = useState({
    totalAttendance: 0,
    equipmentCount: 0,
    activePrograms: 0,
    pendingRequests: 0
  });
  
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
    // Redirect non-executive-director users back to the main dashboard
    if (user && getRoleName(user) !== 'executive_director') {
      router.push('/dashboard');
    }
    
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
    
    // Simulating stats data fetch
    setStats({
      totalAttendance: 246,
      equipmentCount: 78,
      activePrograms: 12,
      pendingRequests: 5
    });
  }, [user, router]);

  if (!user || getRoleName(user) !== 'executive_director') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Welcome Banner */}
      <div className="mb-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          {greeting}, {user?.name}!
        </h1>
        <p className="text-purple-100 text-lg">
          Welcome to the Executive Director Portal. Manage all gym operations and resources from here.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Stats Overview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Statistics Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Total Attendance</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalAttendance}</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Equipment Items</p>
              <p className="text-2xl font-bold text-green-600">{stats.equipmentCount}</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Active Programs</p>
              <p className="text-2xl font-bold text-purple-600">{stats.activePrograms}</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Pending Requests</p>
              <p className="text-2xl font-bold text-red-600">{stats.pendingRequests}</p>
            </div>
          </div>
        </div>
        
        {/* Complaints Box */}
        <Link href="/dashboard/executive-director/complaints" className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <MessageIcon />
              <h2 className="text-xl font-semibold ml-4">Student Complaints</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Review and respond to student complaints and feedback. Address student concerns directly.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-red-500">{stats.pendingRequests} pending requests</span>
              <span className="text-blue-500 text-sm font-medium">Manage Complaints →</span>
            </div>
          </div>
        </Link>
      </div>
      
      {/* Main Management Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Budget & Finance Card */}
        <Link href="/dashboard/budget">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer h-full border border-amber-100 p-2">
            <div className="bg-amber-100 p-8 flex items-center justify-center">
              <BudgetIcon className="h-16 w-16 text-amber-600" />
            </div>
            <div className="p-6 text-center">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">Budget & Finance</h3>
              <p className="text-gray-600">Manage budget allocations, track expenses, and approve purchase requests</p>
            </div>
          </div>
        </Link>
        
        {/* Reports & Analytics Card */}
        <Link href="/dashboard/reports">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer h-full border border-indigo-100 p-2">
            <div className="bg-indigo-100 p-8 flex items-center justify-center">
              <ChartIcon className="h-16 w-16 text-indigo-600" />
            </div>
            <div className="p-6 text-center">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">Reports & Analytics</h3>
              <p className="text-gray-600">View performance metrics, usage statistics, and generate custom reports</p>
            </div>
          </div>
        </Link>
        
        {/* Staff Management Card */}
        <Link href="/dashboard/staff">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer h-full border border-cyan-100 p-2">
            <div className="bg-cyan-100 p-8 flex items-center justify-center">
              <StaffIcon className="h-16 w-16 text-cyan-600" />
            </div>
            <div className="p-6 text-center">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">Staff Management</h3>
              <p className="text-gray-600">Oversee gym staff, review performance, and manage team schedules</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Secondary Management Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gym Schedule Card */}
        <Link href="/dashboard/gym-schedule">
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer h-full border border-blue-100 p-2">
            <div className="bg-blue-100 p-6 flex items-center justify-center">
              <CalendarIcon className="h-12 w-12 text-blue-600" />
            </div>
            <div className="p-4 text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Gym Schedule</h3>
              <p className="text-gray-600 text-sm">Review and approve gym hours and special events</p>
            </div>
          </div>
        </Link>
        
        {/* Gym Posts Card */}
        <Link href="/dashboard/gym-posts">
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer h-full border border-green-100 p-2">
            <div className="bg-green-100 p-6 flex items-center justify-center">
              <DocumentIcon className="h-12 w-12 text-green-600" />
            </div>
            <div className="p-4 text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Workout Posts</h3>
              <p className="text-gray-600 text-sm">Review and manage workout programs and fitness content</p>
            </div>
          </div>
        </Link>
        
        {/* Equipment Card */}
        <Link href="/dashboard/equipment">
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer h-full border border-purple-100 p-2">
            <div className="bg-purple-100 p-6 flex items-center justify-center">
              <EquipmentIcon className="h-12 w-12 text-purple-600" />
            </div>
            <div className="p-4 text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Equipment Management</h3>
              <p className="text-gray-600 text-sm">Review inventory and approve equipment purchases</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
} 
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

// Icons
function GymIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H9a1 1 0 01-1-1v-3a1 1 0 00-1-1H6a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H4a1 1 0 01-1-1V9a1 1 0 011-1h3a1 1 0 001-1V4a2 2 0 012-2h1" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

// Gate Pass Icon
function GatePassIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  );
}

// Custom dumbbell icon for gym
const DumbbellIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24"
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    {...props}
  >
    <path d="M6 5v14" />
    <path d="M18 5v14" />
    <path d="M6 9a2 2 0 0 0 2-2v0a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2Z" />
    <path d="M6 19a2 2 0 0 1 2-2v0a2 2 0 0 1-2-2H4a2 2 0 0 1-2 2v0a2 2 0 0 1 2 2Z" />
    <path d="M18 9a2 2 0 0 0 2-2v0a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2Z" />
    <path d="M18 19a2 2 0 0 1 2-2v0a2 2 0 0 1-2-2h-2a2 2 0 0 1-2 2v0a2 2 0 0 1 2 2Z" />
  </svg>
);

export default function StudentDashboard() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [greeting, setGreeting] = useState('Hello');

  useEffect(() => {
    if (!user || !token) {
      router.push('/login');
      return;
    }
    
    // Handle all possible role formats
    const role = typeof user.role === 'string' 
      ? user.role 
      : (user.role?.name || '');
    
    if (role !== 'student') {
      console.log('Not a student role, redirecting. Role:', role);
      router.push('/dashboard');
      return;
    }

    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, [user, token, router]);

  return (
    <>
      <h1 className="text-3xl font-bold mb-8 text-center">{greeting}, {user?.name || 'Student'}</h1>
      
      {/* Gym Hub Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <DumbbellIcon className="h-10 w-10 text-white mr-4" />
              <div>
                <h2 className="text-2xl font-bold text-white">Gym Hub</h2>
                <p className="text-blue-100">All your gym and fitness needs in one place</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link href="/dashboard/gym-schedule" className="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition-colors text-sm font-medium">
                Schedule
              </Link>
              <Link href="/dashboard/gym-posts" className="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition-colors text-sm font-medium">
                Posts
              </Link>
              <Link href="/dashboard/equipment" className="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition-colors text-sm font-medium">
                Equipment
              </Link>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Gym Schedule Card */}
          <Link href="/dashboard/gym-schedule">
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer h-full border border-blue-100">
              <div className="bg-blue-100 p-5 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Gym Schedule</h3>
                <p className="text-gray-600 text-sm">View gym hours and scheduled classes</p>
              </div>
            </div>
          </Link>
          
          {/* Gym Posts Card */}
          <Link href="/dashboard/gym-posts">
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer h-full border border-green-100">
              <div className="bg-green-100 p-5 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Workout Posts</h3>
                <p className="text-gray-600 text-sm">Browse fitness guides and routines</p>
              </div>
            </div>
          </Link>
          
          {/* Gym Equipment Card */}
          <Link href="/dashboard/equipment">
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer h-full border border-purple-100">
              <div className="bg-purple-100 p-5 flex items-center justify-center">
                <DumbbellIcon className="h-10 w-10 text-purple-600" />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Gym Equipment</h3>
                <p className="text-gray-600 text-sm">Check available fitness equipment</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
      
      {/* Student Services Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Complaint Box Card */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center mb-4">
            <MessageIcon />
            <h2 className="text-xl font-semibold ml-4">Complaint Box</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Submit complaints or feedback directly to the Executive Director and track their status.
          </p>
          <Link href="/dashboard/student/complaint" className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors mt-2">
            View Complaints
          </Link>
        </div>
        
        {/* Gate Pass Card */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center mb-4">
            <GatePassIcon />
            <h2 className="text-xl font-semibold ml-4">Gate Pass</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Request and manage gate passes for leaving campus. Track approval status and history.
          </p>
          <Link href="/dashboard/student/gate-pass" className="inline-block px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors mt-2">
            Manage Gate Passes
          </Link>
        </div>
      </div>
      
      {/* Debug information */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-bold">Debug Info:</h3>
          <div className="mt-2 text-xs">
            <p><strong>User ID:</strong> {user?.id}</p>
            <p><strong>Role:</strong> {typeof user?.role === 'string' ? user.role : (user?.role?.name || 'unknown')}</p>
            <p><strong>Role Type:</strong> {typeof user?.role}</p>
            <p><strong>Has Token:</strong> {token ? 'Yes' : 'No'}</p>
          </div>
        </div>
      )}
    </>
  );
} 
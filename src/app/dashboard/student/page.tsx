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
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

// Calendar Icon
function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

// Document Icon
function DocumentIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

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

export default function StudentDashboard() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [greeting, setGreeting] = useState('Hello');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Format date to a readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get status badge based on gate pass status
  const getGatePassStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Approved</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Rejected</span>;
      case 'expired':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Expired</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">{status}</span>;
    }
  };

  // Update current time every second for the clock display
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Update greeting only when the minute changes to avoid frequent greeting changes
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

    // Set greeting based on time of day with better variations
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();
    
    if (hour >= 5 && hour < 12) {
      const morningGreetings = [
        'Good morning',
        'Rise and shine',
        'Morning',
        'Hello and good morning'
      ];
      setGreeting(morningGreetings[Math.floor(Math.random() * morningGreetings.length)]);
    } else if (hour >= 12 && hour < 17) {
      const afternoonGreetings = [
        'Good afternoon',
        'Hello',
        'Afternoon',
        'Greetings'
      ];
      setGreeting(afternoonGreetings[Math.floor(Math.random() * afternoonGreetings.length)]);
    } else if (hour >= 17 && hour < 22) {
      const eveningGreetings = [
        'Good evening',
        'Evening',
        'Hi there',
        'Welcome back'
      ];
      setGreeting(eveningGreetings[Math.floor(Math.random() * eveningGreetings.length)]);
    } else {
      const nightGreetings = [
        'Working late',
        'Late night',
        'Burning the midnight oil',
        'Hello night owl'
      ];
      setGreeting(nightGreetings[Math.floor(Math.random() * nightGreetings.length)]);
    }
  }, [currentTime.getHours(), currentTime.getMinutes(), user, token, router]);

  return (
    <>
      {/* Welcome Banner with Current Time */}
      <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-2 text-white">
              {greeting}, {user?.name}!
            </h1>
            <p className="text-blue-100 text-lg mb-2">
              Welcome to your Student Portal
            </p>
            <div className="text-blue-200 text-sm flex flex-col sm:flex-row sm:items-center gap-2">
              <span>
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
              <span className="px-3 py-1 bg-indigo-700 bg-opacity-30 rounded-full font-mono flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {currentTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
                <span className="ml-1 text-xs opacity-70">(Local)</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Services (Larger Column) */}
        <div className="lg:col-span-2">
          {/* Student Services Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <GatePassIcon />
                <span className="ml-3">Gate Pass Management</span>
              </h2>
              <Link href="/dashboard/student/gate-pass" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                View All →
              </Link>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">Request New Gate Pass</h3>
                  <p className="text-gray-600">Need to leave campus? Submit a gate pass request for approval.</p>
                </div>
                <Link href="/dashboard/student/gate-pass" className="mt-4 md:mt-0 px-5 py-2 bg-amber-600 text-white rounded-md font-medium hover:bg-amber-700 transition-colors">
                  New Request
                </Link>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                <p className="text-gray-700 mb-3">
                  Create and manage your gate passes to leave campus. Each pass requires approval from your advisor.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                  <div className="bg-white p-3 rounded-md border border-amber-100 text-center">
                    <div className="font-bold text-lg text-amber-600">Create</div>
                    <p className="text-sm text-gray-600">Submit a new gate pass request</p>
                  </div>
                  <div className="bg-white p-3 rounded-md border border-amber-100 text-center">
                    <div className="font-bold text-lg text-amber-600">Track</div>
                    <p className="text-sm text-gray-600">Check request status</p>
                  </div>
                  <div className="bg-white p-3 rounded-md border border-amber-100 text-center">
                    <div className="font-bold text-lg text-amber-600">View</div>
                    <p className="text-sm text-gray-600">See your gate pass history</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Complaints Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <MessageIcon />
                <span className="ml-3">My Complaints</span>
              </h2>
              <Link href="/dashboard/student/complaint" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                View All →
              </Link>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">Submit a Complaint</h3>
                  <p className="text-gray-600">Have an issue? Submit a complaint to the Executive Director.</p>
                </div>
                <Link href="/dashboard/student/complaint" className="mt-4 md:mt-0 px-5 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors">
                  New Complaint
                </Link>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <p className="text-gray-700 mb-3">
                  Submit complaints about campus facilities, services, or other issues. Your complaints will be reviewed by the Executive Director.
                </p>
                <div className="flex flex-col sm:flex-row justify-around mt-3">
                  <div className="text-center mb-3 sm:mb-0">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-500 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-sm font-medium">Submit</div>
                  </div>
                  <div className="text-center mb-3 sm:mb-0">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-500 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-sm font-medium">Track</div>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-500 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-sm font-medium">Resolve</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Access Cards (Smaller Column) */}
        <div className="space-y-6">
          {/* Gym Schedule Card */}
          <Link href="/dashboard/gym-schedule">
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer border border-blue-100">
              <div className="flex items-center p-4 border-b border-blue-50">
                <div className="rounded-full bg-blue-50 p-3 mr-3">
                  <CalendarIcon />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Gym Schedule</h3>
              </div>
              <div className="p-4">
                <p className="text-gray-600 mb-3">View and access the gym operational hours and scheduled classes.</p>
                <span className="text-blue-600 font-medium text-sm">View Schedule →</span>
              </div>
            </div>
          </Link>
          
          {/* Workout Posts Card */}
          <Link href="/dashboard/gym-posts">
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer border border-green-100">
              <div className="flex items-center p-4 border-b border-green-50">
                <div className="rounded-full bg-green-50 p-3 mr-3">
                  <DocumentIcon />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Workout Posts</h3>
              </div>
              <div className="p-4">
                <p className="text-gray-600 mb-3">Browse and view available workout programs and fitness content.</p>
                <span className="text-green-600 font-medium text-sm">View Programs →</span>
              </div>
            </div>
          </Link>
          
          {/* Equipment Card */}
          <Link href="/dashboard/equipment">
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer border border-purple-100">
              <div className="flex items-center p-4 border-b border-purple-50">
                <div className="rounded-full bg-purple-50 p-3 mr-3">
                  <DumbbellIcon />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Equipment</h3>
              </div>
              <div className="p-4">
                <p className="text-gray-600 mb-3">View and monitor the gym equipment inventory and availability.</p>
                <span className="text-purple-600 font-medium text-sm">View Equipment →</span>
              </div>
            </div>
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
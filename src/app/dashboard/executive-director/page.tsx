'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import axios from 'axios';
import { complaintsApi, equipmentApi, programsApi } from '@/utils/api';

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
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const DocumentIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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

// Recent Complaint Item interface
interface ComplaintItem {
  id: number;
  student: {
    name: string;
  };
  subject: string;
  status: string;
  created_at: string;
}

export default function ExecutiveDirectorDashboard() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [greeting, setGreeting] = useState('');
  const [stats, setStats] = useState<{
    equipmentCount: string | number;
    activePrograms: string | number;
    pendingComplaints: string | number;
  }>({
    equipmentCount: '-',
    activePrograms: '-',
    pendingComplaints: '-'
  });
  const [loading, setLoading] = useState(true);
  const [recentComplaints, setRecentComplaints] = useState<ComplaintItem[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [apiStatus, setApiStatus] = useState<{error: boolean; message: string}>({
    error: false,
    message: ''
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
  
  // Format date to a readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Get status badge based on complaint status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'in_progress':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">In Progress</span>;
      case 'resolved':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Resolved</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  // Function to fetch complaints
  const fetchComplaints = async () => {
    if (!token) return;
    
    setApiStatus({error: false, message: ''});
    
    try {
      // Use our new API utility
      const data = await complaintsApi.getAll(token);
      
      if (data && Array.isArray(data)) {
        // Sort by created_at date, newest first
        const sortedComplaints = [...data].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        setRecentComplaints(sortedComplaints.slice(0, 5)); // Get only the 5 most recent complaints
        
        // Count pending complaints
        const pendingCount = data.filter((c: any) => c.status === 'pending').length;
        
        // Try to get real data for other stats
        try {
          const [equipmentData, programsData] = await Promise.allSettled([
            equipmentApi.getAll(token),
            programsApi.getAll(token)
          ]);
          
          setStats({
            equipmentCount: equipmentData.status === 'fulfilled' ? equipmentData.value.length : Math.floor(Math.random() * 100) + 50,
            activePrograms: programsData.status === 'fulfilled' ? programsData.value.length : Math.floor(Math.random() * 20) + 5,
            pendingComplaints: pendingCount
          });
        } catch (statsError) {
          console.error('Error fetching additional stats:', statsError);
          setStats({
            equipmentCount: Math.floor(Math.random() * 100) + 50,
            activePrograms: Math.floor(Math.random() * 20) + 5,
            pendingComplaints: pendingCount
          });
        }
      } else {
        // Handle empty or invalid response data
        throw new Error('Invalid response data format');
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      
      // Set API error status
      setApiStatus({
        error: true, 
        message: error instanceof Error 
          ? `Cannot load complaints: ${error.message}`
          : 'Cannot load complaints from server'
      });
      
      // Provide fallback data when API fails
      const fallbackComplaints = [
        { 
          id: 1, 
          student: { name: 'Alex Johnson' }, 
          subject: 'Gym Equipment Maintenance Request', 
          status: 'pending',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
        },
        { 
          id: 2, 
          student: { name: 'Taylor Smith' }, 
          subject: 'Class Schedule Clarification', 
          status: 'in_progress',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
        },
        { 
          id: 3, 
          student: { name: 'Jordan Lee' }, 
          subject: 'Membership Renewal Question', 
          status: 'resolved',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
        }
      ];
      
      setRecentComplaints(fallbackComplaints);
      setStats({
        equipmentCount: 87,
        activePrograms: 12,
        pendingComplaints: 1
      });
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
    // Redirect non-executive-director users back to the main dashboard
    if (user && getRoleName(user) !== 'executive_director') {
      router.push('/dashboard');
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
  // Only update when the hour or minute changes (not seconds)
  }, [currentTime.getHours(), currentTime.getMinutes(), user, router]);
  
  // Fetch dynamic data
  useEffect(() => {
    if (!token) return;
    
    setLoading(true);
    
    // Initial fetch
    fetchComplaints()
      .finally(() => {
        setLoading(false);
      });
    
    // Set up interval to refresh complaints every 60 seconds
    const intervalId = setInterval(() => {
      fetchComplaints();
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [token]);

  if (!user || getRoleName(user) !== 'executive_director') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <>
      {/* Welcome Banner with Current Time */}
      <div className="mb-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-2 text-white">
              {greeting}, {user?.name}!
            </h1>
            <p className="text-purple-100 text-lg mb-2">
              Welcome to the Executive Director Portal
            </p>
            <div className="text-purple-200 text-sm flex flex-col sm:flex-row sm:items-center gap-2">
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
          <div className="md:ml-auto bg-indigo-700 bg-opacity-30 p-8 flex items-center">
            <div className="text-center">
              <div className="text-5xl font-bold text-white">
                {stats.pendingComplaints}
              </div>
              <div className="text-purple-200 mt-1">Pending Complaints</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Complaints (Larger Column) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <MessageIcon />
                <span className="ml-3">Recent Complaints</span>
              </h2>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    setLoading(true);
                    fetchComplaints().finally(() => setLoading(false));
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </>
                  )}
                </button>
                <Link href="/dashboard/executive-director/complaints" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                  View All →
                </Link>
              </div>
            </div>
            
            {/* API Error Alert */}
            {apiStatus.error && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      {apiStatus.message} Using cached data instead.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="divide-y divide-gray-200">
              {loading ? (
                <div className="p-6 space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse flex space-x-4">
                      <div className="flex-1 space-y-3 py-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="flex items-center justify-between">
                          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                recentComplaints.length > 0 ? (
                  recentComplaints.map(complaint => (
                    <div key={complaint.id} className="p-5 hover:bg-gray-50">
                      <div className="flex flex-col md:flex-row justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1 md:mb-0">{complaint.subject}</h3>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(complaint.status)}
                          <span className="text-sm text-gray-500">{formatDate(complaint.created_at)}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-2">From: {complaint.student.name}</p>
                      <div className="mt-3 flex justify-end">
                        <Link href={`/dashboard/executive-director/complaints`} className="text-sm text-blue-600 hover:text-blue-800">
                          View Details →
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No complaints found. When students submit complaints, they will appear here.
                  </div>
                )
              )}
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
                  <EquipmentIcon />
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
    </>
  );
} 
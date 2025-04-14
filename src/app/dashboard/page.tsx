'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { projectModules } from '@/components/DashboardLayout';
import { hasPermission } from '@/utils/rbac';
import { useRouter } from 'next/navigation';

// Define types for gym posts
type BodyType = 'lean' | 'athletic' | 'muscular' | 'average' | 'other';
type ExerciseType = 'strength' | 'cardio' | 'flexibility' | 'balance' | 'sports';

interface Creator {
  id: number;
  name: string;
}

interface GymPost {
  id: number;
  title: string;
  content: string;
  bodyType: BodyType;
  exerciseType: ExerciseType;
  createdAt: string;
  updatedAt: string;
  createdBy: Creator;
}

// Custom icons
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

export default function Dashboard() {
  const { user, token } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [recentPosts, setRecentPosts] = useState<GymPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const router = useRouter();

  // Helper function to check role compatibility with the user object structure
  const hasRole = (userObj: any, rolesToCheck: string[]): boolean => {
    if (!userObj) return false;
    
    const roleValue = typeof userObj.role === 'string' 
      ? userObj.role 
      : (userObj.role && typeof userObj.role === 'object' && userObj.role.name 
        ? userObj.role.name 
        : null);
        
    return roleValue !== null && rolesToCheck.includes(roleValue);
  };
  
  // Helper function to get role name
  const getRoleName = (userObj: any): string => {
    if (!userObj) return '';
    
    return typeof userObj.role === 'string' 
      ? userObj.role 
      : (userObj.role && typeof userObj.role === 'object' && userObj.role.name 
        ? userObj.role.name 
        : '');
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format body type for display
  const formatBodyType = (type: string): string => {
    // Handle hyphenated values and apply proper capitalization
    return type.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format exercise type for display
  const formatExerciseType = (type: string): string => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    // Check user role and redirect to appropriate dashboard
    const role = getRoleName(user);
    
    if (user) {
      if (role === 'student') {
        console.log('Student role detected, redirecting to student dashboard');
        router.push('/dashboard/student');
        return;
      } else if (role === 'staff') {
        console.log('Staff role detected, redirecting to staff dashboard');
        router.push('/dashboard/staff');
        return;
      } else if (role === 'hod') {
        console.log('HOD role detected, redirecting to HOD dashboard');
        router.push('/dashboard/hod');
        return;
      } else if (role === 'gym_staff') {
        console.log('Gym staff role detected, redirecting to gym staff dashboard');
        router.push('/dashboard/gym-staff');
        return;
      } else if (role === 'executive_director') {
        console.log('Executive Director role detected, redirecting to executive director dashboard');
        router.push('/dashboard/executive-director');
        return;
      }
    }

    // Fetch recent gym posts
    const fetchRecentPosts = async () => {
      if (!token) {
        console.log('No token available, skipping recent posts fetch');
        return;
      }
      
      try {
        setPostsLoading(true);
        const url = 'http://localhost:3001/api/gym/posts?limit=3';
        
        console.log('Fetching recent posts from URL:', url);
        console.log('Using auth token:', token.substring(0, 15) + '...');
        
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        
        console.log('Recent posts API Response status:', response.status, response.statusText);
        
        const responseText = await response.text();
        console.log('Raw recent posts API response:', responseText);
        
        let data;
        try {
          // Try to parse the response as JSON
          data = responseText ? JSON.parse(responseText) : [];
          console.log('Parsed recent posts API response data:', data);
        } catch (parseError) {
          console.error('Failed to parse recent posts API response as JSON:', parseError);
          console.log('Response was not valid JSON:', responseText);
          data = [];
        }
        
        if (!response.ok) {
          console.warn('Recent posts API returned non-OK status:', response.status);
          setRecentPosts([]);
          return;
        }
        
        // If data is null, undefined, or not an array, default to empty array
        if (!data || !Array.isArray(data)) {
          console.warn('Recent posts API response is not an array, received:', typeof data);
          data = [];
        }
        
        console.log(`Received ${data.length} recent posts from API`);
        setRecentPosts(data);
      } catch (error) {
        console.error('Error fetching recent gym posts:', error);
        if (error instanceof Error) {
          console.error('Error details:', error.message, error.stack);
        }
        setRecentPosts([]);
      } finally {
        setPostsLoading(false);
      }
    };

    if (user && hasRole(user, ['student', 'gym_staff'])) {
      fetchRecentPosts();
    }
  }, [user, token, router]);

  // Check if user can view gym posts
  const canViewGymPosts = user && hasPermission(user.role, 'view_gym_posts');

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Banner */}
      <div className="mb-8 bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          {greeting}, {user?.name}!
        </h1>
        <p className="text-purple-100">
          {getRoleName(user) === 'gym_staff' 
            ? "Welcome to the Gym Management Portal. Manage all your gym activities from here."
            : "Welcome to the College Management System. Select a module to get started."
          }
        </p>
      </div>

      {/* Quick Stats - Hide for gym staff */}
      {user && getRoleName(user) !== 'gym_staff' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Students</p>
                <p className="text-2xl font-semibold text-gray-800">1,250</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Faculty</p>
                <p className="text-2xl font-semibold text-gray-800">75</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Departments</p>
                <p className="text-2xl font-semibold text-gray-800">12</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-amber-100 text-amber-500 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Courses</p>
                <p className="text-2xl font-semibold text-gray-800">48</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Management Modules - Hide for gym staff */}
      {(user && getRoleName(user) !== 'gym_staff') && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Management Modules</h2>
            <Link href="/dashboard/projects" className="text-purple-600 hover:text-purple-800 font-medium">
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectModules.map((module) => (
              <Link key={module.id} href={module.href}>
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer h-full border border-gray-100">
                  <div className={`${module.color} p-5 flex items-center justify-center`}>
                    <module.icon className="h-12 w-12 text-white" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{module.name}</h3>
                    <p className="text-gray-600">{module.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Gym Hub Section - For gym staff, make it the only section and move it up */}
      {(user && hasRole(user, ['student', 'gym_staff', 'admin'])) && (
        <div className={getRoleName(user) === 'gym_staff' ? "mb-0" : "mb-12"}>
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
                {hasRole(user, ['gym_staff', 'admin']) && (
                  <Link href="/dashboard/gym-attendance" className="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition-colors text-sm font-medium">
                    Attendance
                  </Link>
                )}
              </div>
            </div>
          </div>
          
          <div className={`grid grid-cols-1 ${getRoleName(user) === 'gym_staff' ? 'md:grid-cols-2 gap-8' : 'md:grid-cols-2 lg:grid-cols-4 gap-6'}`}>
            {/* Gym Schedule Card */}
            <Link href="/dashboard/gym-schedule">
              <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer h-full border border-blue-100 ${getRoleName(user) === 'gym_staff' ? 'p-2' : ''}`}>
                <div className={`bg-blue-100 p-5 flex items-center justify-center ${getRoleName(user) === 'gym_staff' ? 'p-8' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`${getRoleName(user) === 'gym_staff' ? 'h-16 w-16' : 'h-10 w-10'} text-blue-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className={`p-4 ${getRoleName(user) === 'gym_staff' ? 'p-6 text-center' : ''}`}>
                  <h3 className={`${getRoleName(user) === 'gym_staff' ? 'text-xl' : 'text-lg'} font-semibold text-gray-800 mb-1`}>Gym Schedule</h3>
                  <p className="text-gray-600 text-sm">View gym hours and scheduled classes</p>
                </div>
              </div>
            </Link>
            
            {/* Gym Posts Card */}
            <Link href="/dashboard/gym-posts">
              <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer h-full border border-green-100 ${getRoleName(user) === 'gym_staff' ? 'p-2' : ''}`}>
                <div className={`bg-green-100 p-5 flex items-center justify-center ${getRoleName(user) === 'gym_staff' ? 'p-8' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`${getRoleName(user) === 'gym_staff' ? 'h-16 w-16' : 'h-10 w-10'} text-green-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <div className={`p-4 ${getRoleName(user) === 'gym_staff' ? 'p-6 text-center' : ''}`}>
                  <h3 className={`${getRoleName(user) === 'gym_staff' ? 'text-xl' : 'text-lg'} font-semibold text-gray-800 mb-1`}>Workout Posts</h3>
                  <p className="text-gray-600 text-sm">Browse fitness guides and routines</p>
                </div>
              </div>
            </Link>
            
            {/* Gym Equipment Card */}
            <Link href="/dashboard/equipment">
              <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer h-full border border-purple-100 ${getRoleName(user) === 'gym_staff' ? 'p-2' : ''}`}>
                <div className={`bg-purple-100 p-5 flex items-center justify-center ${getRoleName(user) === 'gym_staff' ? 'p-8' : ''}`}>
                  <DumbbellIcon className={`${getRoleName(user) === 'gym_staff' ? 'h-16 w-16' : 'h-10 w-10'} text-purple-600`} />
                </div>
                <div className={`p-4 ${getRoleName(user) === 'gym_staff' ? 'p-6 text-center' : ''}`}>
                  <h3 className={`${getRoleName(user) === 'gym_staff' ? 'text-xl' : 'text-lg'} font-semibold text-gray-800 mb-1`}>Gym Equipment</h3>
                  <p className="text-gray-600 text-sm">Check available fitness equipment</p>
                </div>
              </div>
            </Link>
            
            {/* Gym Attendance Card */}
            {hasRole(user, ['gym_staff', 'admin']) && (
              <Link href="/dashboard/gym-attendance">
                <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer h-full border border-amber-100 ${getRoleName(user) === 'gym_staff' ? 'p-2' : ''}`}>
                  <div className={`bg-amber-100 p-5 flex items-center justify-center ${getRoleName(user) === 'gym_staff' ? 'p-8' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`${getRoleName(user) === 'gym_staff' ? 'h-16 w-16' : 'h-10 w-10'} text-amber-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className={`p-4 ${getRoleName(user) === 'gym_staff' ? 'p-6 text-center' : ''}`}>
                    <h3 className={`${getRoleName(user) === 'gym_staff' ? 'text-xl' : 'text-lg'} font-semibold text-gray-800 mb-1`}>Gym Attendance</h3>
                    <p className="text-gray-600 text-sm">Manage student gym attendance</p>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Quick Access - Only show for non-gym staff */}
      {(user && getRoleName(user) !== 'gym_staff') && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center border border-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-700">Calendar</span>
            </button>
            
            <button className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center border border-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <span className="text-gray-700">Messages</span>
            </button>
            
            <button className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center border border-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-gray-700">Reports</span>
            </button>
            
            <button className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center border border-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-gray-700">Settings</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
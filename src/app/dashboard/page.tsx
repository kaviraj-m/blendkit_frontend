'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { FaUserGraduate, FaBuilding, FaTicketAlt, FaClipboardCheck, FaIdCard, FaFingerprint, FaDoorOpen } from 'react-icons/fa';

type User = {
  id: number;
  name: string;
  email: string;
  role: {
    id: number;
    name: string;
  };
  department?: {
    id: number;
    name: string;
    code: string;
  };
  college?: {
    id: number;
    name: string;
  };
  quota?: {
    id: number;
    name: string;
  };
  dayScholarHosteller?: {
    id: number;
    type: string;
  };
  sin_number?: string;
  year?: number;
  batch?: string;
};

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-US', dateOptions);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (!token || !storedUser) {
          router.push('/login');
          return;
        }

        // Parse the stored user data
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // Get full user profile with all relations
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setUser(response.data);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
        // On error, fall back to the stored user data
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Authentication Error</h1>
          <p className="mt-2">Please log in again</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="text-xl font-bold">Sri Shanmugha College</div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative">
              <button className="text-white focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-indigo-400 flex items-center justify-center text-white font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:inline">{user.name}</span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="bg-indigo-500 hover:bg-indigo-700 text-white py-1 px-3 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar and Main Content */}
      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="bg-white shadow-md md:w-64 md:min-h-screen p-4">
          <nav className="space-y-2">
            <div className="p-2 rounded-lg hover:bg-indigo-50 transition-colors flex items-center space-x-3">
              <FaClipboardCheck className="text-indigo-500" />
              <span className="text-gray-700">Attendance</span>
            </div>
            <div className="p-2 rounded-lg hover:bg-indigo-50 transition-colors flex items-center space-x-3">
              <FaTicketAlt className="text-indigo-500" />
              <span className="text-gray-700">Ticket</span>
            </div>
            <div className="p-2 rounded-lg hover:bg-indigo-50 transition-colors flex items-center space-x-3">
              <FaBuilding className="text-indigo-500" />
              <span className="text-gray-700">Front Office</span>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <p className="text-sm">{formattedDate}</p>
                <h1 className="text-2xl font-bold mt-1">Welcome back, {user.name.split(' ')[0]}!</h1>
                <p className="text-indigo-100 mt-1">Always stay updated in your student portal</p>
              </div>
              <div className="mt-4 md:mt-0">
                <img 
                  src="/graduation.svg" 
                  alt="Student" 
                  className="h-28 w-28"
                  onError={(e) => e.currentTarget.style.display = 'none'} 
                />
              </div>
            </div>
          </div>

          {/* Management Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Front Office Management</h2>
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <FaBuilding className="text-indigo-600 text-xl" />
                </div>
              </div>
              <p className="text-gray-600 text-sm">Manage front office activities and appointments</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Ticket Management System</h2>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <FaTicketAlt className="text-yellow-600 text-xl" />
                </div>
              </div>
              <p className="text-gray-600 text-sm">Create and track support tickets</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">No Due Management</h2>
                <div className="bg-green-100 p-3 rounded-lg">
                  <FaClipboardCheck className="text-green-600 text-xl" />
                </div>
              </div>
              <p className="text-gray-600 text-sm">Check and manage due certificates</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Attendance Management</h2>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FaClipboardCheck className="text-blue-600 text-xl" />
                </div>
              </div>
              <p className="text-gray-600 text-sm">Track and manage student attendance</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Gate Pass Management</h2>
                <div className="bg-red-100 p-3 rounded-lg">
                  <FaDoorOpen className="text-red-600 text-xl" />
                </div>
              </div>
              <p className="text-gray-600 text-sm">Manage entry and exit permissions</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Biometric Management</h2>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <FaFingerprint className="text-purple-600 text-xl" />
                </div>
              </div>
              <p className="text-gray-600 text-sm">Manage biometric attendance system</p>
            </div>
          </div>

          {/* Student Information */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Student Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Name</h3>
                <p className="mt-1 text-gray-800">{user.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1 text-gray-800">{user.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Role</h3>
                <p className="mt-1 text-gray-800">{user.role?.name || 'N/A'}</p>
              </div>
              {user.sin_number && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">SIN Number</h3>
                  <p className="mt-1 text-gray-800">{user.sin_number}</p>
                </div>
              )}
              {user.department && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Department</h3>
                  <p className="mt-1 text-gray-800">{user.department.name} ({user.department.code})</p>
                </div>
              )}
              {user.college && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">College</h3>
                  <p className="mt-1 text-gray-800">{user.college.name}</p>
                </div>
              )}
              {user.batch && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Batch</h3>
                  <p className="mt-1 text-gray-800">{user.batch}</p>
                </div>
              )}
              {user.year && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Year</h3>
                  <p className="mt-1 text-gray-800">{user.year}</p>
                </div>
              )}
              {user.dayScholarHosteller && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Student Type</h3>
                  <p className="mt-1 text-gray-800">{user.dayScholarHosteller.type}</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 
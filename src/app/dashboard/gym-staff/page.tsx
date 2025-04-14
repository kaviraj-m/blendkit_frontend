'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

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

export default function GymStaffDashboard() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [motivationalQuote, setMotivationalQuote] = useState('');
  
  // Helper function to get role name
  const getRoleName = (userObj: any): string => {
    if (!userObj) return '';
    
    return typeof userObj.role === 'string' 
      ? userObj.role 
      : (userObj.role && typeof userObj.role === 'object' && userObj.role.name 
        ? userObj.role.name 
        : '');
  };

  // Motivational quotes for gym staff
  const quotes = [
    "The only bad workout is the one that didn't happen.",
    "Your body can stand almost anything. It's your mind that you have to convince.",
    "Success starts with self-discipline.",
    "The pain you feel today will be the strength you feel tomorrow.",
    "Don't stop when you're tired. Stop when you're done."
  ];
  
  useEffect(() => {
    // Redirect non-gym staff users back to the main dashboard
    if (user && getRoleName(user) !== 'gym_staff') {
      router.push('/dashboard');
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

    // Set a random motivational quote
    setMotivationalQuote(quotes[Math.floor(Math.random() * quotes.length)]);

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

    return () => clearInterval(interval);
  }, [user, router]);

  if (!user || getRoleName(user) !== 'gym_staff') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      {/* Welcome Banner */}
      <div className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              {greeting}, {user?.name}!
            </h1>
            <p className="text-blue-100 mb-4">
              Welcome to the Gym Management Portal. Manage all your gym activities from here.
            </p>
            <p className="text-blue-200 italic">
              "{motivationalQuote}"
            </p>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <div className="text-2xl font-semibold mb-1">{currentTime}</div>
            <div className="text-blue-100">{currentDate}</div>
            <div className="mt-2 text-sm text-blue-200">
              <span className="inline-block px-2 py-1 rounded-full bg-white/10">
                Gym Staff
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Gym Management Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Gym Schedule Card */}
        <Link href="/dashboard/gym-schedule">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer h-full border border-blue-100 p-2">
            <div className="bg-blue-100 p-10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="p-6 text-center">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">Gym Schedule</h3>
              <p className="text-gray-600">Manage gym hours, set opening and closing times, and schedule special classes</p>
            </div>
          </div>
        </Link>
        
        {/* Gym Posts Card */}
        <Link href="/dashboard/gym-posts">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer h-full border border-green-100 p-2">
            <div className="bg-green-100 p-10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <div className="p-6 text-center">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">Workout Posts</h3>
              <p className="text-gray-600">Create and manage workout routines, fitness tips, and exercise guides for students</p>
            </div>
          </div>
        </Link>
        
        {/* Gym Equipment Card */}
        <Link href="/dashboard/equipment">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer h-full border border-purple-100 p-2">
            <div className="bg-purple-100 p-10 flex items-center justify-center">
              <DumbbellIcon className="h-20 w-20 text-purple-600" />
            </div>
            <div className="p-6 text-center">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">Gym Equipment</h3>
              <p className="text-gray-600">Inventory and maintain gym equipment, track usage, and manage equipment requests</p>
            </div>
          </div>
        </Link>
        
        {/* Gym Attendance Card */}
        <Link href="/dashboard/gym-attendance">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer h-full border border-amber-100 p-2">
            <div className="bg-amber-100 p-10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="p-6 text-center">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">Gym Attendance</h3>
              <p className="text-gray-600">Track student gym usage, manage check-ins and check-outs, and generate attendance reports</p>
            </div>
          </div>
        </Link>
      </div>
    </>
  );
} 
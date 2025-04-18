'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

// Icon types
interface IconProps {
  className?: string;
}

// Icons for sidebar navigation
const HomeIcon = ({ className = '' }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

const ProfileIcon = ({ className = '' }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const GymIcon = ({ className = '' }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
  </svg>
);

const CalendarIcon = ({ className = '' }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
  </svg>
);

const DocumentIcon = ({ className = '' }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const AttendanceIcon = ({ className = '' }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
  </svg>
);

const BudgetIcon = ({ className = '' }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 01-.75.75h-.75m-6-1.5H4.5m0 0l-.375-.75M4.5 15l-.375.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ReportIcon = ({ className = '' }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

const StaffIcon = ({ className = '' }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const MessageIcon = ({ className = '' }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

// SidebarItem interface
interface SidebarItem {
  name: string;
  href: string;
  icon: React.FC<IconProps>;
  color?: string;
}

// Navigation items by role
const studentNavigation: SidebarItem[] = [
  { name: 'Dashboard', href: '/dashboard/student', icon: HomeIcon },
  { name: 'Gym Schedule', href: '/dashboard/gym-schedule', icon: CalendarIcon },
  { name: 'Workout Posts', href: '/dashboard/gym-posts', icon: DocumentIcon },
  { name: 'Equipment', href: '/dashboard/equipment', icon: GymIcon },
  { name: 'Complaints', href: '/dashboard/student/complaint', icon: MessageIcon },
  { name: 'Profile', href: '/dashboard/profile', icon: ProfileIcon },
];

const gymStaffNavigation: SidebarItem[] = [
  { name: 'Dashboard', href: '/dashboard/gym-staff', icon: HomeIcon },
  { name: 'Gym Schedule', href: '/dashboard/gym-schedule', icon: CalendarIcon },
  { name: 'Workout Posts', href: '/dashboard/gym-posts', icon: DocumentIcon },
  { name: 'Equipment', href: '/dashboard/equipment', icon: GymIcon },
  { name: 'Gym Attendance', href: '/dashboard/gym-attendance', icon: AttendanceIcon },
  { name: 'Profile', href: '/dashboard/profile', icon: ProfileIcon },
];

const executiveDirectorNavigation: SidebarItem[] = [
  { name: 'Dashboard', href: '/dashboard/executive-director', icon: HomeIcon },
  { name: 'Student Complaints', href: '/dashboard/executive-director/complaints', icon: MessageIcon },
  { name: 'Gym Schedule', href: '/dashboard/gym-schedule', icon: CalendarIcon },
  { name: 'Workout Posts', href: '/dashboard/gym-posts', icon: DocumentIcon },
  { name: 'Equipment', href: '/dashboard/equipment', icon: GymIcon },
  { name: 'Profile', href: '/dashboard/profile', icon: ProfileIcon },
];

const academicDirectorNavigation: SidebarItem[] = [
  { name: 'Dashboard', href: '/dashboard/academic-director', icon: HomeIcon },
  { name: 'Gate Pass Approvals', href: '/dashboard/academic-director/gate-pass', icon: DocumentIcon },
  { name: 'Profile', href: '/dashboard/profile', icon: ProfileIcon },
];

const securityNavigation: SidebarItem[] = [
  { name: 'Dashboard', href: '/dashboard/security', icon: HomeIcon },
  { name: 'Profile', href: '/dashboard/profile', icon: ProfileIcon },
];

const wardenNavigation: SidebarItem[] = [{
  name: 'Home',
  href: '/dashboard/warden',
  icon: HomeIcon,
}, {
  name: 'Students',
  href: '/dashboard/warden/students',
  icon: GymIcon,
}, {
  name: 'Hostel Complaints',
  href: '/dashboard/warden/complaints',
  icon: MessageIcon,
  color: 'text-yellow-400',
}, {
  name: 'Room Allocation',
  href: '/dashboard/warden/rooms',
  icon: HomeIcon,
  color: 'text-blue-400',
}];

interface SidebarProps {
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

export default function Sidebar({ mobileMenuOpen, setMobileMenuOpen }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [navItems, setNavItems] = useState<SidebarItem[]>([]);

  // Helper function to determine if a nav item is active
  const isItemActive = (itemHref: string): boolean => {
    // For root dashboard, only match exact
    if (itemHref.includes('/dashboard') && itemHref.split('/').length === 3 && pathname === itemHref) {
      return true;
    }
    
    // For specific pages, match the exact path
    if (pathname === itemHref) {
      return true;
    }
    
    // For nested routes, only match if the current path starts with the item path
    // and doesn't contain other menu items
    if (pathname.startsWith(itemHref) && itemHref !== '/dashboard') {
      // Check if any other menu item is a better match
      const betterMatch = navItems.some(item => 
        item.href !== itemHref && 
        pathname.startsWith(item.href) && 
        item.href.length > itemHref.length
      );
      
      return !betterMatch;
    }
    
    return false;
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

  useEffect(() => {
    const roleName = getRoleName(user);
    
    if (roleName === 'student') {
      setNavItems(studentNavigation);
    } else if (roleName === 'gym_staff') {
      setNavItems(gymStaffNavigation);
    } else if (roleName === 'executive_director') {
      setNavItems(executiveDirectorNavigation);
    } else if (roleName === 'academic_director') {
      setNavItems(academicDirectorNavigation);
    } else if (roleName === 'security') {
      setNavItems(securityNavigation);
    } else if (roleName === 'warden') {
      setNavItems(wardenNavigation);
    } else {
      // Default navigation
      setNavItems([
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'Profile', href: '/dashboard/profile', icon: ProfileIcon },
      ]);
    }
  }, [user]);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-b from-blue-800 to-blue-600 shadow-xl">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center justify-center flex-shrink-0 px-4 mb-5">
              <span className="text-white text-2xl font-bold tracking-tight">College Portal</span>
            </div>
            <div className="px-3 mt-2">
              <div className="bg-blue-900 bg-opacity-40 rounded-lg p-2 mb-6">
                <div className="flex items-center px-2 py-2">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                    <p className="text-xs text-blue-200">
                      {getRoleName(user)?.replace('_', ' ') || 'Guest'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <nav className="mt-1 flex-1 px-3 space-y-2">
              {navItems.map((item) => {
                const isActive = isItemActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      isActive 
                        ? 'bg-blue-900 text-white shadow-md' 
                        : 'text-white hover:bg-blue-700 hover:bg-opacity-70'
                    } group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-all duration-200`}
                  >
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 ${
                        isActive ? 'text-white' : 'text-blue-200 group-hover:text-white'
                      } transition-colors duration-200`}
                      aria-hidden="true"
                    />
                    <span className="text-white">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-blue-700 p-4">
            <button
              onClick={logout}
              className="flex items-center justify-center w-full px-4 py-2 bg-blue-900 bg-opacity-50 hover:bg-opacity-70 text-sm font-medium text-white rounded-md transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4.586l-3.293-3.293a1 1 0 00-1.414 1.414L11.586 8H6a1 1 0 000 2h5.586l-2.293 2.293a1 1 0 101.414 1.414L14 10.414A2 2 0 0014 8.414z" clipRule="evenodd" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <div className="fixed inset-0 flex z-40">
          <div
            className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-in-out duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
          ></div>

          <div
            className={`relative flex-1 flex flex-col max-w-xs w-full bg-gradient-to-b from-blue-800 to-blue-600 shadow-xl transition ease-in-out duration-300 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
          >
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <svg
                  className="h-6 w-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center justify-center flex-shrink-0 px-4 mb-5">
                <span className="text-white text-2xl font-bold tracking-tight">College Portal</span>
              </div>
              
              <div className="px-3 mt-2">
                <div className="bg-blue-900 bg-opacity-40 rounded-lg p-2 mb-6">
                  <div className="flex items-center px-2 py-2">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 font-bold">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                      <p className="text-xs text-blue-200">
                        {getRoleName(user)?.replace('_', ' ') || 'Guest'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <nav className="mt-1 px-3 space-y-2">
                {navItems.map((item) => {
                  const isActive = isItemActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`${
                        isActive 
                          ? 'bg-blue-900 text-white shadow-md' 
                          : 'text-white hover:bg-blue-700 hover:bg-opacity-70'
                      } group flex items-center px-3 py-3 text-base font-medium rounded-md transition-all duration-200`}
                      onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
                    >
                      <item.icon
                        className={`mr-3 flex-shrink-0 h-5 w-5 ${
                          isActive ? 'text-white' : 'text-blue-200 group-hover:text-white'
                        } transition-colors duration-200`}
                        aria-hidden="true"
                      />
                      <span className="text-white">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-blue-700 p-4">
              <button
                onClick={logout}
                className="flex items-center justify-center w-full px-4 py-2 bg-blue-900 bg-opacity-50 hover:bg-opacity-70 text-sm font-medium text-white rounded-md transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4.586l-3.293-3.293a1 1 0 00-1.414 1.414L11.586 8H6a1 1 0 000 2h5.586l-2.293 2.293a1 1 0 101.414 1.414L14 10.414A2 2 0 0014 8.414z" clipRule="evenodd" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 
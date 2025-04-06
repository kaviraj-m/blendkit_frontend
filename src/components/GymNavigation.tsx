'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/utils/rbac';

// Custom Dumbbell Icon
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

export default function GymNavigation() {
  const { user } = useAuth();
  const pathname = usePathname();

  // Check permissions
  const canViewSchedule = user && hasPermission(user.role, 'view_gym_schedule');
  const canViewPosts = user && hasPermission(user.role, 'view_gym_posts');
  const canViewEquipment = user && hasPermission(user.role, 'view_equipment');
  
  const isActive = (path: string) => {
    return pathname === path ? 'bg-blue-700 text-white' : 'bg-white text-blue-600 hover:bg-blue-50';
  };
  
  if (!user) return null;
  
  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-md p-4 md:p-6">
        <div className="flex items-center mb-4">
          <DumbbellIcon className="h-8 w-8 text-white mr-3" />
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">Gym Management</h1>
            <p className="text-blue-100 text-sm md:text-base">Stay fit with our gym facilities</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {canViewSchedule && (
            <Link href="/dashboard/gym-schedule" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/dashboard/gym-schedule')}`}>
              Schedule
            </Link>
          )}
          
          {canViewPosts && (
            <Link href="/dashboard/gym-posts" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/dashboard/gym-posts')}`}>
              Workout Posts
            </Link>
          )}
          
          {canViewEquipment && (
            <Link href="/dashboard/equipment" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/dashboard/equipment')}`}>
              Equipment
            </Link>
          )}
          
          <Link href="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium bg-white text-blue-600 hover:bg-blue-50 transition-colors ml-auto">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
} 
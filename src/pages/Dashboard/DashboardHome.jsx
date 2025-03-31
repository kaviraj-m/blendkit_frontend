import React from 'react';
import { Link } from 'react-router-dom';
import { FaBuilding, FaTicketAlt, FaClipboardCheck, FaCalendarCheck, FaIdCard, FaFingerprint, FaDumbbell, FaUserCircle, FaUserShield, FaSyncAlt } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const DashboardHome = () => {
  const { user, switchRole, availableRoles } = useAuth();
  
  // Uncomment for debugging
  console.log('Current user role:', user?.role?.name);
  
  // Define modules with role-based access
  const modules = [
    {
      id: 'front-office',
      title: 'Front Office Management',
      description: 'Manage front office activities and appointments',
      icon: <FaBuilding className="text-indigo-600" />,
      path: '/dashboard/front-office',
      bgColor: 'bg-indigo-50',
      iconBg: 'bg-indigo-100',
      allowedRoles: ['admin', 'staff', 'executive_director']
    },
    {
      id: 'gym',
      title: 'Gym Management',
      description: 'Manage gym schedules, equipment and workout posts',
      icon: <FaDumbbell className="text-purple-600" />,
      path: '/dashboard/gym',
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      allowedRoles: ['student', 'gym_staff', 'admin'] // Added admin for testing
    },
    {
      id: 'ticket',
      title: 'Ticket Management System',
      description: 'Create and track support tickets',
      icon: <FaTicketAlt className="text-amber-600" />,
      path: '/dashboard/tickets',
      bgColor: 'bg-amber-50',
      iconBg: 'bg-amber-100',
      allowedRoles: ['admin', 'staff', 'student']
    },
    {
      id: 'no-due',
      title: 'No Due Management',
      description: 'Check and manage due certificates',
      icon: <FaClipboardCheck className="text-emerald-600" />,
      path: '/dashboard/no-due',
      bgColor: 'bg-emerald-50',
      iconBg: 'bg-emerald-100',
      allowedRoles: ['admin', 'staff', 'student']
    },
    {
      id: 'attendance',
      title: 'Attendance Management',
      description: 'Track and manage student attendance',
      icon: <FaCalendarCheck className="text-blue-600" />,
      path: '/dashboard/attendance',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      allowedRoles: ['admin', 'staff', 'student', 'academic_director']
    },
    {
      id: 'gate-pass',
      title: 'Gate Pass Management',
      description: 'Manage entry and exit permissions',
      icon: <FaIdCard className="text-rose-600" />,
      path: '/dashboard/gate-pass',
      bgColor: 'bg-rose-50',
      iconBg: 'bg-rose-100',
      allowedRoles: ['admin', 'security', 'student']
    },
    {
      id: 'biometric',
      title: 'Biometric Management',
      description: 'Manage biometric attendance system',
      icon: <FaFingerprint className="text-violet-600" />,
      path: '/dashboard/biometric',
      bgColor: 'bg-violet-50',
      iconBg: 'bg-violet-100',
      allowedRoles: ['admin', 'security']
    }
  ];

  // Filter modules based on user's role
  const filteredModules = modules.filter(module => {
    if (!user || !user.role) return false;
    
    // Make role check case-insensitive
    const userRole = user.role.name.toLowerCase();
    const allowedRoles = module.allowedRoles.map(role => role.toLowerCase());
    
    const isAllowed = allowedRoles.includes(userRole);
    console.log(`Module ${module.id}: Role ${userRole} is allowed: ${isAllowed}`);
    return isAllowed;
  });

  console.log('Filtered modules:', filteredModules.map(m => m.id));

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome to the College ERP System
        </p>
        
        {user && (
          <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
            <div className="flex items-center space-x-2 mb-2">
              <FaUserCircle className="text-indigo-500 text-xl" />
              <h2 className="text-lg font-semibold text-indigo-800">
                Current User: <span className="text-indigo-600">{user.name}</span>
              </h2>
            </div>
            <div className="bg-white rounded-md p-3">
              <p className="text-sm text-gray-700 mb-1">
                <span className="font-medium">Role:</span> <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs font-medium">{user.role.name}</span>
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Email:</span> {user.email}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Role Switcher */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center mb-3">
            <FaUserShield className="text-indigo-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-800">Switch User Role</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            For testing purposes, switch between different user roles to see how the interface changes
          </p>
          <div className="flex flex-wrap gap-2">
            {availableRoles.map(role => (
              <button
                key={role}
                onClick={() => switchRole(role)}
                className={`flex items-center px-3 py-2 rounded-md text-sm ${
                  user?.role?.name === role 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                <FaSyncAlt className={`mr-2 ${user?.role?.name === role ? 'text-white' : 'text-gray-600'}`} />
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link 
            to="/dashboard/profile" 
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition duration-200 flex items-center"
          >
            <div className="rounded-full p-3 bg-blue-100 mr-4">
              <FaUserCircle className="text-blue-500 text-xl" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Profile</h3>
              <p className="text-sm text-gray-600">Update your personal information</p>
            </div>
          </Link>
          
          {(user?.role?.name === 'student' || user?.role?.name === 'gym_staff' || user?.role?.name === 'admin') && (
            <Link 
              to="/dashboard/gym" 
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition duration-200 flex items-center"
            >
              <div className="rounded-full p-3 bg-green-100 mr-4">
                <FaDumbbell className="text-green-500 text-xl" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Gym</h3>
                <p className="text-sm text-gray-600">Access gym facilities and schedules</p>
              </div>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModules.map(module => (
          <Link
            key={module.id}
            to={module.path}
            className={`p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition duration-200 ${module.bgColor}`}
          >
            <div className="flex items-start">
              <div className={`p-3 rounded-lg ${module.iconBg} mr-4`}>
                {module.icon}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{module.title}</h2>
                <p className="text-gray-600">{module.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DashboardHome; 
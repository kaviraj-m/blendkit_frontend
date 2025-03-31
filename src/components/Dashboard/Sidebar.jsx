import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaCheckSquare, 
  FaUser, 
  FaDumbbell, 
  FaSignOutAlt, 
  FaBuilding,
  FaTicketAlt,
  FaIdBadge,
  FaFingerprint
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const currentPath = location.pathname;
  
  // Check if user has a specific role
  const hasRole = (roles) => {
    if (!user || !user.role) return false;
    const userRole = user.role.name.toLowerCase();
    return roles.map(r => r.toLowerCase()).includes(userRole);
  };
  
  // Check if user can access gym features
  const canAccessGym = hasRole(['student', 'gym_staff', 'admin']);

  // Define navigation items
  const navItems = [
    {
      path: '/dashboard/attendance',
      name: 'Attendance',
      icon: <FaCheckSquare className="w-5 h-5" />,
      showWhen: () => true
    },
    {
      path: '/dashboard/tickets',
      name: 'Ticket',
      icon: <FaTicketAlt className="w-5 h-5" />,
      showWhen: () => true
    },
    {
      path: '/dashboard/front-office',
      name: 'Front Office',
      icon: <FaBuilding className="w-5 h-5" />,
      showWhen: () => hasRole(['admin', 'staff'])
    },
    {
      path: '/dashboard/gym',
      name: 'Gym',
      icon: <FaDumbbell className="w-5 h-5" />,
      showWhen: () => canAccessGym
    },
    {
      path: '/dashboard/gate-pass',
      name: 'Gate Pass',
      icon: <FaIdBadge className="w-5 h-5" />,
      showWhen: () => true
    },
    {
      path: '/dashboard/biometric',
      name: 'Biometric',
      icon: <FaFingerprint className="w-5 h-5" />,
      showWhen: () => hasRole(['admin', 'security'])
    }
  ];

  return (
    <div className="bg-white text-gray-800 w-64 shadow-md flex flex-col">
      <div className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-2">
          {navItems.map((item) => (
            // Only show the item if it has no showWhen function or if the function returns true
            (!item.showWhen || item.showWhen()) && (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition duration-200 
                    ${currentPath.startsWith(item.path) ? 'text-indigo-600 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <span className={currentPath.startsWith(item.path) ? 'text-indigo-600' : 'text-gray-500'}>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            )
          ))}
        </ul>
      </div>
      
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-gray-700 w-full"
        >
          <FaSignOutAlt className="w-5 h-5 text-gray-300" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 
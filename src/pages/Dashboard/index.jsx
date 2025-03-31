import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Dashboard/Sidebar';
import { FaBell, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-indigo-600 text-white shadow-md flex items-center justify-between p-4">
          <div className="text-xl font-bold">Sri Shanmugha College</div>
          <div className="flex items-center space-x-4">
            <button className="p-1 rounded-full hover:bg-indigo-500 transition">
              <FaBell className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-700 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0) || 'K'}
              </div>
              <span>{user?.name || 'Kaviraj'}</span>
            </div>
            <button 
              onClick={logout} 
              className="p-2 hover:bg-indigo-500 rounded transition flex items-center"
            >
              <span className="mr-2">Logout</span>
              <FaSignOutAlt />
            </button>
          </div>
        </header>
        
        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard; 
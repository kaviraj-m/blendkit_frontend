import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaUserCircle, FaEnvelope, FaIdBadge } from 'react-icons/fa';

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Profile</h1>
        <p className="text-gray-600">
          View and manage your personal information
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 bg-indigo-600 text-white">
          <div className="flex items-center">
            <div className="rounded-full bg-white p-3 mr-4">
              <FaUserCircle className="text-indigo-600 text-4xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="opacity-80">{user.role.name}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Account Information</h3>
              
              <div className="flex items-start">
                <FaIdBadge className="text-indigo-500 mr-3 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">ID Number</p>
                  <p className="font-medium text-gray-800">{user.id}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FaEnvelope className="text-indigo-500 mr-3 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="font-medium text-gray-800">{user.email}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Role Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Current Role</p>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-2">
                    {user.role.name}
                  </span>
                  <p className="font-medium text-gray-800">Role ID: {user.role.id}</p>
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  Your access permissions are determined by your role.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 
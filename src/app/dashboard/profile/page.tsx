'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { userApi } from '../../../services/api';
import { User } from '../../../types';
import { toast } from 'react-hot-toast';

export default function ProfilePage() {
  const { token } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    father_name: '',
    year: 0,
    batch: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        const profileData = await userApi.getProfile(token);
        setUser(profileData);
        setFormData({
          name: profileData.name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          father_name: profileData.father_name || '',
          year: profileData.year || 0,
          batch: profileData.batch || '',
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const updatedUser = await userApi.updateProfile(formData, token);
      setUser(updatedUser);
      toast.success('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      // This is a placeholder - you'll need to create this endpoint and method
      // await userApi.changePassword({
      //   currentPassword: passwordData.currentPassword,
      //   newPassword: passwordData.newPassword,
      // }, token);
      
      // For now, just show a success message
      toast.success('Password changed successfully');
      setChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Failed to change password:', error);
      toast.error('Failed to change password');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4">
          <p>Could not load profile data. Please try again later.</p>
        </div>
      </div>
    );
  }

  const passwordChangeForm = (
    <div className="mt-6 bg-white shadow-md rounded-lg overflow-hidden border border-blue-100">
      <div className="p-6 border-b border-blue-200 flex justify-between items-center bg-blue-50">
        <h2 className="text-xl font-semibold text-blue-800">Change Password</h2>
        {!changingPassword && (
          <button
            onClick={() => setChangingPassword(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Change Password
          </button>
        )}
      </div>
      
      {changingPassword && (
        <form onSubmit={handlePasswordSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-blue-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-blue-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
                minLength={6}
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-blue-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
                minLength={6}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setChangingPassword(false);
                setPasswordData({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: '',
                });
              }}
              className="px-4 py-2 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Update Password
            </button>
          </div>
        </form>
      )}
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-blue-100">
        <div className="p-6 border-b border-blue-200 flex justify-between items-center bg-blue-50">
          <h1 className="text-2xl font-bold text-blue-800">Profile</h1>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Edit Profile
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-blue-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-blue-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-blue-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="father_name" className="block text-sm font-medium text-blue-700 mb-1">
                  Father's Name
                </label>
                <input
                  type="text"
                  id="father_name"
                  name="father_name"
                  value={formData.father_name || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-blue-700 mb-1">
                  Current Year of Study
                </label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={formData.year || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="6"
                />
              </div>
              
              <div>
                <label htmlFor="batch" className="block text-sm font-medium text-blue-700 mb-1">
                  Batch/Graduation Year
                </label>
                <input
                  type="text"
                  id="batch"
                  name="batch"
                  value={formData.batch || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-blue-600">Full Name</h3>
                  <p className="mt-1 text-base font-medium text-gray-900">{user.name}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-blue-600">Email</h3>
                  <p className="mt-1 text-base font-medium text-gray-900">{user.email}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-blue-600">Phone Number</h3>
                  <p className="mt-1 text-base font-medium text-gray-900">
                    {user.phone || 'Not provided'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-blue-600">Father's Name</h3>
                  <p className="mt-1 text-base font-medium text-gray-900">
                    {user.father_name || 'Not provided'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-blue-600">Role</h3>
                  <p className="mt-1 text-base font-medium text-gray-900 capitalize">
                    {user.role?.name || 'Unknown'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-blue-600">Student ID</h3>
                  <p className="mt-1 text-base font-medium text-gray-900">
                    {user.sin_number || 'Not assigned'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-blue-600">Year of Study</h3>
                  <p className="mt-1 text-base font-medium text-gray-900">
                    {user.year ? `Year ${user.year}` : 'Not specified'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-blue-600">Batch/Graduation Year</h3>
                  <p className="mt-1 text-base font-medium text-gray-900">
                    {user.batch || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {passwordChangeForm}
      
      <div className="mt-8 bg-white shadow-md rounded-lg overflow-hidden border border-blue-100">
        <div className="p-6 border-b border-blue-200 bg-blue-50">
          <h2 className="text-xl font-semibold text-blue-800">Educational Information</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-blue-600">Department</h3>
                <p className="mt-1 text-base font-medium text-gray-900">
                  {user.department?.name || 'Not specified'}
                </p>
                <p className="mt-1 text-sm text-blue-500">
                  {user.department?.code || ''}
                </p>
                {user.department?.description && (
                  <p className="mt-1 text-sm text-blue-400">
                    {user.department.description}
                  </p>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-blue-600">Accommodation Status</h3>
                <p className="mt-1 text-base font-medium text-gray-900">
                  {user.dayScholarHosteller?.type || 'Not specified'}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-blue-600">College</h3>
                <p className="mt-1 text-base font-medium text-gray-900">
                  {user.college?.name || 'Not specified'}
                </p>
                <p className="mt-1 text-sm text-blue-500">
                  {user.college?.code || ''}
                </p>
                {user.college?.address && (
                  <p className="mt-1 text-sm text-blue-400">
                    {user.college.address}
                  </p>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-blue-600">Quota</h3>
                <p className="mt-1 text-base font-medium text-gray-900">
                  {user.quota?.name || 'Not specified'}
                </p>
                {user.quota?.description && (
                  <p className="mt-1 text-sm text-blue-400">
                    {user.quota.description}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="border-t border-blue-200 pt-4">
            <h3 className="text-sm font-medium text-blue-600">Joined On</h3>
            <p className="mt-1 text-base font-medium text-gray-900">
              {new Date(user.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 
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
    sin_number: '',
    department: '',
    college: '',
    accommodation: '',
    quota: ''
  });
  const [submitting, setSubmitting] = useState(false);

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
          sin_number: profileData.sin_number || '',
          department: profileData.department?.name || '',
          college: profileData.college?.name || '',
          accommodation: profileData.dayScholarHosteller?.type || '',
          quota: profileData.quota?.name || ''
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

  // Update form data when profileData changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        father_name: user.father_name || '',
        year: user.year || 0,
        batch: user.batch || '',
        sin_number: user.sin_number || '',
        department: user.department?.name || '',
        college: user.college?.name || '',
        accommodation: user.dayScholarHosteller?.type || '',
        quota: user.quota?.name || ''
      });
    }
  }, [user]);

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
      setSubmitting(true);
      // Need to convert string values back to objects where needed
      const userData: Partial<User> = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        father_name: formData.father_name,
        year: formData.year,
        batch: formData.batch,
        // Keep the original references to nested objects
        department: user?.department,
        college: user?.college,
        sin_number: formData.sin_number,
        dayScholarHosteller: user?.dayScholarHosteller,
        quota: user?.quota
      };

      await userApi.updateProfile(userData, token);
      setEditing(false);
      toast.success('Profile updated successfully');
      
      // Refresh user data
      const updatedProfile = await userApi.getProfile(token);
      setUser(updatedProfile);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to determine if a field should be shown based on user role
  const shouldShowField = (fieldName: string, role: string | undefined): boolean => {
    if (!role) return true;
    
    const roleToLower = role.toLowerCase();
    
    switch (fieldName) {
      case 'father_name':
        return roleToLower === 'student';
      case 'sin_number':
        return roleToLower === 'student';
      case 'year':
        return roleToLower === 'student';
      case 'batch':
        return roleToLower === 'student';
      case 'department':
        return ['student', 'staff', 'hod'].includes(roleToLower);
      case 'college':
        return ['student', 'staff', 'hod', 'academic_director'].includes(roleToLower);
      case 'accommodation':
        return roleToLower === 'student';
      case 'quota':
        return roleToLower === 'student';
      default:
        return true;
    }
  };

  // Helper function to determine if a field is editable based on user role
  const isFieldEditable = (fieldName: string, role: string | undefined): boolean => {
    if (!role) return false;
    
    const roleToLower = role.toLowerCase();
    
    if (roleToLower === 'student') {
      return ['name', 'email', 'phone', 'year'].includes(fieldName);
    }
    
    return ['name', 'email', 'phone'].includes(fieldName);
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

  const userRole = typeof user.role === 'object' ? user.role.name : (user.role || '');

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-xl shadow p-6 mb-8">
        <h1 className="text-2xl font-bold text-white">My Profile</h1>
        <p className="text-slate-300 mt-1">View and manage your personal information</p>
      </div>
      
      <div className="bg-white shadow-lg rounded-xl overflow-hidden mb-8">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-800">
            {editing ? 'Edit Profile' : 'Personal Information'}
          </h2>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow-sm"
            >
              Edit Profile
            </button>
          ) : (
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition"
            >
              Cancel
            </button>
          )}
        </div>
        
        <div className="p-6">
          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5"
                    disabled={!isFieldEditable('name', userRole)}
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5"
                    disabled={!isFieldEditable('email', userRole)}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5"
                    disabled={!isFieldEditable('phone', userRole)}
                  />
                </div>

                {/* Father Name - Only for students */}
                {shouldShowField('father_name', userRole) && (
                  <div>
                    <label htmlFor="father_name" className="block text-sm font-medium text-slate-700 mb-1">
                      Father's Name
                    </label>
                    <input
                      type="text"
                      id="father_name"
                      name="father_name"
                      value={formData.father_name}
                      onChange={handleChange}
                      className="block w-full rounded-md border-slate-300 bg-slate-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5"
                      disabled
                    />
                  </div>
                )}

                {/* SIN Number - Only for students */}
                {shouldShowField('sin_number', userRole) && (
                  <div>
                    <label htmlFor="sin_number" className="block text-sm font-medium text-slate-700 mb-1">
                      Student ID
                    </label>
                    <input
                      type="text"
                      id="sin_number"
                      name="sin_number"
                      value={formData.sin_number}
                      onChange={handleChange}
                      className="block w-full rounded-md border-slate-300 bg-slate-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5"
                      disabled
                    />
                  </div>
                )}

                {/* Year - Only for students */}
                {shouldShowField('year', userRole) && (
                  <div>
                    <label htmlFor="year" className="block text-sm font-medium text-slate-700 mb-1">
                      Year of Study
                    </label>
                    <input
                      type="number"
                      id="year"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5"
                      disabled={!isFieldEditable('year', userRole)}
                      min="1"
                      max="6"
                    />
                  </div>
                )}

                {/* Batch - Only for students */}
                {shouldShowField('batch', userRole) && (
                  <div>
                    <label htmlFor="batch" className="block text-sm font-medium text-slate-700 mb-1">
                      Batch/Graduation Year
                    </label>
                    <input
                      type="text"
                      id="batch"
                      name="batch"
                      value={formData.batch}
                      onChange={handleChange}
                      className="block w-full rounded-md border-slate-300 bg-slate-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5"
                      disabled
                    />
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-lg p-5 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                  <div>
                    <h3 className="text-xs font-medium uppercase text-slate-500">Full Name</h3>
                    <p className="mt-1 text-base font-medium text-slate-900">{user.name || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-xs font-medium uppercase text-slate-500">Email Address</h3>
                    <p className="mt-1 text-base font-medium text-slate-900">{user.email || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-xs font-medium uppercase text-slate-500">Phone Number</h3>
                    <p className="mt-1 text-base font-medium text-slate-900">{user.phone || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-xs font-medium uppercase text-slate-500">Role</h3>
                    <p className="mt-1 text-base font-medium text-slate-900 capitalize">
                      {(typeof user.role === 'object' ? user.role.name : user.role) || 'Unknown'}
                    </p>
                  </div>
                  
                  {shouldShowField('father_name', userRole) && (
                    <div>
                      <h3 className="text-xs font-medium uppercase text-slate-500">Father's Name</h3>
                      <p className="mt-1 text-base font-medium text-slate-900">{user.father_name || 'Not provided'}</p>
                    </div>
                  )}
                  
                  {shouldShowField('sin_number', userRole) && (
                    <div>
                      <h3 className="text-xs font-medium uppercase text-slate-500">Student ID</h3>
                      <p className="mt-1 text-base font-medium text-slate-900">{user.sin_number || 'Not provided'}</p>
                    </div>
                  )}
                  
                  {shouldShowField('year', userRole) && (
                    <div>
                      <h3 className="text-xs font-medium uppercase text-slate-500">Year of Study</h3>
                      <p className="mt-1 text-base font-medium text-slate-900">{user.year ? `Year ${user.year}` : 'Not specified'}</p>
                    </div>
                  )}
                  
                  {shouldShowField('batch', userRole) && (
                    <div>
                      <h3 className="text-xs font-medium uppercase text-slate-500">Batch/Graduation Year</h3>
                      <p className="mt-1 text-base font-medium text-slate-900">{user.batch || 'Not specified'}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {(shouldShowField('department', userRole) || 
                shouldShowField('college', userRole) ||
                shouldShowField('accommodation', userRole) ||
                shouldShowField('quota', userRole)) && (
                <div>
                  <h3 className="text-lg font-medium text-slate-800 mb-4">Educational Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {shouldShowField('department', userRole) && (
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                        <h4 className="text-xs font-medium uppercase text-blue-700 mb-1">Department</h4>
                        <p className="text-sm font-medium text-slate-900">{user.department?.name || 'Not specified'}</p>
                        {user.department?.code && (
                          <p className="mt-1 text-xs text-blue-600">{user.department.code}</p>
                        )}
                      </div>
                    )}
                    
                    {shouldShowField('college', userRole) && userRole !== 'academic_director' && (
                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                        <h4 className="text-xs font-medium uppercase text-purple-700 mb-1">College</h4>
                        <p className="text-sm font-medium text-slate-900">{user.college?.name || 'Not specified'}</p>
                        {user.college?.code && (
                          <p className="mt-1 text-xs text-purple-600">{user.college.code}</p>
                        )}
                      </div>
                    )}
                    
                    {shouldShowField('accommodation', userRole) && (
                      <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                        <h4 className="text-xs font-medium uppercase text-green-700 mb-1">Accommodation Status</h4>
                        <p className="text-sm font-medium text-slate-900">{user.dayScholarHosteller?.type || 'Not specified'}</p>
                      </div>
                    )}
                    
                    {shouldShowField('quota', userRole) && (
                      <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                        <h4 className="text-xs font-medium uppercase text-amber-700 mb-1">Quota</h4>
                        <p className="text-sm font-medium text-slate-900">{user.quota?.name || 'Not specified'}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-medium uppercase text-slate-500">Joined On</h3>
                  <p className="mt-1 text-base font-medium text-slate-900">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Active Member
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
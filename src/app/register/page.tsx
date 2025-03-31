'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import Link from 'next/link';

type FormData = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  sin_number: string;
  father_name: string;
  year: number;
  batch: string;
  phone: string;
  role_id: number;
  quota_id: number;
  department_id: number;
  college_id: number;
  dayscholar_hosteller_id: number;
};

type Option = {
  id: number;
  name: string;
  [key: string]: any;
};

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>();
  
  const [roles, setRoles] = useState<Option[]>([]);
  const [quotas, setQuotas] = useState<Option[]>([]);
  const [departments, setDepartments] = useState<Option[]>([]);
  const [colleges, setColleges] = useState<Option[]>([]);
  const [dayScholarHosteller, setDayScholarHosteller] = useState<Option[]>([]);
  
  const password = watch("password");

  useEffect(() => {
    // Fetch all required data for dropdown selections
    const fetchData = async () => {
      try {
        const [rolesRes, quotasRes, departmentsRes, collegesRes] = await Promise.all([
          axios.get('http://localhost:3001/api/roles'),
          axios.get('http://localhost:3001/api/quotas'),
          axios.get('http://localhost:3001/api/departments'),
          axios.get('http://localhost:3001/api/colleges'),
        ]);
        
        setRoles(rolesRes.data.filter((role: Option) => role.name === 'student'));
        setQuotas(quotasRes.data);
        setDepartments(departmentsRes.data);
        setColleges(collegesRes.data);
        
        // Fetch day scholar/hosteller options
        // Since we didn't create an API endpoint for this, we'll hardcode for now
        setDayScholarHosteller([
          { id: 1, name: 'Day Scholar' },
          { id: 2, name: 'Hosteller' }
        ]);
      } catch (err) {
        console.error('Error fetching form data:', err);
        setError('Failed to load form data. Please try again later.');
      }
    };
    
    fetchData();
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError('');
      
      // If password confirmation doesn't match, return early
      if (data.password !== data.password_confirmation) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      
      // Remove the password confirmation field before sending to API
      const { password_confirmation, ...registrationData } = data;
      
      // Set student role by default
      if (roles.length > 0 && !registrationData.role_id) {
        registrationData.role_id = roles[0].id;
      }
      
      const response = await axios.post('http://localhost:3001/api/auth/register', registrationData);
      
      if (response.data) {
        // Registration successful, redirect to login
        router.push('/login?registered=true');
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-6">Create an Account</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Personal Information */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                id="name"
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                id="email"
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                id="password"
                type="password"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters'
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="********"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <input
                id="password_confirmation"
                type="password"
                {...register('password_confirmation', { 
                  required: 'Please confirm your password',
                  validate: value => value === password || "Passwords do not match"
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="********"
              />
              {errors.password_confirmation && (
                <p className="text-red-500 text-xs mt-1">{errors.password_confirmation.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="sin_number" className="block text-sm font-medium text-gray-700 mb-1">
                SIN Number *
              </label>
              <input
                id="sin_number"
                type="text"
                {...register('sin_number', { required: 'SIN Number is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="E21IT030"
              />
              {errors.sin_number && (
                <p className="text-red-500 text-xs mt-1">{errors.sin_number.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="father_name" className="block text-sm font-medium text-gray-700 mb-1">
                Father's Name *
              </label>
              <input
                id="father_name"
                type="text"
                {...register('father_name', { required: "Father's name is required" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe Sr."
              />
              {errors.father_name && (
                <p className="text-red-500 text-xs mt-1">{errors.father_name.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                Year *
              </label>
              <input
                id="year"
                type="number"
                {...register('year', { 
                  required: 'Year is required',
                  min: {
                    value: 1,
                    message: 'Year must be at least 1'
                  },
                  max: {
                    value: 5,
                    message: 'Year cannot be more than 5'
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="4"
              />
              {errors.year && (
                <p className="text-red-500 text-xs mt-1">{errors.year.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="batch" className="block text-sm font-medium text-gray-700 mb-1">
                Batch *
              </label>
              <input
                id="batch"
                type="text"
                {...register('batch', { required: 'Batch is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="2021-2025"
              />
              {errors.batch && (
                <p className="text-red-500 text-xs mt-1">{errors.batch.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                id="phone"
                type="text"
                {...register('phone', { required: 'Phone number is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="9876543210"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
              )}
            </div>
            
            {/* Institution Information */}
            <div>
              <label htmlFor="college_id" className="block text-sm font-medium text-gray-700 mb-1">
                College *
              </label>
              <select
                id="college_id"
                {...register('college_id', { required: 'College is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select College</option>
                {colleges.map(college => (
                  <option key={college.id} value={college.id}>{college.name}</option>
                ))}
              </select>
              {errors.college_id && (
                <p className="text-red-500 text-xs mt-1">{errors.college_id.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="department_id" className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <select
                id="department_id"
                {...register('department_id', { required: 'Department is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Department</option>
                {departments.map(department => (
                  <option key={department.id} value={department.id}>{department.name} ({department.code})</option>
                ))}
              </select>
              {errors.department_id && (
                <p className="text-red-500 text-xs mt-1">{errors.department_id.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="quota_id" className="block text-sm font-medium text-gray-700 mb-1">
                Quota *
              </label>
              <select
                id="quota_id"
                {...register('quota_id', { required: 'Quota is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Quota</option>
                {quotas.map(quota => (
                  <option key={quota.id} value={quota.id}>{quota.name}</option>
                ))}
              </select>
              {errors.quota_id && (
                <p className="text-red-500 text-xs mt-1">{errors.quota_id.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="dayscholar_hosteller_id" className="block text-sm font-medium text-gray-700 mb-1">
                Student Type *
              </label>
              <select
                id="dayscholar_hosteller_id"
                {...register('dayscholar_hosteller_id', { required: 'Student type is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Type</option>
                {dayScholarHosteller.map(option => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
              {errors.dayscholar_hosteller_id && (
                <p className="text-red-500 text-xs mt-1">{errors.dayscholar_hosteller_id.message}</p>
              )}
            </div>
            
            {/* Hidden role field - defaulted to student */}
            <input 
              type="hidden" 
              {...register('role_id')} 
              value={roles.length > 0 ? roles[0].id : ''}
            />
          </div>
          
          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Login here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
} 
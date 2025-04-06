'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { hasPermission } from '@/utils/rbac';
import GymNavigation from '@/components/GymNavigation';

// Updated to match the API response format
type BodyType = 'athletic' | 'flexible' | 'weight-loss' | 'muscular' | 'general';
type ExerciseType = 'functional' | 'flexibility' | 'cardio' | 'strength' | 'general';

interface Creator {
  id: number;
  name: string;
}

interface GymPost {
  id: number;
  title: string;
  content: string;
  bodyType: string;          // Changed from restricted type to string
  exerciseType: string;      // Changed from restricted type to string
  imageUrl: string | null;   // Updated to match API
  isActive: boolean;         // Updated to match API
  createdBy: Creator;        // Now an object with id and name
  createdAt: string;
  updatedAt: string;
}

export default function GymPostsPage() {
  // CSS styles to ensure select and options have correct colors
  const selectStyles = `
    select, option {
      color: #000 !important;
      background-color: #fff !important;
    }
    select option:checked {
      color: #000 !important;
      background-color: #f0f9ff !important;
    }
    select.filter-select {
      appearance: auto;
      -webkit-appearance: menulist;
      -moz-appearance: menulist;
    }
  `;

  const { user, token } = useAuth();
  const router = useRouter();
  
  const [posts, setPosts] = useState<GymPost[]>([]);
  const [allPosts, setAllPosts] = useState<GymPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBodyType, setSelectedBodyType] = useState<string>('');
  const [selectedExerciseType, setSelectedExerciseType] = useState<string>('');

  // Dynamically populated from backend response
  const [bodyTypes, setBodyTypes] = useState<string[]>([]);
  const [exerciseTypes, setExerciseTypes] = useState<string[]>([]);

  // State for API URL
  const [apiBaseUrl, setApiBaseUrl] = useState('http://localhost:3001');

  useEffect(() => {
    // More detailed logging for debugging
    console.log('Current user:', user);
    console.log('User role structure:', user?.role);
    
    // Handle user authentication and permissions
    if (!user) {
      console.log('No user found, redirecting to login');
      router.push('/login');
      return;
    }
    
    // Get role name for logging
    let roleName = '(unknown)';
    if (typeof user.role === 'string') {
      roleName = user.role;
    } else if (user.role && typeof user.role === 'object') {
      // Use type assertion to handle the nested role object
      const roleObj = user.role as { name?: string };
      if (roleObj.name) {
        roleName = roleObj.name;
      }
    }
    console.log('User role name:', roleName);
    
    // Check permission using updated hasPermission function
    const canViewGymPosts = hasPermission(user.role, 'view_gym_posts');
    console.log('Can view gym posts permission check result:', canViewGymPosts);
    
    if (!canViewGymPosts) {
      console.log('Permission denied, redirecting to dashboard');
      toast.error('You do not have permission to view this page');
      router.push('/dashboard');
      return;
    }
    
    console.log('User has permission, fetching posts...');
    fetchAllPosts();
  }, [user, router, token]);

  // Fetch all posts without filters to populate filter options
  const fetchAllPosts = async () => {
    if (!token) {
      console.log('No token available, skipping fetch');
      return;
    }
    
    try {
      setLoading(true);
      
      let url = `${apiBaseUrl}/api/gym/posts`;
      
      console.log('Fetching all posts from URL:', url);
      
      // First try the regular API endpoint
      let response: Response;
      let data: GymPost[];
      
      try {
        response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`API returned error status: ${response.status}`);
        }
        
        data = await response.json();
      } catch (initialError) {
        console.log('Initial API call failed:', initialError);
        toast.error('Could not connect to API. Please try again later.');
        // Return empty array instead of using sample data
        data = [];
      }
      
      console.log(`Received ${data.length} posts from API`);
      setAllPosts(data);
      setPosts(data);
      
      // Extract unique bodyTypes and exerciseTypes from the data
      const uniqueBodyTypes = Array.from(new Set(data.map(post => post.bodyType)));
      const uniqueExerciseTypes = Array.from(new Set(data.map(post => post.exerciseType)));
      
      setBodyTypes(uniqueBodyTypes);
      setExerciseTypes(uniqueExerciseTypes);
      
      console.log('Available body types:', uniqueBodyTypes);
      console.log('Available exercise types:', uniqueExerciseTypes);
      
    } catch (error) {
      console.error('Error fetching gym posts:', error);
      setPosts([]);
      setAllPosts([]);
      toast.error('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to the existing posts
  useEffect(() => {
    if (allPosts.length > 0) {
      let filteredPosts = [...allPosts];
      
      if (selectedBodyType) {
        filteredPosts = filteredPosts.filter(post => post.bodyType === selectedBodyType);
      }
      
      if (selectedExerciseType) {
        filteredPosts = filteredPosts.filter(post => post.exerciseType === selectedExerciseType);
      }
      
      setPosts(filteredPosts);
    }
  }, [selectedBodyType, selectedExerciseType, allPosts]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format body type for display
  const formatBodyType = (type: string): string => {
    // Handle hyphenated values and apply proper capitalization
    return type.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format exercise type for display
  const formatExerciseType = (type: string): string => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const handleBodyTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBodyType(e.target.value);
  };

  const handleExerciseTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedExerciseType(e.target.value);
  };

  // Function to refresh posts from the server
  const refreshPosts = () => {
    fetchAllPosts();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <style jsx>{selectStyles}</style>
      
      <GymNavigation />
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-blue-100 mb-8">
        <div className="p-6 border-b border-blue-200 bg-blue-50">
          <h1 className="text-2xl font-bold text-blue-800">Workout Posts</h1>
          <p className="mt-2 text-blue-600">
            Find workout recommendations tailored to your body type and exercise preferences.
          </p>
        </div>
        
        <div className="p-6 border-b border-blue-200">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="w-full md:w-auto">
              <label htmlFor="bodyType" className="block text-sm font-medium text-blue-700 mb-1">
                Filter by Body Type
              </label>
              <select
                id="bodyType"
                value={selectedBodyType}
                onChange={handleBodyTypeChange}
                className="filter-select w-full md:w-48 px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                style={{ color: '#000000', backgroundColor: '#ffffff' }}
              >
                <option value="" className="text-gray-900 bg-white">All Body Types</option>
                {bodyTypes.map((type) => (
                  <option key={type} value={type} className="text-gray-900 bg-white">
                    {formatBodyType(type)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="w-full md:w-auto">
              <label htmlFor="exerciseType" className="block text-sm font-medium text-blue-700 mb-1">
                Filter by Exercise Type
              </label>
              <select
                id="exerciseType"
                value={selectedExerciseType}
                onChange={handleExerciseTypeChange}
                className="filter-select w-full md:w-48 px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                style={{ color: '#000000', backgroundColor: '#ffffff' }}
              >
                <option value="" className="text-gray-900 bg-white">All Exercise Types</option>
                {exerciseTypes.map((type) => (
                  <option key={type} value={type} className="text-gray-900 bg-white">
                    {formatExerciseType(type)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex-grow"></div>
            
            <div className="w-full md:w-auto">
              <button
                onClick={refreshPosts}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {posts.map((post) => (
                <div 
                  key={post.id} 
                  className={`bg-white rounded-lg border ${post.isActive ? 'border-blue-100' : 'border-gray-200'} overflow-hidden shadow-md`}
                >
                  <div className={`p-4 flex justify-between ${post.isActive ? 'bg-blue-50 border-b border-blue-100' : 'bg-gray-50 border-b border-gray-200'}`}>
                    <div className="flex flex-col">
                      <h2 className={`text-xl font-semibold ${post.isActive ? 'text-blue-800' : 'text-gray-600'}`}>
                        {post.title}
                      </h2>
                      {!post.isActive && (
                        <span className="mt-1 text-xs text-red-500 font-medium">
                          Inactive Post
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <span 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
                        onClick={() => setSelectedBodyType(post.bodyType)}
                        title="Click to filter by this body type"
                      >
                        {formatBodyType(post.bodyType)}
                      </span>
                      <span 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 cursor-pointer hover:bg-green-200"
                        onClick={() => setSelectedExerciseType(post.exerciseType)}
                        title="Click to filter by this exercise type"
                      >
                        {formatExerciseType(post.exerciseType)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    {post.imageUrl && (
                      <div className="mb-4">
                        <img 
                          src={post.imageUrl} 
                          alt={post.title} 
                          className="w-full h-48 object-cover rounded-md"
                        />
                      </div>
                    )}
                    <p className="text-gray-700 whitespace-pre-line">{post.content}</p>
                    
                    <div className="mt-4 flex justify-between items-center text-sm text-blue-600">
                      <div className="flex items-center">
                        <span className="font-medium mr-1">Created by:</span> 
                        <span className="text-gray-700">{post.createdBy.name}</span>
                      </div>
                      <div>{formatDate(post.createdAt)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) :
            <div className="bg-white rounded-lg shadow-md p-6 w-full">
              <div className="text-center">
                <svg
                  className="w-16 h-16 mx-auto text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No Workout Posts Found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  There are currently no workout posts available matching your filter criteria.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-4">
                  <button
                    onClick={() => {
                      setSelectedBodyType('');
                      setSelectedExerciseType('');
                    }}
                    className="inline-flex items-center px-4 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={refreshPosts}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white shadow-sm text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Refresh Posts
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  );
}
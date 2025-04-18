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

// Form data type for creating a new post
interface CreatePostFormData {
  title: string;
  content: string;
  bodyType: string;
  exerciseType: string;
  imageUrl?: string;
}

export default function GymPostsPage() {
  // CSS styles to ensure select and options have correct colors
  const selectStyles = `
    select, option, input, textarea {
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
    input::placeholder, textarea::placeholder {
      color: #6b7280 !important;
      opacity: 1;
    }
    .form-input, .form-textarea, .form-select {
      color: #000 !important;
      background-color: #fff !important;
    }
  `;

  const { user, token } = useAuth();
  const router = useRouter();
  
  const [posts, setPosts] = useState<GymPost[]>([]);
  const [allPosts, setAllPosts] = useState<GymPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBodyType, setSelectedBodyType] = useState<string>('');
  const [selectedExerciseType, setSelectedExerciseType] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // State for the create post form
  const [formData, setFormData] = useState<CreatePostFormData>({
    title: '',
    content: '',
    bodyType: 'athletic',
    exerciseType: 'strength',
    imageUrl: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Dynamically populated from backend response
  const [bodyTypes, setBodyTypes] = useState<string[]>([]);
  const [exerciseTypes, setExerciseTypes] = useState<string[]>([]);

  // State for API URL
  const [apiBaseUrl, setApiBaseUrl] = useState('http://localhost:3001');
  const [isGymStaff, setIsGymStaff] = useState(false);

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
        // Check if user is gym staff
        if (roleObj.name === 'gym_staff') {
          setIsGymStaff(true);
        }
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
          // Add cache: 'no-store' to prevent caching issues
          cache: 'no-store'
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
      
      setBodyTypes(uniqueBodyTypes.length > 0 ? uniqueBodyTypes : ['athletic', 'flexible', 'muscular', 'average', 'lean']);
      setExerciseTypes(uniqueExerciseTypes.length > 0 ? uniqueExerciseTypes : ['strength', 'cardio', 'flexibility', 'balance', 'endurance']);
      
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

  // Handle form input changes - Fixed to prevent typing issues
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Direct state update instead of using the functional update pattern
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast.error('You must be logged in to create a post');
      return;
    }
    
    // Validate form data
    if (!formData.title.trim()) {
      toast.error('Please enter a post title');
      return;
    }
    
    if (!formData.content.trim()) {
      toast.error('Please enter workout content');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Create post data
      const postData = {
        ...formData,
        imageUrl: formData.imageUrl?.trim() || null // Convert empty string to null
      };
      
      console.log('Creating post with data:', postData);
      
      const response = await fetch(`${apiBaseUrl}/api/gym/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData),
        // Add cache: 'no-store' to prevent caching issues
        cache: 'no-store'
      });
      
      if (!response.ok) {
        let errorMessage = `API error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If JSON parsing fails, use the default error message
        }
        throw new Error(errorMessage);
      }
      
      const newPost = await response.json();
      console.log('Post created successfully:', newPost);
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        bodyType: 'athletic',
        exerciseType: 'strength',
        imageUrl: ''
      });
      
      // Hide form
      setShowCreateForm(false);
      
      // Refresh posts
      fetchAllPosts();
      
      toast.success('Workout post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error(`Failed to create post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSubmitting(false);
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

  // Delete post function
  const handleDeletePost = async (postId: number) => {
    if (!token) {
      toast.error('You must be logged in to delete a post');
      return;
    }

    try {
      setDeletingPostId(postId);
      
      const response = await fetch(`${apiBaseUrl}/api/gym/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        let errorMessage = `API error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If JSON parsing fails, use the default error message
        }
        throw new Error(errorMessage);
      }
      
      // Remove the deleted post from the state
      setPosts(posts.filter(post => post.id !== postId));
      setAllPosts(allPosts.filter(post => post.id !== postId));
      
      toast.success('Post deleted successfully!');
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error(`Failed to delete post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDeletingPostId(null);
    }
  };

  // Confirmation dialog component
  const DeleteConfirmDialog = ({ postId, onCancel, onConfirm }: { postId: number, onCancel: () => void, onConfirm: () => void }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 mt-2">Delete Confirmation</h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
          </div>
          <div className="items-center px-4 py-3">
            <button
              onClick={onCancel}
              className="mr-2 px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md w-24 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-24 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <style jsx global>{selectStyles}</style>
      
      <GymNavigation />
      
      {/* Create Post Button - Only show for gym staff */}
      {isGymStaff && !showCreateForm && (
        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Workout Post
          </button>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && deletingPostId && (
        <DeleteConfirmDialog 
          postId={deletingPostId}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setDeletingPostId(null);
          }}
          onConfirm={() => handleDeletePost(deletingPostId)}
        />
      )}
      
      {/* Create Post Modal - New implementation as a modal */}
      {isGymStaff && showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 my-6">
            <div className="absolute top-0 right-0 pt-4 pr-4">
              <button 
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                aria-label="Close"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 border-b border-blue-200 bg-blue-50">
              <h2 className="text-xl font-bold text-blue-800">Create New Workout Post</h2>
            </div>
            
            <div className="p-6">
              <form id="createPostForm" onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                
                const postData = {
                  title: formData.get('title') as string,
                  content: formData.get('content') as string,
                  bodyType: formData.get('bodyType') as string,
                  exerciseType: formData.get('exerciseType') as string,
                  imageUrl: formData.get('imageUrl') as string || null
                };
                
                if (!postData.title.trim()) {
                  toast.error('Please enter a post title');
                  return;
                }
                
                if (!postData.content.trim()) {
                  toast.error('Please enter workout content');
                  return;
                }
                
                setSubmitting(true);
                
                fetch(`${apiBaseUrl}/api/gym/posts`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify(postData),
                  cache: 'no-store'
                })
                .then(response => {
                  if (!response.ok) {
                    return response.json().then(errorData => {
                      throw new Error(errorData.message || `API error: ${response.status}`);
                    });
                  }
                  return response.json();
                })
                .then(newPost => {
                  console.log('Post created successfully:', newPost);
                  form.reset();
                  setShowCreateForm(false);
                  fetchAllPosts();
                  toast.success('Workout post created successfully!');
                })
                .catch(error => {
                  console.error('Error creating post:', error);
                  toast.error(`Failed to create post: ${error.message || 'Unknown error'}`);
                })
                .finally(() => {
                  setSubmitting(false);
                });
              }}>
                <div className="mb-4">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Post Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    defaultValue=""
                    className="form-input w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter workout title"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="bodyType" className="block text-sm font-medium text-gray-700 mb-1">
                      Target Body Type
                    </label>
                    <select
                      id="bodyType"
                      name="bodyType"
                      defaultValue="athletic"
                      className="form-select w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      {bodyTypes.map((type) => (
                        <option key={type} value={type}>
                          {formatBodyType(type)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="exerciseType" className="block text-sm font-medium text-gray-700 mb-1">
                      Exercise Type
                    </label>
                    <select
                      id="exerciseType"
                      name="exerciseType"
                      defaultValue="strength"
                      className="form-select w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      {exerciseTypes.map((type) => (
                        <option key={type} value={type}>
                          {formatExerciseType(type)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    id="imageUrl"
                    name="imageUrl"
                    defaultValue=""
                    className="form-input w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                    Workout Content
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    defaultValue=""
                    rows={6}
                    className="form-textarea w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter workout details, instructions, and tips..."
                    required
                  ></textarea>
                  <p className="mt-1 text-sm text-gray-500">
                    Tip: Use line breaks to format your content. Add exercise lists, sets, reps, etc.
                  </p>
                </div>
                
                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="mr-3 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white shadow-sm text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
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
                    ) : (
                      'Create Post'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
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
                      <div className="flex items-center">
                        <div>{formatDate(post.createdAt)}</div>
                        
                        {/* Delete Post Button - Only show for gym staff and author of the post */}
                        {isGymStaff && (
                          <button
                            onClick={() => {
                              setDeletingPostId(post.id);
                              setShowDeleteConfirm(true);
                            }}
                            className="ml-4 text-red-500 hover:text-red-700 focus:outline-none"
                            title="Delete Post"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
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
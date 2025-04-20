'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { Spinner } from '@/components/Spinner';

// Types
interface Creator {
  id: number;
  name: string;
  role: {
    name: string;
  };
  profileImageUrl?: string;
}

interface SocialPost {
  id: number;
  content: string;
  mediaUrls: string[];
  category: string;
  visibility: string;
  createdBy: Creator;
  endorsementCount: number;
  commentCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  hasEndorsed?: boolean;
}

interface Comment {
  id: number;
  content: string;
  createdBy: Creator;
  createdAt: string;
  updatedAt: string;
}

// Default avatar image
const DEFAULT_AVATAR = '/images/default-avatar.png';

export default function SocialFeedPage() {
  const { user, token } = useAuth();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeCommentPost, setActiveCommentPost] = useState<number | null>(null);
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [loadingComments, setLoadingComments] = useState<Record<number, boolean>>({});
  const [newComment, setNewComment] = useState('');
  const [commentsPage, setCommentsPage] = useState<Record<number, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Categories for posts
  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'event', label: 'Events' },
    { value: 'announcement', label: 'Announcements' },
    { value: 'general', label: 'General' },
    { value: 'academic', label: 'Academic' },
    { value: 'question', label: 'Questions' }
  ];

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fetch posts
  const fetchPosts = async (page = 1, category = '') => {
    if (!token) return;
    
    try {
      setLoading(true);
      const url = `http://localhost:3001/api/social/posts/feed?page=${page}&limit=10${category ? `&category=${category}` : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching posts: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (page === 1) {
        setPosts(data.items || []);
      } else {
        setPosts(prev => [...prev, ...(data.items || [])]);
      }
      
      setHasMore(data.meta.hasNextPage);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Create new post
  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newPostContent.trim()) return;
    
    try {
      setIsSubmitting(true);
      
      // First create the post
      const response = await fetch('http://localhost:3001/api/social/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newPostContent,
          category: selectedCategory || 'general',
          visibility: 'public'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error creating post: ${response.status}`);
      }
      
      const post = await response.json();
      
      // If there's a file, upload it
      if (selectedFile && post.id) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        const uploadResponse = await fetch(`http://localhost:3001/api/social/posts/${post.id}/upload-media`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        if (!uploadResponse.ok) {
          console.error('Error uploading media');
        }
      }
      
      // Reset form and refresh posts
      setNewPostContent('');
      setSelectedCategory('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      fetchPosts(1, selectedCategory);
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Load more posts
  const loadMorePosts = () => {
    if (!loading && hasMore) {
      fetchPosts(currentPage + 1, selectedCategory);
    }
  };

  // Toggle comments section
  const toggleComments = async (postId: number) => {
    if (activeCommentPost === postId) {
      setActiveCommentPost(null);
      return;
    }
    
    setActiveCommentPost(postId);
    
    if (!comments[postId]) {
      await fetchComments(postId);
    }
  };

  // Fetch comments for a post
  const fetchComments = async (postId: number, page = 1) => {
    if (!token) return;
    
    try {
      setLoadingComments(prev => ({ ...prev, [postId]: true }));
      
      const url = `http://localhost:3001/api/social/posts/${postId}/comments?page=${page}&limit=5`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching comments: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (page === 1) {
        setComments(prev => ({ ...prev, [postId]: data.items || [] }));
      } else {
        setComments(prev => ({ 
          ...prev, 
          [postId]: [...(prev[postId] || []), ...(data.items || [])] 
        }));
      }
      
      setCommentsPage(prev => ({ ...prev, [postId]: page }));
    } catch (err) {
      console.error(`Error fetching comments for post ${postId}:`, err);
    } finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  // Submit a new comment
  const submitComment = async (postId: number) => {
    if (!token || !newComment.trim()) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/social/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newComment
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error submitting comment: ${response.status}`);
      }
      
      // Update post's comment count
      setPosts(prev => 
        prev.map(post => 
          post.id === postId 
            ? { ...post, commentCount: post.commentCount + 1 } 
            : post
        )
      );
      
      // Reset form and refresh comments
      setNewComment('');
      fetchComments(postId);
    } catch (err) {
      console.error('Error submitting comment:', err);
    }
  };

  // Toggle post endorsement
  const toggleEndorsement = async (postId: number, currentlyEndorsed: boolean) => {
    if (!token) return;
    
    try {
      const method = currentlyEndorsed ? 'DELETE' : 'POST';
      const response = await fetch(`http://localhost:3001/api/social/posts/${postId}/endorsements`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error toggling endorsement: ${response.status}`);
      }
      
      // Update post endorsement status in state
      setPosts(prev => 
        prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                hasEndorsed: !currentlyEndorsed,
                endorsementCount: currentlyEndorsed 
                  ? post.endorsementCount - 1 
                  : post.endorsementCount + 1
              } 
            : post
        )
      );
    } catch (err) {
      console.error('Error toggling endorsement:', err);
    }
  };

  // Apply category filter
  const applyFilter = (category: string) => {
    setSelectedCategory(category);
    fetchPosts(1, category);
  };

  // Initial load
  useEffect(() => {
    if (token) {
      fetchPosts();
    }
  }, [token]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-800 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Campus Social Feed</h1>
        <p className="text-blue-100">
          Connect with the campus community, share updates, and stay informed
        </p>
      </div>

      {/* Post Creation Form */}
      <div className="bg-white rounded-lg shadow-md mb-8 p-6">
        <h2 className="text-xl font-semibold mb-4">Create a Post</h2>
        <form onSubmit={createPost}>
          <div className="mb-4">
            <textarea
              rows={3}
              placeholder="What's on your mind?"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              required
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Select a category</option>
                {categories.slice(1).map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Add Media</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !newPostContent.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Spinner size="sm" /> : 'Post'}
            </button>
          </div>
        </form>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Filter by Category</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.value}
              onClick={() => applyFilter(category.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                selectedCategory === category.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {posts.length === 0 && !loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-xl font-medium text-gray-600 mb-2">No posts found</p>
            <p className="text-gray-500 mb-4">Be the first to share something with the community!</p>
          </div>
        ) : (
          <>
            {posts.map(post => (
              <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Post Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                      <Image 
                        src={post.createdBy.profileImageUrl || DEFAULT_AVATAR} 
                        alt={post.createdBy.name}
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = DEFAULT_AVATAR;
                        }}
                      />
                    </div>
                    <div>
                      <div className="font-medium">{post.createdBy.name}</div>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-2">{formatDate(post.createdAt)}</span>
                        {post.category && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                            {post.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Post Content */}
                <div className="p-4">
                  <p className="whitespace-pre-line">{post.content}</p>
                  
                  {/* Media */}
                  {post.mediaUrls && post.mediaUrls.length > 0 && (
                    <div className="mt-3">
                      {post.mediaUrls.map((url, idx) => (
                        <div key={idx} className="mt-2 rounded-lg overflow-hidden">
                          <Image
                            src={url}
                            alt={`Post media ${idx + 1}`}
                            width={500}
                            height={300}
                            className="w-full h-auto max-h-96 object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Post Actions */}
                <div className="px-4 py-3 border-t flex items-center justify-between">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => toggleEndorsement(post.id, !!post.hasEndorsed)}
                      className={`flex items-center space-x-1 ${
                        post.hasEndorsed ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={post.hasEndorsed ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      <span>{post.endorsementCount}</span>
                    </button>
                    
                    <button 
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center space-x-1 text-gray-600 hover:text-blue-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>{post.commentCount}</span>
                    </button>
                  </div>
                </div>
                
                {/* Comments Section */}
                {activeCommentPost === post.id && (
                  <div className="bg-gray-50 p-4 border-t">
                    <h3 className="text-lg font-medium mb-3">Comments</h3>
                    
                    {/* Comments List */}
                    <div className="space-y-3 mb-4">
                      {comments[post.id] && comments[post.id].length > 0 ? (
                        comments[post.id].map(comment => (
                          <div key={comment.id} className="flex space-x-3 p-3 bg-white rounded-lg">
                            <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0">
                              <Image 
                                src={comment.createdBy.profileImageUrl || DEFAULT_AVATAR} 
                                alt={comment.createdBy.name}
                                width={32}
                                height={32}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = DEFAULT_AVATAR;
                                }}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <div className="font-medium text-sm">{comment.createdBy.name}</div>
                                <div className="text-xs text-gray-500">{formatDate(comment.createdAt)}</div>
                              </div>
                              <p className="text-sm">{comment.content}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-3 text-gray-500">
                          {loadingComments[post.id] ? (
                            <Spinner />
                          ) : (
                            'No comments yet. Be the first to comment!'
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Comment Form */}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <button
                        onClick={() => submitComment(post.id)}
                        disabled={!newComment.trim()}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Load More Button */}
            {(hasMore && !loading) && (
              <div className="text-center mt-6">
                <button
                  onClick={loadMorePosts}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Load More
                </button>
              </div>
            )}
            
            {/* Loading Indicator */}
            {loading && (
              <div className="text-center py-6">
                <Spinner />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 
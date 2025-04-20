import { toast } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Types
export interface Creator {
  id: number;
  name: string;
  email: string;
  profilePicture?: string;
}

export interface SocialPost {
  id: number;
  content: string;
  mediaUrls?: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
  creator: Creator;
  comments: Comment[];
  endorsements: Endorsement[];
  _count?: {
    comments: number;
    endorsements: number;
  }
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  creator: Creator;
}

export interface Endorsement {
  id: number;
  createdAt: string;
  updatedAt: string;
  creator: Creator;
}

export interface CreatePostRequest {
  content: string;
  category: string;
}

export interface CreateCommentRequest {
  content: string;
}

// Helper function to handle API responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || `API returned status: ${response.status}`);
  }
  return response.json();
};

// Social API service
export const socialApi = {
  // Posts
  getPosts: async (token: string): Promise<SocialPost[]> => {
    try {
      const response = await fetch(`${API_URL}/social/posts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return handleResponse<SocialPost[]>(response);
    } catch (error) {
      console.error('Error fetching social posts:', error);
      throw error;
    }
  },

  getPostById: async (postId: number, token: string): Promise<SocialPost> => {
    try {
      const response = await fetch(`${API_URL}/social/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return handleResponse<SocialPost>(response);
    } catch (error) {
      console.error(`Error fetching post ${postId}:`, error);
      throw error;
    }
  },

  createPost: async (data: CreatePostRequest, token: string): Promise<SocialPost> => {
    try {
      const response = await fetch(`${API_URL}/social/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return handleResponse<SocialPost>(response);
    } catch (error) {
      console.error('Error creating social post:', error);
      throw error;
    }
  },

  uploadPostMedia: async (postId: number, file: File, token: string): Promise<{ mediaUrl: string }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/social/posts/${postId}/upload-media`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      return handleResponse<{ mediaUrl: string }>(response);
    } catch (error) {
      console.error('Error uploading media to post:', error);
      throw error;
    }
  },

  deletePost: async (postId: number, token: string): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/social/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return handleResponse<void>(response);
    } catch (error) {
      console.error(`Error deleting post ${postId}:`, error);
      throw error;
    }
  },

  // Comments
  getComments: async (postId: number, token: string): Promise<Comment[]> => {
    try {
      const response = await fetch(`${API_URL}/social/posts/${postId}/comments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return handleResponse<Comment[]>(response);
    } catch (error) {
      console.error(`Error fetching comments for post ${postId}:`, error);
      throw error;
    }
  },

  createComment: async (postId: number, data: CreateCommentRequest, token: string): Promise<Comment> => {
    try {
      const response = await fetch(`${API_URL}/social/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return handleResponse<Comment>(response);
    } catch (error) {
      console.error(`Error creating comment on post ${postId}:`, error);
      throw error;
    }
  },

  deleteComment: async (commentId: number, token: string): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/social/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return handleResponse<void>(response);
    } catch (error) {
      console.error(`Error deleting comment ${commentId}:`, error);
      throw error;
    }
  },

  // Endorsements
  toggleEndorsement: async (postId: number, token: string): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/social/posts/${postId}/endorsements/toggle`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return handleResponse<void>(response);
    } catch (error) {
      console.error(`Error toggling endorsement for post ${postId}:`, error);
      throw error;
    }
  },

  // Filter posts by category
  getPostsByCategory: async (category: string, token: string): Promise<SocialPost[]> => {
    try {
      const response = await fetch(`${API_URL}/social/posts?category=${category}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return handleResponse<SocialPost[]>(response);
    } catch (error) {
      console.error(`Error fetching posts for category ${category}:`, error);
      throw error;
    }
  }
}; 
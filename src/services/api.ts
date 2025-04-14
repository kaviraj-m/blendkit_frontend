import { AuthResponse, LoginRequest, Equipment, GymPost, GymSchedule, Attendance, User } from '../types';

// The API_URL should be correctly set in the .env file or use this fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'An error occurred');
  }
  return response.json() as Promise<T>;
}

// Authentication API calls
export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(response);
  },
  register: async (data: any): Promise<User> => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<User>(response);
  },
};

// Equipment API calls
export const equipmentApi = {
  getAll: async (token: string): Promise<Equipment[]> => {
    const response = await fetch(`${API_URL}/gym/equipment`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<Equipment[]>(response);
  },
  getById: async (id: number, token: string): Promise<Equipment> => {
    const response = await fetch(`${API_URL}/gym/equipment/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<Equipment>(response);
  },
  create: async (data: Partial<Equipment>, token: string): Promise<Equipment> => {
    console.log('Creating equipment with data:', data);
    const response = await fetch(`${API_URL}/gym/equipment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Equipment>(response);
  },
  update: async (id: number, data: Partial<Equipment>, token: string): Promise<Equipment> => {
    console.log('Updating equipment with data:', data);
    const response = await fetch(`${API_URL}/gym/equipment/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Equipment>(response);
  },
  delete: async (id: number, token: string): Promise<void> => {
    const response = await fetch(`${API_URL}/gym/equipment/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<void>(response);
  },
};

// Gym Posts API calls
export const gymPostsApi = {
  getAll: async (filters?: { bodyType?: string; exerciseType?: string; isActive?: boolean }): Promise<GymPost[]> => {
    try {
      let url = `${API_URL}/gym/posts`;
      if (filters) {
        const params = new URLSearchParams();
        if (filters.bodyType) params.append('bodyType', filters.bodyType);
        if (filters.exerciseType) params.append('exerciseType', filters.exerciseType);
        if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
        if (params.toString()) url += `?${params.toString()}`;
      }
      
      console.log('Fetching gym posts from:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`);
      }
      
      // Try to parse the response
      const data = await response.json();
      console.log(`Received ${data.length} gym posts`);
      return data;
    } catch (error) {
      console.error('Error fetching gym posts:', error);
      
      // Try direct API call as fallback
      console.log('Trying direct API call to gym posts endpoint');
      try {
        const directResponse = await fetch("http://localhost:3001/api/gym/posts");
        if (!directResponse.ok) {
          throw new Error(`API returned status: ${directResponse.status}`);
        }
        const data = await directResponse.json();
        return data;
      } catch (fallbackError) {
        console.error('Fallback API call also failed:', fallbackError);
        throw new Error('Failed to fetch gym posts after multiple attempts');
      }
    }
  },
  getById: async (id: number): Promise<GymPost> => {
    try {
      const response = await fetch(`${API_URL}/gym/posts/${id}`);
      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error(`Error fetching gym post ${id}:`, error);
      
      // Try direct API call as fallback
      const directResponse = await fetch(`http://localhost:3001/api/gym/posts/${id}`);
      if (!directResponse.ok) {
        throw new Error(`API returned status: ${directResponse.status}`);
      }
      return directResponse.json();
    }
  },
  create: async (data: Partial<GymPost>, token: string): Promise<GymPost> => {
    try {
      const response = await fetch(`${API_URL}/gym/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `API returned status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error creating gym post:', error);
      throw error;
    }
  },
  update: async (id: number, data: Partial<GymPost>, token: string): Promise<GymPost> => {
    try {
      const response = await fetch(`${API_URL}/gym/posts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `API returned status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`Error updating gym post ${id}:`, error);
      throw error;
    }
  },
  delete: async (id: number, token: string): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/gym/posts/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `API returned status: ${response.status}`);
      }
      
      return;
    } catch (error) {
      console.error(`Error deleting gym post ${id}:`, error);
      throw error;
    }
  },
};

// Gym Schedule API calls
export const gymScheduleApi = {
  getAll: async (): Promise<GymSchedule[]> => {
    const response = await fetch(`${API_URL}/gym-schedule`);
    
    try {
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error parsing gym schedule response:", error);
      
      // Try direct API call as fallback
      console.log("Trying direct API call to gym-schedule endpoint");
      const directResponse = await fetch("http://localhost:3001/api/gym-schedule");
      if (!directResponse.ok) {
        throw new Error(`API returned status: ${directResponse.status}`);
      }
      return directResponse.json();
    }
  },
  getActive: async (): Promise<GymSchedule[]> => {
    try {
      const response = await fetch(`${API_URL}/gym-schedule/active`);
      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching active gym schedules:", error);
      
      // Try direct API call as fallback
      console.log("Trying direct API call to active gym-schedule endpoint");
      const directResponse = await fetch("http://localhost:3001/api/gym-schedule/active");
      if (!directResponse.ok) {
        throw new Error(`API returned status: ${directResponse.status}`);
      }
      return directResponse.json();
    }
  },
  getById: async (id: number): Promise<GymSchedule> => {
    try {
      const response = await fetch(`${API_URL}/gym-schedule/${id}`);
      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error(`Error fetching gym schedule ${id}:`, error);
      
      // Try direct API call as fallback
      console.log(`Trying direct API call to gym-schedule/${id} endpoint`);
      const directResponse = await fetch(`http://localhost:3001/api/gym-schedule/${id}`);
      if (!directResponse.ok) {
        throw new Error(`API returned status: ${directResponse.status}`);
      }
      return directResponse.json();
    }
  },
  create: async (data: Partial<GymSchedule>, token: string): Promise<GymSchedule> => {
    try {
      const response = await fetch(`${API_URL}/gym-schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `API returned status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error creating gym schedule:", error);
      
      // Try direct API call as fallback
      console.log("Trying direct API call to create gym schedule");
      const directResponse = await fetch("http://localhost:3001/api/gym-schedule", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!directResponse.ok) {
        const errorData = await directResponse.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `API returned status: ${directResponse.status}`);
      }
      return directResponse.json();
    }
  },
  update: async (id: number, data: Partial<GymSchedule>, token: string): Promise<GymSchedule> => {
    try {
      const response = await fetch(`${API_URL}/gym-schedule/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `API returned status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error(`Error updating gym schedule ${id}:`, error);
      
      // Try direct API call as fallback
      console.log(`Trying direct API call to update gym schedule ${id}`);
      const directResponse = await fetch(`http://localhost:3001/api/gym-schedule/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!directResponse.ok) {
        const errorData = await directResponse.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `API returned status: ${directResponse.status}`);
      }
      return directResponse.json();
    }
  },
  delete: async (id: number, token: string): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/gym-schedule/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `API returned status: ${response.status}`);
      }
      return;
    } catch (error) {
      console.error(`Error deleting gym schedule ${id}:`, error);
      
      // Try direct API call as fallback
      console.log(`Trying direct API call to delete gym schedule ${id}`);
      const directResponse = await fetch(`http://localhost:3001/api/gym-schedule/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!directResponse.ok) {
        const errorData = await directResponse.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `API returned status: ${directResponse.status}`);
      }
      return;
    }
  },
};

// Attendance API calls
export const attendanceApi = {
  getAll: async (token: string, filters?: { userId?: number; date?: string; isPresent?: boolean }): Promise<Attendance[]> => {
    let url = `${API_URL}/attendance`;
    if (filters) {
      const params = new URLSearchParams();
      if (filters.userId) params.append('userId', filters.userId.toString());
      if (filters.date) params.append('date', filters.date);
      if (filters.isPresent !== undefined) params.append('isPresent', filters.isPresent.toString());
      if (params.toString()) url += `?${params.toString()}`;
    }
    
    try {
      console.log(`Fetching attendance records from: ${url}`);
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      
      // Try direct API call as fallback
      console.log('Trying direct API call to attendance endpoint');
      const directUrl = `http://localhost:3001/api/attendance${filters ? '?' + new URLSearchParams(
        Object.entries(filters).filter(([_, v]) => v !== undefined) as [string, string][]
      ).toString() : ''}`;
      
      console.log(`Direct API call to: ${directUrl}`);
      const directResponse = await fetch(directUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!directResponse.ok) {
        throw new Error(`Direct API call failed with status: ${directResponse.status}`);
      }
      
      return await directResponse.json();
    }
  },
  
  getById: async (id: number, token: string): Promise<Attendance> => {
    try {
      const response = await fetch(`${API_URL}/attendance/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching attendance record ${id}:`, error);
      
      // Try direct API call as fallback
      const directResponse = await fetch(`http://localhost:3001/api/attendance/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!directResponse.ok) {
        throw new Error(`Direct API call failed with status: ${directResponse.status}`);
      }
      
      return await directResponse.json();
    }
  },
  
  create: async (data: Partial<Attendance>, token: string): Promise<Attendance> => {
    try {
      console.log('Creating attendance record with data:', data);
      const response = await fetch(`${API_URL}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`API returned status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating attendance record:', error);
      
      // Try direct API call as fallback
      console.log('Trying direct API call to create attendance record');
      const directResponse = await fetch(`http://localhost:3001/api/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!directResponse.ok) {
        const errorText = await directResponse.text();
        console.error('Direct API error response:', errorText);
        throw new Error(`Direct API call failed with status: ${directResponse.status}`);
      }
      
      return await directResponse.json();
    }
  },
  
  update: async (id: number, data: Partial<Attendance>, token: string): Promise<Attendance> => {
    try {
      console.log(`Updating attendance record ${id} with data:`, data);
      const response = await fetch(`${API_URL}/attendance/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`API returned status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error updating attendance record ${id}:`, error);
      
      // Try direct API call as fallback
      console.log(`Trying direct API call to update attendance record ${id}`);
      const directResponse = await fetch(`http://localhost:3001/api/attendance/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!directResponse.ok) {
        const errorText = await directResponse.text();
        console.error('Direct API error response:', errorText);
        throw new Error(`Direct API call failed with status: ${directResponse.status}`);
      }
      
      return await directResponse.json();
    }
  },
  
  delete: async (id: number, token: string): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/attendance/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error deleting attendance record ${id}:`, error);
      
      // Try direct API call as fallback
      const directResponse = await fetch(`http://localhost:3001/api/attendance/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!directResponse.ok) {
        throw new Error(`Direct API call failed with status: ${directResponse.status}`);
      }
    }
  },
};

// User API calls
export const userApi = {
  getAll: async (token: string): Promise<User[]> => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if the response is an object with a users array property
      // This is likely based on your backend implementation
      if (data && typeof data === 'object' && Array.isArray(data.users)) {
        console.log(`Received ${data.users.length} users from API`);
        return data.users;
      }
      
      // Handle direct array response
      if (Array.isArray(data)) {
        console.log(`Received ${data.length} users from API`);
        return data;
      }
      
      console.error('Unexpected API response format:', data);
      return [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },
  getStudents: async (token: string): Promise<User[]> => {
    try {
      const response = await fetch(`${API_URL}/users/students`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },
  getById: async (id: number, token: string): Promise<User> => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<User>(response);
  },
  getProfile: async (token: string): Promise<User> => {
    // First try with the configured API_URL
    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return handleResponse<User>(response);
    } catch (error) {
      console.error('Error fetching user profile with primary URL:', error);
      
      // Try with alternative URL formats as fallback
      try {
        // Try removing the /api part if it exists
        const baseUrl = API_URL.endsWith('/api') 
          ? API_URL.slice(0, -4)
          : API_URL;
          
        console.log('Attempting fallback with URL:', `${baseUrl}/api/users/profile`);
        const alternativeResponse = await fetch(`${baseUrl}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!alternativeResponse.ok) {
          throw new Error(`Failed with status: ${alternativeResponse.status}`);
        }
        
        return alternativeResponse.json();
      } catch (fallbackError) {
        console.error('All profile fetch attempts failed:', fallbackError);
        throw new Error('Failed to fetch user profile after multiple attempts');
      }
    }
  },
  update: async (id: number, data: Partial<User>, token: string): Promise<User> => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse<User>(response);
  },
  updateProfile: async (data: Partial<User>, token: string): Promise<User> => {
    const response = await fetch(`${API_URL}/users/profile/update`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse<User>(response);
  },
};
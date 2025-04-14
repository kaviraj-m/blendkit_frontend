import axios from 'axios';

// Create a reusable API client with consistent configuration
const createApiClient = (token: string | null) => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  return axios.create({
    baseURL,
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    },
    timeout: 8000 // 8 second timeout
  });
};

// Complaint related API calls
export const complaintsApi = {
  getAll: async (token: string | null) => {
    const api = createApiClient(token);
    const response = await api.get('/api/complaints');
    return response.data;
  },
  
  getById: async (id: number, token: string | null) => {
    const api = createApiClient(token);
    const response = await api.get(`/api/complaints/${id}`);
    return response.data;
  },
  
  update: async (id: number, data: { status: string; response: string }, token: string | null) => {
    const api = createApiClient(token);
    const response = await api.patch(`/api/complaints/${id}`, data);
    return response.data;
  }
};

// Equipment related API calls
export const equipmentApi = {
  getAll: async (token: string | null) => {
    const api = createApiClient(token);
    const response = await api.get('/api/equipment');
    return response.data;
  }
};

// Programs related API calls
export const programsApi = {
  getAll: async (token: string | null) => {
    const api = createApiClient(token);
    const response = await api.get('/api/programs');
    return response.data;
  }
};

export default createApiClient; 
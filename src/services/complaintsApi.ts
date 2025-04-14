import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Define types
export interface Complaint {
  id: number;
  subject: string;
  message: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  response?: string;
  created_at: string;
  updated_at: string;
  student: {
    id: number;
    name: string;
    email: string;
    rollNumber?: string;
    department?: {
      id: number;
      name: string;
    };
    dayScholarHosteller?: {
      id: number;
      name: string;
    };
  };
  director?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateComplaintDto {
  subject: string;
  message: string;
}

export interface UpdateComplaintStatusDto {
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  response: string;
}

// Create axios instance with authorization header
const createAuthorizedAxios = (token: string) => {
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
};

// Complaints API
export const complaintsApi = {
  // Get diagnostic info to debug auth
  getAuthDebug: async (token: string): Promise<any> => {
    const http = createAuthorizedAxios(token);
    const response = await http.get('/api/complaints/debug/auth');
    return response.data;
  },
  
  // Get all complaints (for student: their own, for executive director: all)
  getAll: async (token: string): Promise<Complaint[]> => {
    const http = createAuthorizedAxios(token);
    const response = await http.get('/api/complaints');
    return response.data;
  },
  
  // Get department complaints (HOD only)
  getDepartmentComplaints: async (token: string): Promise<Complaint[]> => {
    const http = createAuthorizedAxios(token);
    const response = await http.get('/api/complaints/department');
    return response.data;
  },
  
  // Get hostel complaints (Warden only)
  getHostelComplaints: async (token: string): Promise<Complaint[]> => {
    const http = createAuthorizedAxios(token);
    const response = await http.get('/api/complaints/hostel');
    return response.data;
  },
  
  // Get complaints by status (executive director only)
  getByStatus: async (token: string, status: string): Promise<Complaint[]> => {
    const http = createAuthorizedAxios(token);
    const response = await http.get(`/api/complaints/status/${status}`);
    return response.data;
  },
  
  // Get a specific complaint
  getById: async (token: string, id: number): Promise<Complaint> => {
    const http = createAuthorizedAxios(token);
    const response = await http.get(`/api/complaints/${id}`);
    return response.data;
  },
  
  // Create a new complaint (student only)
  create: async (token: string, data: CreateComplaintDto): Promise<Complaint> => {
    const http = createAuthorizedAxios(token);
    const response = await http.post('/api/complaints', data);
    return response.data;
  },
  
  // Update complaint status (executive director only)
  updateStatus: async (token: string, id: number, data: UpdateComplaintStatusDto): Promise<Complaint> => {
    const http = createAuthorizedAxios(token);
    const response = await http.patch(`/api/complaints/${id}`, data);
    return response.data;
  }
}; 
// User related types
export interface User {
  id: number;
  sin_number?: string;
  name: string;
  email: string;
  father_name?: string;
  year?: number;
  batch?: string;
  phone?: string;
  department_id: number;
  college_id: number;
  dayscholar_hosteller_id: number;
  quota_id: number;
  role_id: number;
  role?: Role;
  department?: Department;
  college?: College;
  dayScholarHosteller?: DayScholarHosteller;
  quota?: Quota;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  college_id: number;
  created_at: string;
  updated_at: string;
}

export interface College {
  id: number;
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface DayScholarHosteller {
  id: number;
  type: string;
  created_at: string;
  updated_at: string;
}

export interface Quota {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

// Equipment types
export interface Equipment {
  id: number;
  name: string;
  description: string;
  quantity: number;
  imageUrl: string | null;
  // These fields may be null based on the API response
  category: string | null;
  trainingType: string | null;
  isAvailable: boolean;
  location: string;
  createdAt: string;
  updatedAt: string;
}

// Attendance types
export interface Attendance {
  id: number;
  user_id: number;
  user?: User;
  check_in: string;
  check_out?: string;
  is_present: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  userId?: number;      // Alternative for user_id
  checkInTime?: string; // Alternative for check_in
  checkOutTime?: string; // Alternative for check_out
  isPresent?: boolean;  // Alternative for is_present
}

// Gym Post types
export interface GymPost {
  id: number;
  title: string;
  content: string;
  bodyType: string;
  exerciseType: string;
  imageUrl: string | null;
  isActive: boolean;
  createdBy: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Gym Schedule types
export interface GymSchedule {
  id: number;
  day: string;
  openingTime: string;
  closingTime: string;
  isActive: boolean;
  specialNote: string;
  createdAt: string;
  updatedAt: string;
}
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../services/api';
import { AuthResponse, LoginRequest, User } from '../types';
import { useRouter } from 'next/navigation';

// Explicitly define the user object with possibly nested role structure
interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: string | {
    id: number;
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
  };
  department?: {
    id: number;
    name: string;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginRequest, redirectCallback?: boolean) => Promise<{ user: AuthUser; access_token: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    // Check if user is already logged in
    console.log('AuthProvider: Checking stored credentials');
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      console.log('AuthProvider: Found stored credentials');
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('AuthProvider: Parsed stored user', parsedUser);
        console.log('AuthProvider: User role', parsedUser.role);
        const roleName = getRoleName(parsedUser);
        console.log('AuthProvider: Extracted role name', roleName);
        
        setUser(parsedUser);
        setToken(storedToken);
      } catch (error) {
        console.error('AuthProvider: Error parsing stored user', error);
      }
    } else {
      console.log('AuthProvider: No stored credentials found');
    }
    
    setIsLoading(false);
  }, []);

  // Helper to get role name
  const getRoleName = (userObj: any): string => {
    if (!userObj) {
      console.log('No user object provided to getRoleName');
      return '';
    }
    
    let roleName = '';
    
    if (typeof userObj.role === 'string') {
      roleName = userObj.role.toLowerCase();
      console.log('Role is a string:', roleName);
    } else if (userObj.role && typeof userObj.role === 'object' && 'name' in userObj.role) {
      roleName = userObj.role.name.toLowerCase();
      console.log('Role is an object with name property:', roleName);
    } else {
      console.log('Unknown role format:', userObj.role);
    }
    
    console.log('Final extracted role name:', roleName);
    return roleName;
  };
  
  const login = async (data: LoginRequest, redirectCallback = true) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authApi.login(data);
      
      // Store the user with the role object intact
      setUser(response.user);
      setToken(response.access_token);
      
      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('token', response.access_token);
      
      // Set token in cookie for middleware authentication
      document.cookie = `token=${response.access_token}; path=/; max-age=86400; SameSite=Strict`;
      
      console.log('Login successful, user data:', response.user);
      console.log('User role (raw):', response.user.role);
      
      // Handle redirect based on role if redirectCallback is true
      if (redirectCallback) {
        const roleName = getRoleName(response.user);
        console.log('Role name extracted for redirect:', roleName);
        console.log('Role type:', typeof roleName);
        
        // Use timeout to ensure state is updated before redirect
        setTimeout(() => {
          console.log('Inside timeout, redirecting based on role:', roleName);
          switch (roleName) {
            case 'staff':
              console.log('Redirecting to staff dashboard from context');
              router.push('/dashboard/staff');
              break;
            case 'student':
              console.log('Redirecting to student dashboard from context');
              router.push('/dashboard/student');
              break;
            case 'hod':
              console.log('Redirecting to HOD dashboard from context');
              router.push('/dashboard/hod');
              break;
            case 'academic_director':
              console.log('Redirecting to Academic Director dashboard from context');
              router.push('/dashboard/academic-director');
              break;
            case 'security':
              console.log('Redirecting to security dashboard from context');
              router.push('/dashboard/security');
              break;
            case 'gym_staff':
              console.log('Redirecting to gym staff dashboard from context');
              router.push('/dashboard/gym-staff');
              break;
            case 'executive_director':
              console.log('Redirecting to executive director dashboard from context');
              router.push('/dashboard/executive-director');
              break;
            default:
              console.log('No specific role match, redirecting to default dashboard');
              router.push('/dashboard');
          }
        }, 100);
      }
      
      // Return the response for further use
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Clear the token cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  };
  
  const value = {
    user,
    token,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated: !!user && !!token,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
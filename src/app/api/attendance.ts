import { apiClient } from './apiClient';

export interface CreateAttendanceDTO {
  userId: number;
  checkInTime?: string;
  isPresent?: boolean;
  notes?: string;
  workoutType?: 'cardio' | 'strength' | 'flexibility' | 'mixed' | 'other';
  plannedDuration?: number;
  isFirstVisit?: boolean;
}

export interface CheckoutAttendanceDTO {
  checkOutTime: string;
  notes?: string;
  actualDuration?: number;
}

export interface AttendanceStatistics {
  totalVisits: number;
  uniqueUsers: number;
  averageDuration: number;
  workoutTypes: Record<string, number>;
  peakHour: number;
  hourDistribution: Record<string, number>;
}

const attendanceApi = {
  // Check in a student
  checkIn: async (data: CreateAttendanceDTO, token: string) => {
    return apiClient.post('/attendance', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  
  // Checkout a student
  checkOut: async (attendanceId: number, data: CheckoutAttendanceDTO, token: string) => {
    return apiClient.patch(`/attendance/${attendanceId}/checkout`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  
  // Get attendance history for all students
  getHistory: async (token: string, params?: { startDate?: string; endDate?: string }) => {
    return apiClient.get('/attendance/history', {
      headers: { Authorization: `Bearer ${token}` },
      params
    });
  },
  
  // Get currently checked-in users
  getCurrentAttendance: async (token: string) => {
    return apiClient.get('/attendance/current', {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  
  // Get statistics for attendance
  getStatistics: async (token: string, startDate: string, endDate: string) => {
    return apiClient.get<AttendanceStatistics>('/attendance/statistics', {
      headers: { Authorization: `Bearer ${token}` },
      params: { startDate, endDate }
    });
  }
};

export default attendanceApi; 
 
 
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { attendanceApi, userApi } from '@/services/api';
import { User, Attendance, AttendanceStatistics, WorkoutType, WorkoutCompletionStatus, WorkoutStatus, Role } from '@/types';
import GymNavigation from '@/components/GymNavigation';
import { format, parseISO, subDays } from 'date-fns';
import { hasPermission } from '@/utils/rbac';
// Remove problematic imports that cause linter errors
// import Loading from '@/components/Loading';
// import { BsCheckCircle, BsXCircle } from 'react-icons/bs';
// import Modal from '@/components/Modal';

// Helper component for loading state
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Helper functions
const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const calculateTimeElapsed = (checkInTime: string) => {
  const checkIn = new Date(checkInTime);
  const now = new Date();
  const diff = now.getTime() - checkIn.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

const getMostActiveDayName = (weekdayDistribution: Record<number, number>) => {
  if (!weekdayDistribution || Object.keys(weekdayDistribution).length === 0) {
    return 'N/A';
  }
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const mostActiveDay = Object.entries(weekdayDistribution)
    .sort((a, b) => Number(b[1]) - Number(a[1]))[0];
  
  return dayNames[Number(mostActiveDay[0])] || 'N/A';
};

// Mock data generation for statistics
const getMockData = () => {
  // Generate mock workout distribution
  const workoutDistribution = {
    Cardio: Math.floor(Math.random() * 50) + 20,
    Strength: Math.floor(Math.random() * 40) + 30,
    HIIT: Math.floor(Math.random() * 30) + 10,
    Flexibility: Math.floor(Math.random() * 20) + 5,
    Other: Math.floor(Math.random() * 15) + 5
  };
  
  // Generate mock intensity distribution
  const intensityDistribution = {
    Low: Math.floor(Math.random() * 30) + 10,
    Medium: Math.floor(Math.random() * 50) + 30,
    High: Math.floor(Math.random() * 40) + 20
  };
  
  // Generate mock weekly attendance
  const weeklyAttendance = {
    Monday: Math.floor(Math.random() * 30) + 10,
    Tuesday: Math.floor(Math.random() * 35) + 15,
    Wednesday: Math.floor(Math.random() * 40) + 20,
    Thursday: Math.floor(Math.random() * 35) + 15,
    Friday: Math.floor(Math.random() * 25) + 5,
    Saturday: Math.floor(Math.random() * 20) + 5,
    Sunday: Math.floor(Math.random() * 15) + 5
  };
  
  // Generate mock weekday distribution
  const weekdayDistribution: Record<number, number> = {
    0: Math.floor(Math.random() * 15) + 5,   // Sunday
    1: Math.floor(Math.random() * 30) + 10,  // Monday
    2: Math.floor(Math.random() * 35) + 15,  // Tuesday
    3: Math.floor(Math.random() * 40) + 20,  // Wednesday
    4: Math.floor(Math.random() * 35) + 15,  // Thursday
    5: Math.floor(Math.random() * 25) + 5,   // Friday
    6: Math.floor(Math.random() * 20) + 5    // Saturday
  };
  
  // Generate mock completion status distribution
  const completionStatusDistribution = {
    Completed: Math.floor(Math.random() * 70) + 30,
    Partial: Math.floor(Math.random() * 30) + 10,
    Incomplete: Math.floor(Math.random() * 20) + 5
  };
  
  // Generate mock peak hours data
  const peakHoursData = {
    '6-8 AM': Math.floor(Math.random() * 25) + 5,
    '8-10 AM': Math.floor(Math.random() * 35) + 15,
    '10-12 PM': Math.floor(Math.random() * 30) + 10,
    '12-2 PM': Math.floor(Math.random() * 20) + 5,
    '2-4 PM': Math.floor(Math.random() * 25) + 5,
    '4-6 PM': Math.floor(Math.random() * 45) + 25,
    '6-8 PM': Math.floor(Math.random() * 40) + 20,
    '8-10 PM': Math.floor(Math.random() * 25) + 5
  };
  
  return {
    totalVisits: Math.floor(Math.random() * 500) + 300,
    uniqueUsers: Math.floor(Math.random() * 200) + 100,
    avgDuration: (Math.random() * 60 + 30).toFixed(0),
    firstTimeVisits: Math.floor(Math.random() * 50) + 20,
    returnRate: (Math.random() * 30 + 70).toFixed(1),
    avgIntensity: (Math.random() * 2 + 6).toFixed(1),
    workoutDistribution,
    intensityDistribution,
    weeklyAttendance,
    weekdayDistribution,
    completionStatusDistribution,
    peakHoursData
  };
};

export default function GymAttendancePage() {
  const { user, token } = useAuth();
  const router = useRouter();
  
  // States for attendance management
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<User[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [attendanceDate, setAttendanceDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'checkin' | 'history' | 'stats' | 'current'>('checkin');
  const [error, setError] = useState<string | null>(null);
  const [statsDateRange, setStatsDateRange] = useState<{start: string, end: string}>({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  const [statistics, setStatistics] = useState<AttendanceStatistics | null>(null);
  const [currentUsers, setCurrentUsers] = useState<Attendance[]>([]);
  
  // New field states
  const [workoutType, setWorkoutType] = useState<WorkoutType | ''>('');
  const [plannedDuration, setPlannedDuration] = useState<number>(60);
  const [isFirstVisit, setIsFirstVisit] = useState<boolean>(false);
  const [checkoutData, setCheckoutData] = useState<{
    attendanceId: number | null;
    completionStatus: WorkoutCompletionStatus | '';
    staffObservations: string;
    workoutIntensity: number;
  }>({
    attendanceId: null,
    completionStatus: '',
    staffObservations: '',
    workoutIntensity: 3,
  });
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [attendanceList, setAttendanceList] = useState<Attendance[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
  const [checkoutStatus, setCheckoutStatus] = useState<WorkoutStatus | ''>('');
  const [workoutIntensity, setWorkoutIntensity] = useState<string>('3');
  const [staffObservations, setStaffObservations] = useState<string>('');

  // Initial data loading
  useEffect(() => {
    // Redirect non-gym staff users back to the main dashboard
    if (user) {
      const roleName = typeof user.role === 'string' 
        ? user.role 
        : (user.role && typeof user.role === 'object' && user.role.name 
          ? user.role.name 
          : '');
      
      if (roleName !== 'gym_staff') {
        router.push('/dashboard');
        return;
      }
      
      // User has correct role, load data based on active tab
      if (activeTab === 'checkin' || activeTab === 'history') {
        // First load attendance data, then try to fetch students
        fetchAttendanceRecords().then(() => {
          fetchStudents();
        });
      } else if (activeTab === 'stats') {
        fetchStatistics();
      } else if (activeTab === 'current') {
        fetchCurrentAttendance();
      }
    }
  }, [user, router, token, activeTab, attendanceDate]);

  // Fetch attendance records
  const fetchAttendanceRecords = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      
      // Direct fetch for debugging
      const filters = {
        date: attendanceDate,
      };
      
      let endpoint = `http://localhost:3001/api/attendance`;
      if (filters.date) {
        endpoint += `?date=${filters.date}`;
      }
      
      console.log(`Fetching attendance records from: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received attendance records:', data);
      
      if (Array.isArray(data)) {
      setAttendanceRecords(data);
        return data; // Return data for potential use in fetchStudents
      } else {
        console.error('Unexpected data format:', data);
        throw new Error('Invalid data format');
      }
    } catch (err) {
      console.error('Failed to fetch attendance records:', err);
      toast.error('Could not load attendance data');
      setError('Failed to load attendance records. Please try again.');
      return []; // Return empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Fetch users
  const fetchStudents = async () => {
    if (!token) {
      setError('No authentication token available');
      return;
    }
    
    try {
      setLoading(true);
      try {
        // Use the users API endpoint
        console.log('Fetching all users from API');
        
        // Use direct fetch for debugging
        const response = await fetch('http://localhost:3001/api/users', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`API returned status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Raw API response:', data);
        
        // Check if the response is wrapped in an object
        let users: User[] = [];
        if (data && typeof data === 'object' && Array.isArray(data.users)) {
          users = data.users;
          console.log(`Found ${users.length} users in data.users`);
        } else if (Array.isArray(data)) {
          users = data;
          console.log(`Found ${users.length} users in data array`);
        } else {
          console.error('Unexpected API response format:', data);
          throw new Error('Invalid API response format');
        }
        
        console.log(`Setting ${users.length} users`);
        if (users.length === 0) {
          setError('No users found in API response');
        } else {
          setError(null);
        }
        
        setStudents(users);
      } catch (apiError: any) {
        console.error('Failed to fetch users from API:', apiError);
        setError(`API Error: ${apiError.message || 'Unknown error'}`);
        
        // Continue with fallback
        if (attendanceRecords.length > 0) {
          console.log('Using attendance records to extract user information');
          const uniqueUserIds = [...new Set(attendanceRecords.map(record => 
            record.user_id || record.userId || 0
          ))];
          
          const uniqueUsers = uniqueUserIds
            .filter(id => id > 0)
            .map(id => {
              const record = attendanceRecords.find(r => (r.user_id || r.userId) === id);
              if (record?.user) {
                // If the attendance record already includes user info, use it
                return record.user;
              }
              
              // Otherwise create a placeholder user
              return {
                id,
                name: `User ID: ${id}`,
                sin_number: '',
                role: { id: 1, name: 'user', created_at: '', updated_at: '' } as Role,
                department_id: 1,
                college_id: 1,
                dayscholar_hosteller_id: 1,
                quota_id: 1,
                role_id: 1,
                created_at: '',
                updated_at: '',
                email: ''
              } as User;
            });
          
          setStudents(uniqueUsers);
          if (uniqueUsers.length > 0) {
            toast.success(`Found ${uniqueUsers.length} users from attendance records`);
          } else {
            toast.error('No user data available');
          }
        } else {
          // No attendance records and API calls failed
          toast.error('Could not load user data. Please try with a different date.');
        }
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      toast.error('Could not load user data');
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch attendance statistics
  const fetchStatistics = useCallback(async () => {
    if (!token) {
      setError('No authentication token available');
      return;
    }
    
    setLoading(true);
    try {
      // Use the working attendance history API and calculate statistics manually
      let endpoint = `http://localhost:3001/api/attendance?startDate=${statsDateRange.start}&endDate=${statsDateRange.end}`;
      console.log(`Fetching attendance records for statistics from: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`);
      }
      
      const attendanceRecords = await response.json();
      console.log(`Received ${attendanceRecords.length} attendance records for statistics calculation`);
      
      if (!Array.isArray(attendanceRecords)) {
        throw new Error('Invalid response format - expected an array of attendance records');
      }
      
      // Calculate statistics manually from attendance records
      const stats = calculateStatistics(attendanceRecords);
      console.log('Calculated statistics:', stats);
      
      setStatistics(stats);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch attendance statistics:', err);
      toast.error('Could not load attendance statistics');
      setError('Failed to load attendance statistics. Please try again.');
      
      // Set default empty stats to prevent rendering errors
      setStatistics({
        totalVisits: 0,
        uniqueUsers: 0,
        averageDuration: 0,
        workoutTypes: {},
        peakHour: 0,
        hourDistribution: {},
        weekdayDistribution: {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0},
        completionStatusDistribution: {},
        intensityDistribution: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
        visitFrequencyByUser: {},
        returnRate: 0,
        dailyAverages: {},
        firstTimeVisits: 0,
        averageIntensity: 0,
        weeklyTrends: {}
      });
    } finally {
      setLoading(false);
    }
  }, [token, statsDateRange.start, statsDateRange.end]);
  
  // Helper function to calculate statistics from attendance records
  const calculateStatistics = (records: Attendance[]): AttendanceStatistics => {
    // Total visits is simply the number of records
    const totalVisits = records.length;
    
    // Count unique users
    const uniqueUserIds = new Set(records.map(record => 
      record.user_id || record.userId || (record.user ? record.user.id : 0)
    ));
    const uniqueUsers = uniqueUserIds.size;
    
    // Calculate average duration
    let totalDuration = 0;
    let recordsWithDuration = 0;
    
    // For intensity tracking
    let totalIntensity = 0;
    let recordsWithIntensity = 0;

    // For completion status tracking
    const completionStatusDistribution: Record<string, number> = {};
    
    // For intensity distribution
    const intensityDistribution: Record<number, number> = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    };
    
    // For first time visitors count
    let firstTimeVisits = 0;
    
    // For visit frequency by user
    const visitFrequencyByUser: Record<number, number> = {};
    
    // For weekday distribution
    const weekdayDistribution: Record<number, number> = {
      0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0
    };
    
    // For daily averages and weekly trends
    const dailyDurations: Record<string, number[]> = {};
    const weeklyVisits: Record<string, number> = {};
    
    records.forEach(record => {
      // Count user visit frequencies
      const userId = record.user_id || record.userId || (record.user ? record.user.id : 0);
      visitFrequencyByUser[userId] = (visitFrequencyByUser[userId] || 0) + 1;
      
      // Track first time visits
      if (record.isFirstVisit) {
        firstTimeVisits++;
      }
      
      // Track completion status
      if (record.completionStatus) {
        completionStatusDistribution[record.completionStatus] = 
          (completionStatusDistribution[record.completionStatus] || 0) + 1;
      }
      
      // Track workout intensity
      if (record.workoutIntensity) {
        totalIntensity += record.workoutIntensity;
        recordsWithIntensity++;
        intensityDistribution[record.workoutIntensity] = 
          (intensityDistribution[record.workoutIntensity] || 0) + 1;
      }
      
      // Track weekday distribution
      if (record.check_in || record.checkInTime) {
        const checkInDate = new Date(record.check_in || record.checkInTime || '');
        if (checkInDate && !isNaN(checkInDate.getTime())) {
          const weekday = checkInDate.getDay(); // 0 = Sunday, 6 = Saturday
          weekdayDistribution[weekday] = (weekdayDistribution[weekday] || 0) + 1;
          
          // Track daily averages
          const dateString = format(checkInDate, 'yyyy-MM-dd');
          
          // Track weekly trends - format as YYYY-WW (year and week number)
          const weekString = format(checkInDate, 'yyyy-') + 
            `W${Math.ceil((checkInDate.getDate() + (checkInDate.getDay() === 0 ? 6 : checkInDate.getDay() - 1)) / 7)}`;
          weeklyVisits[weekString] = (weeklyVisits[weekString] || 0) + 1;
          
          if ((record.check_out || record.checkOutTime) && 
              (record.actualDuration || 
               (record.check_in && record.check_out) || 
               (record.checkInTime && record.checkOutTime))) {
            
            // If we have actual duration, use it
            if (record.actualDuration) {
              if (!dailyDurations[dateString]) {
                dailyDurations[dateString] = [];
              }
              dailyDurations[dateString].push(record.actualDuration);
            } 
            // Otherwise calculate from check-in/out times
            else if ((record.check_in || record.checkInTime) && (record.check_out || record.checkOutTime)) {
              const checkIn = new Date(record.check_in || record.checkInTime || '');
              const checkOut = new Date(record.check_out || record.checkOutTime || '');
              
              if (checkIn && checkOut && !isNaN(checkIn.getTime()) && !isNaN(checkOut.getTime())) {
                const durationMinutes = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60);
                if (durationMinutes > 0 && durationMinutes < 480) { // Max 8 hours
                  if (!dailyDurations[dateString]) {
                    dailyDurations[dateString] = [];
                  }
                  dailyDurations[dateString].push(durationMinutes);
                }
              }
            }
          }
        }
      }
      
      // Calculate durations for average
      if ((record.check_in || record.checkInTime) && (record.check_out || record.checkOutTime)) {
        const checkIn = new Date(record.check_in || record.checkInTime || '');
        const checkOut = new Date(record.check_out || record.checkOutTime || '');
        
        if (checkIn && checkOut && !isNaN(checkIn.getTime()) && !isNaN(checkOut.getTime())) {
          const durationMinutes = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60);
          // Only count reasonable durations
          if (durationMinutes > 0 && durationMinutes < 480) { // Max 8 hours
            totalDuration += durationMinutes;
            recordsWithDuration++;
          }
        }
      } else if (record.actualDuration) {
        // Or use the actualDuration field if available
        totalDuration += record.actualDuration;
        recordsWithDuration++;
      } else if (record.plannedDuration) {
        // Fallback to plannedDuration if that's all we have
        totalDuration += record.plannedDuration;
        recordsWithDuration++;
      }
    });
    
    const averageDuration = recordsWithDuration > 0 ? totalDuration / recordsWithDuration : 0;
    const averageIntensity = recordsWithIntensity > 0 ? totalIntensity / recordsWithIntensity : 0;
    
    // Calculate return rate (users who visited more than once / total unique users)
    const returnVisitors = Object.values(visitFrequencyByUser).filter(count => count > 1).length;
    const returnRate = uniqueUsers > 0 ? (returnVisitors / uniqueUsers) * 100 : 0;
    
    // Process daily average durations
    const dailyAverages: Record<string, number> = {};
    Object.entries(dailyDurations).forEach(([date, durations]) => {
      if (durations.length > 0) {
        const sum = durations.reduce((acc, duration) => acc + duration, 0);
        dailyAverages[date] = sum / durations.length;
      }
    });
    
    // Count workout types
    const workoutTypes: Record<string, number> = {};
    records.forEach(record => {
      if (record.workoutType) {
        workoutTypes[record.workoutType] = (workoutTypes[record.workoutType] || 0) + 1;
      }
    });
    
    // Calculate hourly distribution and find peak hour
    const hourDistribution: Record<number, number> = {};
    records.forEach(record => {
      if (record.check_in || record.checkInTime) {
        const checkIn = new Date(record.check_in || record.checkInTime || '');
        if (checkIn && !isNaN(checkIn.getTime())) {
          const hour = checkIn.getHours();
          hourDistribution[hour] = (hourDistribution[hour] || 0) + 1;
        }
      }
    });
    
    // Find peak hour
    let peakHour = 0;
    let peakCount = 0;
    Object.entries(hourDistribution).forEach(([hour, count]) => {
      if (count > peakCount) {
        peakHour = parseInt(hour);
        peakCount = count;
      }
    });
    
    return {
      totalVisits,
      uniqueUsers,
      averageDuration,
      workoutTypes,
      peakHour,
      hourDistribution,
      weekdayDistribution,
      completionStatusDistribution,
      intensityDistribution,
      visitFrequencyByUser,
      returnRate,
      dailyAverages,
      firstTimeVisits,
      averageIntensity,
      weeklyTrends: weeklyVisits
    };
  };
  
  // Fetch current attendance
  const fetchCurrentAttendance = useCallback(async () => {
    if (!token) {
      setError('No authentication token available');
      return;
    }
    
    setLoading(true);
    try {
      // Use the same approach as fetchAttendanceRecords which works
      // Get today's attendance records and filter them
      const today = format(new Date(), 'yyyy-MM-dd');
      
      let endpoint = `http://localhost:3001/api/attendance?date=${today}`;
      console.log(`Fetching today's attendance from: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`);
      }
      
      const allTodayRecords = await response.json();
      console.log('All today attendance records:', allTodayRecords);
      
      if (!Array.isArray(allTodayRecords)) {
        throw new Error('Invalid response format - expected an array');
      }
      
      // Filter records with check-in but no check-out
      const currentRecords = allTodayRecords.filter(record => 
        (record.check_in || record.checkInTime) && !(record.check_out || record.checkOutTime)
      );
      
      console.log(`Found ${currentRecords.length} users currently in gym`);
      setCurrentUsers(currentRecords);
      
      if (currentRecords.length === 0) {
        toast.success('No users currently in the gym');
      }
      
    setError(null);
    } catch (err) {
      console.error('Failed to fetch current attendance:', err);
      toast.error('Could not load current attendance');
      setError('Failed to load current attendance. Please try again.');
      setCurrentUsers([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Handle checking in a student
  const handleCheckIn = async () => {
    if (!token || !selectedStudent) {
      toast.error('Please select a student');
      return;
    }
    
    // Validate input
    if (workoutType === '') {
      toast.error('Please select a workout type');
      return;
    }
    
    try {
      setLoading(true);
      const currentTime = new Date().toISOString();
      
      // Create attendance record data
      const attendanceData = {
        userId: selectedStudent,
        isPresent: true,
        notes: notes.trim(),
        checkInTime: currentTime,
        workoutType: workoutType,
        plannedDuration,
        isFirstVisit
      };
      
      // Direct API call
      const endpoint = `http://localhost:3001/api/attendance`;
      console.log(`Creating attendance record at: ${endpoint}`);
      console.log('With data:', attendanceData);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(attendanceData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`API returned status: ${response.status}`);
      }
      
      toast.success('Student checked in successfully');
      
      // Reset form fields
      setNotes('');
      setSelectedStudent(null);
      setWorkoutType('');
      setPlannedDuration(60);
      setIsFirstVisit(false);
      
      // Refresh attendance records
      if (activeTab === 'current') {
        fetchCurrentAttendance();
      } else {
        fetchAttendanceRecords();
      }
    } catch (err) {
      console.error('Failed to check in student:', err);
      toast.error('Could not check in student');
    } finally {
      setLoading(false);
    }
  };

  // Handle checking out a student
  const handleCheckOut = async (attendanceId: number) => {
    if (!token) return;
    
    setCheckoutData({
      ...checkoutData,
      attendanceId
    });
    
    // Open checkout modal
    document.getElementById('checkout-modal')?.classList.remove('hidden');
  };
  
  // Complete checkout with workout data
  const completeCheckout = async () => {
    if (!token || !checkoutData.attendanceId) return;
    
    if (checkoutData.completionStatus === '') {
      toast.error('Please select a completion status');
        return;
      }

    try {
      setLoading(true);
      
      // Create checkout data
      const updateData = {
        checkOutTime: new Date().toISOString(),
        completionStatus: checkoutData.completionStatus,
        staffObservations: checkoutData.staffObservations.trim(),
        workoutIntensity: checkoutData.workoutIntensity
      };
      
      // Direct API call
      const endpoint = `http://localhost:3001/api/attendance/${checkoutData.attendanceId}`;
      console.log(`Updating attendance record at: ${endpoint}`);
      console.log('With data:', updateData);
      
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`API returned status: ${response.status}`);
      }
      
      toast.success('Student checked out successfully');
      
      // Close the modal
      document.getElementById('checkout-modal')?.classList.add('hidden');
      
      // Reset checkout data
      setCheckoutData({
        attendanceId: null,
        completionStatus: '',
        staffObservations: '',
        workoutIntensity: 3
      });
      
      // Refresh attendance records
      if (activeTab === 'current') {
        fetchCurrentAttendance();
      } else {
        fetchAttendanceRecords();
      }
    } catch (err) {
      console.error('Failed to check out student:', err);
      toast.error('Could not check out student');
    } finally {
      setLoading(false);
    }
  };
  
  // Cancel checkout
  const cancelCheckout = () => {
    document.getElementById('checkout-modal')?.classList.add('hidden');
    setCheckoutData({
      attendanceId: null,
      completionStatus: '',
      staffObservations: '',
      workoutIntensity: 3
    });
  };

  // Handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttendanceDate(e.target.value);
  };

  // Filter students based on search query
  const filteredStudents = Array.isArray(students) 
    ? students.filter(student => {
        if (!student) return false;
        const name = student.name || '';
        const sinNumber = student.sin_number || '';
        return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               sinNumber.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : [];

  // Format date for display
  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Not checked in';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy hh:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Get student name by ID
  const getStudentName = (id: number) => {
    if (!Array.isArray(students)) return `User ID: ${id}`;
    const student = students.find(s => s && s.id === id);
    return student ? student.name : `User ID: ${id}`;
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-4 md:p-6">
      <GymNavigation />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Gym Attendance</h1>
          <p className="text-gray-600">Track user gym usage and manage attendance</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded relative mb-6 font-medium" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500">
          <li className="mr-2">
            <button
              className={`inline-flex items-center p-4 border-b-2 rounded-t-lg ${
                activeTab === 'checkin'
                  ? 'text-blue-600 border-blue-600 active'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('checkin')}
            >
              Check In/Out
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-flex items-center p-4 border-b-2 rounded-t-lg ${
                activeTab === 'current'
                  ? 'text-blue-600 border-blue-600 active'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={() => {
                setActiveTab('current');
                fetchCurrentAttendance();
              }}
            >
              Currently In Gym
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-flex items-center p-4 border-b-2 rounded-t-lg ${
                activeTab === 'history'
                  ? 'text-blue-600 border-blue-600 active'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('history')}
            >
              Attendance History
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-flex items-center p-4 border-b-2 rounded-t-lg ${
                activeTab === 'stats'
                  ? 'text-blue-600 border-blue-600 active'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={() => {
                setActiveTab('stats');
                fetchStatistics();
              }}
            >
              Analytics
            </button>
          </li>
        </ul>
          </div>

      {/* Check In Form */}
      {activeTab === 'checkin' && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Check In User</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="studentSearch" className="block text-sm font-medium text-gray-700 mb-1">
                Search User
              </label>
              <input
                type="text"
                id="studentSearch"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Search by name or ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="studentSelect" className="block text-sm font-medium text-gray-700 mb-1">
                Select User
              </label>
              <select
                id="studentSelect"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                value={selectedStudent || ''}
                onChange={(e) => setSelectedStudent(Number(e.target.value))}
              >
                <option value="" className="text-gray-500">-- Select a user --</option>
                {Array.isArray(filteredStudents) && filteredStudents.map((student) => (
                  <option 
                    key={student.id} 
                    value={student.id}
                    className="text-gray-900"
                  >
                    {student.name} {student.sin_number ? `(${student.sin_number})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="workoutType" className="block text-sm font-medium text-gray-700 mb-1">
                Workout Type
              </label>
              <select
                id="workoutType"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                value={workoutType}
                onChange={(e) => setWorkoutType(e.target.value as WorkoutType | '')}
              >
                <option value="" className="text-gray-500">-- Select workout type --</option>
                {Object.entries(WorkoutType).map(([key, value]) => (
                  <option key={value} value={value} className="text-gray-900">
                    {key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="plannedDuration" className="block text-sm font-medium text-gray-700 mb-1">
                Planned Duration (minutes)
              </label>
              <input
                type="number"
                id="plannedDuration"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                min="5"
                max="240"
                value={plannedDuration}
                onChange={(e) => setPlannedDuration(parseInt(e.target.value, 10) || 30)}
              />
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isFirstVisit"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={isFirstVisit}
                onChange={(e) => setIsFirstVisit(e.target.checked)}
              />
              <label htmlFor="isFirstVisit" className="ml-2 block text-sm text-gray-700">
                This is the user's first visit (provides orientation)
              </label>
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              rows={3}
              placeholder="Add any notes about this attendance"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>
          
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            onClick={handleCheckIn}
            disabled={!selectedStudent || loading || workoutType === ''}
          >
            {loading ? 'Processing...' : 'Check In User'}
          </button>
        </div>
      )}

      {/* Attendance History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <h2 className="text-xl font-semibold mb-2 md:mb-0">Attendance History</h2>
            
            <div className="flex items-center">
              <label htmlFor="dateFilter" className="mr-2 text-sm font-medium text-gray-700">
                Date:
              </label>
            <input
              type="date"
                id="dateFilter"
                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                value={attendanceDate}
                onChange={handleDateChange}
              />
              <button
                className="ml-2 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => {
                  fetchAttendanceRecords().then(() => {
                    fetchStudents();
                  });
                }}
              >
                Filter
              </button>
          </div>
        </div>

          {loading ? (
            <LoadingSpinner />
          ) : attendanceRecords.length === 0 ? (
            <div className="text-center py-10 text-gray-800 font-medium">
              No attendance records found for this date
            </div>
          ) : (
        <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check In Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check Out Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Workout Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
              </tr>
            </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendanceRecords.map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {record.user ? record.user.name : getStudentName(record.user_id || record.userId || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(record.check_in || record.checkInTime || '')}
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(record.check_out || record.checkOutTime) 
                          ? formatDateTime(record.check_out || record.checkOutTime || '') 
                          : 'Not checked out'}
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.workoutType 
                          ? record.workoutType.charAt(0).toUpperCase() + record.workoutType.slice(1)
                          : 'Not specified'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.actualDuration 
                          ? `${record.actualDuration} min (actual)`
                          : record.plannedDuration 
                            ? `${record.plannedDuration} min (planned)`
                            : 'Not specified'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.is_present || record.isPresent
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {record.completionStatus 
                            ? record.completionStatus.replace('_', ' ').charAt(0).toUpperCase() + record.completionStatus.replace('_', ' ').slice(1)
                            : (record.is_present || record.isPresent) ? 'Present' : 'Absent'}
                      </span>
                    </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {record.notes || 
                         (record.staffObservations 
                          ? `Staff notes: ${record.staffObservations}`
                          : 'No notes')}
                  </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {!(record.check_out || record.checkOutTime) && (
                          <button
                            className="text-indigo-600 hover:text-indigo-900"
                            onClick={() => handleCheckOut(record.id)}
                          >
                            Check Out
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
          )}
      </div>
      )}

      {/* Checkout Modal */}
      <div id="checkout-modal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Check Out User</h2>
            <button 
              onClick={cancelCheckout}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="completionStatus" className="block text-sm font-medium text-gray-700 mb-1">
                Workout Completion Status
              </label>
              <select
                id="completionStatus"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                value={checkoutData.completionStatus}
                onChange={(e) => setCheckoutData({
                  ...checkoutData,
                  completionStatus: e.target.value as WorkoutCompletionStatus | ''
                })}
              >
                <option value="" className="text-gray-500">-- Select status --</option>
                {Object.entries(WorkoutCompletionStatus).map(([key, value]) => (
                  <option key={value} value={value} className="text-gray-900">
                    {key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="workoutIntensity" className="block text-sm font-medium text-gray-700 mb-1">
                Workout Intensity (1-5)
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 text-sm">Low</span>
                <input
                  type="range"
                  id="workoutIntensity"
                  className="w-full"
                  min="1"
                  max="5"
                  value={checkoutData.workoutIntensity}
                  onChange={(e) => setCheckoutData({
                    ...checkoutData,
                    workoutIntensity: parseInt(e.target.value, 10)
                  })}
                />
                <span className="text-gray-500 text-sm">High</span>
              </div>
              <div className="flex justify-between px-2 text-sm text-gray-500">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
            </div>
            
            <div>
              <label htmlFor="staffObservations" className="block text-sm font-medium text-gray-700 mb-1">
                Staff Observations (Optional)
              </label>
              <textarea
                id="staffObservations"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                rows={3}
                placeholder="Enter any observations about the user's workout"
                value={checkoutData.staffObservations}
                onChange={(e) => setCheckoutData({
                  ...checkoutData,
                  staffObservations: e.target.value
                })}
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={cancelCheckout}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={completeCheckout}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                disabled={loading || checkoutData.completionStatus === ''}
              >
                {loading ? 'Processing...' : 'Complete Checkout'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Current In Gym Tab */}
      {activeTab === 'current' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Currently In Gym</h2>
            <button
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm"
              onClick={fetchCurrentAttendance}
            >
              Refresh
            </button>
          </div>
          
          {loading ? (
            <LoadingSpinner />
          ) : currentUsers.length === 0 ? (
            <div className="text-center py-10 text-gray-800 font-medium">
              No users currently in the gym
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentUsers.map((record) => (
                <div key={record.id} className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {record.user ? record.user.name : getStudentName(record.user_id || record.userId || 0)}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Checked in: {formatDateTime(record.check_in || record.checkInTime || '')}
                      </p>
                    </div>
                    <button
                      className="px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      onClick={() => handleCheckOut(record.id)}
                    >
                      Check Out
                    </button>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-blue-200 text-sm space-y-1">
                    <p>
                      <span className="font-medium text-gray-700">Workout: </span>
                      {record.workoutType 
                        ? record.workoutType.charAt(0).toUpperCase() + record.workoutType.slice(1)
                        : 'Not specified'}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Duration: </span>
                      {record.plannedDuration ? `${record.plannedDuration} min (planned)` : 'Not specified'}
                    </p>
                    {record.isFirstVisit && (
                      <p className="text-amber-600 font-medium">First-time visitor</p>
                    )}
                    {record.notes && (
                      <p>
                        <span className="font-medium text-gray-700">Notes: </span>
                        {record.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Statistics Tab */}
      {activeTab === 'stats' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-xl font-semibold mb-2 md:mb-0">Attendance Analytics</h2>
            
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3">
              <div className="flex items-center">
                <label className="mr-2 text-sm font-medium text-gray-700">From:</label>
                <input
                  type="date"
                  className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  value={statsDateRange.start}
                  onChange={(e) => setStatsDateRange({...statsDateRange, start: e.target.value})}
                />
              </div>
              <div className="flex items-center">
                <label className="mr-2 text-sm font-medium text-gray-700">To:</label>
                <input
                  type="date"
                  className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  value={statsDateRange.end}
                  onChange={(e) => setStatsDateRange({...statsDateRange, end: e.target.value})}
                />
              </div>
              <button
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm"
                onClick={fetchStatistics}
              >
                Update
              </button>
            </div>
          </div>
          
          {loading ? (
            <LoadingSpinner />
          ) : !statistics ? (
            <div className="text-center py-10 text-gray-800 font-medium">
              No statistics available. Please update the date range and try again.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Key Metrics Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <h3 className="text-sm font-medium text-blue-700">Total Visits</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{statistics.totalVisits}</p>
                  <p className="text-xs text-gray-800 mt-1">During selected date range</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <h3 className="text-sm font-medium text-green-700">Unique Users</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{statistics.uniqueUsers}</p>
                  <p className="text-xs text-gray-800 mt-1">Different people used the gym</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                  <h3 className="text-sm font-medium text-purple-700">Average Workout Duration</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{Math.round(statistics.averageDuration)} min</p>
                  <p className="text-xs text-gray-800 mt-1">Time spent per workout</p>
                </div>
              </div>

              {/* Second Row of Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                  <h3 className="text-sm font-medium text-amber-700">First-Time Visits</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{statistics.firstTimeVisits}</p>
                  <p className="text-xs text-gray-800 mt-1">New gym users</p>
                </div>
                <div className="bg-rose-50 rounded-lg p-4 border border-rose-100">
                  <h3 className="text-sm font-medium text-rose-700">Return Rate</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{statistics.returnRate.toFixed(1)}%</p>
                  <p className="text-xs text-gray-800 mt-1">Users who came back</p>
                </div>
                <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-100">
                  <h3 className="text-sm font-medium text-cyan-700">Avg Workout Intensity</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{statistics.averageIntensity.toFixed(1)}</p>
                  <p className="text-xs text-gray-800 mt-1">Scale of 1-5</p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                  <h3 className="text-sm font-medium text-indigo-700">Most Active Day</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {getMostActiveDayName(statistics.weekdayDistribution)}
                  </p>
                  <p className="text-xs text-gray-800 mt-1">Highest attendance</p>
                </div>
              </div>
              
              {/* Workout Type Distribution */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Workout Type Distribution</h3>
                <div className="space-y-2">
                  {Object.entries(statistics.workoutTypes).map(([type, count]) => (
                    <div key={type} className="flex items-center">
                      <div className="w-32 text-sm font-medium text-gray-800">
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </div>
                      <div className="flex-1 h-5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600" 
                          style={{ width: `${(count / statistics.totalVisits) * 100}%` }}
                        ></div>
                      </div>
                      <div className="w-16 text-right text-sm text-gray-800">
                        {((count / statistics.totalVisits) * 100).toFixed(1)}%
                      </div>
                      <div className="w-12 text-right text-sm font-medium text-gray-800">
                        {count}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Workout Intensity Distribution */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Workout Intensity Distribution</h3>
                <div className="flex items-end space-x-2 h-40 mt-4 px-2">
                  {Object.entries(statistics.intensityDistribution).map(([intensity, count]) => {
                    const totalIntensityRecords = Object.values(statistics.intensityDistribution).reduce((a, b) => a + b, 0);
                    const percentage = totalIntensityRecords > 0 ? (count / totalIntensityRecords) * 100 : 0;
                    const heightPercentage = percentage > 0 ? Math.max(10, percentage) : 0; // Min 10% height for visibility
                    
                    return (
                      <div key={intensity} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-orange-500 rounded-t-sm" 
                          style={{ height: `${heightPercentage}%` }}
                        ></div>
                        <div className="mt-2 text-sm font-medium text-gray-800">{intensity}</div>
                        <div className="text-xs text-gray-800">{percentage.toFixed(0)}%</div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-4 text-sm text-gray-800 px-2">
                  <span>Very Light</span>
                  <span>Medium</span>
                  <span>Very Intense</span>
                </div>
              </div>
              
              {/* Weekly Trends */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Weekly Attendance Trends</h3>
                <div className="h-40 flex items-end space-x-2">
                  {Object.entries(statistics.weeklyTrends)
                    .sort()
                    .slice(-8) // Show only the last 8 weeks
                    .map(([weekStr, count]) => {
                      const allValues = Object.values(statistics.weeklyTrends);
                      const maxValue = Math.max(...allValues as number[]);
                      const heightPercent = maxValue > 0 ? (count / maxValue) * 100 : 0;
                      const weekNum = weekStr.split('-W')[1];
                      
                      return (
                        <div key={weekStr} className="flex-1 flex flex-col items-center">
                          <div 
                            className="w-full bg-indigo-500 rounded-t-sm" 
                            style={{ height: `${heightPercent}%` }}
                          ></div>
                          <div className="mt-2 text-xs text-gray-800">Week {weekNum}</div>
                          <div className="text-xs font-medium text-gray-800">{count}</div>
                        </div>
                      );
                    })}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Completion Status Distribution */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Workout Completion</h3>
                  <div className="space-y-2">
                    {Object.entries(statistics.completionStatusDistribution).map(([status, count]) => {
                      const totalCompletions = Object.values(statistics.completionStatusDistribution).reduce((a, b) => a + b, 0);
                      const percentage = totalCompletions > 0 ? (count / totalCompletions) * 100 : 0;
                      
                      // Determine color based on status
                      let colorClass = "bg-blue-500";
                      if (status.includes('completed')) colorClass = "bg-green-500";
                      if (status.includes('partial')) colorClass = "bg-yellow-500";
                      if (status.includes('abandoned')) colorClass = "bg-red-500";
                      
                      const statusLabel = status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1);
                      
                      return (
                        <div key={status} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-800">{statusLabel}</span>
                            <span className="text-gray-800">{percentage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${colorClass}`} 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Weekday Distribution */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Weekday Distribution</h3>
                  <div className="h-40 flex items-end space-x-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
                      const count = statistics.weekdayDistribution[index] || 0;
                      const totalWeekdayVisits = Object.values(statistics.weekdayDistribution).reduce((a, b) => a + b, 0);
                      const percentage = totalWeekdayVisits > 0 ? (count / totalWeekdayVisits) * 100 : 0;
                      const heightPercent = percentage > 0 ? Math.max(5, percentage) : 0; // Min 5% height for visibility
                      
                      return (
                        <div key={day} className="flex-1 flex flex-col items-center">
                          <div 
                            className={`w-full rounded-t-sm ${
                              index === 0 || index === 6 ? 'bg-blue-300' : 'bg-blue-600'
                            }`}
                            style={{ height: `${heightPercent}%` }}
                          ></div>
                          <div className="mt-2 text-xs font-medium text-gray-800">{day}</div>
                          <div className="text-xs text-gray-800">{percentage.toFixed(0)}%</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* Peak Hour */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Peak Hours</h3>
                <p className="font-medium text-gray-800 mb-2">
                  Most popular time: {statistics.peakHour}:00 - {statistics.peakHour + 1}:00
                </p>
                <div className="h-40 flex items-end space-x-1">
                  {Array.from({length: 24}, (_, i) => i).map((hour) => {
                    const count = statistics.hourDistribution[hour] || 0;
                    const maxCount = Math.max(...Object.values(statistics.hourDistribution).map(v => v as number));
                    const heightPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    
                    return (
                      <div key={hour} className="flex-1 flex flex-col items-center">
                        <div 
                          className={`w-full ${
                            hour === statistics.peakHour 
                              ? 'bg-blue-600' 
                              : 'bg-blue-300'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        ></div>
                        <div className="text-xs text-gray-800 mt-1">{hour}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
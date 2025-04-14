'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { attendanceApi, userApi } from '@/services/api';
import { User, Attendance, Role } from '@/types';
import GymNavigation from '@/components/GymNavigation';
import { format, parseISO } from 'date-fns';
import { hasPermission } from '@/utils/rbac';

// Helper component for loading state
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

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
  const [activeTab, setActiveTab] = useState<'checkin' | 'history'>('checkin');
  const [error, setError] = useState<string | null>(null);

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
      
      // User has correct role, load data
      // First load attendance data, then try to fetch students
      fetchAttendanceRecords().then(() => {
        fetchStudents();
      });
    }
  }, [user, router, token]);

  // Fetch attendance records
  const fetchAttendanceRecords = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const filters = {
        date: attendanceDate,
      };
      
      console.log('Fetching attendance records with filters:', filters);
      const data = await attendanceApi.getAll(token, filters);
      console.log('Received attendance records:', data);
      setAttendanceRecords(data);
      return data; // Return data for potential use in fetchStudents
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

  // Handle checking in a student
  const handleCheckIn = async () => {
    if (!token || !selectedStudent) {
      toast.error('Please select a student');
      return;
    }
    
    try {
      setLoading(true);
      const currentTime = new Date().toISOString();
      await attendanceApi.create({
        userId: selectedStudent,
        isPresent: true,
        notes: notes.trim(),
        checkInTime: currentTime
      }, token);
      
      toast.success('Student checked in successfully');
      setNotes('');
      setSelectedStudent(null);
      
      // Refresh attendance records
      fetchAttendanceRecords();
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
    
    try {
      setLoading(true);
      await attendanceApi.update(attendanceId, {
        checkOutTime: new Date().toISOString(),
      }, token);
      
      toast.success('Student checked out successfully');
      
      // Refresh attendance records
      fetchAttendanceRecords();
    } catch (err) {
      console.error('Failed to check out student:', err);
      toast.error('Could not check out student');
    } finally {
      setLoading(false);
    }
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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
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
                activeTab === 'history'
                  ? 'text-blue-600 border-blue-600 active'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('history')}
            >
              Attendance History
            </button>
          </li>
        </ul>
      </div>

      {/* Check In Form */}
      {activeTab === 'checkin' && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Check In User</h2>
          
          <div className="mb-4">
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
          
          <div className="mb-4">
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
            disabled={!selectedStudent || loading}
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
                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
            <div className="text-center py-10 text-gray-500">
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.is_present || record.isPresent
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {record.is_present || record.isPresent ? 'Present' : 'Absent'}
                      </span>
                    </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {record.notes || 'No notes'}
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
    </div>
  );
}
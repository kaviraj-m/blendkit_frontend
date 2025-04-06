'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { attendanceApi } from '@/services/api';
import { Attendance } from '@/types';
import { hasPermission } from '@/utils/rbac';
import GymNavigation from '@/components/GymNavigation';

export default function GymAttendancePage() {
  const { user, token } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkInStatus, setCheckInStatus] = useState<string | null>(null);
  
  // Determine user permissions
  const canViewAllAttendance = user && hasPermission(user.role, 'view_attendance');
  const canManageAttendance = user && hasPermission(user.role, 'manage_attendance');
  const canViewOwnAttendance = user && hasPermission(user.role, 'view_own_attendance');

  useEffect(() => {
    if (token) {
      fetchAttendanceRecords();
    }
  }, [token, selectedDate]);

  const fetchAttendanceRecords = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!token) return;

      // Different fetch logic based on user role
      let filters = {};
      
      if (!canViewAllAttendance && canViewOwnAttendance && user) {
        // Students can only see their own records
        filters = { userId: user.id };
      }
      
      if (selectedDate) {
        filters = { ...filters, date: selectedDate };
      }

      const data = await attendanceApi.getAll(token, filters);
      setAttendanceRecords(data);
      
      // Check if user is already checked in today
      if (canViewOwnAttendance && user) {
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = data.find(record => {
          const recordDate = new Date(record.check_in).toISOString().split('T')[0];
          return recordDate === today && record.user_id === user.id;
        });
        
        if (todayRecord) {
          setCheckInStatus(todayRecord.check_out ? 'checked-out' : 'checked-in');
        } else {
          setCheckInStatus(null);
        }
      }
    } catch (err) {
      setError('Failed to load attendance records');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!token || !user) return;

      const checkInData = {
        user_id: user.id,
        check_in: new Date().toISOString(),
        is_present: true
      };

      await attendanceApi.checkIn(checkInData, token);
      setCheckInStatus('checked-in');
      await fetchAttendanceRecords();
    } catch (err) {
      setError('Failed to check in');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!token || !user) return;

      // Find the current check-in record
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = attendanceRecords.find(record => {
        const recordDate = new Date(record.check_in).toISOString().split('T')[0];
        return recordDate === today && record.user_id === user.id && !record.check_out;
      });

      if (!todayRecord) {
        setError('No active check-in found');
        setIsLoading(false);
        return;
      }

      await attendanceApi.checkOut(todayRecord.id, token);
      setCheckInStatus('checked-out');
      await fetchAttendanceRecords();
    } catch (err) {
      setError('Failed to check out');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDateTime = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleString('en-US', options);
  };

  // Calculate duration between check-in and check-out
  const calculateDuration = (checkIn: string, checkOut?: string) => {
    if (!checkOut) return 'Active';
    
    const checkInTime = new Date(checkIn);
    const checkOutTime = new Date(checkOut);
    const diffMs = checkOutTime.getTime() - checkInTime.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs}h ${diffMins}m`;
  };

  if (isLoading && attendanceRecords.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <GymNavigation />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Gym Attendance</h1>
          <p className="text-gray-600">
            {canViewAllAttendance 
              ? "Track and manage student attendance records" 
              : "Record your gym attendance and view history"}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Check-in/out section for students */}
      {canViewOwnAttendance && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Today's Attendance</h2>
          <div className="flex space-x-4">
            <button
              onClick={handleCheckIn}
              disabled={checkInStatus === 'checked-in' || checkInStatus === 'checked-out'}
              className={`px-4 py-2 rounded-md ${checkInStatus === 'checked-in' || checkInStatus === 'checked-out' ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
            >
              Check In
            </button>
            <button
              onClick={handleCheckOut}
              disabled={checkInStatus !== 'checked-in'}
              className={`px-4 py-2 rounded-md ${checkInStatus !== 'checked-in' ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'}`}
            >
              Check Out
            </button>
          </div>
        </div>
      )}

      {/* Date filter */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Attendance Records</h2>
          <div className="flex items-center space-x-2">
            <label htmlFor="date-filter" className="text-gray-700">Filter by date:</label>
            <input
              id="date-filter"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Attendance records table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-50 border-b">
                {canViewAllAttendance && <th className="py-2 px-4 text-left text-gray-700">User</th>}
                <th className="py-2 px-4 text-left text-gray-700">Check-in Time</th>
                <th className="py-2 px-4 text-left text-gray-700">Check-out Time</th>
                <th className="py-2 px-4 text-left text-gray-700">Duration</th>
                <th className="py-2 px-4 text-left text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.length > 0 ? (
                attendanceRecords.map((record) => (
                  <tr key={record.id} className="border-b hover:bg-gray-50">
                    {canViewAllAttendance && (
                      <td className="py-3 px-4 text-gray-800 font-medium">
                        {record.user?.name || `User ID: ${record.user_id}`}
                      </td>
                    )}
                    <td className="py-3 px-4 text-gray-800">{formatDateTime(record.check_in)}</td>
                    <td className="py-3 px-4 text-gray-800">
                      {record.check_out ? formatDateTime(record.check_out) : 'Not checked out'}
                    </td>
                    <td className="py-3 px-4 text-gray-800">
                      {calculateDuration(record.check_in, record.check_out)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${record.is_present ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {record.is_present ? 'Present' : 'Absent'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={canViewAllAttendance ? 5 : 4} className="py-4 text-center text-gray-500">
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { FaCalendarCheck, FaUserCheck, FaUserTimes } from 'react-icons/fa';
import { useAuth } from '../../../contexts/AuthContext';

const GymAttendance = () => {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkInStatus, setCheckInStatus] = useState(null);
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Sample attendance data - in a real app, this would come from an API
  useEffect(() => {
    // Simulate API call
    setIsLoading(true);
    setTimeout(() => {
      const sampleData = [
        {
          id: 1,
          userId: 2, // student user id
          userName: 'Student User',
          checkInTime: '2023-05-15T08:30:00Z',
          checkOutTime: '2023-05-15T09:45:00Z',
          isPresent: true,
          notes: 'Regular workout session'
        },
        {
          id: 2,
          userId: 2,
          userName: 'Student User',
          checkInTime: '2023-05-14T16:15:00Z',
          checkOutTime: '2023-05-14T17:30:00Z',
          isPresent: true,
          notes: 'Evening workout'
        },
        {
          id: 3,
          userId: 3, // gym staff id
          userName: 'Gym Staff',
          checkInTime: '2023-05-15T07:00:00Z',
          checkOutTime: '2023-05-15T15:00:00Z',
          isPresent: true,
          notes: 'Staff duty'
        }
      ];
      
      // Filter records based on user role
      let filteredRecords;
      if (user?.role?.name === 'gym_staff') {
        // Gym staff can see all records
        filteredRecords = sampleData;
      } else {
        // Students can only see their own records
        filteredRecords = sampleData.filter(record => record.userId === user?.id);
      }
      
      setAttendanceRecords(filteredRecords);
      setIsLoading(false);
      
      // Check if user is already checked in today
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = filteredRecords.find(record => {
        const recordDate = new Date(record.checkInTime).toISOString().split('T')[0];
        return recordDate === today && record.userId === user?.id;
      });
      
      setCheckInStatus(todayRecord ? 'checked-in' : null);
    }, 1000);
  }, [user]);

  // Handle check-in/check-out
  const handleAttendance = (action) => {
    if (action === 'check-in') {
      // In a real app, this would be an API call to create an attendance record
      const newRecord = {
        id: attendanceRecords.length + 1,
        userId: user?.id,
        userName: user?.name,
        checkInTime: new Date().toISOString(),
        isPresent: true,
        notes: 'Self check-in'
      };
      
      setAttendanceRecords([newRecord, ...attendanceRecords]);
      setCheckInStatus('checked-in');
    } else if (action === 'check-out') {
      // In a real app, this would be an API call to update the attendance record
      const updatedRecords = attendanceRecords.map(record => {
        if (record.userId === user?.id && !record.checkOutTime) {
          return { ...record, checkOutTime: new Date().toISOString() };
        }
        return record;
      });
      
      setAttendanceRecords(updatedRecords);
      setCheckInStatus('checked-out');
    }
  };

  // Filter records by date
  const filteredByDate = selectedDate 
    ? attendanceRecords.filter(record => {
        const recordDate = new Date(record.checkInTime).toISOString().split('T')[0];
        return recordDate === selectedDate;
      })
    : attendanceRecords;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Gym Attendance</h1>
        <p className="text-gray-600">Track your gym visits and check-in/out times</p>
      </div>
      
      {/* Check-in/out section for students */}
      {user?.role?.name === 'student' && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center mb-4">
            <FaUserCheck className="text-indigo-600 mr-2 text-xl" />
            <h2 className="text-xl font-semibold text-gray-800">Today's Attendance</h2>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={() => handleAttendance('check-in')}
              disabled={checkInStatus === 'checked-in' || checkInStatus === 'checked-out'}
              className={`px-4 py-2 rounded-md flex items-center ${checkInStatus === 'checked-in' || checkInStatus === 'checked-out' ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white'}`}
            >
              <FaUserCheck className="mr-2" />
              Check In
            </button>
            
            <button
              onClick={() => handleAttendance('check-out')}
              disabled={checkInStatus !== 'checked-in'}
              className={`px-4 py-2 rounded-md flex items-center ${checkInStatus !== 'checked-in' ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 text-white'}`}
            >
              <FaUserTimes className="mr-2" />
              Check Out
            </button>
          </div>
        </div>
      )}
      
      {/* Date filter */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FaCalendarCheck className="text-indigo-600 mr-2 text-xl" />
            <h2 className="text-xl font-semibold text-gray-800">Attendance Records</h2>
          </div>
          
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
        
        {isLoading ? (
          <div className="text-center py-4">Loading attendance records...</div>
        ) : filteredByDate.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="py-2 px-4 text-left text-gray-700">User</th>
                  <th className="py-2 px-4 text-left text-gray-700">Check-in Time</th>
                  <th className="py-2 px-4 text-left text-gray-700">Check-out Time</th>
                  <th className="py-2 px-4 text-left text-gray-700">Duration</th>
                  <th className="py-2 px-4 text-left text-gray-700">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredByDate.map(record => {
                  // Calculate duration if check-out time exists
                  let duration = 'N/A';
                  if (record.checkOutTime) {
                    const checkIn = new Date(record.checkInTime);
                    const checkOut = new Date(record.checkOutTime);
                    const diffMs = checkOut - checkIn;
                    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                    duration = `${diffHrs}h ${diffMins}m`;
                  }
                  
                  return (
                    <tr key={record.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-800 font-medium">{record.userName}</td>
                      <td className="py-3 px-4 text-gray-600">{formatDate(record.checkInTime)}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {record.checkOutTime ? formatDate(record.checkOutTime) : 'Not checked out'}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{duration}</td>
                      <td className="py-3 px-4 text-gray-600">{record.notes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">No attendance records found for this date.</div>
        )}
      </div>
    </div>
  );
};

export default GymAttendance;
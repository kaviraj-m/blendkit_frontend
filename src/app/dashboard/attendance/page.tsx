'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function AttendancePage() {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 bg-gradient-to-r from-amber-600 to-amber-800 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Attendance Management</h1>
        <p className="text-amber-100">
          Track student and staff attendance records
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Coming Soon</h2>
        <p className="text-gray-600">
          The Attendance Management module is currently under development. This module will allow you to:
        </p>
        <ul className="list-disc pl-5 mt-2 text-gray-600">
          <li>Record daily attendance for students and staff</li>
          <li>Generate attendance reports by class, department, or date range</li>
          <li>Track attendance patterns and identify issues</li>
          <li>Send automated notifications for absences</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Today's Attendance</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Present</p>
              <p className="text-2xl font-bold text-green-600">0</p>
            </div>
            <div>
              <p className="text-gray-500">Absent</p>
              <p className="text-2xl font-bold text-red-600">0</p>
            </div>
            <div>
              <p className="text-gray-500">Leave</p>
              <p className="text-2xl font-bold text-amber-600">0</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Monthly Overview</h3>
          <p className="text-gray-500 italic">No data available</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Quick Actions</h3>
          <div className="flex flex-col space-y-2">
            <button disabled className="bg-amber-500 text-white py-2 px-4 rounded opacity-50 cursor-not-allowed">
              Mark Attendance
            </button>
            <button disabled className="bg-amber-500 text-white py-2 px-4 rounded opacity-50 cursor-not-allowed">
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
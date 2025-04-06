'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function FrontOfficePage() {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Front Office</h1>
        <p className="text-purple-100">
          Manage inquiries, admissions, and visitors
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Coming Soon</h2>
        <p className="text-gray-600">
          The Front Office module is currently under development. This module will allow you to manage:
        </p>
        <ul className="list-disc pl-5 mt-2 text-gray-600">
          <li>Student inquiries and applications</li>
          <li>Admission processes and documentation</li>
          <li>Visitor management and appointments</li>
          <li>Communication logs and follow-ups</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Inquiries</h3>
          <p className="text-gray-500 italic">No data available</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Today's Appointments</h3>
          <p className="text-gray-500 italic">No data available</p>
        </div>
      </div>
    </div>
  );
}
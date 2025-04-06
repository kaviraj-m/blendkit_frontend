'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function GatePassPage() {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Gate Pass Management</h1>
        <p className="text-indigo-100">
          Manage entry and exit permissions
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Coming Soon</h2>
        <p className="text-gray-600">
          The Gate Pass Management module is currently under development. This module will allow you to:
        </p>
        <ul className="list-disc pl-5 mt-2 text-gray-600">
          <li>Issue gate passes for students and visitors</li>
          <li>Track entry and exit times</li>
          <li>Manage permissions for early departures or late entries</li>
          <li>Generate reports on campus access patterns</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Today's Passes</h3>
          <div className="text-3xl font-bold text-indigo-600">0</div>
          <p className="text-gray-500 italic">No passes issued today</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Active Visitors</h3>
          <div className="text-3xl font-bold text-indigo-600">0</div>
          <p className="text-gray-500 italic">No active visitors</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Quick Actions</h3>
          <div className="flex flex-col space-y-2">
            <button disabled className="bg-indigo-500 text-white py-2 px-4 rounded opacity-50 cursor-not-allowed">
              Issue New Pass
            </button>
            <button disabled className="bg-indigo-500 text-white py-2 px-4 rounded opacity-50 cursor-not-allowed">
              Scan QR Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
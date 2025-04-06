'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function BiometricPage() {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 bg-gradient-to-r from-rose-600 to-rose-800 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Biometric Management</h1>
        <p className="text-rose-100">
          Manage biometric attendance and access control
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Coming Soon</h2>
        <p className="text-gray-600">
          The Biometric Management module is currently under development. This module will allow you to:
        </p>
        <ul className="list-disc pl-5 mt-2 text-gray-600">
          <li>Register and manage biometric data for students and staff</li>
          <li>Track attendance using fingerprint or facial recognition</li>
          <li>Control access to restricted areas</li>
          <li>Generate automated attendance reports</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Registered Users</h3>
          <div className="text-3xl font-bold text-rose-600">0</div>
          <p className="text-gray-500 italic">No users registered</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Today's Scans</h3>
          <div className="text-3xl font-bold text-rose-600">0</div>
          <p className="text-gray-500 italic">No biometric scans today</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Device Status</h3>
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-gray-400 mr-2"></div>
            <span className="text-gray-600">Offline</span>
          </div>
          <p className="text-gray-500 mt-2 italic">No devices connected</p>
        </div>
      </div>
    </div>
  );
}
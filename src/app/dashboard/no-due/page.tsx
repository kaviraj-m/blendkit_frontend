'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function NoDuePage() {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 bg-gradient-to-r from-green-600 to-green-800 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">No Due Certificate</h1>
        <p className="text-green-100">
          Manage and verify student clearance certificates
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Coming Soon</h2>
        <p className="text-gray-600">
          The No Due Certificate module is currently under development. This module will allow you to:
        </p>
        <ul className="list-disc pl-5 mt-2 text-gray-600">
          <li>Generate no-due certificates for students</li>
          <li>Track pending clearances across departments</li>
          <li>Approve or reject clearance requests</li>
          <li>Maintain digital records of all certificates</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Pending Requests</h3>
          <div className="text-3xl font-bold text-amber-600">0</div>
          <p className="text-gray-500 italic">No pending requests</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Approved Certificates</h3>
          <div className="text-3xl font-bold text-green-600">0</div>
          <p className="text-gray-500 italic">No certificates issued</p>
        </div>
      </div>
    </div>
  );
}
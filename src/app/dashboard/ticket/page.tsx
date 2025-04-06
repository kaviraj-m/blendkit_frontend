'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function TicketPage() {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Ticket Management</h1>
        <p className="text-blue-100">
          Track and resolve support tickets and requests
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Coming Soon</h2>
        <p className="text-gray-600">
          The Ticket Management module is currently under development. This module will allow you to:
        </p>
        <ul className="list-disc pl-5 mt-2 text-gray-600">
          <li>Create and assign support tickets</li>
          <li>Track ticket status and resolution time</li>
          <li>Categorize and prioritize requests</li>
          <li>Generate ticket reports and analytics</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Open Tickets</h3>
          <div className="text-3xl font-bold text-blue-600">0</div>
          <p className="text-gray-500 italic">No data available</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">In Progress</h3>
          <div className="text-3xl font-bold text-amber-600">0</div>
          <p className="text-gray-500 italic">No data available</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Resolved</h3>
          <div className="text-3xl font-bold text-green-600">0</div>
          <p className="text-gray-500 italic">No data available</p>
        </div>
      </div>
    </div>
  );
}
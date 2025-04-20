'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import axios from 'axios';

// Types
interface GatePass {
  id: number;
  type: string;
  reason: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  academic_director_comment?: string;
  security_comment?: string;
}

// Updated status colors with much higher contrast for better readability
const statusColors: Record<string, string> = {
  'PENDING_ACADEMIC_DIRECTOR_FROM_HOD': 'bg-yellow-300 text-yellow-950 font-medium',
  'APPROVED_BY_ACADEMIC_DIRECTOR': 'bg-blue-300 text-blue-950 font-medium',
  'REJECTED_BY_ACADEMIC_DIRECTOR': 'bg-red-300 text-red-950 font-medium',
  'APPROVED_BY_SECURITY': 'bg-green-300 text-green-950 font-medium',
  'REJECTED_BY_SECURITY': 'bg-red-300 text-red-950 font-medium',
  'COMPLETED': 'bg-purple-300 text-purple-950 font-medium',
};

export default function HodManageGatePassPage() {
  const [loading, setLoading] = useState(true);
  const [gatePasses, setGatePasses] = useState<GatePass[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'leave',
    reason: '',
    description: '',
    start_date: '',
    end_date: '',
  });
  
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchGatePasses();
  }, [router]);

  const fetchGatePasses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Use new HOD-specific endpoint
      const response = await axios.get('http://localhost:3001/api/api/gate-passes/hod/my-passes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('Fetched HOD gate passes:', response.data);
      setGatePasses(response.data);
    } catch (error) {
      console.error('Error fetching gate passes:', error);
      toast.error('Failed to fetch gate passes');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      await axios.post(
        'http://localhost:3001/api/api/gate-passes/hod',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      toast.success('Gate pass request submitted successfully');
      setShowForm(false);
      setFormData({
        type: 'leave',
        reason: '',
        description: '',
        start_date: '',
        end_date: '',
      });
      
      // Refresh the list of gate passes
      fetchGatePasses();
    } catch (error: any) {
      console.error('Error submitting gate pass:', error);
      
      // Display more detailed error message if available
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Failed to submit gate pass request');
      }
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy hh:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusBadge = (status: string) => {
    const colorClass = statusColors[status] || 'bg-gray-300 text-gray-950 font-medium';
    const displayStatus = status.replace(/_/g, ' ');
    
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs ${colorClass} shadow-sm`}>
        {displayStatus}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 mb-8">
        <h1 className="text-2xl font-bold text-white">Manage Gate Passes</h1>
        <p className="text-white mt-2">
          Review and approve gate pass requests from students and staff in your department
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
        >
          {showForm ? 'Cancel' : 'Create New Gate Pass'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 mb-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Create New Gate Pass</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 font-medium"
                  required
                >
                  <option value="leave">Leave</option>
                  <option value="emergency">Emergency</option>
                  <option value="official">Official</option>
                  <option value="home_visit">Home Visit</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Reason</label>
                <input
                  type="text"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 font-medium"
                  required
                  placeholder="Enter reason"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 h-24 text-gray-900 font-medium"
                  required
                  placeholder="Enter description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Start Date & Time</label>
                <input
                  type="datetime-local"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 font-medium"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">End Date & Time</label>
                <input
                  type="datetime-local"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 font-medium"
                  required
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-800 font-medium rounded-md mr-2 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 text-white font-medium rounded-md hover:bg-amber-700"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : gatePasses.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600">No gate pass requests found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
            <thead className="bg-amber-50">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-amber-800">Type</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-amber-800">Reason</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-amber-800">Date Range</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-amber-800">Status</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-amber-800">Comments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {gatePasses.map((gatePass) => (
                <tr key={gatePass.id} className="hover:bg-amber-50">
                  <td className="py-4 px-4 text-sm text-gray-800">{gatePass.type}</td>
                  <td className="py-4 px-4 text-sm text-gray-800">
                    <div className="font-medium">{gatePass.reason}</div>
                    <div className="text-gray-500 text-xs mt-1 line-clamp-2">{gatePass.description}</div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-800">
                    <div>{formatDate(gatePass.start_date)}</div>
                    <div className="text-gray-500">to</div>
                    <div>{formatDate(gatePass.end_date)}</div>
                  </td>
                  <td className="py-4 px-4 text-sm">
                    {getStatusBadge(gatePass.status)}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-800">
                    {gatePass.academic_director_comment && (
                      <div className="mb-2">
                        <div className="font-medium text-xs text-amber-800">Academic Director:</div>
                        <div className="text-gray-600">{gatePass.academic_director_comment}</div>
                      </div>
                    )}
                    {gatePass.security_comment && (
                      <div>
                        <div className="font-medium text-xs text-amber-800">Security:</div>
                        <div className="text-gray-600">{gatePass.security_comment}</div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 
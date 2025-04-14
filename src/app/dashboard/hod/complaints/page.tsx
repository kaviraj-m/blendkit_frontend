'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { complaintsApi } from '@/services/complaintsApi';

interface Complaint {
  id: number;
  student: {
    id: number;
    name: string;
    email: string;
    rollNumber?: string;
  };
  subject: string;
  message: string;
  status: string;
  response?: string;
  createdAt: string;
  updatedAt: string;
}

export default function HodComplaintsPage() {
  const router = useRouter();
  const { user, isLoading, token } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [response, setResponse] = useState('');
  const [responseLoading, setResponseLoading] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      
      // Check if user has HOD role
      const roleName = typeof user.role === 'object' ? user.role.name : user.role;
      if (roleName !== 'hod') {
        router.push('/dashboard');
        return;
      }
      
      fetchDepartmentComplaints();
    }
  }, [user, isLoading, router, token]);

  const fetchDepartmentComplaints = async () => {
    setLoading(true);
    try {
      // Assuming we add a method to complaintsApi to get department complaints
      const response = await complaintsApi.getDepartmentComplaints(token);
      // Transform the data to match our frontend interface
      const transformedComplaints = response.map(complaint => ({
        ...complaint,
        createdAt: complaint.created_at,
        updatedAt: complaint.updated_at
      }));
      setComplaints(transformedComplaints);
    } catch (error) {
      console.error('Error fetching department complaints:', error);
      toast.error('Failed to load department complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setResponse(complaint.response || '');
  };

  const handleSubmitResponse = async () => {
    if (!selectedComplaint) return;
    
    if (!response.trim()) {
      toast.error('Please provide a response');
      return;
    }
    
    setResponseLoading(true);
    try {
      await complaintsApi.updateStatus(
        selectedComplaint.id, 
        { 
          status: 'RESOLVED',
          response 
        }, 
        token
      );
      
      toast.success('Response submitted successfully');
      
      // Update local state
      setComplaints(complaints.map(c => 
        c.id === selectedComplaint.id 
          ? { ...c, status: 'RESOLVED', response, updatedAt: new Date().toISOString() } 
          : c
      ));
      
      setSelectedComplaint(null);
    } catch (error) {
      console.error('Error submitting response:', error);
      toast.error('Failed to submit response');
    } finally {
      setResponseLoading(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">Pending</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">In Progress</span>;
      case 'RESOLVED':
        return <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">Resolved</span>;
      case 'REJECTED':
        return <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">Rejected</span>;
      default:
        return <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">{status}</span>;
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Department Complaints</h1>
        <p className="text-gray-600">Review and respond to student complaints from your department</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Complaints List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="font-semibold text-gray-700">All Complaints</h2>
          </div>
          
          {complaints.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No complaints found</p>
            </div>
          ) : (
            <div className="overflow-y-auto" style={{ maxHeight: '70vh' }}>
              {complaints.map((complaint) => (
                <div 
                  key={complaint.id}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${
                    selectedComplaint?.id === complaint.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleSelect(complaint)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-800 truncate mr-2">{complaint.subject}</h3>
                    {getStatusBadge(complaint.status)}
                  </div>
                  <p className="text-sm text-gray-600 mb-1 truncate">
                    From: {complaint.student.name}
                  </p>
                  <p className="text-xs text-gray-500">{formatDate(complaint.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Complaint Details */}
        <div className="lg:col-span-2">
          {!selectedComplaint ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No Complaint Selected</h2>
              <p className="text-gray-500">Select a complaint from the list to view details and respond</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">{selectedComplaint.subject}</h2>
                  {getStatusBadge(selectedComplaint.status)}
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">From: {selectedComplaint.student.name} ({selectedComplaint.student.email})</p>
                  <p className="text-sm text-gray-500">Submitted: {formatDate(selectedComplaint.createdAt)}</p>
                  {selectedComplaint.student.rollNumber && (
                    <p className="text-sm text-gray-500">Roll Number: {selectedComplaint.student.rollNumber}</p>
                  )}
                </div>
              </div>
              
              <div className="p-6 border-b">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Complaint Message</h3>
                <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">{selectedComplaint.message}</div>
              </div>
              
              <div className="p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  {selectedComplaint.status === 'RESOLVED' ? 'Your Response' : 'Respond to this complaint'}
                </h3>
                
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Enter your response here..."
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  disabled={selectedComplaint.status === 'RESOLVED' || responseLoading}
                />
                
                {selectedComplaint.status !== 'RESOLVED' && (
                  <div className="flex justify-end">
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      onClick={handleSubmitResponse}
                      disabled={responseLoading}
                    >
                      {responseLoading ? 'Submitting...' : 'Submit Response'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 
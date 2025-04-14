'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { complaintsApi } from '@/utils/api';

interface Student {
  id: number;
  name: string;
  email: string;
  sin_number: string;
}

interface Complaint {
  id: number;
  student: Student;
  subject: string;
  message: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  reply?: string;
  created_at: string;
  updated_at: string;
}

export default function ExecutiveDirectorComplaintsPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [replyText, setReplyText] = useState('');
  const [newStatus, setNewStatus] = useState<'pending' | 'in_progress' | 'resolved' | 'rejected'>('in_progress');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [authDebug, setAuthDebug] = useState<any>(null);
  
  useEffect(() => {
    if (!user || !token) {
      router.push('/login');
      return;
    }
    
    // Handle different role formats
    const role = typeof user.role === 'string' 
      ? user.role 
      : (user.role?.name || '');
    
    if (role !== 'executive_director') {
      console.log('Not executive director, redirecting. Role:', role);
      router.push('/dashboard');
      return;
    }
    
    fetchComplaints();
    fetchAuthDebug();
  }, [user, token, router]);
  
  const fetchAuthDebug = async () => {
    try {
      // Create axios instance with authorization header
      const api = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const response = await api.get('/api/complaints/debug/auth');
      console.log('Auth debug info:', response.data);
      setAuthDebug(response.data);
    } catch (error) {
      console.error('Error fetching auth debug info:', error);
    }
  };
  
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      
      // Use our API utility
      const data = await complaintsApi.getAll(token);
      console.log('Complaints data:', data);
      setComplaints(data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };
  
  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedComplaint) return;
    
    if (!replyText.trim()) {
      toast.error('Please enter a reply message');
      return;
    }
    
    try {
      setSubmitting(true);
      
      console.log(`Sending reply to complaint ID: ${selectedComplaint.id}`);
      console.log(`Request data:`, { status: newStatus, response: replyText });
      console.log(`Token (first 15 chars): ${token?.substring(0, 15)}...`);
      
      // Use our API utility
      const data = await complaintsApi.update(
        selectedComplaint.id,
        { status: newStatus, response: replyText },
        token
      );
      
      console.log('Reply response:', data);
      toast.success('Reply sent successfully');
      setIsModalOpen(false);
      setReplyText('');
      setNewStatus('in_progress');
      fetchComplaints();
    } catch (error) {
      console.error('Error submitting reply:', error);
      
      // Add more detailed error logging
      if (axios.isAxiosError(error)) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response?.data);
        console.error('Error response status:', error.response?.status);
        console.error('Error response headers:', error.response?.headers);
        
        if (error.response?.status === 403) {
          toast.error('Access denied: You do not have permission to update this complaint');
        } else {
          toast.error(`Server error: ${error.response?.data?.message || 'Unknown error'}`);
        }
      } else if (error instanceof Error) {
        // Something happened in setting up the request that triggered an Error
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  const openReplyModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setReplyText(complaint.reply || '');
    setNewStatus(complaint.status);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedComplaint(null);
    setReplyText('');
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'in_progress':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">In Progress</span>;
      case 'resolved':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Resolved</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredComplaints = filter === 'all' 
    ? complaints 
    : complaints.filter(complaint => complaint.status === filter);
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  }
  
  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">Student Complaints Management</h1>
      
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setFilter('all')} 
            className={`px-5 py-2 rounded-md font-medium text-sm ${filter === 'all' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-colors`}
          >
            All Complaints
          </button>
          <button 
            onClick={() => setFilter('pending')} 
            className={`px-5 py-2 rounded-md font-medium text-sm ${filter === 'pending' ? 'bg-yellow-500 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-colors`}
          >
            Pending
          </button>
          <button 
            onClick={() => setFilter('in_progress')} 
            className={`px-5 py-2 rounded-md font-medium text-sm ${filter === 'in_progress' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-colors`}
          >
            In Progress
          </button>
          <button 
            onClick={() => setFilter('resolved')} 
            className={`px-5 py-2 rounded-md font-medium text-sm ${filter === 'resolved' ? 'bg-green-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-colors`}
          >
            Resolved
          </button>
          <button 
            onClick={() => setFilter('rejected')} 
            className={`px-5 py-2 rounded-md font-medium text-sm ${filter === 'rejected' ? 'bg-red-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-colors`}
          >
            Rejected
          </button>
        </div>
        <span className="text-lg font-semibold text-gray-700 bg-gray-100 px-4 py-2 rounded-md">
          Total: {filteredComplaints.length} complaints
        </span>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredComplaints.length === 0 ? (
          <div className="p-8 text-center text-gray-600 font-medium text-lg">No complaints found with the selected filter.</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredComplaints.map((complaint) => (
              <div key={complaint.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{complaint.subject}</h3>
                  <div className="bg-gray-50 p-4 rounded-md mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-1">Student Information</h4>
                        <p className="text-gray-600">Name: {complaint.student.name}</p>
                        <p className="text-gray-600">Email: {complaint.student.email}</p>
                        <p className="text-gray-600">SIN Number: {complaint.student.sin_number}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-1">Complaint Details</h4>
                        <p className="text-gray-600">Status: {getStatusBadge(complaint.status)}</p>
                        <p className="text-gray-600">Submitted: {formatDate(complaint.created_at)}</p>
                        {complaint.updated_at !== complaint.created_at && (
                          <p className="text-gray-600">Last Updated: {formatDate(complaint.updated_at)}</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-700 mb-2">Complaint Message</h4>
                      <p className="text-gray-800 whitespace-pre-wrap bg-white p-4 rounded-md border border-gray-200">{complaint.message}</p>
                    </div>
                  </div>
                </div>
                
                {complaint.reply && (
                  <div className="mb-5 bg-green-50 p-4 rounded-md border-l-4 border-green-500">
                    <h4 className="font-semibold text-green-800 mb-2">Your Response:</h4>
                    <p className="text-gray-800 whitespace-pre-wrap">{complaint.reply}</p>
                  </div>
                )}
                
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => openReplyModal(complaint)}
                    className="px-5 py-2 bg-blue-600 text-white rounded-md font-medium shadow-sm hover:bg-blue-700 hover:shadow transition-all"
                  >
                    {complaint.reply ? 'Update Response' : 'Respond'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Reply Modal */}
      {isModalOpen && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-3">Respond to Complaint</h2>
            
            <div className="mb-4 bg-blue-50 p-4 rounded-md">
              <h3 className="font-semibold text-blue-800">From: {selectedComplaint.student.name}</h3>
              <p className="text-blue-600 text-sm mt-1">{formatDate(selectedComplaint.created_at)}</p>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Subject: {selectedComplaint.subject}</h3>
              <div className="bg-gray-50 p-4 rounded-md border-l-4 border-gray-300">
                <p className="text-gray-800 whitespace-pre-wrap">{selectedComplaint.message}</p>
              </div>
            </div>
            
            <form onSubmit={handleReplySubmit} className="space-y-6">
              <div>
                <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">Update Status</label>
                <select
                  id="status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white shadow-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="reply" className="block text-sm font-semibold text-gray-700 mb-2">Your Response</label>
                <textarea
                  id="reply"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px] text-gray-800 shadow-sm"
                  placeholder="Type your response here..."
                  required
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2 border border-gray-300 rounded-md hover:bg-gray-100 font-medium text-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2 bg-blue-600 text-white rounded-md font-medium shadow-md hover:bg-blue-700 transition-colors ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {submitting ? 'Sending...' : 'Send Response'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { complaintsApi, Complaint, CreateComplaintDto } from '@/services/complaintsApi';
import { toast } from 'react-toastify';

export default function StudentComplaintPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [authDebug, setAuthDebug] = useState<any>(null);
  
  useEffect(() => {
    if (!user || !token) {
      router.push('/login');
      return;
    }
    
    // Handle all possible role formats
    const role = typeof user.role === 'string' 
      ? user.role 
      : (user.role?.name || '');
    
    if (role !== 'student') {
      console.log('Not a student role, redirecting. Role:', role);
      router.push('/dashboard');
      return;
    }
    
    fetchComplaints();
    fetchAuthDebug();
  }, [user, token, router]);
  
  const fetchAuthDebug = async () => {
    try {
      if (!token) return;
      const data = await complaintsApi.getAuthDebug(token);
      setAuthDebug(data);
      console.log('Auth debug:', data);
    } catch (error) {
      console.error('Error fetching auth debug:', error);
    }
  };
  
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      if (!token) return;
      
      const data = await complaintsApi.getAll(token);
      setComplaints(data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };
  
  const submitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      setSubmitting(true);
      if (!token) {
        toast.error('You are not logged in');
        return;
      }
      
      const complaintData: CreateComplaintDto = {
        subject,
        message
      };
      
      await complaintsApi.create(token, complaintData);
      toast.success('Complaint submitted successfully');
      setSubject('');
      setMessage('');
      fetchComplaints();
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast.error('Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
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
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  }
  
  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center border-b pb-4">Complaint Box</h1>
      
      <div className="mb-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">Submit a New Complaint</h2>
        <form onSubmit={submitComplaint} className="space-y-5">
          <div>
            <label htmlFor="subject" className="block text-base font-semibold text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white shadow-sm"
              placeholder="Enter the subject of your complaint"
              required
            />
          </div>
          
          <div>
            <label htmlFor="message" className="block text-base font-semibold text-gray-700 mb-2">Message</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px] text-gray-800 bg-white shadow-sm"
              placeholder="Provide details about your complaint"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 text-lg transition-colors ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {submitting ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <h2 className="text-2xl font-bold p-6 border-b text-gray-800 bg-gray-50">Your Complaints</h2>
        
        {complaints.length === 0 ? (
          <div className="p-10 text-center text-gray-600 font-medium text-lg">You haven't submitted any complaints yet.</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row justify-between items-start gap-3 mb-4">
                  <h3 className="text-xl font-bold text-gray-800">{complaint.subject}</h3>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(complaint.status)}
                    <span className="text-sm font-medium text-gray-600">{formatDate(complaint.created_at)}</span>
                  </div>
                </div>
                
                <div className="mb-5 bg-gray-50 p-4 rounded-md border-l-4 border-gray-300">
                  <p className="text-gray-800 whitespace-pre-wrap">{complaint.message}</p>
                </div>
                
                {complaint.reply && (
                  <div className="bg-green-50 p-5 rounded-md border-l-4 border-green-500">
                    <h4 className="font-semibold text-green-800 mb-2">Response from Executive Director:</h4>
                    <p className="text-gray-800 whitespace-pre-wrap">{complaint.reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
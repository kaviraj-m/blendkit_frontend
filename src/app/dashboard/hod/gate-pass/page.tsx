'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { gatePassApi } from '@/services/gatePassApi';

interface GatePass {
  id: number;
  student: {
    id: number;
    name: string;
    email: string;
    rollNumber?: string;
  };
  reason: string;
  departureDate: string;
  returnDate: string;
  status: string;
  staffApproved: boolean;
  hodApproved: boolean;
  academicDirectorApproved: boolean;
  securityApproved: boolean;
  staffComments?: string;
  hodComments?: string;
  academicDirectorComments?: string;
  securityComments?: string;
  createdAt: string;
  updatedAt: string;
}

export default function HodGatePassApprovalPage() {
  const router = useRouter();
  const { user, isLoading, token } = useAuth();
  const [gatePasses, setGatePasses] = useState<GatePass[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState<{ [key: number]: string }>({});
  const [actionLoading, setActionLoading] = useState<{ [key: number]: string }>({});

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
      
      fetchPendingGatePasses();
    }
  }, [user, isLoading, router, token]);

  const fetchPendingGatePasses = async () => {
    setLoading(true);
    try {
      if (token) {
        const response = await gatePassApi.getHodPendingApproval(token);
        // Convert response to match the GatePass interface if needed
        const formattedResponse = response.map((pass: any) => ({
          id: pass.id,
          student: pass.student || { id: pass.student_id, name: 'Unknown Student', email: '' },
          reason: pass.reason || '',
          departureDate: pass.start_date || '',
          returnDate: pass.end_date || '',
          status: pass.status || '',
          staffApproved: pass.status === 'PENDING_HOD' || pass.status === 'pending_hod',
          hodApproved: false,
          academicDirectorApproved: false,
          securityApproved: false,
          staffComments: pass.staff_comment || '',
          hodComments: pass.hod_comment || '',
          academicDirectorComments: pass.academic_director_comment || '',
          securityComments: pass.security_comment || '',
          createdAt: pass.created_at || new Date().toISOString(),
          updatedAt: pass.updated_at || new Date().toISOString()
        }));
        setGatePasses(formattedResponse);
      }
    } catch (error) {
      console.error('Error fetching pending gate passes:', error);
      toast.error('Failed to load pending gate passes');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    setActionLoading({ ...actionLoading, [id]: 'approve' });
    try {
      await gatePassApi.hodApprove(token!, id, { 
        approved: true, 
        comments: comment[id] || 'Approved by HOD' 
      });
      toast.success('Gate pass approved successfully');
      setGatePasses(gatePasses.filter(pass => pass.id !== id));
      setComment({ ...comment, [id]: '' });
    } catch (error) {
      console.error('Error approving gate pass:', error);
      toast.error('Failed to approve gate pass');
    } finally {
      setActionLoading({ ...actionLoading, [id]: '' });
    }
  };

  const handleReject = async (id: number) => {
    if (!comment[id]) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    setActionLoading({ ...actionLoading, [id]: 'reject' });
    try {
      await gatePassApi.hodApprove(token!, id, { 
        approved: false, 
        comments: comment[id] 
      });
      toast.success('Gate pass rejected');
      setGatePasses(gatePasses.filter(pass => pass.id !== id));
      setComment({ ...comment, [id]: '' });
    } catch (error) {
      console.error('Error rejecting gate pass:', error);
      toast.error('Failed to reject gate pass');
    } finally {
      setActionLoading({ ...actionLoading, [id]: '' });
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

  if (isLoading || loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-800 font-medium">Loading gate pass requests...</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gate Pass Approval</h1>
        <p className="text-gray-800">Review and manage gate pass requests that require HOD approval</p>
      </div>

      {gatePasses.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Pending Requests</h2>
          <p className="text-gray-800">There are no gate pass requests waiting for your approval at this time.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {gatePasses.map((gatePass) => (
            <div key={gatePass.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Gate Pass #{gatePass.id}
                  </h3>
                  <p className="text-sm text-gray-700">
                    Submitted on {formatDate(gatePass.createdAt)}
                  </p>
                </div>
                <div className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium">
                  Pending HOD Approval
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Student Information</h4>
                    <p className="font-medium text-gray-900">{gatePass.student.name}</p>
                    <p className="text-gray-800">{gatePass.student.email}</p>
                    {gatePass.student.rollNumber && (
                      <p className="text-gray-800">Roll #: {gatePass.student.rollNumber}</p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Request Details</h4>
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm text-gray-700">Departure:</p>
                        <p className="font-medium text-gray-900">{formatDate(gatePass.departureDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-700">Return:</p>
                        <p className="font-medium text-gray-900">{formatDate(gatePass.returnDate)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Reason for Leave</h4>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded">{gatePass.reason}</p>
                </div>
                
                {gatePass.staffComments && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Staff Comments</h4>
                    <p className="text-gray-800 bg-green-50 p-3 rounded">{gatePass.staffComments}</p>
                  </div>
                )}
                
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Your Comments</h4>
                  <textarea
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    rows={3}
                    placeholder="Add your comments here (required for rejection)"
                    value={comment[gatePass.id] || ''}
                    onChange={(e) => setComment({ ...comment, [gatePass.id]: e.target.value })}
                  />
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                    onClick={() => handleReject(gatePass.id)}
                    disabled={actionLoading[gatePass.id] === 'reject'}
                  >
                    {actionLoading[gatePass.id] === 'reject' ? 'Rejecting...' : 'Reject'}
                  </button>
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                    onClick={() => handleApprove(gatePass.id)}
                    disabled={actionLoading[gatePass.id] === 'approve'}
                  >
                    {actionLoading[gatePass.id] === 'approve' ? 'Approving...' : 'Approve'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
} 
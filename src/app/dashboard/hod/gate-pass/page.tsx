'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { gatePassApi, RequesterType } from '@/services/gatePassApi';

interface GatePass {
  id: number;
  student?: {
    id: number;
    name: string;
    email: string;
    sin_number?: string;
    year?: number;
    batch?: string;
  };
  requester?: {
    id: number;
    name: string;
    email: string;
    sin_number?: string;
    year?: number;
    batch?: string;
  };
  requester_type?: string;
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

// Simple Tabs Components - since @/components/ui/tabs doesn't exist
const TabsList = ({ className, children }: { className: string, children: React.ReactNode }) => (
  <div className={`flex rounded-lg bg-gray-100 p-1 ${className}`}>{children}</div>
);

const TabsTrigger = ({ value, className, children, active, onClick }: { value: string, className: string, children: React.ReactNode, active: boolean, onClick: () => void }) => (
  <button 
    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${active ? 'bg-white shadow' : 'text-gray-700 hover:bg-gray-200/60'} ${className}`}
    onClick={onClick}
  >
    {children}
  </button>
);

const TabsContent = ({ value, activeValue, children }: { value: string, activeValue: string, children: React.ReactNode }) => (
  <div className={value === activeValue ? 'block' : 'hidden'}>
    {children}
  </div>
);

const Tabs = ({ defaultValue, value, onValueChange, children }: { defaultValue: string, value: string, onValueChange: (value: string) => void, children: React.ReactNode }) => {
  const activeValue = value || defaultValue;
  return (
    <div className="w-full">
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && child.type === TabsList) {
          return React.cloneElement(child);
        }
        if (React.isValidElement(child) && child.type === TabsContent) {
          return React.cloneElement(child as React.ReactElement<any>, { activeValue } as any);
        }
        return child;
      })}
    </div>
  );
};

export default function HodGatePassApprovalPage() {
  const router = useRouter();
  const { user, isLoading, token } = useAuth();
  const [studentGatePasses, setStudentGatePasses] = useState<GatePass[]>([]);
  const [staffGatePasses, setStaffGatePasses] = useState<GatePass[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState<{ [key: number]: string }>({});
  const [actionLoading, setActionLoading] = useState<{ [key: number]: string }>({});
  const [activeTab, setActiveTab] = useState('students');

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
        console.log('API Response:', response);
        
        // Process the response and filter by requester type
        const formattedResponse = response.map((pass: any) => ({
          id: pass.id,
          student: pass.student || (pass.requester_type === RequesterType.STUDENT ? { 
            id: pass.requester_id, 
            name: pass.requester?.name || 'Unknown Student', 
            email: pass.requester?.email || '',
            sin_number: pass.requester?.sin_number || '',
            year: pass.requester?.year || null,
            batch: pass.requester?.batch || ''
          } : undefined),
          requester: pass.requester || { 
            id: pass.requester_id, 
            name: 'Unknown User', 
            email: '', 
            sin_number: pass.requester?.sin_number || '',
            year: pass.requester?.year || null,
            batch: pass.requester?.batch || ''
          },
          requester_type: pass.requester_type,
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
        
        // Filter passes by requester type
        const studentPasses = formattedResponse.filter(pass => 
          pass.requester_type === RequesterType.STUDENT || pass.requester_type === 'student'
        );
        
        const staffPasses = formattedResponse.filter(pass => 
          pass.requester_type === RequesterType.STAFF || pass.requester_type === 'staff'
        );
        
        setStudentGatePasses(studentPasses);
        setStaffGatePasses(staffPasses);
      }
    } catch (error) {
      console.error('Error fetching pending gate passes:', error);
      toast.error('Failed to load pending gate passes');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number, type: 'student' | 'staff') => {
    setActionLoading({ ...actionLoading, [id]: 'approve' });
    try {
      await gatePassApi.hodApprove(token!, id, { 
        approved: true, 
        comments: comment[id] || 'Approved by HOD' 
      });
      toast.success('Gate pass approved successfully');
      
      // Remove the approved gate pass from the respective list
      if (type === 'student') {
        setStudentGatePasses(studentGatePasses.filter(pass => pass.id !== id));
      } else {
        setStaffGatePasses(staffGatePasses.filter(pass => pass.id !== id));
      }
      
      setComment({ ...comment, [id]: '' });
    } catch (error) {
      console.error('Error approving gate pass:', error);
      toast.error('Failed to approve gate pass');
    } finally {
      setActionLoading({ ...actionLoading, [id]: '' });
    }
  };

  const handleReject = async (id: number, type: 'student' | 'staff') => {
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
      
      // Remove the rejected gate pass from the respective list
      if (type === 'student') {
        setStudentGatePasses(studentGatePasses.filter(pass => pass.id !== id));
      } else {
        setStaffGatePasses(staffGatePasses.filter(pass => pass.id !== id));
      }
      
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

  // Render a gate pass card - reusable for both student and staff
  const renderGatePassCard = (gatePass: GatePass, type: 'student' | 'staff') => (
    <div key={gatePass.id} className={`rounded-lg shadow overflow-hidden ${type === 'student' ? 'border-l-4 border-amber-500' : 'border-l-4 border-purple-500'}`}>
      <div className={`px-6 py-4 border-b border-gray-200 ${type === 'student' ? 'bg-amber-50' : 'bg-purple-50'} flex justify-between items-center`}>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Gate Pass #{gatePass.id}
          </h3>
          <p className="text-sm text-gray-700">
            Submitted on {formatDate(gatePass.createdAt)}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full ${type === 'student' ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-purple-100 text-purple-800 font-bold'} text-sm`}>
          {type === 'student' ? 'Student Gate Pass' : 'Staff Gate Pass'}
        </div>
      </div>
      
      <div className="p-6 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className={`p-4 rounded-lg ${type === 'student' ? 'bg-amber-50' : 'bg-purple-50'}`}>
            <h4 className="text-sm font-medium text-gray-700 mb-3">{type === 'student' ? 'Student Information' : 'Staff Information'}</h4>
            <p className="font-medium text-gray-900 text-lg">{type === 'student' ? gatePass.student?.name : gatePass.requester?.name}</p>
            
            {type === 'student' && (
              <>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div className="bg-white p-2 rounded border border-amber-200">
                    <p className="text-xs text-gray-500">SIN Number</p>
                    <p className="font-medium text-gray-900">{gatePass.student?.sin_number || 'N/A'}</p>
                  </div>
                  <div className="bg-white p-2 rounded border border-amber-200">
                    <p className="text-xs text-gray-500">Year</p>
                    <p className="font-medium text-gray-900">{gatePass.student?.year || 'N/A'}</p>
                  </div>
                </div>
                {gatePass.student?.batch && (
                  <div className="mt-2 bg-white p-2 rounded border border-amber-200">
                    <p className="text-xs text-gray-500">Batch</p>
                    <p className="font-medium text-gray-900">{gatePass.student?.batch}</p>
                  </div>
                )}
              </>
            )}
            
            <p className="mt-2 text-gray-800">{type === 'student' ? gatePass.student?.email : gatePass.requester?.email}</p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Request Details</h4>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white p-3 rounded border border-gray-200">
                <p className="text-xs text-gray-500">Departure</p>
                <p className="font-medium text-gray-900">{formatDate(gatePass.departureDate)}</p>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200">
                <p className="text-xs text-gray-500">Return</p>
                <p className="font-medium text-gray-900">{formatDate(gatePass.returnDate)}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Reason for Leave</h4>
          <p className="text-gray-800 bg-white p-3 rounded border border-gray-200">{gatePass.reason}</p>
        </div>
        
        {gatePass.staffComments && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-700 mb-2">Staff Comments</h4>
            <p className="text-gray-800 bg-white p-3 rounded border border-blue-200">{gatePass.staffComments}</p>
          </div>
        )}
        
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Your Comments</h4>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Add your comments here (required for rejection)"
            value={comment[gatePass.id] || ''}
            onChange={(e) => setComment({ ...comment, [gatePass.id]: e.target.value })}
          ></textarea>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => handleReject(gatePass.id, type)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
            disabled={actionLoading[gatePass.id] === 'reject'}
          >
            {actionLoading[gatePass.id] === 'reject' ? 'Rejecting...' : 'Reject'}
          </button>
          <button
            onClick={() => handleApprove(gatePass.id, type)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            disabled={actionLoading[gatePass.id] === 'approve'}
          >
            {actionLoading[gatePass.id] === 'approve' ? 'Approving...' : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  );

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
      <div className="mb-6 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Gate Pass Approval</h1>
        <p className="text-blue-100">
          Review and manage gate pass requests that require HOD approval
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <Tabs defaultValue="students" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="students" 
              className="relative" 
              active={activeTab === 'students'} 
              onClick={() => setActiveTab('students')}
            >
              <span className={`text-base font-semibold ${activeTab === 'students' ? 'text-amber-700' : 'text-gray-700'}`}>Students</span>
              {studentGatePasses.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white">
                  {studentGatePasses.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="staff" 
              className="relative" 
              active={activeTab === 'staff'} 
              onClick={() => setActiveTab('staff')}
            >
              <span className={`text-base font-semibold ${activeTab === 'staff' ? 'text-purple-700' : 'text-gray-700'}`}>Staff</span>
              {staffGatePasses.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white">
                  {staffGatePasses.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-4">
            <TabsContent value="students" activeValue={activeTab}>
              {studentGatePasses.length === 0 ? (
                <div className="bg-amber-50 rounded-lg p-6 text-center border border-amber-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">No Pending Student Requests</h2>
                  <p className="text-gray-800">There are no student gate pass requests waiting for your approval at this time.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {studentGatePasses.map(gatePass => renderGatePassCard(gatePass, 'student'))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="staff" activeValue={activeTab}>
              {staffGatePasses.length === 0 ? (
                <div className="bg-purple-50 rounded-lg p-6 text-center border border-purple-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">No Pending Staff Requests</h2>
                  <p className="text-gray-800">There are no staff gate pass requests waiting for your approval at this time.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {staffGatePasses.map(gatePass => renderGatePassCard(gatePass, 'staff'))}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </>
  );
}
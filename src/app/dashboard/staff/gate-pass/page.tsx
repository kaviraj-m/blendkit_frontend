'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { 
  GatePass, 
  GatePassStatus, 
  GatePassType, 
  UpdateGatePassStatusByStaffDto, 
  gatePassApi 
} from '@/services/gatePassApi';

export default function StaffGatePassPage() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  
  const [pendingGatePasses, setPendingGatePasses] = useState<GatePass[]>([]);
  const [selectedGatePass, setSelectedGatePass] = useState<GatePass | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [remarks, setRemarks] = useState('');
  
  // Fetch pending gate passes
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      
      // Check if user has staff role
      const roleName = typeof user.role === 'object' ? user.role.name : user.role;
      if (roleName !== 'staff') {
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
        const data = await gatePassApi.getPendingStaffApproval(token);
        console.log('Pending gate passes:', data);
        setPendingGatePasses(data || []);
      }
    } catch (err) {
      console.error('Error fetching pending gate passes:', err);
      toast.error('Failed to load pending gate passes');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectGatePass = (gatePass: GatePass) => {
    setSelectedGatePass(gatePass);
    setRemarks('');
  };
  
  const handleApproveGatePass = async () => {
    if (!selectedGatePass) return;
    
    setUpdating(true);
    try {
      // Ensure status is exactly as expected by the API
      const updateData = {
        status: "approved_by_staff", // Lowercase as expected by the backend
        remarks: remarks.trim() || ''
      };
      
      console.log('Sending approval data:', JSON.stringify(updateData));
      await gatePassApi.updateByStaff(token!, selectedGatePass.id, updateData);
      toast.success('Gate pass approved successfully');
      
      // Refresh the list and clear selection
      fetchPendingGatePasses();
      setSelectedGatePass(null);
      setRemarks('');
    } catch (err) {
      console.error('Error approving gate pass:', err);
      toast.error('Failed to approve gate pass: Please try again');
    } finally {
      setUpdating(false);
    }
  };
  
  const handleRejectGatePass = async () => {
    if (!selectedGatePass) return;
    
    if (!remarks.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    setUpdating(true);
    try {
      // Ensure status is exactly as expected by the API
      const updateData = {
        status: "rejected_by_staff", // Lowercase as expected by the backend
        remarks: remarks.trim()
      };
      
      console.log('Sending rejection data:', JSON.stringify(updateData));
      await gatePassApi.updateByStaff(token!, selectedGatePass.id, updateData);
      toast.success('Gate pass rejected');
      
      // Refresh the list and clear selection
      fetchPendingGatePasses();
      setSelectedGatePass(null);
      setRemarks('');
    } catch (err) {
      console.error('Error rejecting gate pass:', err);
      toast.error('Failed to reject gate pass: Please check your input and try again');
    } finally {
      setUpdating(false);
    }
  };
  
  const formatGatePassType = (type: GatePassType): string => {
    if (!type) return 'Unknown';
    
    switch (type) {
      case GatePassType.LEAVE:
        return 'Leave';
      case GatePassType.HOME_VISIT:
        return 'Home Visit';
      case GatePassType.EMERGENCY:
        return 'Emergency';
      case GatePassType.OTHER:
        return 'Other';
      default:
        return String(type).replace(/_/g, ' ');
    }
  };
  
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return 'Not specified';
    try {
      return format(parseISO(dateStr), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateStr;
    }
  };
  
  if (isLoading || loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 border-t-2 border-opacity-80 shadow-md mb-4"></div>
        <p className="text-gray-800">Loading gate pass information...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-8 bg-gradient-to-r from-amber-600 to-amber-800 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Gate Pass Approvals</h1>
        <p className="text-amber-100">
          Review and manage student gate pass requests for your department
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Pending Gate Passes */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Requests</h2>
            
            {pendingGatePasses.length === 0 ? (
              <div className="text-center py-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-700">No pending gate pass requests</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {pendingGatePasses.map((gatePass) => (
                  <div
                    key={gatePass.id}
                    onClick={() => handleSelectGatePass(gatePass)}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedGatePass?.id === gatePass.id
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-900">{gatePass.student?.name || `Student #${gatePass.student_id}`}</span>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800">
                        {formatGatePassType(gatePass.type)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 mb-2">{gatePass.reason}</p>
                    <div className="text-xs text-gray-700 flex justify-between">
                      <span>ID: {gatePass.id}</span>
                      <span>{format(parseISO(gatePass.created_at), 'MMM dd')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Right Panel - Gate Pass Details */}
        <div className="lg:col-span-2">
          {selectedGatePass ? (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Gate Pass Details</h2>
              
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="block text-sm text-gray-600">Student</span>
                    <span className="font-medium text-lg text-gray-900">
                      {selectedGatePass.student?.name || `Student #${selectedGatePass.student_id}`}
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                    {formatGatePassType(selectedGatePass.type)}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Request Details</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="block text-sm text-gray-600">Reason</span>
                      <span className="font-medium text-gray-900">{selectedGatePass.reason}</span>
                    </div>
                    
                    <div>
                      <span className="block text-sm text-gray-600">Description</span>
                      <p className="text-gray-800 whitespace-pre-line">
                        {selectedGatePass.description || "No description provided."}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Time Period</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="block text-sm text-gray-600">Start Date & Time</span>
                      <span className="font-medium text-gray-900">{formatDate(selectedGatePass.start_date)}</span>
                    </div>
                    
                    <div>
                      <span className="block text-sm text-gray-600">End Date & Time</span>
                      <span className="font-medium text-gray-900">{formatDate(selectedGatePass.end_date)}</span>
                    </div>
                    
                    <div>
                      <span className="block text-sm text-gray-600">Request Date</span>
                      <span className="font-medium text-gray-900">{formatDate(selectedGatePass.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <label htmlFor="remarks" className="block font-medium text-gray-900 mb-2">
                  Remarks (required for rejection)
                </label>
                <textarea
                  id="remarks"
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm mb-4 text-gray-900"
                  placeholder="Enter any comments or feedback about this request..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  disabled={updating}
                ></textarea>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleRejectGatePass}
                    disabled={updating}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? 'Processing...' : 'Reject'}
                  </button>
                  <button
                    type="button"
                    onClick={handleApproveGatePass}
                    disabled={updating}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? 'Processing...' : 'Approve'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center h-full min-h-[400px]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Gate Pass Selected</h3>
              <p className="text-gray-700 text-center max-w-md">
                Select a gate pass request from the list to view details and make approval decisions.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Help Information */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Processing Gate Passes</h3>
        <p className="text-blue-800 mb-4">
          As a staff member, you are the first level of approval for student gate pass requests. 
          Review each request carefully before making a decision.
        </p>
        <ul className="list-disc list-inside text-blue-800 space-y-1">
          <li>Approved gate passes will be forwarded to the HOD for the next level of approval.</li>
          <li>Rejected gate passes will be marked as rejected and the student will be notified.</li>
          <li>You must provide remarks when rejecting a gate pass request.</li>
          <li>Consider the student's reason, time period, and urgency when making your decision.</li>
        </ul>
      </div>
      
      {/* Debug information - only shown in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-200 rounded-lg">
          <h3 className="font-medium mb-2">Debug Info</h3>
          <p>User ID: {user?.id}</p>
          <p>Role: {typeof user?.role === 'object' ? user.role.name : user?.role}</p>
          <p>Token Status: {token ? 'Available' : 'Not available'}</p>
          <p>Pending Gate Passes: {pendingGatePasses.length}</p>
        </div>
      )}
    </div>
  );
} 
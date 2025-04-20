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
  gatePassApi,
  CreateStaffGatePassDto,
  RequesterType
} from '@/services/gatePassApi';

// Extend the GatePassStatus enum with missing values
const ExtendedGatePassStatus = {
  ...GatePassStatus,
  PENDING_SECURITY: 'PENDING_SECURITY',
  APPROVED_BY_ACADEMIC_DIRECTOR: 'APPROVED_BY_ACADEMIC_DIRECTOR',
  REJECTED_BY_ACADEMIC_DIRECTOR: 'REJECTED_BY_ACADEMIC_DIRECTOR',
};

export default function StaffGatePassApplyPage() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  
  const [myGatePasses, setMyGatePasses] = useState<GatePass[]>([]);
  const [selectedGatePass, setSelectedGatePass] = useState<GatePass | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Calculate default start date (15 minutes from now)
  const getDefaultStartDate = () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + 15);
    return date.toISOString().slice(0, 16); // Format as YYYY-MM-DDTHH:MM
  };
  
  // Calculate default end date (1 hour after start date)
  const getDefaultEndDate = (startDate: string) => {
    const date = new Date(startDate);
    date.setHours(date.getHours() + 1);
    return date.toISOString().slice(0, 16); // Format as YYYY-MM-DDTHH:MM
  };
  
  const defaultStartDate = getDefaultStartDate();
  
  const [formData, setFormData] = useState({
    type: GatePassType.OFFICIAL,
    reason: '',
    description: '',
    startDate: defaultStartDate,
    endDate: getDefaultEndDate(defaultStartDate),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Fetch my gate passes
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
      
      fetchMyGatePasses();
    }
  }, [user, isLoading, router, token]);
  
  const fetchMyGatePasses = async () => {
    setLoading(true);
    try {
      if (token) {
        const data = await gatePassApi.getMyRequests(token);
        setMyGatePasses(data || []);
      }
    } catch (err) {
      console.error('Error fetching my gate passes:', err);
      toast.error('Failed to load your gate passes');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectGatePass = (gatePass: GatePass) => {
    setSelectedGatePass(gatePass);
    setShowForm(false);
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'startDate') {
      // When start date changes, update end date to be 1 hour later
      setFormData({
        ...formData,
        startDate: value,
        endDate: getDefaultEndDate(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { type, reason, description, startDate, endDate } = formData;
    
    if (!reason.trim()) {
      toast.error('Reason is required');
      return;
    }
    
    if (!startDate || !endDate) {
      toast.error('Start and end dates are required');
      return;
    }
    
    // Calculate the minimum allowed start time (15 minutes from now)
    const minStartDate = new Date();
    minStartDate.setMinutes(minStartDate.getMinutes() + 15);
    
    // Convert startDate string to Date object for comparison
    const startDateTime = new Date(startDate);
    
    // Check if start time is at least 15 minutes in the future
    if (startDateTime < minStartDate) {
      toast.error('Start date and time must be at least 15 minutes in the future');
      return;
    }
    
    // Check if end date is after start date
    if (startDate >= endDate) {
      toast.error('End date must be after start date');
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (token) {
        const gatePassData = {
          type: type,
          reason: reason,
          description: description,
          start_date: startDate,
          end_date: endDate
          // Removed requester_type as it causes validation issues
          // The backend and API service will set this automatically
        };
        
        console.log('Submitting gate pass data:', gatePassData);
        await gatePassApi.createForStaff(token, gatePassData);
        
        toast.success('Gate pass request submitted successfully');
        setFormData({
          type: GatePassType.OFFICIAL,
          reason: '',
          description: '',
          startDate: getDefaultStartDate(),
          endDate: getDefaultEndDate(getDefaultStartDate()),
        });
        
        setShowForm(false);
        fetchMyGatePasses();
      }
    } catch (error) {
      console.error('Error creating gate pass:', error);
      toast.error('Failed to submit gate pass request');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatGatePassType = (type: GatePassType): string => {
    switch (type) {
      case GatePassType.OFFICIAL:
        return 'Official Duty';
      case GatePassType.LEAVE:
        return 'Leave';
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
  
  const getStatusBadge = (status: GatePassStatus) => {
    switch (status) {
      case GatePassStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case GatePassStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case GatePassStatus.PENDING_HOD:
        return 'bg-yellow-100 text-yellow-800';
      case GatePassStatus.PENDING_ACADEMIC_DIRECTOR:
        return 'bg-orange-100 text-orange-800';
      case ExtendedGatePassStatus.PENDING_SECURITY:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusLabel = (status: GatePassStatus): string => {
    switch (status) {
      case GatePassStatus.PENDING_STAFF:
        return 'Pending Staff Approval';
      case GatePassStatus.APPROVED_BY_STAFF:
        return 'Approved by Staff, Pending HOD';
      case GatePassStatus.REJECTED_BY_STAFF:
        return 'Rejected by Staff';
      case GatePassStatus.PENDING_HOD:
        return 'Pending HOD Approval';
      case GatePassStatus.APPROVED_BY_HOD:
        return 'Approved by HOD, Pending Academic Director';
      case GatePassStatus.REJECTED_BY_HOD:
        return 'Rejected by HOD';
      case GatePassStatus.PENDING_ACADEMIC_DIRECTOR:
        return 'Pending Academic Director Approval';
      case ExtendedGatePassStatus.APPROVED_BY_ACADEMIC_DIRECTOR:
        return 'Approved by Academic Director, Pending Security';
      case ExtendedGatePassStatus.REJECTED_BY_ACADEMIC_DIRECTOR:
        return 'Rejected by Academic Director';
      case ExtendedGatePassStatus.PENDING_SECURITY:
        return 'Pending Security Approval';
      case GatePassStatus.APPROVED:
        return 'Approved';
      case GatePassStatus.REJECTED:
        return 'Rejected';
      default:
        return String(status).replace(/_/g, ' ');
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2 text-white">Apply for Gate Pass</h1>
        <p className="text-white">
          Submit your gate pass request. All requests require approval from HOD and academic director.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - My Gate Passes */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">My Gate Passes</h2>
              <button
                onClick={() => {
                  setShowForm(true);
                  setSelectedGatePass(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                + New Request
              </button>
            </div>
            
            {myGatePasses.length === 0 ? (
              <div className="text-center py-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-700">You haven't submitted any gate pass requests</p>
                <button 
                  onClick={() => {
                    setShowForm(true);
                    setSelectedGatePass(null);
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Create New Request
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {myGatePasses.map((gatePass) => (
                  <div
                    key={gatePass.id}
                    onClick={() => handleSelectGatePass(gatePass)}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedGatePass?.id === gatePass.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-900">Gate Pass #{gatePass.id}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(gatePass.status)}`}>
                        {formatGatePassType(gatePass.type)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 mb-2">{gatePass.reason}</p>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{formatDate(gatePass.start_date).split(' ')[0]}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(gatePass.status)}`}>
                        {getStatusLabel(gatePass.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Right Panel - Gate Pass Form or Details */}
        <div className="lg:col-span-2">
          {showForm ? (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">New Gate Pass Request</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                      Type of Gate Pass
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleFormChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900"
                      required
                    >
                      <option value={GatePassType.OFFICIAL}>Official Duty</option>
                      <option value={GatePassType.LEAVE}>Leave</option>
                      <option value={GatePassType.EMERGENCY}>Emergency</option>
                      <option value={GatePassType.OTHER}>Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                      Reason
                    </label>
                    <input
                      type="text"
                      id="reason"
                      name="reason"
                      value={formData.reason}
                      onChange={handleFormChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900"
                      placeholder="Brief reason for gate pass"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleFormChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900"
                      placeholder="Detailed description (optional)"
                    ></textarea>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleFormChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                        End Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleFormChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          ) : selectedGatePass ? (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Gate Pass Details</h2>
              
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="block text-sm text-gray-500">Gate Pass #{selectedGatePass.id}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(selectedGatePass.status)}`}>
                    {getStatusLabel(selectedGatePass.status)}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-medium text-gray-800 mb-3">Request Details</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="block text-sm text-gray-600">Type</span>
                      <span className="font-medium text-gray-900">{formatGatePassType(selectedGatePass.type)}</span>
                    </div>
                    
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
                  <h3 className="font-medium text-gray-800 mb-3">Time Period</h3>
                  
                  <div className="space-y-4">
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
              
              {selectedGatePass.remarks && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="font-medium text-gray-800 mb-2">Remarks</h3>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded-md">{selectedGatePass.remarks}</p>
                </div>
              )}
              
              <div className="border-t border-gray-200 pt-4 mt-6">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(true);
                      setSelectedGatePass(null);
                    }}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create New Request
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center h-full min-h-[400px]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Apply for a Gate Pass</h3>
              <p className="text-gray-700 text-center max-w-md mb-6">
                Create a new gate pass request or select an existing request to view details.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create New Request
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Help Information */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Gate Pass Information</h3>
        <p className="text-blue-800 mb-4">
          Gate passes allow staff members to enter or exit the campus outside of normal hours. The approval process includes:
        </p>
        <ol className="list-decimal list-inside text-blue-800 space-y-1 pl-4">
          <li>Staff submits a gate pass request (this form)</li>
          <li>Approval by the HOD</li>
          <li>Approval by the Academic Director</li>
          <li>Final verification by Security when entering/exiting</li>
        </ol>
      </div>
    </div>
  );
} 
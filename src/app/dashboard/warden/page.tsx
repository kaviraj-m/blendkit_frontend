'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { gatePassApi } from '@/services/gatePassApi';
import { ClipboardCheck, CheckCircle, XCircle, Search, Calendar, User, Clock, File, FileText } from 'lucide-react';

interface GatePass {
  id: number;
  student: {
    id: number;
    name: string;
    email: string;
    sin_number?: string;
  };
  department: {
    id: number;
    name: string;
  };
  type: string;
  reason: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  staff_comment?: string;
  hod_comment?: string;
  created_at: string;
  updated_at: string;
}

export default function WardenDashboard() {
  const router = useRouter();
  const { user, isLoading, token } = useAuth();
  const [gatePasses, setGatePasses] = useState<GatePass[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGatePass, setSelectedGatePass] = useState<GatePass | null>(null);
  const [comment, setComment] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      
      // Check if user has warden role
      const roleName = typeof user.role === 'object' ? user.role.name : user.role;
      if (roleName !== 'hostel_warden') {
        toast.error('Only hostel wardens can access this page');
        router.push('/dashboard');
        return;
      }
      
      fetchPendingGatePasses();
    }
  }, [user, isLoading, router, token]);

  const fetchPendingGatePasses = async () => {
    setLoading(true);
    try {
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await gatePassApi.getPendingHostelWardenApproval(token);
      console.log('Fetched gate passes:', response);
      setGatePasses(response || []);
      
      if (response && response.length > 0) {
        toast.success(`${response.length} pending gate passes found`);
      } else {
        toast('No pending gate passes found');
      }
    } catch (error) {
      console.error('Error fetching pending gate passes:', error);
      toast.error('Failed to load pending gate passes');
      setGatePasses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (gatePass: GatePass) => {
    setSelectedGatePass(gatePass);
    setComment('');
  };

  const handleApprove = async () => {
    if (!selectedGatePass || !token) return;
    
    if (!comment.trim()) {
      toast.error('Please provide a comment');
      return;
    }
    
    setSubmitLoading(true);
    try {
      await gatePassApi.updateByHostelWarden(
        token,
        selectedGatePass.id,
        {
          status: 'approved_by_hostel_warden',
          remarks: comment
        }
      );
      
      toast.success('Gate pass approved successfully');
      
      // Update local state
      setGatePasses(gatePasses.filter(gp => gp.id !== selectedGatePass.id));
      setSelectedGatePass(null);
    } catch (error) {
      console.error('Error approving gate pass:', error);
      toast.error('Failed to approve gate pass');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedGatePass || !token) return;
    
    if (!comment.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    setSubmitLoading(true);
    try {
      await gatePassApi.updateByHostelWarden(
        token,
        selectedGatePass.id,
        {
          status: 'rejected_by_hostel_warden',
          remarks: comment
        }
      );
      
      toast.success('Gate pass rejected');
      
      // Update local state
      setGatePasses(gatePasses.filter(gp => gp.id !== selectedGatePass.id));
      setSelectedGatePass(null);
    } catch (error) {
      console.error('Error rejecting gate pass:', error);
      toast.error('Failed to reject gate pass');
    } finally {
      setSubmitLoading(false);
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
  
  const getPassTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'leave':
        return <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">Leave</span>;
      case 'home_visit':
        return <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">Home Visit</span>;
      case 'emergency':
        return <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">Emergency</span>;
      default:
        return <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">{type}</span>;
    }
  };

  const filteredGatePasses = gatePasses.filter(gatePass => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      gatePass.student.name.toLowerCase().includes(query) ||
      (gatePass.student.sin_number && gatePass.student.sin_number.toLowerCase().includes(query)) ||
      gatePass.reason.toLowerCase().includes(query) ||
      gatePass.department.name.toLowerCase().includes(query)
    );
  });

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      {/* Header */}
      <div className="mb-8 bg-gradient-to-r from-purple-700 to-purple-900 rounded-xl shadow-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Hostel Warden Dashboard</h1>
        <p className="text-purple-100 text-lg">
          Manage gate pass approvals for hostel students
        </p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
          <div className="rounded-full bg-purple-100 p-3 mr-4">
            <ClipboardCheck className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
            <p className="text-2xl font-bold text-gray-900">{gatePasses.length}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 flex items-start">
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Gate Pass Process</p>
            <p className="text-base text-gray-700 mt-1">
              ✓ HOD → <span className="font-bold text-purple-700">Warden</span> → Academic Director
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-center">
          <p className="text-sm font-medium text-gray-600 mb-2">Quick Actions</p>
          <button 
            onClick={fetchPendingGatePasses}
            className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 transition"
          >
            Refresh Gate Passes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gate Passes List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="font-semibold text-gray-700">Pending Gate Passes</h2>
            
            {/* Search Box */}
            <div className="mt-3 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search by name, ID..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {filteredGatePasses.length === 0 ? (
            <div className="p-6 text-center">
              <ClipboardCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No pending gate passes found</p>
              <p className="text-sm text-gray-400 mt-1">All hosteller gate passes require your approval</p>
            </div>
          ) : (
            <div className="overflow-y-auto" style={{ maxHeight: '70vh' }}>
              {filteredGatePasses.map((gatePass) => (
                <div 
                  key={gatePass.id}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${
                    selectedGatePass?.id === gatePass.id ? 'bg-purple-50' : ''
                  }`}
                  onClick={() => handleSelect(gatePass)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-500 mr-1" />
                      <h3 className="font-medium text-gray-800">{gatePass.student.name}</h3>
                    </div>
                    {getPassTypeBadge(gatePass.type)}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-1 truncate flex items-center">
                    <FileText className="h-3 w-3 mr-1 inline" />
                    {gatePass.reason}
                  </p>
                  
                  <div className="flex items-center text-xs text-gray-500 mt-2">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{formatDate(gatePass.start_date)}</span>
                    <span className="mx-1">→</span>
                    <span>{formatDate(gatePass.end_date)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Gate Pass Details */}
        <div className="lg:col-span-2">
          {!selectedGatePass ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No Gate Pass Selected</h2>
              <p className="text-gray-500">Select a gate pass from the list to view details and respond</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b border-purple-100 flex justify-between items-center bg-purple-50">
                <h2 className="text-xl font-semibold text-gray-800">Gate Pass #{selectedGatePass.id}</h2>
                {getPassTypeBadge(selectedGatePass.type)}
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">Student Information</h4>
                    <p className="text-gray-900 font-semibold">{selectedGatePass.student.name}</p>
                    <p className="text-gray-800">{selectedGatePass.student.email}</p>
                    <p className="text-gray-800">ID: {selectedGatePass.student.sin_number || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">Department</h4>
                    <p className="text-gray-900 font-semibold">{selectedGatePass.department.name}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">Gate Pass Details</h4>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs font-medium text-gray-600">Duration</p>
                        <p className="text-gray-900 font-semibold flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(selectedGatePass.start_date)} - {formatDate(selectedGatePass.end_date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-600">Created</p>
                        <p className="text-gray-900 font-semibold">{formatDate(selectedGatePass.created_at)}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium text-gray-600">Reason</p>
                      <p className="text-gray-900 font-semibold">{selectedGatePass.reason}</p>
                    </div>
                    
                    {selectedGatePass.description && (
                      <div className="mt-4">
                        <p className="text-xs font-medium text-gray-600">Description</p>
                        <p className="text-gray-800">{selectedGatePass.description}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {selectedGatePass.staff_comment && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">Staff Comment</h4>
                    <p className="bg-blue-50 p-3 rounded-lg text-gray-800 border border-blue-100">{selectedGatePass.staff_comment}</p>
                  </div>
                )}
                
                {selectedGatePass.hod_comment && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">HOD Comment</h4>
                    <p className="bg-green-50 p-3 rounded-lg text-gray-800 border border-green-100">{selectedGatePass.hod_comment}</p>
                  </div>
                )}
                
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">Your Comment</h4>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                    rows={3}
                    placeholder="Add your comment here..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={submitLoading}
                  />
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={handleReject}
                    className="flex items-center justify-center px-4 py-2 bg-white border border-red-500 text-red-600 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitLoading || !comment.trim()}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </button>
                  
                  <button
                    onClick={handleApprove}
                    className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitLoading || !comment.trim()}
                  >
                    {submitLoading ? (
                      <>
                        <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
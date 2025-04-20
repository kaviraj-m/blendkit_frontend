'use client';

import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiCheckCircle, FiXCircle, FiClock, FiCalendar, FiUser, FiArrowLeft } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import classNames from 'classnames';

enum RequesterType {
  STUDENT = 'student',
  STAFF = 'staff',
  HOD = 'hod'
}

enum GatePassStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  USED = 'used'
}

// Helper function to get greeting based on time of day
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

// API service for gate passes
const gatePassApi = {
  getAllForSecurity: async () => {
    const token = localStorage.getItem('token');
    return axios.get('http://localhost:3001/api/gate-passes/for-security-verification', {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  verifyBySecurityWithComment: async (id: number, data: { status: string, security_comment: string }) => {
    const token = localStorage.getItem('token');
    return axios.patch(`http://localhost:3001/api/gate-passes/${id}/security-verification`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};

interface User {
  id: number;
  sin_number: string;
  name: string;
  email: string;
  department_id: number;
  year?: number;
  batch?: string;
  phone?: string;
}

interface Department {
  id: number;
  name: string;
  code?: string;
}

interface GatePass {
  id: number;
  requester: User;
  requester_id: number;
  requester_type: RequesterType;
  student?: User | null;
  student_id?: number | null;
  department: Department;
  department_id: number;
  staff?: User | null;
  staff_id?: number | null;
  hod?: User | null;
  hod_id?: number | null;
  academicDirector?: User | null;
  academic_director_id?: number | null;
  security_id?: number | null;
  status: string;
  type: string;
  reason: string;
  description?: string;
  start_date: string;
  end_date: string;
  staff_comment?: string | null;
  hod_comment?: string | null;
  academic_director_comment?: string | null;
  security_comment?: string | null;
  checkout_time?: string | null;
  checkin_time?: string | null;
  hostel_warden_id?: number | null;
  hostel_warden_comment?: string | null;
  created_at: string;
  updated_at: string;
}

const SecurityVerificationByTypePage = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<RequesterType>(RequesterType.STUDENT);
  const [gatePasses, setGatePasses] = useState<GatePass[]>([]);
  const [filteredGatePasses, setFilteredGatePasses] = useState<GatePass[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGatePass, setSelectedGatePass] = useState<GatePass | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [verificationComment, setVerificationComment] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchGatePasses();
  }, []);

  useEffect(() => {
    filterGatePasses();
  }, [activeTab, gatePasses, searchTerm]);

  const fetchGatePasses = async () => {
    setLoading(true);
    try {
      const response = await gatePassApi.getAllForSecurity();
      console.log('API response:', response.data);
      setGatePasses(response.data);
    } catch (error) {
      console.error('Error fetching gate passes:', error);
      toast.error('Failed to fetch gate passes');
    } finally {
      setLoading(false);
    }
  };

  const filterGatePasses = () => {
    let filtered = gatePasses.filter(pass => pass.requester_type === activeTab);
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(pass => 
        pass.requester.name.toLowerCase().includes(term) ||
        (pass.requester.sin_number && pass.requester.sin_number.toLowerCase().includes(term)) ||
        pass.reason.toLowerCase().includes(term) ||
        pass.status.toLowerCase().includes(term) ||
        (pass.department && pass.department.name.toLowerCase().includes(term))
      );
    }
    
    setFilteredGatePasses(filtered);
  };

  const handleVerify = async (isVerified: boolean) => {
    if (!selectedGatePass) return;
    
    setVerifying(true);
    try {
      // Since the API only accepts 'used' status, we'll indicate reject/verify in the comment
      const statusText = isVerified ? 'VERIFIED' : 'REJECTED';
      const userComment = verificationComment ? verificationComment : '';
      const data = {
        status: 'used', // API only accepts 'used' status
        security_comment: `[${statusText}] ${userComment}`
      };
      
      await gatePassApi.verifyBySecurityWithComment(selectedGatePass.id, data);
      
      toast.success(`Gate pass ${isVerified ? 'verified' : 'rejected'} successfully`);
      await fetchGatePasses();
      setIsModalOpen(false);
      setVerificationComment('');
    } catch (error) {
      console.error('Error verifying gate pass:', error);
      toast.error('Failed to verify gate pass');
    } finally {
      setVerifying(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleViewDetails = (gatePass: GatePass) => {
    setSelectedGatePass(gatePass);
    setIsModalOpen(true);
  };

  const getPendingCount = (type: RequesterType) => {
    return gatePasses.filter(pass => 
      pass.requester_type === type && 
      pass.status === GatePassStatus.APPROVED.toLowerCase() && 
      !pass.security_comment
    ).length;
  };

  const getStatusBadge = (status: string) => {
    const lowerStatus = status.toLowerCase();
    
    switch(lowerStatus) {
      case GatePassStatus.APPROVED.toLowerCase():
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Approved</span>;
      case GatePassStatus.REJECTED.toLowerCase():
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>;
      case GatePassStatus.USED.toLowerCase():
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Used</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'N/A';
      
      // Check if the date is valid
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return format(date, 'MMM dd, yyyy hh:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const isVerified = (gatePass: GatePass) => {
    return gatePass.security_comment !== null && 
           gatePass.security_comment !== undefined &&
           gatePass.status.toLowerCase() === 'used' && 
           gatePass.security_comment.includes('[VERIFIED]');
  };

  const isRejected = (gatePass: GatePass) => {
    return gatePass.security_comment !== null && 
           gatePass.security_comment !== undefined &&
           gatePass.status.toLowerCase() === 'used' && 
           gatePass.security_comment.includes('[REJECTED]');
  };

  const isPendingVerification = (gatePass: GatePass) => {
    return gatePass.security_comment === null && gatePass.status.toLowerCase() === 'approved';
  };

  return (
    <div className="container px-6 mx-auto">
      {/* Breadcrumb navigation */}
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <Link href="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
        <span className="mx-2">/</span>
        <Link href="/dashboard/security" className="hover:text-indigo-600">Security</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">Verification by Type</span>
      </div>

      {/* Header with back button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">{getGreeting()}, Security Officer</h2>
        <Link 
          href="/dashboard/security" 
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <FiArrowLeft className="mr-2" />
          Back to Dashboard
        </Link>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab(RequesterType.STUDENT)}
            className={classNames(
              "py-4 px-1 border-b-2 font-medium text-sm",
              activeTab === RequesterType.STUDENT 
                ? "border-indigo-500 text-indigo-600" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            Students {getPendingCount(RequesterType.STUDENT) > 0 && 
              <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                {getPendingCount(RequesterType.STUDENT)}
              </span>
            }
          </button>
          
          <button
            onClick={() => setActiveTab(RequesterType.STAFF)}
            className={classNames(
              "py-4 px-1 border-b-2 font-medium text-sm",
              activeTab === RequesterType.STAFF 
                ? "border-indigo-500 text-indigo-600" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            Staff {getPendingCount(RequesterType.STAFF) > 0 && 
              <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                {getPendingCount(RequesterType.STAFF)}
              </span>
            }
          </button>
          
          <button
            onClick={() => setActiveTab(RequesterType.HOD)}
            className={classNames(
              "py-4 px-1 border-b-2 font-medium text-sm",
              activeTab === RequesterType.HOD 
                ? "border-indigo-500 text-indigo-600" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            HOD {getPendingCount(RequesterType.HOD) > 0 && 
              <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                {getPendingCount(RequesterType.HOD)}
              </span>
            }
          </button>
        </nav>
      </div>
      
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-indigo-100 p-3 rounded-full">
              <FiClock className="text-indigo-500" />
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-medium text-gray-500">Pending Verification</h4>
              <h3 className="text-xl font-semibold">{getPendingCount(activeTab)}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <FiCheckCircle className="text-green-500" />
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-medium text-gray-500">Verified</h4>
              <h3 className="text-xl font-semibold">
                {gatePasses.filter(pass => 
                  pass.requester_type === activeTab && 
                  isVerified(pass)
                ).length}
              </h3>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-full">
              <FiXCircle className="text-red-500" />
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-medium text-gray-500">Rejected</h4>
              <h3 className="text-xl font-semibold">
                {gatePasses.filter(pass => 
                  pass.requester_type === activeTab && 
                  isRejected(pass)
                ).length}
              </h3>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Search by name, SIN number, reason, or status..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
        </div>
      </div>
      
      {/* Gate passes list */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : filteredGatePasses.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredGatePasses.map((gatePass) => (
              <li key={gatePass.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer" onClick={() => handleViewDetails(gatePass)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <FiUser className="h-6 w-6 text-indigo-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-sm font-medium text-gray-900">{gatePass.requester.name}</h4>
                        <p className="text-xs text-gray-500">
                          {gatePass.requester_type === RequesterType.STUDENT ? 'Student' : 
                           gatePass.requester_type === RequesterType.STAFF ? 'Staff' : 'HOD'}
                          {gatePass.requester_type === RequesterType.STUDENT && gatePass.requester.year && ` • Year ${gatePass.requester.year}`}
                          {` • SIN: ${gatePass.requester.sin_number}`}
                          {` • ${gatePass.department.name}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {isPendingVerification(gatePass) ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending Verification</span>
                      ) : isVerified(gatePass) ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Verified</span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <FiCalendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {formatDate(gatePass.start_date)} - {formatDate(gatePass.end_date)}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      {getStatusBadge(gatePass.status)}
                      <span className="ml-2 px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">
                        {gatePass.type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
          <p className="text-gray-500">No gate passes found for this category</p>
        </div>
      )}
      
      {/* Modal for gate pass details */}
      {isModalOpen && selectedGatePass && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center pb-3">
              <h3 className="text-xl font-semibold">Gate Pass #{selectedGatePass.id} Details</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiXCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Requester</p>
                    <p className="mt-1 font-semibold">{selectedGatePass.requester.name}</p>
                    <p className="text-sm text-gray-600">SIN: {selectedGatePass.requester.sin_number}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Department</p>
                    <p className="mt-1 font-semibold">{selectedGatePass.department.name}</p>
                    {selectedGatePass.department.code && (
                      <p className="text-sm text-gray-600">Code: {selectedGatePass.department.code}</p>
                    )}
                  </div>
                  
                  {selectedGatePass.requester_type === RequesterType.STUDENT && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Student Details</p>
                      <p className="mt-1 font-semibold">Year: {selectedGatePass.requester.year || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Batch: {selectedGatePass.requester.batch || 'N/A'}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pass Type & Status</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {getStatusBadge(selectedGatePass.status)}
                      <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">
                        {selectedGatePass.type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500">Time Period</p>
                  <p className="mt-1 font-semibold">From: {formatDate(selectedGatePass.start_date)}</p>
                  <p className="text-sm text-gray-600">To: {formatDate(selectedGatePass.end_date)}</p>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500">Reason</p>
                  <p className="mt-1 p-3 bg-gray-50 rounded-md">{selectedGatePass.reason}</p>
                </div>
                
                {selectedGatePass.description && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500">Description</p>
                    <p className="mt-1 p-3 bg-gray-50 rounded-md">{selectedGatePass.description}</p>
                  </div>
                )}
                
                {/* Verification History */}
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500">Approval & Verification History</p>
                  <div className="mt-2 space-y-3">
                    {selectedGatePass.requester_type !== RequesterType.HOD && selectedGatePass.staff_comment !== null && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <FiCheckCircle className="h-5 w-5 text-green-500" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium">Staff</p>
                            <p className="text-xs text-gray-500">{selectedGatePass.staff_comment || 'Approved'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedGatePass.hod_comment !== null && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <FiCheckCircle className="h-5 w-5 text-green-500" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium">HOD</p>
                            <p className="text-xs text-gray-500">{selectedGatePass.hod_comment || 'Approved'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedGatePass.academic_director_comment !== null && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <FiCheckCircle className="h-5 w-5 text-green-500" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium">Academic Director</p>
                            <p className="text-xs text-gray-500">{selectedGatePass.academic_director_comment || 'Approved'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedGatePass.security_comment !== null && selectedGatePass.security_comment !== undefined && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            selectedGatePass.security_comment.includes('[VERIFIED]') 
                              ? 'bg-green-100' 
                              : selectedGatePass.security_comment.includes('[REJECTED]')
                                ? 'bg-red-100'
                                : 'bg-blue-100'
                          }`}>
                            {selectedGatePass.security_comment.includes('[VERIFIED]') ? (
                              <FiCheckCircle className="h-5 w-5 text-green-500" />
                            ) : selectedGatePass.security_comment.includes('[REJECTED]') ? (
                              <FiXCircle className="h-5 w-5 text-red-500" />
                            ) : (
                              <FiCheckCircle className="h-5 w-5 text-blue-500" />
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium">Security</p>
                            <p className="text-xs text-gray-500">
                              {selectedGatePass.security_comment.replace(/\[(VERIFIED|REJECTED)\]\s*/, '')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Security verification section (only shown for approved passes that haven't been verified yet) */}
              {selectedGatePass.status.toLowerCase() === 'approved' && !selectedGatePass.security_comment && (
                <div className="mt-4">
                  <div className="mb-3">
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Security Verification Comment</label>
                    <textarea
                      id="comment"
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Add verification details (e.g., ID checked, details verified)..."
                      value={verificationComment}
                      onChange={(e) => setVerificationComment(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleVerify(true)}
                      disabled={verifying}
                      className="flex-1 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      {verifying ? 'Verifying...' : 'Verify Exit'}
                    </button>
                    <button
                      onClick={() => handleVerify(false)}
                      disabled={verifying}
                      className="flex-1 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      {verifying ? 'Rejecting...' : 'Reject Exit'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityVerificationByTypePage; 
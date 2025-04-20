'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { GatePassRequestForm } from '@/components/GatePassRequestForm';
import { CreateGatePassDto, GatePass, GatePassStatus, gatePassApi } from '@/services/gatePassApi';
import { toast } from 'react-hot-toast';

export default function StudentGatePassPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  
  const [requests, setRequests] = useState<GatePass[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!token) {
        router.push('/login');
        return;
      }
      
      if (user && user.role?.name !== 'student') {
        router.push('/dashboard');
        return;
      }
      
      fetchGatePasses();
    }
  }, [isLoading, token, user, router]);

  const fetchGatePasses = async () => {
    try {
      setLoading(true);
      const data = await gatePassApi.getMyRequests(token);
      setRequests(data);
    } catch (error) {
      console.error('Error fetching gate passes:', error);
      toast.error('Failed to load your gate pass requests');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGatePass = async (data: CreateGatePassDto) => {
    try {
      setSubmitting(true);
      await gatePassApi.create(token, data);
      toast.success('Gate pass request submitted successfully');
      fetchGatePasses();
    } catch (error) {
      console.error('Error creating gate pass:', error);
      toast.error('Failed to submit gate pass request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: GatePassStatus) => {
    switch (status) {
      case GatePassStatus.PENDING:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
      case GatePassStatus.APPROVED_BY_STAFF:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Approved by Staff</span>;
      case GatePassStatus.APPROVED_BY_HOD:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">Approved by HOD</span>;
      case GatePassStatus.APPROVED_BY_WARDEN:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Approved by Warden</span>;
      case GatePassStatus.APPROVED_BY_DIRECTOR:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">Approved by Director</span>;
      case GatePassStatus.APPROVED:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>;
      case GatePassStatus.REJECTED:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>;
      case GatePassStatus.COMPLETED:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Completed</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Gate Pass Requests</h1>
      
      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        <div className="md:col-span-7">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-blue-600 p-4">
              <h2 className="text-lg font-semibold text-white">New Gate Pass Request</h2>
            </div>
            <GatePassRequestForm 
              onSubmit={handleCreateGatePass}
              isLoading={submitting}
            />
          </div>
        </div>
        
        <div className="md:col-span-5">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-blue-600 p-4">
              <h2 className="text-lg font-semibold text-white">My Gate Pass Requests</h2>
            </div>
            
            <div className="p-4">
              {loading ? (
                <div className="py-8 text-center">
                  <div className="animate-pulse inline-block h-8 w-8 rounded-full bg-blue-200"></div>
                  <p className="mt-2 text-gray-500">Loading your requests...</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-gray-500">You haven't made any gate pass requests yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{request.reason}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(request.start_date)} - {formatDate(request.end_date)}
                          </p>
                        </div>
                        <div>{getStatusBadge(request.status)}</div>
                      </div>
                      
                      {request.rejection_reason && (
                        <div className="mt-2 p-2 bg-red-50 rounded text-sm">
                          <p className="font-semibold text-red-800">Rejection reason:</p>
                          <p className="text-red-700">{request.rejection_reason}</p>
                        </div>
                      )}
                      
                      {request.description && (
                        <div className="mt-2 text-sm text-gray-600">
                          <p className="line-clamp-2">{request.description}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Debug information - only shown in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs font-mono">
          <p>User ID: {user?.id}</p>
          <p>Role: {user?.role?.name}</p>
          <p>Token Status: {token ? 'Available' : 'Not available'}</p>
        </div>
      )}
    </div>
  );
} 
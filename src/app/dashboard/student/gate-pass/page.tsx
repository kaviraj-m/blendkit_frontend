'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  gatePassApi, 
  GatePass, 
  GatePassType,
  GatePassStatus, 
  CreateGatePassDto 
} from '@/services/gatePassApi';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Select from '@/components/Select';
import Textarea from '@/components/Textarea';
import Input from '@/components/Input';
import { format, isAfter, parseISO, isBefore } from 'date-fns';

const LoadingSpinner: React.FC = () => (
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 border-t-2 border-opacity-80 shadow-md"></div>
);

interface TextInputProps {
  label?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  [key: string]: any;
}

const TextInput: React.FC<TextInputProps> = ({ 
  label, 
  name, 
  value, 
  onChange, 
  error, 
  ...props 
}) => (
  <Input
    label={label}
    name={name}
    value={value}
    onChange={onChange}
    error={error}
    {...props}
  />
);

interface DatePickerProps {
  label?: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  error?: string;
  [key: string]: any;
}

const DatePicker: React.FC<DatePickerProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  ...props
}) => (
  <Input
    type="datetime-local"
    label={label}
    name={name}
    value={value}
    onChange={(e) => onChange(name, e.target.value)}
    error={error}
    {...props}
  />
);

const StudentGatePassPage = () => {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [gatePasses, setGatePasses] = useState<GatePass[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [formData, setFormData] = useState<CreateGatePassDto>({
    type: GatePassType.LEAVE,
    reason: '',
    description: '',
    start_date: format(new Date(Date.now() + 15 * 60 * 1000), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    end_date: format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd\'T\'HH:mm:ss')
  });
  
  const [formErrors, setFormErrors] = useState({
    type: '',
    reason: '',
    description: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      
      // Check if user has student role
      const roleName = typeof user.role === 'object' ? user.role.name : user.role;
      if (roleName !== 'student') {
        router.push('/dashboard');
        return;
      }
      
      fetchGatePasses();
    }
  }, [user, isLoading, router, token]);

  const fetchGatePasses = async (retryCount = 0) => {
    setLoading(true);
    try {
      if (token) {
        const data = await gatePassApi.getMyRequests(token);
        setGatePasses(data || []);
      }
    } catch (err) {
      console.error('Error fetching gate passes:', err);
      
      // Retry up to 2 times with exponential backoff
      if (retryCount < 2) {
        console.log(`Retrying fetch (attempt ${retryCount + 1})...`);
        setTimeout(() => {
          fetchGatePasses(retryCount + 1);
        }, Math.pow(2, retryCount) * 1000);
        return;
      }
      
      setError('Failed to load gate passes. Please check your connection and try again later.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {
      type: '',
      reason: '',
      description: '',
      start_date: '',
      end_date: ''
    };
    let isValid = true;

    if (!formData.reason?.trim()) {
      errors.reason = 'Reason is required';
      isValid = false;
    } else if (formData.reason.length < 5) {
      errors.reason = 'Reason must be at least 5 characters long';
      isValid = false;
    }

    if (!formData.description?.trim()) {
      errors.description = 'Description is required';
      isValid = false;
    } else if (formData.description.length < 10) {
      errors.description = 'Description must be at least 10 characters long';
      isValid = false;
    }

    try {
      const startDate = parseISO(formData.start_date);
      const endDate = parseISO(formData.end_date);
      
      // Only check if the date is before today, not exact time
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (isBefore(startDate, today)) {
        errors.start_date = 'Start date cannot be in the past';
        isValid = false;
      }

      // Allow same-day passes, but end time must be after start time
      if (isBefore(endDate, startDate)) {
        errors.end_date = 'End time must be after start time';
        isValid = false;
      }
    } catch (error) {
      console.error('Error validating dates:', error);
      errors.start_date = 'Invalid date format';
      errors.end_date = 'Invalid date format';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      if (!token) {
        setError('Authentication token is missing. Please log in again.');
        return;
      }
      
      console.log('Submitting gate pass with data:', formData);
      await gatePassApi.create(token, formData);
      setSuccess('Gate pass request submitted successfully');
      // Reset form
      setFormData({
        type: GatePassType.LEAVE,
        reason: '',
        description: '',
        start_date: format(new Date(Date.now() + 15 * 60 * 1000), 'yyyy-MM-dd\'T\'HH:mm:ss'),
        end_date: format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd\'T\'HH:mm:ss')
      });
      // Refresh gate passes
      fetchGatePasses();
    } catch (err: any) {
      console.error('Error creating gate pass:', err);
      if (err.response?.data) {
        console.error('Server error response:', err.response.data);
      }
      setError(err.response?.data?.message || 'Failed to submit gate pass request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDateChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const getStatusColor = (status: GatePassStatus) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status) {
      case GatePassStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case GatePassStatus.REJECTED:
      case GatePassStatus.REJECTED_BY_STAFF:
      case GatePassStatus.REJECTED_BY_HOD:
      case GatePassStatus.REJECTED_BY_HOSTEL_WARDEN:
        return 'bg-red-100 text-red-800';
      case GatePassStatus.PENDING_STAFF:
      case GatePassStatus.PENDING_HOD:
      case GatePassStatus.PENDING_ACADEMIC_DIRECTOR:
      case GatePassStatus.PENDING_HOSTEL_WARDEN:
        return 'bg-yellow-100 text-yellow-800';
      case GatePassStatus.APPROVED_BY_STAFF:
      case GatePassStatus.APPROVED_BY_HOD:
      case GatePassStatus.APPROVED_BY_HOSTEL_WARDEN:
        return 'bg-blue-100 text-blue-800';
      case GatePassStatus.USED:
        return 'bg-purple-100 text-purple-800';
      case GatePassStatus.EXPIRED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: GatePassStatus) => {
    if (!status) return 'Unknown';
    return status.replace(/_/g, ' ');
  };

  const formatGatePassType = (type: GatePassType) => {
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

  const isExpired = (endDate: string) => {
    if (!endDate) return false;
    try {
      return isBefore(parseISO(endDate), new Date());
    } catch (error) {
      console.error('Error parsing date:', error);
      return false;
    }
  };

  // Auto-clear error and success messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        if (error) setError('');
        if (success) setSuccess('');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  if (isLoading || loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 border-t-2 border-opacity-80 shadow-md mb-4"></div>
          <p className="text-gray-600">Loading gate pass information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-800">Gate Pass Management</h1>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
          {typeof user?.role === 'object' ? user.role.name : user?.role || 'Student'}
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg shadow-sm border border-red-200 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg shadow-sm border border-green-200 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>{success}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col">
          <Card className="p-6 shadow-md border-t-4 border-blue-500 rounded-lg mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              Request New Gate Pass
            </h2>
            <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 text-sm">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>
                  The server requires that start time must be at least a few minutes in the future. 
                  We've set it to 15 minutes ahead by default.
                </span>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Select
                  label="Type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  error={formErrors.type}
                  options={[
                    { value: GatePassType.LEAVE, label: 'Leave (Long absence from campus)' },
                    { value: GatePassType.HOME_VISIT, label: 'Home Visit (Visit to family/residence)' },
                    { value: GatePassType.EMERGENCY, label: 'Emergency (Medical or urgent matter)' },
                    { value: GatePassType.OTHER, label: 'Other (Any other reason)' }
                  ]}
                  className="text-gray-900 font-medium"
                />
              </div>
              
              <div>
                <TextInput
                  label="Reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  error={formErrors.reason}
                  placeholder="Brief reason for gate pass"
                  className="text-gray-900"
                />
              </div>
              
              <div>
                <Textarea
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  error={formErrors.description}
                  placeholder="Detailed explanation..."
                  rows={3}
                  className="text-gray-900"
                />
              </div>
              
              <div className="border-t border-gray-100 pt-5">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Time Period</h3>
                <div className="mb-3">
                  <DatePicker
                    label="Start Date & Time (When you need to leave)"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleDateChange}
                    error={formErrors.start_date}
                    className="text-gray-900 font-medium"
                  />
                  <p className="mt-1 text-xs text-gray-500">Select when you need to leave campus</p>
                </div>
                
                <div>
                  <DatePicker
                    label="End Date & Time (When you will return)"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleDateChange}
                    error={formErrors.end_date}
                    className="text-gray-900 font-medium"
                  />
                  <p className="mt-1 text-xs text-gray-500">Same-day passes are allowed (minutes difference is acceptable)</p>
                </div>
              </div>
              
              <div className="pt-4">
                <button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors text-base shadow-sm"
                  disabled={loading}
                >
                  {loading ? 
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Submitting...
                    </div> : 
                    'Submit Request'
                  }
                </button>
              </div>
            </form>
          </Card>
        </div>
        
        <div>
          <Card className="p-6 shadow-md border-t-4 border-green-500 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              My Gate Passes
            </h2>
            {gatePasses.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                <p className="text-gray-700 font-medium mb-2">No Gate Passes Found</p>
                <p className="text-gray-500 text-sm">You haven't requested any gate passes yet. Use the form to submit your first request.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 -mr-2">
                {gatePasses.map(pass => (
                  <div key={pass.id} className="border border-gray-200 rounded-lg p-5 bg-white hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold text-gray-900 text-lg">{pass.reason}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(pass.status)}`}>
                        {formatStatus(pass.status)}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm mb-3">
                      {pass.description?.substring(0, 100) || 'No description provided'}
                      {(pass.description?.length || 0) > 100 ? '...' : ''}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mt-4 border-t border-gray-100 pt-3">
                      <div>
                        <div className="mb-2">
                          <span className="font-medium text-gray-700 block mb-1">Type</span>
                          <span className="text-gray-900">{formatGatePassType(pass.type)}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 block mb-1">Created</span>
                          <span className="text-gray-900">{pass.created_at ? format(new Date(pass.created_at), 'MMM dd, yyyy') : 'Unknown'}</span>
                        </div>
                      </div>
                      <div>
                        <div className="mb-2">
                          <span className="font-medium text-gray-700 block mb-1">Valid From</span>
                          <span className="text-gray-900">
                            {pass.start_date ? format(parseISO(pass.start_date), 'MMM dd, yyyy HH:mm') : 'Not specified'}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 block mb-1">Valid Until</span>
                          <span className="text-gray-900">
                            {pass.end_date ? format(parseISO(pass.end_date), 'MMM dd, yyyy HH:mm') : 'Not specified'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {pass.remarks && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <span className="font-medium block text-gray-700 mb-1">Remarks</span>
                        <span className="text-gray-700 italic block p-3 bg-gray-50 rounded-md">{pass.remarks}</span>
                      </div>
                    )}
                    
                    {isExpired(pass.end_date) && pass.status !== GatePassStatus.EXPIRED && (
                      <div className="mt-3 bg-red-50 p-3 rounded-md text-sm text-red-700 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        This gate pass has expired.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 border border-gray-200 rounded-md bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Debug Information</h3>
          <pre className="text-xs overflow-auto">
            {JSON.stringify({ userId: user?.id, role: user?.role }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default StudentGatePassPage; 
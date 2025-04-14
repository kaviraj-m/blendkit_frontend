'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/utils/rbac';
import { ShieldCheck, ClipboardCheck, UserCheck, Calendar, AlertTriangle, X, CheckCircle, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { gatePassApi, UpdateGatePassBySecurityDto } from '@/services/gatePassApi';

// Define proper GatePass interface matching what comes from API
interface GatePass {
  id: number;
  student: {
    id: number;
    sin_number: string;
    name: string;
    email: string;
  };
  department: {
    id: number;
    name: string;
  };
  staff?: {
    id: number;
    name: string;
  };
  hod?: {
    id: number;
    name: string;
  };
  academicDirector?: {
    id: number;
    name: string;
  };
  security_id?: number;
  status: string;
  type: string;
  reason: string;
  description: string;
  start_date: string;
  end_date: string;
  staff_comment?: string;
  hod_comment?: string;
  academic_director_comment?: string;
  security_comment?: string;
  checkout_time?: string;
  checkin_time?: string;
  created_at: string;
  updated_at: string;
}

export default function SecurityDashboard() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('approved');
  const [gatePasses, setGatePasses] = useState<GatePass[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGatePass, setSelectedGatePass] = useState<GatePass | null>(null);
  const [securityComment, setSecurityComment] = useState('');
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState({
    pendingGatePasses: 0,
    approvedGatePasses: 0,
    usedGatePasses: 0,
    recentEntries: 0,
  });

  // Get current time to display greeting
  const currentHour = new Date().getHours();
  let greeting = 'Good evening';
  if (currentHour < 12) {
    greeting = 'Good morning';
  } else if (currentHour < 18) {
    greeting = 'Good afternoon';
  }

  useEffect(() => {
    // Verify user has security role permissions
    if (!user) {
      router.push('/login');
      return;
    }

    // Check permission
    const canViewGatePasses = hasPermission(user.role, 'view_gate_passes');
    
    if (!canViewGatePasses) {
      toast.error('You do not have permission to view this page');
      router.push('/dashboard');
      return;
    }

    // Debug API URL
    console.log('API URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000');
    console.log('User role:', typeof user.role === 'object' ? user.role.name : user.role);

    // Fetch gate passes based on active tab
    fetchGatePasses();
  }, [user, router, token, activeTab]);

  // Effect to update stats when active tab changes
  useEffect(() => {
    // Only run if we already have gate passes data
    if (gatePasses.length === 0) return;
    
    // Update the stat counts based on the current tab
    if (activeTab === 'approved') {
      // Update the stats to highlight approved passes
      setStats(prev => ({
        ...prev,
        approvedGatePasses: gatePasses.length
      }));
    } else if (activeTab === 'pending') {
      // Update the stats to highlight pending passes
      setStats(prev => ({
        ...prev,
        pendingGatePasses: gatePasses.length
      }));
    } else if (activeTab === 'used') {
      // Update the stats to highlight used passes
      setStats(prev => ({
        ...prev,
        usedGatePasses: gatePasses.length,
        recentEntries: gatePasses.length
      }));
    }
  }, [gatePasses, activeTab]);

  const fetchGatePasses = async () => {
    try {
      setLoading(true);
      if (token) {
        console.log('Fetching gate passes with token:', token.substring(0, 10) + '...');
        console.log('Current active tab:', activeTab);
        
        try {
          let response;
          
          // Use the appropriate API endpoint based on the active tab
          if (activeTab === 'pending') {
            console.log('Fetching pending gate passes');
            response = await gatePassApi.getSecurityPending(token);
          } else if (activeTab === 'used') {
            console.log('Fetching used gate passes');
            response = await gatePassApi.getSecurityUsed(token);
          } else {
            // Default to 'approved' tab
            console.log('Fetching approved gate passes');
            response = await gatePassApi.getForSecurityVerification(token);
          }
          
          console.log(`API Response for ${activeTab} tab:`, response);
          
          if (response && Array.isArray(response)) {
            console.log('Successfully loaded gate passes, count:', response.length);
            // Type assertion to ensure compatibility
            setGatePasses(response as unknown as GatePass[]);
            
            // Calculate stats from the fetched data
            const pendingCount = response.filter(pass => 
              pass.status.toLowerCase().includes('pending')).length;
            const approvedCount = response.filter(pass => 
              pass.status.toLowerCase() === 'approved').length;
            const usedCount = response.filter(pass => 
              pass.status.toLowerCase() === 'used').length;
            
            setStats({
              pendingGatePasses: pendingCount,
              approvedGatePasses: approvedCount,
              usedGatePasses: usedCount,
              recentEntries: usedCount, // Use used passes as recent entries
            });
            
            if (response.length > 0) {
              toast.success(`Loaded ${response.length} gate passes`);
            } else {
              toast(`No ${activeTab} gate passes available`);
            }
          } else {
            console.warn('API returned empty or invalid data, using demo data');
            useDemoData();
          }
        } catch (apiError) {
          console.error('API Error:', apiError);
          toast.error('Failed to fetch data from API. Using demo data instead.');
          useDemoData();
        }
      } else {
        console.warn('No token available, using demo data');
        useDemoData();
      }
    } catch (error) {
      console.error('Error in fetchGatePasses:', error);
      toast.error('Error loading gate passes. Using demo data.');
      useDemoData();
    } finally {
      setLoading(false);
    }
  };

  // Add this helper function to provide demo data when API is not available
  const useDemoData = () => {
    let demoData: GatePass[] = [];
    
    // Generate different demo data based on the active tab
    if (activeTab === 'approved') {
      demoData = [
        {
          id: 5,
          student: {
            id: 1,
            sin_number: "E21IT030",
            name: "Kaviraj Mani",
            email: "kaviraj@example.com"
          },
          department: {
            id: 1,
            name: "Information Technology"
          },
          status: "approved",
          type: "leave",
          reason: "Medical Emergency",
          description: "Medical emergency",
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          staff_comment: "",
          hod_comment: "Approved by HOD",
          academic_director_comment: "Approved",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 6,
          student: {
            id: 2,
            sin_number: "E21IT031",
            name: "Jane Smith",
            email: "jane@example.com"
          },
          department: {
            id: 1,
            name: "Information Technology"
          },
          status: "approved",
          type: "emergency",
          reason: "Family Emergency",
          description: "Need to visit home",
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          staff_comment: "Verified emergency",
          hod_comment: "Approved",
          academic_director_comment: "Take care",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    } else if (activeTab === 'pending') {
      demoData = [
        {
          id: 7,
          student: {
            id: 3,
            sin_number: "E21IT032",
            name: "Alex Johnson",
            email: "alex@example.com"
          },
          department: {
            id: 1,
            name: "Information Technology"
          },
          status: "pending_staff",
          type: "leave",
          reason: "Personal Work",
          description: "Need to attend a family function",
          start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 8,
          student: {
            id: 4,
            sin_number: "E21IT033",
            name: "Sarah Williams",
            email: "sarah@example.com"
          },
          department: {
            id: 1,
            name: "Information Technology"
          },
          status: "pending_hod",
          type: "emergency",
          reason: "Medical Appointment",
          description: "Doctor's appointment",
          start_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          staff_comment: "Verified medical need",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    } else if (activeTab === 'used') {
      demoData = [
        {
          id: 9,
          student: {
            id: 5,
            sin_number: "E21IT034",
            name: "Michael Brown",
            email: "michael@example.com"
          },
          department: {
            id: 1,
            name: "Information Technology"
          },
          status: "used",
          type: "leave",
          reason: "Family Function",
          description: "Attending sister's wedding",
          start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          staff_comment: "Approved",
          hod_comment: "Approved",
          academic_director_comment: "Approved",
          security_comment: "Verified at exit gate",
          checkout_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
    }
    
    setGatePasses(demoData);
    
    // Calculate stats from demo data
    const pendingCount = demoData.filter(pass => 
      pass.status.toLowerCase().includes('pending')).length;
    const approvedCount = demoData.filter(pass => 
      pass.status.toLowerCase() === 'approved').length;
    const usedCount = demoData.filter(pass => 
      pass.status.toLowerCase() === 'used').length;
      
    setStats({
      pendingGatePasses: pendingCount,
      approvedGatePasses: approvedCount,
      usedGatePasses: usedCount,
      recentEntries: usedCount,
    });
    
    console.log(`Using demo data for ${activeTab} tab:`, demoData);
  };

  const openVerifyModal = (gatePass: GatePass) => {
    setSelectedGatePass(gatePass);
    setSecurityComment(`Student ${gatePass.student.name} (${gatePass.student.sin_number}) is leaving campus at ${new Date().toLocaleTimeString()}`);
    setIsVerifyModalOpen(true);
  };

  const openDetailModal = (gatePass: GatePass) => {
    setSelectedGatePass(gatePass);
    setIsDetailModalOpen(true);
  };

  const closeVerifyModal = () => {
    setIsVerifyModalOpen(false);
    setSelectedGatePass(null);
    setSecurityComment('');
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedGatePass(null);
  };

  const handleVerifyGatePass = async () => {
    if (!selectedGatePass || !token) return;
    
    // Validate security comment
    if (!securityComment.trim()) {
      toast.error('Please add a security comment before verification');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Use the format expected by the backend API
      const updateData = {
        status: 'used',
        security_comment: securityComment
      };
      
      console.log(`Verifying gate pass ${selectedGatePass.id}, adding comment: ${securityComment}`);
      
      // Call API to verify gate pass
      await gatePassApi.verifyBySecurity(token, selectedGatePass.id, updateData);
      
      toast.success('Gate pass verified successfully');
      
      // Update the local state after verification
      setGatePasses(prevPasses => 
        prevPasses.map(pass => 
          pass.id === selectedGatePass.id 
            ? {...pass, status: 'USED', security_comment: securityComment} 
            : pass
        )
      );
      
      // Update stats
      setStats(prevStats => ({
        ...prevStats,
        approvedGatePasses: Math.max(0, prevStats.approvedGatePasses - 1),
        usedGatePasses: prevStats.usedGatePasses + 1,
        recentEntries: prevStats.recentEntries + 1,
      }));
      
      // Close the modal
      closeVerifyModal();
      
      // Refresh the gate passes after a successful verification
      setTimeout(() => {
        fetchGatePasses();
      }, 1000);
    } catch (error) {
      console.error('Error verifying gate pass:', error);
      toast.error('Failed to verify gate pass. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFilteredPasses = () => {
    // Filter directly based on search query 
    // (no need to filter by status as each API endpoint already returns the correct data)
    let filtered = [...gatePasses];
    
    // Filter by search query if present
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(pass => 
        pass.student.name.toLowerCase().includes(query) ||
        (pass.student.sin_number && pass.student.sin_number.toLowerCase().includes(query)) ||
        (pass.department?.name && pass.department.name.toLowerCase().includes(query)) ||
        pass.id.toString().includes(query) ||
        pass.reason.toLowerCase().includes(query) ||
        pass.status.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const getTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    const filteredPasses = getFilteredPasses();

    if (filteredPasses.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-600">
          <ClipboardCheck size={48} />
          <p className="mt-4 text-base font-medium">No gate passes to display</p>
          {activeTab === 'approved' && (
            <p className="mt-2 text-sm text-gray-500">Approved gate passes ready for verification will appear here</p>
          )}
          {activeTab === 'pending' && (
            <p className="mt-2 text-sm text-gray-500">Gate passes currently in the approval workflow will appear here</p>
          )}
          {activeTab === 'used' && (
            <p className="mt-2 text-sm text-gray-500">Gate passes that have been used in the last 7 days will appear here</p>
          )}
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-gray-800">ID</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-800">Student</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-800">SIN Number</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-800">Department</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-800">Purpose</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-800">Valid From</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-800">Valid Until</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-800">Status</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-800">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPasses.map((pass) => (
              <tr key={pass.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">{pass.id}</td>
                <td className="py-3 px-4 font-medium text-gray-900">{pass.student.name}</td>
                <td className="py-3 px-4 text-gray-700">{pass.student.sin_number || 'N/A'}</td>
                <td className="py-3 px-4 text-gray-700">{pass.department.name}</td>
                <td className="py-3 px-4 text-gray-700">{pass.reason}</td>
                <td className="py-3 px-4 text-gray-700">{formatDate(pass.start_date)}</td>
                <td className="py-3 px-4 text-gray-700">{formatDate(pass.end_date)}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      pass.status.toLowerCase() === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : pass.status.toLowerCase().includes('pending_staff')
                        ? 'bg-yellow-100 text-yellow-800'
                        : pass.status.toLowerCase().includes('pending_hod')
                        ? 'bg-orange-100 text-orange-800'
                        : pass.status.toLowerCase().includes('pending_academic_director')
                        ? 'bg-blue-100 text-blue-800'
                        : pass.status.toLowerCase().includes('pending_hostel_warden')
                        ? 'bg-purple-100 text-purple-800'
                        : pass.status.toLowerCase() === 'used'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {pass.status.toUpperCase().replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="py-3 px-4 space-x-2">
                  <button
                    onClick={() => openDetailModal(pass)}
                    className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-sm font-medium hover:bg-gray-300"
                  >
                    Details
                  </button>
                  
                  {pass.status.toLowerCase() === 'approved' && (
                    <button
                      onClick={() => openVerifyModal(pass)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
                    >
                      Verify Exit
                    </button>
                  )}
                  
                  {pass.status.toLowerCase() === 'used' && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm font-medium">
                      Verified
                    </span>
                  )}
                  
                  {pass.status.toLowerCase().includes('pending') && (
                    <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-sm font-medium">
                      In Approval
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Banner */}
      <div className="mb-8 bg-gradient-to-r from-slate-700 to-slate-900 rounded-xl shadow-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          {greeting}, {user?.name}!
        </h1>
        <p className="text-slate-100 text-lg">
          Welcome to the Security Dashboard. Manage campus security and gate passes.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
          <div className="rounded-full bg-yellow-100 p-3 mr-4">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Pending Passes</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pendingGatePasses}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
          <div className="rounded-full bg-green-100 p-3 mr-4">
            <ClipboardCheck className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Approved Passes</p>
            <p className="text-2xl font-bold text-gray-900">{stats.approvedGatePasses}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Used Passes</p>
            <p className="text-2xl font-bold text-gray-900">{stats.usedGatePasses}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
          <div className="rounded-full bg-purple-100 p-3 mr-4">
            <UserCheck className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Recent Entries</p>
            <p className="text-2xl font-bold text-gray-900">{stats.recentEntries}</p>
          </div>
        </div>
      </div>

      {/* Gate Pass Management */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Gate Pass Management</h2>
          <p className="text-gray-700">Verify and manage student exit gate passes</p>
        </div>
        
        {/* Search and Filter Section */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search by name, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <nav className="flex space-x-2" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('approved')}
              className={`py-2 px-4 rounded font-medium ${
                activeTab === 'approved'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-2 px-4 rounded font-medium ${
                activeTab === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              In Approval
            </button>
            <button
              onClick={() => setActiveTab('used')}
              className={`py-2 px-4 rounded font-medium ${
                activeTab === 'used'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Used
            </button>
            <button
              onClick={fetchGatePasses}
              className="py-2 px-4 text-blue-600 hover:bg-blue-50 rounded font-medium"
              title="Refresh list"
            >
              ↻ Refresh
            </button>
          </nav>
        </div>
        
        <div className="p-4">{getTabContent()}</div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium">
            <ShieldCheck className="h-5 w-5 mr-2" />
            Scan ID Card
          </button>
          <button className="flex items-center justify-center bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 font-medium">
            <UserCheck className="h-5 w-5 mr-2" />
            View Visitor Log
          </button>
          <button className="flex items-center justify-center bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 font-medium">
            <Calendar className="h-5 w-5 mr-2" />
            Security Schedule
          </button>
        </div>
      </div>
      
      {/* Verify Gate Pass Modal */}
      {isVerifyModalOpen && selectedGatePass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Verify Gate Pass #{selectedGatePass.id}</h3>
              <button 
                onClick={closeVerifyModal}
                className="text-gray-500 hover:text-gray-700"
                disabled={isSubmitting}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-800 mb-2 font-medium">
                  <strong className="text-gray-900">Student:</strong> {selectedGatePass.student.name}
                </p>
                <p className="text-gray-800 mb-2 font-medium">
                  <strong className="text-gray-900">SIN Number:</strong> {selectedGatePass.student.sin_number || 'N/A'}
                </p>
                <p className="text-gray-800 mb-2 font-medium">
                  <strong className="text-gray-900">Department:</strong> {selectedGatePass.department?.name || 'N/A'}
                </p>
                <p className="text-gray-800 mb-2 font-medium">
                  <strong className="text-gray-900">Reason:</strong> {selectedGatePass.reason}
                </p>
                <p className="text-gray-800 mb-2 font-medium">
                  <strong className="text-gray-900">Valid Period:</strong> {formatDate(selectedGatePass.start_date)} to {formatDate(selectedGatePass.end_date)}
                </p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="securityComment" className="block text-sm font-medium text-gray-800 mb-1">
                  Security Comment <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="securityComment"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                  rows={3}
                  value={securityComment}
                  onChange={(e) => setSecurityComment(e.target.value)}
                  placeholder="Add your verification comments..."
                  disabled={isSubmitting}
                  required
                ></textarea>
                {!securityComment.trim() && (
                  <p className="mt-1 text-sm text-red-500">Security comment is required</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeVerifyModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyGatePass}
                  className={`px-4 py-2 text-white rounded-md flex items-center font-medium ${
                    !securityComment.trim() ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  disabled={isSubmitting || !securityComment.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Used
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Gate Pass Details Modal */}
      {isDetailModalOpen && selectedGatePass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Gate Pass #{selectedGatePass.id} Details</h3>
              <button 
                onClick={closeDetailModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">Student Information</h4>
                  <p className="text-gray-900 font-semibold">{selectedGatePass.student.name}</p>
                  <p className="text-gray-800">{selectedGatePass.student.email}</p>
                  <p className="text-gray-800">SIN: {selectedGatePass.student.sin_number || 'N/A'}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">Department</h4>
                  <p className="text-gray-900 font-semibold">{selectedGatePass.department?.name || 'N/A'}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-600 mb-2">Gate Pass Details</h4>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Gate Pass Type</p>
                      <p className="text-gray-900 font-semibold">{selectedGatePass.type}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600">Current Status</p>
                      <p className="text-gray-900 font-semibold">{selectedGatePass.status}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Start Date & Time</p>
                      <p className="text-gray-900 font-semibold">{new Date(selectedGatePass.start_date).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600">End Date & Time</p>
                      <p className="text-gray-900 font-semibold">{new Date(selectedGatePass.end_date).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-600 mb-2">Reason for Leave</h4>
                <p className="bg-gray-50 p-3 rounded-lg text-gray-800 border border-gray-100">{selectedGatePass.reason}</p>
              </div>
              
              {selectedGatePass.description && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">Additional Description</h4>
                  <p className="bg-gray-50 p-3 rounded-lg text-gray-800 border border-gray-100">{selectedGatePass.description}</p>
                </div>
              )}
              
              <div className="flex justify-end">
                {selectedGatePass.status.toLowerCase() === 'approved' && (
                  <button
                    onClick={() => {
                      closeDetailModal();
                      openVerifyModal(selectedGatePass);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center font-medium"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify Exit
                  </button>
                )}
                {selectedGatePass.status.toLowerCase() !== 'approved' && (
                  <button
                    onClick={closeDetailModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
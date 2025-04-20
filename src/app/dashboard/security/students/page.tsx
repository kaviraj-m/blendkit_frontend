import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { RiArrowGoBackLine, RiSearchLine, RiUser3Line, RiFileList3Line } from 'react-icons/ri';

// Mock student data
const MOCK_STUDENTS = [
  {
    id: 'STD-2023-101',
    name: 'John Smith',
    program: 'Computer Science',
    year: '3rd Year',
    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
    gatePasses: [
      { id: 'GP-2023-005', date: '2023-10-15', status: 'approved', currentlyOutside: false },
      { id: 'GP-2023-021', date: '2023-10-10', status: 'expired', currentlyOutside: false },
      { id: 'GP-2023-042', date: '2023-10-05', status: 'completed', currentlyOutside: false },
    ]
  },
  {
    id: 'STD-2023-102',
    name: 'Sarah Williams',
    program: 'Business Administration',
    year: '2nd Year',
    photo: 'https://randomuser.me/api/portraits/women/44.jpg',
    gatePasses: [
      { id: 'GP-2023-018', date: '2023-10-14', status: 'approved', currentlyOutside: true },
      { id: 'GP-2023-033', date: '2023-10-08', status: 'completed', currentlyOutside: false },
    ]
  },
  {
    id: 'STD-2023-103',
    name: 'Michael Johnson',
    program: 'Electrical Engineering',
    year: '4th Year',
    photo: 'https://randomuser.me/api/portraits/men/75.jpg',
    gatePasses: [
      { id: 'GP-2023-027', date: '2023-10-12', status: 'rejected', currentlyOutside: false },
      { id: 'GP-2023-039', date: '2023-10-07', status: 'completed', currentlyOutside: false },
      { id: 'GP-2023-051', date: '2023-10-02', status: 'completed', currentlyOutside: false },
    ]
  },
  {
    id: 'STD-2023-104',
    name: 'Emily Brown',
    program: 'Psychology',
    year: '1st Year',
    photo: 'https://randomuser.me/api/portraits/women/22.jpg',
    gatePasses: []
  },
  {
    id: 'STD-2023-105',
    name: 'David Wilson',
    program: 'Mechanical Engineering',
    year: '3rd Year',
    photo: 'https://randomuser.me/api/portraits/men/53.jpg',
    gatePasses: [
      { id: 'GP-2023-044', date: '2023-10-13', status: 'pending', currentlyOutside: false },
    ]
  }
];

export default function SecurityStudentsPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState(MOCK_STUDENTS);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Check authentication
  useEffect(() => {
    if (!isLoading) {
      if (!user || !token) {
        router.push('/login');
        return;
      }

      // Check if user role is an object with a name property
      const roleName = typeof user.role === 'object' && user.role !== null 
        ? user.role.name 
        : typeof user.role === 'string' 
          ? user.role 
          : null;

      if (!roleName || roleName !== 'security') {
        router.push('/dashboard');
        return;
      }
    }
  }, [user, token, isLoading, router]);

  // Filter students based on search term
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      setStudents(MOCK_STUDENTS);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = MOCK_STUDENTS.filter(student => 
      student.id.toLowerCase().includes(term) || 
      student.name.toLowerCase().includes(term) ||
      student.program.toLowerCase().includes(term)
    );
    
    setStudents(filtered);
  };

  // View student details
  const handleViewStudent = (student) => {
    setSelectedStudent(student);
  };
  
  // Go back to student list
  const handleBackToList = () => {
    setSelectedStudent(null);
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center items-center">Loading...</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Student Lookup</h1>
        <Link href="/dashboard/security" className="flex items-center gap-2 text-blue-600">
          <RiArrowGoBackLine /> Back to Dashboard
        </Link>
      </div>

      {!selectedStudent ? (
        <>
          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by ID, name or program"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Search
              </button>
              {searchTerm && (
                <button 
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setStudents(MOCK_STUDENTS);
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors"
                >
                  Clear
                </button>
              )}
            </form>
          </div>

          {/* Students List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Students ({students.length})</h2>
            
            {students.length === 0 ? (
              <div className="text-center py-8">
                <RiUser3Line className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p className="text-gray-500">No students found matching your search criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map((student) => (
                  <div 
                    key={student.id} 
                    className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleViewStudent(student)}
                  >
                    <div className="flex p-4">
                      <img 
                        src={student.photo} 
                        alt={student.name} 
                        className="w-16 h-16 rounded-full object-cover mr-4"
                      />
                      <div>
                        <h3 className="font-medium text-lg">{student.name}</h3>
                        <p className="text-gray-600 text-sm">{student.id}</p>
                        <p className="text-gray-600 text-sm">{student.program}, {student.year}</p>
                        
                        {student.gatePasses.some(pass => pass.currentlyOutside) && (
                          <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            Currently Outside
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-2 text-sm flex justify-between">
                      <span>Gate Passes: {student.gatePasses.length}</span>
                      <span className="text-blue-600">View Details →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Student Details */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
              <button 
                onClick={handleBackToList}
                className="flex items-center gap-1 text-blue-600"
              >
                <RiArrowGoBackLine /> Back to Students
              </button>
              <span className="text-sm text-gray-500">Student ID: {selectedStudent.id}</span>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="md:w-1/4 flex flex-col items-center">
                  <img 
                    src={selectedStudent.photo} 
                    alt={selectedStudent.name} 
                    className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-gray-200"
                  />
                  <h2 className="text-xl font-bold text-center">{selectedStudent.name}</h2>
                  <p className="text-gray-600 text-center">{selectedStudent.program}</p>
                  <p className="text-gray-600 text-center">{selectedStudent.year}</p>
                  
                  {selectedStudent.gatePasses.some(pass => pass.currentlyOutside) && (
                    <span className="mt-4 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                      Currently Outside Campus
                    </span>
                  )}
                </div>
                
                <div className="md:w-3/4">
                  <h3 className="text-lg font-semibold mb-4">Gate Pass History</h3>
                  
                  {selectedStudent.gatePasses.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-lg">
                      <RiFileList3Line className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-gray-500">No gate pass records found for this student</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Gate Pass ID
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Campus Status
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedStudent.gatePasses.map((pass) => (
                            <tr key={pass.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                {pass.id}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {pass.date}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(pass.status)}`}>
                                  {pass.status.charAt(0).toUpperCase() + pass.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {pass.currentlyOutside ? 'Outside Campus' : 'Inside Campus'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <div className="flex gap-2">
                                  <Link href={`/dashboard/security/scan?id=${pass.id}`} className="text-blue-600 hover:text-blue-800">
                                    Verify
                                  </Link>
                                  <Link href={`/dashboard/gate-pass/${pass.id}`} className="text-purple-600 hover:text-purple-800">
                                    Details
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link 
                href={`/dashboard/security/scan?student=${selectedStudent.id}`}
                className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
              >
                <div className="p-3 rounded-full bg-blue-100">
                  <RiSearchLine className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">Scan Gate Pass</h4>
                  <p className="text-sm text-gray-600">Verify this student's gate pass</p>
                </div>
              </Link>
              
              <Link 
                href={`/dashboard/security/history?student=${selectedStudent.id}`}
                className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 transition-colors"
              >
                <div className="p-3 rounded-full bg-green-100">
                  <RiFileList3Line className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">View Full History</h4>
                  <p className="text-sm text-gray-600">See complete gate pass history</p>
                </div>
              </Link>
            </div>
          </div>
        </>
      )}
      
      {/* Debug info - only shown in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <p>User ID: {user?.id}</p>
          <p>Role: {typeof user?.role === 'object' && user.role !== null ? user.role.name : user?.role}</p>
          <p>Selected Student: {selectedStudent?.id || 'None'}</p>
        </div>
      )}
    </div>
  );
} 
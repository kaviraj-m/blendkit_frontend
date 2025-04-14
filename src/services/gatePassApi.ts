import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Enum for gate pass types
export enum GatePassType {
  LEAVE = 'leave',
  HOME_VISIT = 'home_visit',
  EMERGENCY = 'emergency',
  OTHER = 'other'
}

// Enum for gate pass status
export enum GatePassStatus {
  PENDING_STAFF = 'PENDING_STAFF',
  APPROVED_BY_STAFF = 'APPROVED_BY_STAFF',
  REJECTED_BY_STAFF = 'REJECTED_BY_STAFF',
  PENDING_HOD = 'PENDING_HOD',
  APPROVED_BY_HOD = 'APPROVED_BY_HOD',
  REJECTED_BY_HOD = 'REJECTED_BY_HOD',
  PENDING_ACADEMIC_DIRECTOR = 'PENDING_ACADEMIC_DIRECTOR',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PENDING_HOSTEL_WARDEN = 'PENDING_HOSTEL_WARDEN',
  APPROVED_BY_HOSTEL_WARDEN = 'APPROVED_BY_HOSTEL_WARDEN',
  REJECTED_BY_HOSTEL_WARDEN = 'REJECTED_BY_HOSTEL_WARDEN',
  USED = 'USED',
  EXPIRED = 'EXPIRED'
}

// Interface for Gate Pass
export interface GatePass {
  id: number;
  type: GatePassType;
  reason: string;
  description: string;
  start_date: string;
  end_date: string;
  status: GatePassStatus;
  remarks?: string;
  created_at: string;
  updated_at: string;
  student_id: number;
  department_id?: number;
  approved_by_staff_id?: number;
  approved_by_hod_id?: number;
  approved_by_academic_director_id?: number;
  approved_by_hostel_warden_id?: number;
  verified_by_security_id?: number;
}

// Interface for creating gate pass
export interface CreateGatePassDto {
  type: GatePassType;
  reason: string;
  description: string;
  start_date: string;
  end_date: string;
}

// Interface for filtering gate passes
export interface GatePassFilterDto {
  status?: GatePassStatus;
  type?: GatePassType;
  startDate?: string;
  endDate?: string;
  studentId?: number;
  departmentId?: number;
}

// DTOs for different role approvals
export interface UpdateGatePassStatusByStaffDto {
  status: GatePassStatus.APPROVED_BY_STAFF | GatePassStatus.REJECTED_BY_STAFF;
  remarks?: string;
}

export interface UpdateGatePassStatusByHodDto {
  status: GatePassStatus.APPROVED_BY_HOD | GatePassStatus.REJECTED_BY_HOD;
  remarks?: string;
}

export interface UpdateGatePassStatusByAcademicDirectorDto {
  status: GatePassStatus.APPROVED | GatePassStatus.REJECTED;
  remarks?: string;
}

export interface UpdateGatePassStatusByHostelWardenDto {
  status: GatePassStatus.APPROVED_BY_HOSTEL_WARDEN | GatePassStatus.REJECTED_BY_HOSTEL_WARDEN;
  remarks?: string;
}

export interface UpdateGatePassBySecurityDto {
  status?: string;
  security_comment?: string;
  remarks?: string; // Keep for backward compatibility
}

// Create authorized axios instance
const createAuthorizedAxios = (token: string) => {
  return axios.create({
    baseURL: `${API_URL}/api/gate-passes`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
};

// Gate Pass API
export const gatePassApi = {
  // Get all gate passes (for admin)
  getAll: async (token: string, filters?: GatePassFilterDto): Promise<GatePass[]> => {
    try {
      const authAxios = createAuthorizedAxios(token);
      const response = await authAxios.get('/', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching gate passes:', error);
      throw error;
    }
  },

  // Get current user's gate pass requests (for students)
  getMyRequests: async (token: string): Promise<GatePass[]> => {
    try {
      const authAxios = createAuthorizedAxios(token);
      const response = await authAxios.get('/my-requests');
      return response.data;
    } catch (error) {
      console.error('Error fetching user gate pass requests:', error);
      throw error;
    }
  },

  // Get gate passes pending staff approval
  getPendingStaffApproval: async (token: string): Promise<GatePass[]> => {
    try {
      const authAxios = createAuthorizedAxios(token);
      const response = await authAxios.get('/pending-staff-approval');
      return response.data;
    } catch (error) {
      console.error('Error fetching gate passes pending staff approval:', error);
      throw error;
    }
  },

  // Get gate passes pending HOD approval
  getPendingHodApproval: async (token: string): Promise<GatePass[]> => {
    try {
      const authAxios = createAuthorizedAxios(token);
      const response = await authAxios.get('/pending-hod-approval');
      return response.data;
    } catch (error) {
      console.error('Error fetching gate passes pending HOD approval:', error);
      throw error;
    }
  },

  // Get gate passes pending Academic Director approval
  getPendingAcademicDirectorApproval: async (token: string): Promise<GatePass[]> => {
    try {
      const authAxios = createAuthorizedAxios(token);
      const response = await authAxios.get('/pending-academic-director-approval');
      return response.data;
    } catch (error) {
      console.error('Error fetching gate passes pending Academic Director approval:', error);
      throw error;
    }
  },

  // Get gate passes pending Hostel Warden approval
  getPendingHostelWardenApproval: async (token: string): Promise<GatePass[]> => {
    try {
      const authAxios = createAuthorizedAxios(token);
      const response = await authAxios.get('/pending-hostel-warden-approval');
      return response.data;
    } catch (error) {
      console.error('Error fetching gate passes pending Hostel Warden approval:', error);
      throw error;
    }
  },

  // Get gate passes for security verification
  getForSecurityVerification: async (token: string): Promise<GatePass[]> => {
    try {
      const authAxios = createAuthorizedAxios(token);
      const response = await authAxios.get('/for-security-verification');
      return response.data;
    } catch (error) {
      console.error('Error fetching gate passes for security verification:', error);
      throw error;
    }
  },

  // Get pending gate passes for security (status starting with 'pending')
  getSecurityPending: async (token: string): Promise<GatePass[]> => {
    try {
      const authAxios = createAuthorizedAxios(token);
      const response = await authAxios.get('/security-pending');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending gate passes for security:', error);
      throw error;
    }
  },

  // Get used gate passes for security (already verified)
  getSecurityUsed: async (token: string): Promise<GatePass[]> => {
    try {
      const authAxios = createAuthorizedAxios(token);
      const response = await authAxios.get('/security-used');
      return response.data;
    } catch (error) {
      console.error('Error fetching used gate passes for security:', error);
      throw error;
    }
  },

  // Get a specific gate pass by ID
  getById: async (token: string, id: number): Promise<GatePass> => {
    try {
      const authAxios = createAuthorizedAxios(token);
      const response = await authAxios.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching gate pass ${id}:`, error);
      throw error;
    }
  },

  // Create a new gate pass request (for students)
  create: async (token: string, gatePassData: CreateGatePassDto): Promise<GatePass> => {
    try {
      const authAxios = createAuthorizedAxios(token);
      const response = await authAxios.post('/', gatePassData);
      return response.data;
    } catch (error) {
      console.error('Error creating gate pass:', error);
      throw error;
    }
  },

  // Update gate pass status by staff
  updateByStaff: async (token: string, id: number, updateData: any): Promise<GatePass> => {
    try {
      console.log(`Staff updating gate pass ${id} with data:`, JSON.stringify(updateData));
      const authAxios = createAuthorizedAxios(token);
      
      // Ensure proper object format for API - using staff_comment instead of remarks
      const payload = {
        status: updateData.status.toLowerCase(),
        staff_comment: updateData.remarks || ''
      };
      
      console.log(`Sending formatted payload to API:`, JSON.stringify(payload));
      const response = await authAxios.patch(`/${id}/staff-approval`, payload);
      return response.data;
    } catch (error) {
      console.error(`Error updating gate pass ${id} by staff:`, error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
      throw error;
    }
  },

  // Update gate pass status by HOD
  updateByHod: async (token: string, id: number, updateData: UpdateGatePassStatusByHodDto): Promise<GatePass> => {
    try {
      console.log(`HOD updating gate pass ${id} with data:`, JSON.stringify(updateData));
      const authAxios = createAuthorizedAxios(token);
      
      // Ensure proper object format for API - using hod_comment instead of remarks
      const payload = {
        status: updateData.status.toLowerCase(),
        hod_comment: updateData.remarks || ''
      };
      
      console.log(`Sending formatted payload to API:`, JSON.stringify(payload));
      const response = await authAxios.patch(`/${id}/hod-approval`, payload);
      return response.data;
    } catch (error) {
      console.error(`Error updating gate pass ${id} by HOD:`, error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
      throw error;
    }
  },

  // Update gate pass status by Academic Director
  updateByAcademicDirector: async (token: string, id: number, updateData: UpdateGatePassStatusByAcademicDirectorDto): Promise<GatePass> => {
    try {
      console.log(`Academic Director updating gate pass ${id} with data:`, JSON.stringify(updateData));
      const authAxios = createAuthorizedAxios(token);
      
      // Ensure proper object format for API - using academic_director_comment instead of remarks
      const payload = {
        status: updateData.status.toLowerCase(),
        academic_director_comment: updateData.remarks || ''
      };
      
      console.log(`Sending formatted payload to API:`, JSON.stringify(payload));
      const response = await authAxios.patch(`/${id}/academic-director-approval`, payload);
      return response.data;
    } catch (error) {
      console.error(`Error updating gate pass ${id} by Academic Director:`, error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
      throw error;
    }
  },

  // Update gate pass by Hostel Warden
  updateByHostelWarden: async (token: string, id: number, updateData: UpdateGatePassStatusByHostelWardenDto): Promise<GatePass> => {
    try {
      const authAxios = createAuthorizedAxios(token);
      const response = await authAxios.patch(`/${id}/hostel-warden-approval`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Error updating gate pass ${id} by Hostel Warden:`, error);
      throw error;
    }
  },

  // Verify gate pass by Security
  verifyBySecurity: async (token: string, id: number, updateData?: UpdateGatePassBySecurityDto): Promise<GatePass> => {
    try {
      const authAxios = createAuthorizedAxios(token);
      
      // Ensure proper payload format regardless of what fields are provided
      const processedUpdateData = {
        status: 'used',
        security_comment: updateData?.security_comment || updateData?.remarks || ''
      };
      
      console.log(`Security verifying gate pass ${id} with data:`, JSON.stringify(processedUpdateData));
      const response = await authAxios.patch(`/${id}/security-verification`, processedUpdateData);
      return response.data;
    } catch (error) {
      console.error(`Error verifying gate pass ${id} by Security:`, error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw error;
    }
  },

  // Get gate passes pending HOD approval (alias for getPendingHodApproval)
  getHodPendingApproval: async (token: string): Promise<GatePass[]> => {
    return gatePassApi.getPendingHodApproval(token);
  },
  
  // HOD approve/reject gate pass (alias for updateByHod)
  hodApprove: async (token: string, id: number, data: { approved: boolean, comments: string }): Promise<GatePass> => {
    const updateData: UpdateGatePassStatusByHodDto = {
      status: data.approved ? GatePassStatus.APPROVED_BY_HOD : GatePassStatus.REJECTED_BY_HOD,
      remarks: data.comments
    };
    return gatePassApi.updateByHod(token, id, updateData);
  },
  
  // Academic Director approve/reject gate pass (alias for updateByAcademicDirector)
  academicDirectorApprove: async (token: string, id: number, data: { approved: boolean, comments: string }): Promise<GatePass> => {
    const updateData: UpdateGatePassStatusByAcademicDirectorDto = {
      status: data.approved ? GatePassStatus.APPROVED : GatePassStatus.REJECTED,
      remarks: data.comments
    };
    return gatePassApi.updateByAcademicDirector(token, id, updateData);
  }
}; 
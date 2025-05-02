import apiClient from '../../../core/axios';
import { AxiosRequestConfig } from 'axios';

export interface EmployeeCreateData {
  employeeCode: string;
  name: string;
  email: string;
  position: string;
  teamId?: number;
  phoneNumber?: string;
  emergencyContact?: Object;
  skills?: Array<{ id: number; level: string; years: number }>;
  status?: string;
  endDate?: string;
  currentProject?: string;
  address?: string;
  phone?: string;
  utilization?: number;
}

export interface EmployeeUpdateData extends Partial<EmployeeCreateData> {
  id?: number;
}

export interface EmployeeListParams {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: 'Allocated' | 'Available' | 'EndingSoon' | 'OnLeave' | 'Resigned';
  teamId?: number;
  position?: string;
  skills?: number[];
  minExperience?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  marginStatus?: 'Red' | 'Yellow' | 'Green';
}

export interface EmployeeResponse {
  id: number;
  employeeCode: string;
  name: string;
  email: string;
  phoneNumber?: string;
  position: string;
  team?: {
    id: number;
    name: string;
  };
  status: string;
  currentProject: string | null;
  utilization: number;
  endDate: string | null;
  skills?: Array<{
    id: number;
    name: string;
    level: string;
    years: number;
  }>;
  marginStatus?: 'Red' | 'Yellow' | 'Green';
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeStatusUpdateData {
  status: 'Allocated' | 'Available' | 'EndingSoon' | 'OnLeave' | 'Resigned';
  currentProject?: string;
  projectId?: number;
  allocation?: number;
  endDate?: string;
}

export interface ImportEmployeesResponse {
  success: boolean;
  totalRecords: number;
  successCount: number;
  errorCount: number;
  errors: Array<{
    row: number;
    employeeCode?: string;
    errorMessage: string;
  }>;
  createdEmployees: Array<{
    id: number;
    employeeCode: string;
    name: string;
  }>;
}

export interface EmployeeProjectHistoryResponse {
  id: number;
  projectId: number;
  projectName: string;
  clientName: string;
  role: string;
  startDate: string;
  endDate?: string;
  allocation: number;
  status: 'active' | 'completed' | 'on_hold';
  description?: string;
}

/**
 * Get employees with filtering and pagination
 */
export const getEmployees = async (params?: EmployeeListParams, config?: AxiosRequestConfig): Promise<{
  content: EmployeeResponse[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    sort?: string;
  };
}> => {
  return apiClient.get('/api/v1/employees', { 
    ...config,
    params,
  });
};

/**
 * Get a single employee by ID
 */
export const getEmployeeById = async (id: number, config?: AxiosRequestConfig): Promise<EmployeeResponse> => {
  return apiClient.get(`/api/v1/employees/${id}`, config);
};

/**
 * Create a new employee
 */
export const createEmployee = async (data: EmployeeCreateData, config?: AxiosRequestConfig): Promise<EmployeeResponse> => {
  return apiClient.post('/api/v1/employees', data, config);
};

/**
 * Update an employee
 */
export const updateEmployee = async (id: number, data: EmployeeUpdateData, config?: AxiosRequestConfig): Promise<EmployeeResponse> => {
  return apiClient.put(`/api/v1/employees/${id}`, data, config);
};

/**
 * Delete an employee
 */
export const deleteEmployee = async (id: number, config?: AxiosRequestConfig): Promise<void> => {
  return apiClient.delete(`/api/v1/employees/${id}`, config);
};

/**
 * Upload employee avatar
 */
export const uploadAvatar = async (employeeId: number, file: File, config?: AxiosRequestConfig): Promise<{ avatarUrl: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  
  return apiClient.post(
    `/api/v1/employees/${employeeId}/avatar`, 
    formData,
    {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data'
      }
    }
  );
};

/**
 * Get employees available for projects based on skills and date range
 */
export const getAvailableEmployees = async (params?: { 
  startDate?: string; 
  endDate?: string; 
  requiredSkills?: number[];
  minExperience?: number; 
}, config?: AxiosRequestConfig): Promise<EmployeeResponse[]> => {
  return apiClient.get('/api/v1/employees/available', { 
    ...config,
    params,
  });
};

/**
 * Suggest employees based on skills (for projects/opportunities)
 */
export const suggestEmployees = async (params?: {
  requiredSkills: number[];
  projectId?: number;
  opportunityId?: number;
  count?: number;
}, config?: AxiosRequestConfig): Promise<EmployeeResponse[]> => {
  return apiClient.get('/api/v1/employees/search/suggest', {
    ...config,
    params,
  });
};

/**
 * Import employees from file
 */
export const importEmployees = async (file: File, config?: AxiosRequestConfig): Promise<ImportEmployeesResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  return apiClient.post(
    '/api/v1/employees/import',
    formData,
    {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data'
      }
    }
  );
};

/**
 * Export employees to file
 */
export const exportEmployees = async (params?: EmployeeListParams, config?: AxiosRequestConfig): Promise<Blob> => {
  return apiClient.get('/api/v1/employees/export', {
    ...config,
    params,
    responseType: 'blob'
  });
};

/**
 * Update employee status
 */
export const updateEmployeeStatus = async (
  employeeId: number,
  data: EmployeeStatusUpdateData,
  config?: AxiosRequestConfig
): Promise<EmployeeResponse> => {
  return apiClient.put(`/api/v1/employees/${employeeId}/status`, data, config);
};

/**
 * Get employee project history
 */
export const getEmployeeProjectHistory = async (
  employeeId: number,
  config?: AxiosRequestConfig
): Promise<EmployeeProjectHistoryResponse[]> => {
  return apiClient.get(`/api/v1/employees/${employeeId}/project-history`, config);
}; 
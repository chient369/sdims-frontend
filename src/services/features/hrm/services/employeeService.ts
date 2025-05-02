import { BaseApiService } from '../../../core/baseApi';
import {
  EmployeeCreateData,
  EmployeeListParams,
  EmployeeResponse,
  EmployeeStatusUpdateData,
  EmployeeUpdateData,
  ImportEmployeesResponse,
  getAvailableEmployees as getAvailableEmployeesApi,
  getEmployeeById as getEmployeeByIdApi,
  getEmployeeProjectHistory as getEmployeeProjectHistoryApi,
  getEmployees as getEmployeesApi,
  importEmployees as importEmployeesApi,
  exportEmployees as exportEmployeesApi,
  suggestEmployees as suggestEmployeesApi,
  updateEmployeeStatus as updateEmployeeStatusApi,
  uploadAvatar as uploadAvatarApi,
} from '../api';

/**
 * Service for employee management operations
 */
class EmployeeService extends BaseApiService {
  constructor() {
    super('/api/v1/employees');
  }
  
  /**
   * Get all employees with filtering and pagination
   */
  async getEmployees(params?: EmployeeListParams): Promise<{
    content: EmployeeResponse[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      totalPages: number;
      totalElements: number;
      sort?: string;
    };
  }> {
    return getEmployeesApi(params);
  }
  
  /**
   * Get employee by ID
   */
  async getEmployeeById(employeeId: number): Promise<EmployeeResponse> {
    return getEmployeeByIdApi(employeeId);
  }
  
  /**
   * Create a new employee
   */
  async createEmployee(data: EmployeeCreateData): Promise<EmployeeResponse> {
    return this.create<EmployeeResponse, EmployeeCreateData>(data);
  }
  
  /**
   * Update an existing employee
   */
  async updateEmployee(employeeId: number, data: EmployeeUpdateData): Promise<EmployeeResponse> {
    return this.update<EmployeeResponse, EmployeeUpdateData>(employeeId, data);
  }
  
  /**
   * Delete an employee
   */
  async deleteEmployee(employeeId: number): Promise<void> {
    return this.delete(employeeId);
  }
  
  /**
   * Upload employee avatar
   */
  async uploadAvatar(employeeId: number, file: File): Promise<{ avatarUrl: string }> {
    return uploadAvatarApi(employeeId, file);
  }
  
  /**
   * Update employee status
   */
  async updateEmployeeStatus(
    employeeId: number,
    data: EmployeeStatusUpdateData
  ): Promise<EmployeeResponse> {
    return updateEmployeeStatusApi(employeeId, data);
  }
  
  /**
   * Get employee project history
   */
  async getEmployeeProjectHistory(employeeId: number): Promise<any[]> {
    return getEmployeeProjectHistoryApi(employeeId);
  }
  
  /**
   * Get employees available for projects based on skills and date range
   */
  async getAvailableEmployees(params?: { 
    startDate?: string; 
    endDate?: string; 
    requiredSkills?: number[];
    minExperience?: number; 
  }): Promise<EmployeeResponse[]> {
    return getAvailableEmployeesApi(params);
  }
  
  /**
   * Suggest employees based on skills (for projects/opportunities)
   */
  async suggestEmployees(params: {
    requiredSkills: number[];
    projectId?: number;
    opportunityId?: number;
    count?: number;
  }): Promise<EmployeeResponse[]> {
    return suggestEmployeesApi(params);
  }
  
  /**
   * Import employees from file
   */
  async importEmployees(file: File): Promise<ImportEmployeesResponse> {
    return importEmployeesApi(file);
  }
  
  /**
   * Export employees to file
   */
  async exportEmployees(params?: EmployeeListParams): Promise<Blob> {
    return exportEmployeesApi(params);
  }
  
  /**
   * Get employees with margin status alerts (convenience method)
   */
  async getEmployeesWithMarginAlerts(params?: {
    marginStatus?: 'Red' | 'Yellow';
    teamId?: number;
    limit?: number;
  }): Promise<{
    content: EmployeeResponse[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      totalPages: number;
      totalElements: number;
    };
  }> {
    return getEmployeesApi({
      marginStatus: params?.marginStatus,
      teamId: params?.teamId,
      limit: params?.limit || 10,
      sortBy: 'marginStatus',
      sortDir: 'asc'
    });
  }
  
  /**
   * Get employees by ending soon status (convenience method)
   */
  async getEndingSoonEmployees(params?: {
    teamId?: number;
    limit?: number;
  }): Promise<{
    content: EmployeeResponse[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      totalPages: number;
      totalElements: number;
    };
  }> {
    return getEmployeesApi({
      status: 'EndingSoon',
      teamId: params?.teamId,
      limit: params?.limit || 10,
      sortBy: 'endDate',
      sortDir: 'asc'
    });
  }
}

export const employeeService = new EmployeeService(); 
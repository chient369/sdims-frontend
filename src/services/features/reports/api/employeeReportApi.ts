import apiClient from '../../../core/axios';
import { AxiosRequestConfig } from 'axios';

export type EmployeeStatus = 'Allocated' | 'Available' | 'EndingSoon' | 'OnLeave' | 'Resigned';
export type ExportType = 'json' | 'csv' | 'excel';

export interface EmployeeReportParams {
  teamId?: number;
  position?: string;
  status?: EmployeeStatus;
  skills?: number[];
  minExperience?: number;
  projectId?: number;
  utilization?: string;
  includeSkills?: boolean;
  includeProjects?: boolean;
  exportType?: ExportType;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface EmployeeSkill {
  id: number;
  name: string;
  category: string;
  level: string;
  years: number;
}

export interface EmployeeProject {
  id: number;
  name: string;
  customer: string;
  allocation: number;
  startDate: string;
  endDate: string;
}

export interface EmployeeReportItem {
  id: number;
  employeeCode: string;
  name: string;
  email: string;
  position: string;
  team: {
    id: number;
    name: string;
    leader: {
      id: number;
      name: string;
    };
  };
  status: EmployeeStatus;
  currentProject?: EmployeeProject;
  utilization: number;
  skills?: EmployeeSkill[];
  joinDate: string;
  totalExperience: number;
}

export interface EmployeeReportResponse {
  reportInfo: {
    reportName: string;
    generatedAt: string;
    filters: Record<string, unknown>;
  };
  content: EmployeeReportItem[];
  summaryMetrics: {
    totalEmployees: number;
    allocatedCount: number;
    availableCount: number;
    endingSoonCount: number;
    utilizationRate: number;
    topSkills: Array<{
      name: string;
      count: number;
    }>;
  };
  pageable: {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    sort?: string;
  };
}

/**
 * Get employee detailed report
 */
export const getEmployeeReport = async (
  params?: EmployeeReportParams,
  config?: AxiosRequestConfig
): Promise<EmployeeReportResponse | Blob> => {
  // If export type is excel or csv, return a Blob instead of JSON
  if (params?.exportType && params.exportType !== 'json') {
    return apiClient.get('/api/v1/reports/employee-list', {
      ...config,
      params,
      responseType: 'blob'
    });
  }
  
  return apiClient.get('/api/v1/reports/employee-list', {
    ...config,
    params,
  });
}; 
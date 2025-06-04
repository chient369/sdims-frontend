/**
 * Margin API Module
 * 
 * This module serves as an adapter layer between the application and the REST API.
 * It provides functions for direct API communication with the margin endpoints.
 * Each function implements a specific API call and handles the response formatting.
 */

import apiClient from '../../services/core/axios';
import { AxiosRequestConfig } from 'axios';
import {
  EmployeeMarginListParams,
  EmployeeMarginResponse,
  MarginSummary,
  MarginSummaryParams,
  TeamMarginData,
  StatusGroupMarginData,
  ChartDataset,
  EmployeeCostData,
  CostImportResult,
  CostUpdateResult,
  PeriodType,
  MarginStatusType,
  MarginPeriodData,
  Team
} from './types';

/**
 * Get employee margin data with filtering and pagination
 * API-MGN-001: GET /api/v1/margins/employee
 */
export const getEmployeeMargins = async (params?: EmployeeMarginListParams, config?: AxiosRequestConfig): Promise<{
  status?: string;
  code?: number;
  data?: {
    summary: MarginSummary;
    content: EmployeeMarginResponse[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      totalPages: number;
      totalElements: number;
      sort?: string;
    };
  };
  // Định dạng cũ (trước khi có trường wrapper)
  summary?: MarginSummary;
  content?: EmployeeMarginResponse[];
  pageable?: {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    sort?: string;
  };
}> => {
  return apiClient.get('/api/v1/margins/employee', {
    ...config,
    params,
  });
};

/**
 * Get detailed margin data for a specific employee
 * API-MGN-001: GET /api/v1/margins/employee with employeeId filter
 */
export const getEmployeeMarginDetail = async (employeeId: number, params?: Omit<EmployeeMarginListParams, 'employeeId'>, config?: AxiosRequestConfig): Promise<{
  status?: string;
  code?: number;
  data?: any;
  // Định dạng cũ
  content?: EmployeeMarginResponse[];
  summary?: MarginSummary;
  pageable?: {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    sort?: string;
  };
}> => {
  return apiClient.get('/api/v1/margins/employee', {
    ...config,
    params: {
      ...params,
      employeeId
    }
  });
};

/**
 * Get margin summary data for dashboard/reports
 * API-MGN-002: GET /api/v1/margins/summary
 */
export const getMarginSummary = async (params?: MarginSummaryParams, config?: AxiosRequestConfig): Promise<{
  status?: string;
  code?: number;
  data?: any;
  // Định dạng cũ
  teamData?: TeamMarginData[];
  statusData?: StatusGroupMarginData[];
  trends?: {
    labels: string[];
    datasets: ChartDataset[];
  };
}> => {
  return apiClient.get('/api/v1/margins/summary', {
    ...config,
    params
  });
};

/**
 * Import employee costs from file
 * API-MGN-003: POST /api/v1/margins/costs/import
 */
export const importEmployeeCosts = async (
  file: File, 
  month: string, 
  options?: { teamId?: number; overwrite?: boolean },
  config?: AxiosRequestConfig
): Promise<{
  status?: string;
  code?: number;
  data?: CostImportResult;
  // Định dạng cũ
  importId?: string;
  month?: string;
  totalRecords?: number;
  successCount?: number;
  errorCount?: number;
  summary?: {
    teamId: number;
    teamName: string;
    totalEmployees: number;
    totalCost: number;
    averageCost: number;
  };
  errors?: {
    rowNumber?: number;
    employeeId?: number;
    employeeCode?: string;
    errorType: string;
    message: string;
  }[];
  importedBy?: {
    id: number;
    name: string;
  };
  importedAt?: string;
}> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('month', month);
  if (options?.teamId) formData.append('teamId', options.teamId.toString());
  if (options?.overwrite !== undefined) formData.append('overwrite', options.overwrite.toString());

  return apiClient.post('/api/v1/margins/costs/import', formData, {
    ...config,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * Update employee costs manually
 * API-MGN-004: POST /api/v1/margins/costs
 */
export const updateEmployeeCosts = async (
  data: {
    month: string;
    overwrite?: boolean;
    employees: EmployeeCostData[];
  },
  config?: AxiosRequestConfig
): Promise<{
  status?: string;
  code?: number;
  data?: CostUpdateResult;
  // Định dạng cũ
  month?: string;
  totalEmployees?: number;
  successCount?: number;
  errorCount?: number;
  results?: {
    employeeId: number;
    employeeCode: string;
    name: string;
    totalCost: number;
    status: 'created' | 'updated';
  }[];
  errors?: {
    employeeId?: number;
    employeeCode?: string;
    errorType: string;
    message: string;
  }[];
}> => {
  return apiClient.post('/api/v1/margins/costs', data, config);
};

/**
 * Get teams data for filtering
 * GET /api/v1/teams
 */
export const getTeams = async (config?: AxiosRequestConfig): Promise<{
  status: string;
  code: number;
  data: {
    content: Team[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      totalPages: number;
      totalElements: number;
      sort: string;
    };
  };
}> => {
  return apiClient.get('/api/v1/teams', config);
};

/**
 * Get employees data for filtering
 * Based on API-HRM-001: GET    
 */
export const getEmployees = async (params?: {
  teamId?: number;
  searchTerm?: string;
  status?: string;
  page?: number;
  size?: number;
}, config?: AxiosRequestConfig): Promise<{
  status: string;
  code: number;
  data: {
    content: {
      id: number;
      employeeCode: string;
      name: string;
      email?: string;
      position?: string;
      team?: {
        id: number;
        name: string;
      };
    }[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      totalPages: number;
      totalElements: number;
      sort: string;
    };
  };
}> => {
  return apiClient.get('/api/v1/employees', {
    ...config,
    params
  });
}; 
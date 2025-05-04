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
  MarginPeriodData
} from './types';

/**
 * Get employee margin data with filtering and pagination
 */
export const getEmployeeMargins = async (params?: EmployeeMarginListParams, config?: AxiosRequestConfig): Promise<{
  summary: MarginSummary;
  content: EmployeeMarginResponse[];
  pageable: {
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
 */
export const getEmployeeMarginDetail = async (employeeId: number, params?: Omit<EmployeeMarginListParams, 'employeeId'>, config?: AxiosRequestConfig): Promise<{
  employee: {
    id: number;
    employeeCode: string;
    name: string;
    position: string;
    team?: {
      id: number;
      name: string;
    };
    status: string;
    currentProject: string | null;
  };
  summary: {
    period: PeriodType;
    fromDate: string;
    toDate: string;
    averageCost: number;
    averageRevenue: number;
    averageMargin: number;
  };
  margins: MarginPeriodData[];
}> => {
  return apiClient.get('/api/v1/margins/employee', {
    ...config,
    params: {
      ...params,
      employeeId,
    },
  });
};

/**
 * Get margin summary data for dashboard/reports
 */
export const getMarginSummary = async (params?: MarginSummaryParams, config?: AxiosRequestConfig): Promise<{
  summary: MarginSummary;
  teams?: TeamMarginData[];
  statusGroups?: StatusGroupMarginData[];
  chartData?: {
    labels: string[];
    labelFormat: string;
    datasets: ChartDataset[];
    average: number[];
  };
  thresholds?: {
    Red: number;
    Yellow: number;
  };
}> => {
  return apiClient.get('/api/v1/margins/summary', {
    ...config,
    params,
  });
};

/**
 * Import employee costs from file
 */
export const importEmployeeCosts = async (
  file: File, 
  month: string, 
  options?: { teamId?: number; overwrite?: boolean },
  config?: AxiosRequestConfig
): Promise<CostImportResult> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('month', month);
  
  if (options?.teamId) {
    formData.append('teamId', options.teamId.toString());
  }
  
  if (options?.overwrite !== undefined) {
    formData.append('overwrite', options.overwrite ? 'true' : 'false');
  }
  
  const axiosConfig: AxiosRequestConfig = {
    ...config,
    headers: {
      ...config?.headers,
      'Content-Type': 'multipart/form-data',
    },
  };
  
  return apiClient.post('/api/v1/margins/costs/import', formData, axiosConfig);
};

/**
 * Update employee costs manually
 */
export const updateEmployeeCosts = async (
  data: {
    month: string;
    overwrite?: boolean;
    employees: EmployeeCostData[];
  },
  config?: AxiosRequestConfig
): Promise<CostUpdateResult> => {
  return apiClient.post('/api/v1/margins/costs/update', data, config);
}; 
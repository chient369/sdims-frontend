import apiClient from '../../../core/axios';
import { AxiosRequestConfig } from 'axios';

export type UtilizationPeriodType = 'month' | 'quarter' | 'year';
export type ExportType = 'json' | 'csv' | 'excel';

export interface UtilizationReportParams {
  teamId?: number;
  employeeId?: number;
  period?: UtilizationPeriodType;
  fromDate?: string;
  toDate?: string;
  minUtilization?: number;
  maxUtilization?: number;
  groupBy?: 'employee' | 'team';
  exportType?: ExportType;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface EmployeeUtilizationItem {
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  team: {
    id: number;
    name: string;
  };
  position: string;
  utilizationData: Array<{
    period: string;
    periodLabel: string;
    availableHours: number;
    billableHours: number;
    utilization: number;
    projects: Array<{
      id: number;
      name: string;
      hours: number;
      allocation: number;
    }>;
  }>;
  averageUtilization: number;
}

export interface TeamUtilizationItem {
  teamId: number;
  teamName: string;
  leader: {
    id: number;
    name: string;
  };
  employeeCount: number;
  utilizationData: Array<{
    period: string;
    periodLabel: string;
    availableHours: number;
    billableHours: number;
    utilization: number;
  }>;
  averageUtilization: number;
}

export interface UtilizationReportResponse {
  reportInfo: {
    reportName: string;
    generatedAt: string;
    period: UtilizationPeriodType;
    fromDate: string;
    toDate: string;
    filters: Record<string, unknown>;
  };
  summaryMetrics: {
    overallUtilization: number;
    utilizationByMonth: Array<{
      month: string;
      utilization: number;
    }>;
    utilizationDistribution: {
      labels: string[];
      values: number[];
    };
    topTeams: Array<{
      teamName: string;
      utilization: number;
    }>;
    bottomTeams: Array<{
      teamName: string;
      utilization: number;
    }>;
  };
  content: EmployeeUtilizationItem[] | TeamUtilizationItem[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    sort?: string;
  };
}

/**
 * Get detailed utilization report
 */
export const getUtilizationReport = async (
  params?: UtilizationReportParams,
  config?: AxiosRequestConfig
): Promise<UtilizationReportResponse | Blob> => {
  // If export type is excel or csv, return a Blob instead of JSON
  if (params?.exportType && params.exportType !== 'json') {
    return apiClient.get('/api/v1/reports/utilization', {
      ...config,
      params,
      responseType: 'blob'
    });
  }
  
  return apiClient.get('/api/v1/reports/utilization', {
    ...config,
    params,
  });
}; 
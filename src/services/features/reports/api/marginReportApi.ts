import apiClient from '../../../core/axios';
import { AxiosRequestConfig } from 'axios';
import { MarginStatus, PeriodType, GroupByType, ExportType } from '@/types';

// These types would ideally be imported from a central location
// import { MarginStatus, PeriodType, GroupByType, ExportType } from '@/types';

export interface MarginReportParams {
  teamId?: number;
  employeeId?: number;
  period?: PeriodType;
  fromDate?: string;
  toDate?: string;
  marginThreshold?: MarginStatus;
  groupBy?: GroupByType;
  includeDetails?: boolean;
  exportType?: ExportType;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface ReportMarginPeriodData {
  period: string;
  cost: number;
  revenue: number;
  margin: number;
  status: MarginStatus;
}

export interface EmployeeMarginItem {
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  team: {
    id: number;
    name: string;
  };
  position: string;
  marginData: ReportMarginPeriodData[];
  averageMargin: number;
  status: MarginStatus;
}

export interface TeamMarginItem {
  teamId: number;
  teamName: string;
  leader: {
    id: number;
    name: string;
  };
  employeeCount: number;
  marginData: Array<{
    period: string;
    totalCost: number;
    totalRevenue: number;
    margin: number;
    status: MarginStatus;
  }>;
  averageMargin: number;
  status: MarginStatus;
}

export interface MarginReportResponse {
  reportInfo: {
    reportName: string;
    generatedAt: string;
    period: PeriodType;
    fromDate: string;
    toDate: string;
    filters: Record<string, unknown>;
  };
  summaryMetrics: {
    averageMargin: number;
    redCount: number;
    yellowCount: number;
    greenCount: number;
    marginDistribution: {
      labels: string[];
      values: number[];
    };
    marginTrend: Array<{
      period: string;
      value: number;
    }>;
  };
  content: EmployeeMarginItem[] | TeamMarginItem[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    sort?: string;
  };
}

/**
 * Get detailed margin report by employee or team
 */
export const getMarginReport = async (
  params?: MarginReportParams,
  config?: AxiosRequestConfig
): Promise<MarginReportResponse | Blob> => {
  // If export type is excel or csv, return a Blob instead of JSON
  if (params?.exportType && params.exportType !== 'json') {
    return apiClient.get('/api/v1/reports/margin-detail', {
      ...config,
      params,
      responseType: 'blob'
    });
  }
  
  return apiClient.get('/api/v1/reports/margin-detail', {
    ...config,
    params,
  });
}; 
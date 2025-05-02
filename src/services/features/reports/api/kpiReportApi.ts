import apiClient from '../../../core/axios';
import { AxiosRequestConfig } from 'axios';

export type KpiPeriodType = 'month' | 'quarter' | 'year';
export type ExportType = 'json' | 'csv' | 'excel';

export interface KpiReportParams {
  salesId?: number;
  teamId?: number;
  period?: KpiPeriodType;
  year?: number;
  exportType?: ExportType;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface KpiProgressItem {
  salesId: number;
  salesName: string;
  teamId?: number;
  teamName?: string;
  periodData: Array<{
    period: string;
    periodLabel: string;
    targetAmount: number;
    actualAmount: number;
    achievement: number;
    status: 'success' | 'warning' | 'danger';
  }>;
  yearToDate: {
    targetAmount: number;
    actualAmount: number;
    achievement: number;
    status: 'success' | 'warning' | 'danger';
  };
  contracts: Array<{
    id: number;
    name: string;
    customer: string;
    signedDate: string;
    totalValue: number;
  }>;
}

export interface KpiReportResponse {
  reportInfo: {
    reportName: string;
    generatedAt: string;
    period: KpiPeriodType;
    year: number;
    filters: Record<string, unknown>;
  };
  summaryMetrics: {
    totalSales: number;
    overallAchievement: number;
    achievementByPeriod: Array<{
      period: string;
      achievement: number;
    }>;
    topPerformers: Array<{
      salesName: string;
      achievement: number;
    }>;
    bottomPerformers: Array<{
      salesName: string;
      achievement: number;
    }>;
  };
  content: KpiProgressItem[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    sort?: string;
  };
}

/**
 * Get sales KPI progress report
 */
export const getKpiProgressReport = async (
  params?: KpiReportParams,
  config?: AxiosRequestConfig
): Promise<KpiReportResponse | Blob> => {
  // If export type is excel or csv, return a Blob instead of JSON
  if (params?.exportType && params.exportType !== 'json') {
    return apiClient.get('/api/v1/reports/kpi-progress', {
      ...config,
      params,
      responseType: 'blob'
    });
  }
  
  return apiClient.get('/api/v1/reports/kpi-progress', {
    ...config,
    params,
  });
}; 
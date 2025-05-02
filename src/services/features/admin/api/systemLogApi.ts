import apiClient from '../../../core/axios';
import { AxiosRequestConfig } from 'axios';

export type LogSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
export type LogEntityType = 'USER' | 'ROLE' | 'EMPLOYEE' | 'CONTRACT' | 'OPPORTUNITY' | 'SYSTEM' | 'INTEGRATION';

export interface SystemLog {
  id: number;
  timestamp: string;
  severity: LogSeverity;
  module: string;
  action: string;
  message: string;
  details?: string;
  entityType?: LogEntityType;
  entityId?: number | string;
  ipAddress?: string;
  userAgent?: string;
  user?: {
    id: number;
    username: string;
  };
}

export interface SystemLogParams {
  startDate?: string;
  endDate?: string;
  severity?: LogSeverity;
  module?: string;
  action?: string;
  entityType?: LogEntityType;
  entityId?: number | string;
  userId?: number;
  keyword?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

/**
 * Get system logs with filtering and pagination
 */
export const getSystemLogs = async (params?: SystemLogParams, config?: AxiosRequestConfig): Promise<{
  content: SystemLog[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    sort?: string;
  };
}> => {
  return apiClient.get('/api/v1/admin/system-logs', {
    ...config,
    params,
  });
};

/**
 * Get dashboard summary of system logs
 */
export const getLogsSummary = async (
  params?: {
    startDate?: string;
    endDate?: string;
  },
  config?: AxiosRequestConfig
): Promise<{
  totalErrors: number;
  totalWarnings: number;
  criticalErrors: number;
  topModules: {
    module: string;
    count: number;
  }[];
  recentErrors: SystemLog[];
  timeDistribution: {
    labels: string[];
    errors: number[];
    warnings: number[];
    info: number[];
  };
}> => {
  return apiClient.get('/api/v1/admin/system-logs/summary', {
    ...config,
    params,
  });
};

/**
 * Export system logs to file
 */
export const exportSystemLogs = async (params?: SystemLogParams, config?: AxiosRequestConfig): Promise<Blob> => {
  return apiClient.get('/api/v1/admin/system-logs/export', {
    ...config,
    params,
    responseType: 'blob'
  });
}; 
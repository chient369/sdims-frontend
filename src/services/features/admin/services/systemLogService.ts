import { BaseApiService } from '../../../core/baseApi';
import {
  SystemLog,
  SystemLogParams,
  LogSeverity,
  getSystemLogs as getSystemLogsApi,
  getLogsSummary as getLogsSummaryApi,
  exportSystemLogs as exportSystemLogsApi,
} from '../api';

/**
 * Service for system log operations
 */
class SystemLogService extends BaseApiService {
  constructor() {
    super('/api/v1/admin/system-logs');
  }

  /**
   * Get system logs with filtering and pagination
   */
  async getSystemLogs(params?: SystemLogParams): Promise<{
    content: SystemLog[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      totalPages: number;
      totalElements: number;
      sort?: string;
    };
  }> {
    return getSystemLogsApi(params);
  }

  /**
   * Get dashboard summary of system logs
   */
  async getLogsSummary(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{
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
  }> {
    return getLogsSummaryApi(params);
  }

  /**
   * Export system logs to file
   */
  async exportSystemLogs(params?: SystemLogParams): Promise<Blob> {
    return exportSystemLogsApi(params);
  }

  /**
   * Get recent error logs (convenience method)
   */
  async getRecentErrors(limit: number = 10): Promise<SystemLog[]> {
    const response = await this.getSystemLogs({
      severity: 'ERROR',
      page: 1,
      size: limit,
      sortBy: 'timestamp',
      sortDir: 'desc'
    });
    return response.content;
  }

  /**
   * Get logs for a specific entity (convenience method)
   */
  async getEntityLogs(entityType: string, entityId: number | string, limit: number = 20): Promise<SystemLog[]> {
    const response = await this.getSystemLogs({
      entityType: entityType as any,
      entityId,
      page: 1,
      size: limit,
      sortBy: 'timestamp',
      sortDir: 'desc'
    });
    return response.content;
  }

  /**
   * Check if there are critical errors in the last 24 hours (convenience method)
   */
  async hasCriticalErrors(): Promise<{
    hasCritical: boolean;
    count: number;
    latestError?: SystemLog;
  }> {
    // Create date for 24 hours ago
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const response = await this.getSystemLogs({
      severity: 'CRITICAL',
      startDate: yesterday.toISOString(),
      page: 1,
      size: 5,
      sortBy: 'timestamp',
      sortDir: 'desc'
    });
    
    return {
      hasCritical: response.pageable.totalElements > 0,
      count: response.pageable.totalElements,
      latestError: response.content[0]
    };
  }
}

export const systemLogService = new SystemLogService(); 
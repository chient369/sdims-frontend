/**
 * Margin Service Module
 * 
 * This module provides a higher-level interface for interacting with margin data,
 * encapsulating API calls and adding business logic when needed.
 */

import { BaseApiService } from '../../services/core/baseApi';
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
} from './types';

import {
  getEmployeeMargins as getEmployeeMarginsApi,
  getEmployeeMarginDetail as getEmployeeMarginDetailApi,
  getMarginSummary as getMarginSummaryApi,
  importEmployeeCosts as importEmployeeCostsApi,
  updateEmployeeCosts as updateEmployeeCostsApi,
} from './api';

/**
 * Service for margin management operations
 */
class MarginService extends BaseApiService {
  constructor() {
    super('/api/v1/margins');
  }

  /**
   * Get employee margins with filtering and pagination
   */
  async getEmployeeMargins(params?: EmployeeMarginListParams): Promise<{
    summary: MarginSummary;
    content: EmployeeMarginResponse[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      totalPages: number;
      totalElements: number;
      sort?: string;
    };
  }> {
    return getEmployeeMarginsApi(params);
  }

  /**
   * Get detailed margin data for a specific employee
   */
  async getEmployeeMarginDetail(employeeId: number, params?: Omit<EmployeeMarginListParams, 'employeeId'>): Promise<{
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
    margins: {
      period: string;
      periodLabel: string;
      cost: number;
      revenue: number;
      margin: number;
      marginStatus: MarginStatusType;
      billableHours?: number;
      billableRate?: number;
    }[];
  }> {
    return getEmployeeMarginDetailApi(employeeId, params);
  }

  /**
   * Get margin summary data for dashboard/reports
   */
  async getMarginSummary(params?: MarginSummaryParams): Promise<{
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
  }> {
    return getMarginSummaryApi(params);
  }

  /**
   * Import employee costs from file
   */
  async importEmployeeCosts(
    file: File, 
    month: string, 
    options?: { teamId?: number; overwrite?: boolean }
  ): Promise<CostImportResult> {
    return importEmployeeCostsApi(file, month, options);
  }

  /**
   * Update employee costs manually
   */
  async updateEmployeeCosts(
    data: {
      month: string;
      overwrite?: boolean;
      employees: EmployeeCostData[];
    }
  ): Promise<CostUpdateResult> {
    return updateEmployeeCostsApi(data);
  }

  /**
   * Get employees with low margins (convenience method)
   */
  async getLowMarginEmployees(params?: {
    status?: 'Red' | 'Yellow';
    teamId?: number;
    yearMonth?: string;
    limit?: number;
  }): Promise<{
    content: EmployeeMarginResponse[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      totalPages: number;
      totalElements: number;
    };
  }> {
    const response = await getEmployeeMarginsApi({
      status: params?.status || 'Red',
      teamId: params?.teamId,
      yearMonth: params?.yearMonth,
      sortBy: 'margin',
      sortDir: 'asc',
      size: params?.limit || 10,
      page: 1
    });

    return {
      content: response.content,
      pageable: response.pageable
    };
  }
}

// Create and export a singleton instance
export const marginService = new MarginService();

// Default export
export default marginService; 
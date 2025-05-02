import { BaseApiService } from '../../../core/baseApi';
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
  getEmployeeMargins as getEmployeeMarginsApi,
  getEmployeeMarginDetail as getEmployeeMarginDetailApi,
  getMarginSummary as getMarginSummaryApi,
  importEmployeeCosts as importEmployeeCostsApi,
  updateEmployeeCosts as updateEmployeeCostsApi,
} from '../api';

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

  /**
   * Get margin trends for a team (convenience method)
   */
  async getTeamMarginTrends(teamId: number, period: PeriodType = 'month', limit: number = 6): Promise<{
    team: TeamMarginData | undefined;
    trends: {
      periods: string[];
      margins: number[];
    };
  }> {
    const response = await getMarginSummaryApi({
      teamId,
      period,
      view: 'table',
    });

    const team = response.teams?.[0];
    const trends = team?.trends || { margin: [], periods: [] };

    // Limit the number of periods if needed
    const limitedPeriods = trends.periods.slice(-limit);
    const limitedMargins = trends.margin.slice(-limit);

    return {
      team,
      trends: {
        periods: limitedPeriods,
        margins: limitedMargins
      }
    };
  }

  /**
   * Get margin status distribution (convenience method)
   */
  async getMarginStatusDistribution(teamId?: number, yearMonth?: string): Promise<{
    total: number;
    distribution: {
      status: MarginStatusType;
      count: number;
      percentage: number;
    }[];
  }> {
    const response = await getEmployeeMarginsApi({
      teamId,
      yearMonth,
      page: 1,
      size: 1 // We only need the summary data
    });

    const { Red = 0, Yellow = 0, Green = 0 } = response.summary.statusCounts;
    const total = Red + Yellow + Green;

    return {
      total,
      distribution: [
        { status: 'Red', count: Red, percentage: (Red / total) * 100 },
        { status: 'Yellow', count: Yellow, percentage: (Yellow / total) * 100 },
        { status: 'Green', count: Green, percentage: (Green / total) * 100 }
      ]
    };
  }
}

export const marginService = new MarginService(); 
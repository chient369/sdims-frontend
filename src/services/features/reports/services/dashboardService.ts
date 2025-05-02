import { BaseApiService } from '../../../core/baseApi';
import {
  DashboardParams,
  DashboardSummaryResponse,
  getDashboardSummary as getDashboardSummaryApi
} from '../api';

/**
 * Service for dashboard operations
 */
class DashboardService extends BaseApiService {
  constructor() {
    super('/api/v1/dashboard');
  }

  /**
   * Get dashboard summary data
   */
  async getSummary(params?: DashboardParams): Promise<DashboardSummaryResponse> {
    return getDashboardSummaryApi(params);
  }

  /**
   * Get dashboard data for specific widgets only (convenience method)
   */
  async getWidgets(widgets: string[], teamId?: number): Promise<DashboardSummaryResponse> {
    return this.getSummary({
      widgets,
      teamId
    });
  }

  /**
   * Get dashboard data for a specific date range (convenience method)
   */
  async getDataForDateRange(fromDate: string, toDate: string): Promise<DashboardSummaryResponse> {
    return this.getSummary({
      fromDate,
      toDate
    });
  }
}

export const dashboardService = new DashboardService(); 
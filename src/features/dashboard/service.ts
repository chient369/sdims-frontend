/**
 * Service class for dashboard management
 * 
 * Provides a higher-level interface for interacting with dashboard data,
 * encapsulating API calls and adding business logic when needed.
 */

import { BaseApiService } from '../../services/core/baseApi';
import {
  DashboardSummary,
  DashboardParams,
  ProjectSummary,
  RevenueDataPoint,
  DashboardPreferences,
  DashboardNotification,
  OpportunityStatusWidget,
  MarginDistributionWidget,
  RevenueSummaryWidget,
  EmployeeStatusWidget,
  UtilizationRateWidget
} from './types';
import {
  getDashboardSummary as getDashboardSummaryApi,
  getRecentProjects as getRecentProjectsApi,
  getRevenueData as getRevenueDataApi,
  getDashboardPreferences as getDashboardPreferencesApi,
  updateDashboardPreferences as updateDashboardPreferencesApi,
  getDashboardNotifications as getDashboardNotificationsApi,
  markNotificationAsRead as markNotificationAsReadApi,
  markAllNotificationsAsRead as markAllNotificationsAsReadApi,
  getDashboardKPIs as getDashboardKPIsApi
} from './api';
import { DashboardSummaryResponse } from '../reports/types';
import { AxiosRequestConfig } from 'axios';
import apiClient from '../../services/core/axios';
import { User } from '../../features/auth/types';

class DashboardService extends BaseApiService {
  constructor() {
    super('/api/v1/dashboard');
  }

  /**
   * Get dashboard summary statistics
   */
  async getDashboardSummary(params?: DashboardParams): Promise<DashboardSummary> {
    return getDashboardSummaryApi(params);
  }

  /**
   * Get recent projects for dashboard
   */
  async getRecentProjects(params?: {
    limit?: number;
    status?: string;
  }): Promise<ProjectSummary[]> {
    return getRecentProjectsApi(params);
  }

  /**
   * Get revenue chart data
   */
  async getRevenueData(params?: {
    timeframe: 'week' | 'month' | 'quarter' | 'year';
    startDate?: string;
    endDate?: string;
  }): Promise<RevenueDataPoint[]> {
    return getRevenueDataApi(params);
  }

  /**
   * Get user dashboard preferences
   */
  async getDashboardPreferences(): Promise<DashboardPreferences> {
    return getDashboardPreferencesApi();
  }

  /**
   * Update user dashboard preferences
   */
  async updateDashboardPreferences(
    data: Partial<DashboardPreferences>
  ): Promise<DashboardPreferences> {
    return updateDashboardPreferencesApi(data);
  }

  /**
   * Get dashboard notifications
   */
  async getDashboardNotifications(params?: {
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<DashboardNotification[]> {
    return getDashboardNotificationsApi(params);
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    return markNotificationAsReadApi(notificationId);
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsAsRead(): Promise<void> {
    return markAllNotificationsAsReadApi();
  }

  /**
   * Get key performance indicators (KPIs) for dashboard
   */
  async getDashboardKPIs(params?: {
    timeframe?: 'week' | 'month' | 'quarter' | 'year';
  }): Promise<{
    totalRevenue: number;
    totalProfit: number;
    profitMargin: number;
    averageProjectValue: number;
    resourceUtilization: number;
    clientSatisfaction: number;
  }> {
    return getDashboardKPIsApi(params);
  }

  /**
   * Determine teamId based on user role and available teams
   * @param user Current user
   * @param specifiedTeamId TeamId specifically requested by the UI
   * @returns The appropriate teamId to use for API calls
   */
  determineTeamId(user: User | null, specifiedTeamId?: string | null): string | undefined {
    // Nếu không có user, trả về teamId được chỉ định hoặc undefined
    if (!user) {
      return specifiedTeamId || undefined;
    }

    // Kiểm tra quyền của user
    const hasAllAccess = user.permissions?.includes('dashboard:read:all');
    const hasTeamAccess = user.permissions?.includes('dashboard:read:team');

    // Nếu user có quyền xem tất cả và teamId được chỉ định, sử dụng teamId đó
    if (hasAllAccess && specifiedTeamId) {
      return specifiedTeamId;
    }

    // Nếu user có quyền xem tất cả và không chỉ định teamId, trả về undefined (xem tất cả)
    if (hasAllAccess && !specifiedTeamId) {
      return undefined;
    }

    // Nếu user chỉ có quyền xem team mình, bắt buộc sử dụng teamId của user
    if (hasTeamAccess) {
      return user.teamId;
    }

    // Mặc định, nếu user không có quyền đặc biệt, sử dụng teamId của họ
    return user.teamId;
  }

  /**
   * Get dashboard data (consolidated method for multiple API calls)
   * @param params Dashboard parameters
   * @param user User object for permission checks
   */
  async getDashboardData(
    params?: DashboardParams, 
    user?: User | null
  ): Promise<{
    summary: DashboardSummary;
    recentProjects: ProjectSummary[];
    revenueData: RevenueDataPoint[];
    kpis: {
      totalRevenue: number;
      totalProfit: number;
      profitMargin: number;
      averageProjectValue: number;
      resourceUtilization: number;
      clientSatisfaction: number;
    };
    notifications: DashboardNotification[];
  }> {
    // Xác định teamId phù hợp dựa trên vai trò người dùng và teamId được chỉ định
    const teamId = this.determineTeamId(user || null, params?.teamId);
    
    // Tạo bản sao của params và cập nhật teamId
    const updatedParams = { ...params, teamId };
    
    const [summary, recentProjects, revenueData, kpis, notifications] = await Promise.all([
      this.getDashboardSummary(updatedParams),
      this.getRecentProjects({ limit: 5 }),
      this.getRevenueData({
        timeframe: params?.timeframe || 'month',
        startDate: params?.startDate,
        endDate: params?.endDate
      }),
      this.getDashboardKPIs({ timeframe: params?.timeframe }),
      this.getDashboardNotifications({ limit: 10, unreadOnly: true })
    ]);

    return {
      summary,
      recentProjects,
      revenueData,
      kpis,
      notifications
    };
  }

  /**
   * Get dashboard summary data from API-RPT-001
   */
  async getSummary(params?: {
    fromDate?: string;
    toDate?: string;
    teamId?: string | null;
    widgets?: string[];
  }, config?: AxiosRequestConfig, user?: User | null): Promise<DashboardSummaryResponse> {
    // Nếu cung cấp user, xác định teamId phù hợp
    if (user && !params?.teamId) {
      const teamId = this.determineTeamId(user, params?.teamId);
      params = { ...params, teamId };
    }
    
    return apiClient.get('/api/v1/dashboard/summary', {
      ...config,
      params,
    });
  }

  /**
   * Get dashboard data for specific widgets only (convenience method)
   */
  async getWidgets(widgets: string[], teamId?: string | null, user?: User | null): Promise<DashboardSummaryResponse> {
    // Nếu cung cấp user, xác định teamId phù hợp
    const effectiveTeamId = user ? this.determineTeamId(user, teamId) : teamId;
    
    return this.getSummary({
      widgets,
      teamId: effectiveTeamId
    });
  }

  /**
   * Get dashboard data for a specific date range (convenience method)
   */
  async getDataForDateRange(
    fromDate: string, 
    toDate: string, 
    teamId?: string | null, 
    user?: User | null
  ): Promise<DashboardSummaryResponse> {
    // Nếu cung cấp user, xác định teamId phù hợp
    const effectiveTeamId = user ? this.determineTeamId(user, teamId) : teamId;
    
    return this.getSummary({
      fromDate,
      toDate,
      teamId: effectiveTeamId
    });
  }

  /**
   * Mock data for testing or development purposes
   */

  /**
   * Generate mock data for opportunity status widget
   */
  getMockOpportunityStatus(): OpportunityStatusWidget {
    return {
      totalOpportunities: 28,
      byStatus: {
        green: 15,
        yellow: 8,
        red: 5
      },
      byDealStage: [
        { stage: "Prospecting", count: 10 },
        { stage: "Needs Analysis", count: 5 },
        { stage: "Proposal", count: 8 },
        { stage: "Negotiation", count: 3 },
        { stage: "Closed Won", count: 2 }
      ],
      topOpportunities: [
        {
          id: 45,
          name: "Dự án quản lý bán hàng ABC Corp",
          customer: "ABC Corporation",
          value: 500000000,
          stage: "Proposal",
          lastInteraction: "2025-06-10"
        },
        {
          id: 48,
          name: "Nâng cấp hệ thống XYZ",
          customer: "XYZ Company",
          value: 350000000,
          stage: "Negotiation",
          lastInteraction: "2025-06-12"
        }
      ]
    };
  }

  /**
   * Generate mock data for margin distribution widget
   */
  getMockMarginDistribution(): MarginDistributionWidget {
    return {
      totalEmployees: 45,
      distribution: {
        green: { count: 28, percentage: 62.2 },
        yellow: { count: 12, percentage: 26.7 },
        red: { count: 5, percentage: 11.1 }
      },
      trend: [
        { month: "2025-01", value: 38.5 },
        { month: "2025-02", value: 39.2 },
        { month: "2025-03", value: 40.1 },
        { month: "2025-04", value: 38.7 },
        { month: "2025-05", value: 40.5 },
        { month: "2025-06", value: 41.2 }
      ]
    };
  }

  /**
   * Generate mock data for revenue summary widget
   */
  getMockRevenueSummary(): RevenueSummaryWidget {
    return {
      currentMonth: {
        target: 1500000000,
        actual: 1250000000,
        achievement: 83.3
      },
      currentQuarter: {
        target: 4000000000,
        actual: 3200000000,
        achievement: 80.0
      },
      ytd: {
        target: 15000000000,
        actual: 13800000000,
        achievement: 92.0
      },
      contracts: {
        total: 15,
        newlyAdded: 2
      },
      payment: {
        totalDue: 2500000000,
        overdue: 500000000,
        upcoming: 1000000000
      }
    };
  }

  /**
   * Generate mock data for employee status widget
   */
  getMockEmployeeStatus(): EmployeeStatusWidget {
    return {
      totalEmployees: 45,
      byStatus: {
        allocated: 35,
        available: 5,
        endingSoon: 4,
        onLeave: 1
      },
      endingSoonList: [
        {
          id: 102,
          name: "Trần Thị B",
          projectEndDate: "2025-07-15"
        },
        {
          id: 105,
          name: "Lê Văn E",
          projectEndDate: "2025-07-30"
        },
        {
          id: 110,
          name: "Phạm Văn H",
          projectEndDate: "2025-08-05"
        },
        {
          id: 112,
          name: "Nguyễn Thị D",
          projectEndDate: "2025-08-10"
        }
      ]
    };
  }

  /**
   * Generate mock data for utilization rate widget
   */
  getMockUtilizationRate(): UtilizationRateWidget {
    return {
      overall: 85.5,
      byTeam: [
        { team: "Team Alpha", rate: 92.0 },
        { team: "Team Beta", rate: 87.5 },
        { team: "Team Gamma", rate: 78.0 }
      ],
      trend: [
        { month: "2025-01", value: 82.5 },
        { month: "2025-02", value: 84.0 },
        { month: "2025-03", value: 83.5 },
        { month: "2025-04", value: 84.5 },
        { month: "2025-05", value: 86.0 },
        { month: "2025-06", value: 85.5 }
      ]
    };
  }

  /**
   * Generate mock dashboard summary data
   */
  getMockDashboardSummary(params?: DashboardParams): DashboardSummary {
    // Tạo các dữ liệu widgets
    const widgets: any = {};
    
    // Thêm dữ liệu widget tùy theo cấu hình
    if (!params?.widgets || params.widgets.includes('opportunity_status')) {
      widgets.opportunity_status = this.getMockOpportunityStatus();
    }
    
    if (!params?.widgets || params.widgets.includes('margin_distribution')) {
      widgets.margin_distribution = this.getMockMarginDistribution();
    }
    
    if (!params?.widgets || params.widgets.includes('revenue_summary')) {
      widgets.revenue_summary = this.getMockRevenueSummary();
    }
    
    if (!params?.widgets || params.widgets.includes('employee_status')) {
      widgets.employee_status = this.getMockEmployeeStatus();
    }
    
    if (!params?.widgets || params.widgets.includes('utilization_rate')) {
      widgets.utilization_rate = this.getMockUtilizationRate();
    }
    
    // Xác định thời gian từ params
    const fromDate = params?.fromDate || '2025-06-01';
    const toDate = params?.toDate || '2025-06-30';

    // Trả về định dạng summary
    return {
      dateRange: {
        fromDate,
        toDate
      },
      widgets
    };
  }
}

// Export DashboardService để có thể được import từ file khác
export default DashboardService; 
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
  DashboardNotification
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
   * Get a complete dashboard data package
   * Business logic combining multiple API calls into one convenient method
   */
  async getDashboardData(params?: DashboardParams): Promise<{
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
    const [summary, recentProjects, revenueData, kpis, notifications] = await Promise.all([
      this.getDashboardSummary(params),
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
}

// Create and export an instance
export const dashboardService = new DashboardService(); 
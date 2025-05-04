/**
 * Dashboard API Module
 * 
 * This module serves as an adapter layer between the application and the REST API.
 * It provides functions for direct API communication with the dashboard endpoints.
 * Each function implements a specific API call and handles the response formatting.
 */

import apiClient from '../../services/core/axios';
import { AxiosRequestConfig } from 'axios';
import { 
  DashboardSummary, 
  DashboardParams, 
  ProjectSummary, 
  RevenueDataPoint, 
  DashboardPreferences,
  DashboardNotification
} from './types';

/**
 * Get dashboard summary statistics
 */
export const getDashboardSummary = async (params?: DashboardParams, config?: AxiosRequestConfig): Promise<DashboardSummary> => {
  return apiClient.get('/api/v1/dashboard/summary', {
    ...config,
    params,
  });
};

/**
 * Get recent projects for dashboard
 */
export const getRecentProjects = async (params?: {
  limit?: number;
  status?: string;
}, config?: AxiosRequestConfig): Promise<ProjectSummary[]> => {
  return apiClient.get('/api/v1/dashboard/projects', {
    ...config,
    params,
  });
};

/**
 * Get revenue chart data
 */
export const getRevenueData = async (params?: {
  timeframe: 'week' | 'month' | 'quarter' | 'year';
  startDate?: string;
  endDate?: string;
}, config?: AxiosRequestConfig): Promise<RevenueDataPoint[]> => {
  return apiClient.get('/api/v1/dashboard/revenue', {
    ...config,
    params,
  });
};

/**
 * Get user dashboard preferences
 */
export const getDashboardPreferences = async (config?: AxiosRequestConfig): Promise<DashboardPreferences> => {
  return apiClient.get('/api/v1/dashboard/preferences', config);
};

/**
 * Update user dashboard preferences
 */
export const updateDashboardPreferences = async (
  data: Partial<DashboardPreferences>,
  config?: AxiosRequestConfig
): Promise<DashboardPreferences> => {
  return apiClient.put('/api/v1/dashboard/preferences', data, config);
};

/**
 * Get dashboard notifications
 */
export const getDashboardNotifications = async (params?: {
  limit?: number;
  unreadOnly?: boolean;
}, config?: AxiosRequestConfig): Promise<DashboardNotification[]> => {
  return apiClient.get('/api/v1/dashboard/notifications', {
    ...config,
    params,
  });
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (
  notificationId: string,
  config?: AxiosRequestConfig
): Promise<void> => {
  return apiClient.put(`/api/v1/dashboard/notifications/${notificationId}/read`, {}, config);
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (config?: AxiosRequestConfig): Promise<void> => {
  return apiClient.put('/api/v1/dashboard/notifications/read-all', {}, config);
};

/**
 * Get key performance indicators (KPIs) for dashboard
 */
export const getDashboardKPIs = async (params?: {
  timeframe?: 'week' | 'month' | 'quarter' | 'year';
}, config?: AxiosRequestConfig): Promise<{
  totalRevenue: number;
  totalProfit: number;
  profitMargin: number;
  averageProjectValue: number;
  resourceUtilization: number;
  clientSatisfaction: number;
}> => {
  return apiClient.get('/api/v1/dashboard/kpis', {
    ...config,
    params,
  });
}; 
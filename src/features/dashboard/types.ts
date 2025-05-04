/**
 * Types Module for Dashboard Feature
 * 
 * This module contains all type definitions for the dashboard feature.
 * Types are organized by their domain and used throughout the feature.
 */

//-----------------------------------------------------------------------------
// Dashboard Data Types
//-----------------------------------------------------------------------------

/**
 * Summary statistics for the dashboard
 */
export interface DashboardSummary {
  totalProjects: number;
  activeProjects: number;
  totalEmployees: number;
  activeEmployees: number;
  upcomingDeadlines: number;
  overduePayments: number;
}

/**
 * Project summary for dashboard display
 */
export interface ProjectSummary {
  id: string;
  name: string;
  client: string;
  startDate: string;
  endDate?: string;
  status: 'not_started' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  progress: number;
  teamSize: number;
}

/**
 * Revenue data point for charts
 */
export interface RevenueDataPoint {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
}

/**
 * Parameters for fetching dashboard data
 */
export interface DashboardParams {
  timeframe?: 'week' | 'month' | 'quarter' | 'year';
  startDate?: string;
  endDate?: string;
  teamId?: string;
  userId?: string;
}

//-----------------------------------------------------------------------------
// Dashboard Widget Types
//-----------------------------------------------------------------------------

/**
 * Widget configuration for dashboard
 */
export interface DashboardWidget {
  id: string;
  type: 'summary' | 'projects' | 'revenue' | 'team' | 'calendar' | 'tasks';
  title: string;
  size: 'small' | 'medium' | 'large';
  position: number;
  refreshInterval?: number;
  settings?: Record<string, any>;
}

/**
 * User dashboard layout/preferences
 */
export interface DashboardPreferences {
  userId: string;
  layout: DashboardWidget[];
  theme?: 'light' | 'dark' | 'system';
  defaultTimeframe: 'week' | 'month' | 'quarter' | 'year';
}

//-----------------------------------------------------------------------------
// Dashboard Notification Types
//-----------------------------------------------------------------------------

/**
 * Dashboard notification
 */
export interface DashboardNotification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
} 
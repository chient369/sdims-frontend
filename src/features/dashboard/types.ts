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
  dateRange: {
    fromDate: string;
    toDate: string;
  };
  widgets: {
    opportunity_status?: OpportunityStatusWidget;
    margin_distribution?: MarginDistributionWidget;
    revenue_summary?: RevenueSummaryWidget;
    employee_status?: EmployeeStatusWidget;
    utilization_rate?: UtilizationRateWidget;
  };
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
  fromDate?: string;
  toDate?: string;
  startDate?: string;
  endDate?: string;
  teamId?: string | null;
  widgets?: string[];
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

//-----------------------------------------------------------------------------
// Dashboard Widget Data Types
//-----------------------------------------------------------------------------

/**
 * Opportunity Status Widget Data
 */
export interface OpportunityStatusWidget {
  totalOpportunities: number;
  byStatus: {
    green: number;
    yellow: number;
    red: number;
  };
  byDealStage: Array<{
    stage: string;
    count: number;
  }>;
  topOpportunities: Array<{
    id: number;
    name: string;
    customer: string;
    value: number;
    stage: string;
    lastInteraction: string;
  }>;
}

/**
 * Margin Distribution Widget Data
 */
export interface MarginDistributionWidget {
  totalEmployees: number;
  distribution: {
    green: { count: number; percentage: number };
    yellow: { count: number; percentage: number };
    red: { count: number; percentage: number };
  };
  trend: Array<{
    month: string;
    value: number;
  }>;
}

/**
 * Revenue Summary Widget Data
 */
export interface RevenueSummaryWidget {
  currentMonth: {
    target: number;
    actual: number;
    achievement: number;
  };
  currentQuarter: {
    target: number;
    actual: number;
    achievement: number;
  };
  ytd: {
    target: number;
    actual: number;
    achievement: number;
  };
  contracts: {
    total: number;
    newlyAdded: number;
  };
  payment: {
    totalDue: number;
    overdue: number;
    upcoming: number;
  };
}

/**
 * Employee Status Widget Data
 */
export interface EmployeeStatusWidget {
  totalEmployees: number;
  byStatus: {
    allocated: number;
    available: number;
    endingSoon: number;
    onLeave: number;
  };
  endingSoonList: Array<{
    id: number;
    name: string;
    projectEndDate: string;
  }>;
}

/**
 * Utilization Rate Widget Data
 */
export interface UtilizationRateWidget {
  overall: number;
  byTeam: Array<{
    team: string;
    rate: number;
  }>;
  trend: Array<{
    month: string;
    value: number;
  }>;
} 
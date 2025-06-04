/**
 * Types Module for Margin Feature
 * 
 * This module contains all type definitions for the margin feature.
 * Types are organized by domain and used throughout the feature.
 */

//-----------------------------------------------------------------------------
// Margin Types
//-----------------------------------------------------------------------------

/**
 * Margin status indicators
 */
export type MarginStatusType = 'Red' | 'Yellow' | 'Green';

/**
 * Time period options
 */
export type PeriodType = 'month' | 'quarter' | 'year';

/**
 * View mode options
 */
export type ViewType = 'table' | 'chart';

/**
 * Group by options
 */
export type GroupByType = 'team' | 'status';

/**
 * Margin data for a specific period
 */
export interface MarginPeriodData {
  period: string;
  periodLabel: string;
  cost: number;
  revenue: number;
  margin: number;
  marginStatus: MarginStatusType;
  billableHours?: number;
  billableRate?: number;
}

/**
 * Employee margin response
 */
export interface EmployeeMarginResponse {
  employeeId: number;
  employeeCode: string;
  name: string;
  position: string;
  team?: {
    id: number;
    name: string;
  };
  status: string;
  currentProject: string | null;
  allocation: number;
  periods: MarginPeriodData[];
}

/**
 * Margin summary information
 */
export interface MarginSummary {
  period: PeriodType;
  periodLabel: string;
  totalEmployees: number;
  averageCost: number;
  averageRevenue: number;
  averageMargin: number;
  statusCounts: {
    Red: number;
    Yellow: number;
    Green: number;
  };
}

/**
 * Parameters for listing employee margins
 */
export interface EmployeeMarginListParams {
  employeeId?: number;
  teamId?: number;
  period?: PeriodType;
  fromDate?: string;
  toDate?: string;
  yearMonth?: string;
  yearQuarter?: string;
  year?: number;
  status?: MarginStatusType;
  sortBy?: 'name' | 'cost' | 'revenue' | 'margin' | 'status';
  sortDir?: 'asc' | 'desc';
  page?: number;
  size?: number;
}

/**
 * Parameters for retrieving margin summary
 */
export interface MarginSummaryParams {
  teamId?: number;
  period?: PeriodType;
  fromDate?: string;
  toDate?: string;
  yearMonth?: string;
  yearQuarter?: string;
  year?: number;
  view?: ViewType;
  groupBy?: GroupByType;
}

/**
 * Margin data grouped by team
 */
export interface TeamMarginData {
  id: number;
  name: string;
  employeeCount: number;
  cost: number;
  revenue: number;
  margin: number;
  marginStatus: MarginStatusType;
  statusCounts: {
    Red: number;
    Yellow: number;
    Green: number;
  };
  trends: {
    margin: number[];
    periods: string[];
  };
}

/**
 * Margin data grouped by status
 */
export interface StatusGroupMarginData {
  status: MarginStatusType;
  count: number;
  percentage: number;
  avgMargin: number;
  totalCost: number;
  totalRevenue: number;
  trends: {
    count: number[];
    periods: string[];
  };
  teams: {
    id: number;
    name: string;
    count: number;
  }[];
}

/**
 * Dataset structure for charts
 */
export interface ChartDataset {
  id: number;
  label: string;
  data: number[];
  statusColors: MarginStatusType[];
}

/**
 * Employee cost data structure
 */
export interface EmployeeCostData {
  employeeId?: number;
  employeeCode?: string;
  basicCost: number;
  allowance?: number;
  overtime?: number;
  otherCosts?: number;
  note?: string;
}

/**
 * Result from cost import operation
 */
export interface CostImportResult {
  importId: string;
  month: string;
  totalRecords: number;
  successCount: number;
  errorCount: number;
  summary?: {
    teamId: number;
    teamName: string;
    totalEmployees: number;
    totalCost: number;
    averageCost: number;
  };
  errors: {
    rowNumber?: number;
    employeeId?: number;
    employeeCode?: string;
    errorType: string;
    message: string;
  }[];
  importedBy: {
    id: number;
    name: string;
  };
  importedAt: string;
}

/**
 * Result from cost update operation
 */
export interface CostUpdateResult {
  month: string;
  totalEmployees: number;
  successCount: number;
  errorCount: number;
  results: {
    employeeId: number;
    employeeCode: string;
    name: string;
    totalCost: number;
    status: 'created' | 'updated';
  }[];
  errors: {
    employeeId?: number;
    employeeCode?: string;
    errorType: string;
    message: string;
  }[];
}

/**
 * Team interface
 */
export interface Team {
  id: number;
  name: string;
  department?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
} 
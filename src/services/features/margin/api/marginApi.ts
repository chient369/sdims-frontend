import apiClient from '../../../core/axios';
import { AxiosRequestConfig } from 'axios';

export type MarginStatusType = 'Red' | 'Yellow' | 'Green';
export type PeriodType = 'month' | 'quarter' | 'year';
export type ViewType = 'table' | 'chart';
export type GroupByType = 'team' | 'status';

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

export interface ChartDataset {
  id: number;
  label: string;
  data: number[];
  statusColors: MarginStatusType[];
}

export interface EmployeeCostData {
  employeeId?: number;
  employeeCode?: string;
  basicCost: number;
  allowance?: number;
  overtime?: number;
  otherCosts?: number;
  note?: string;
}

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
 * Get employee margin data with filtering and pagination
 */
export const getEmployeeMargins = async (params?: EmployeeMarginListParams, config?: AxiosRequestConfig): Promise<{
  summary: MarginSummary;
  content: EmployeeMarginResponse[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    sort?: string;
  };
}> => {
  return apiClient.get('/api/v1/margins/employee', {
    ...config,
    params,
  });
};

/**
 * Get detailed margin data for a specific employee
 */
export const getEmployeeMarginDetail = async (employeeId: number, params?: Omit<EmployeeMarginListParams, 'employeeId'>, config?: AxiosRequestConfig): Promise<{
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
  margins: MarginPeriodData[];
}> => {
  return apiClient.get('/api/v1/margins/employee', {
    ...config,
    params: {
      ...params,
      employeeId,
    },
  });
};

/**
 * Get margin summary data for dashboard/reports
 */
export const getMarginSummary = async (params?: MarginSummaryParams, config?: AxiosRequestConfig): Promise<{
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
}> => {
  return apiClient.get('/api/v1/margins/summary', {
    ...config,
    params,
  });
};

/**
 * Import employee costs from file
 */
export const importEmployeeCosts = async (
  file: File, 
  month: string, 
  options?: { teamId?: number; overwrite?: boolean },
  config?: AxiosRequestConfig
): Promise<CostImportResult> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('month', month);
  
  if (options?.teamId) {
    formData.append('teamId', options.teamId.toString());
  }
  
  if (options?.overwrite !== undefined) {
    formData.append('overwrite', options.overwrite.toString());
  }
  
  return apiClient.post(
    '/api/v1/margins/costs/import',
    formData,
    {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data'
      }
    }
  );
};

/**
 * Update employee costs manually
 */
export const updateEmployeeCosts = async (
  data: {
    month: string;
    overwrite?: boolean;
    employees: EmployeeCostData[];
  },
  config?: AxiosRequestConfig
): Promise<CostUpdateResult> => {
  return apiClient.post('/api/v1/margins/costs', data, config);
}; 
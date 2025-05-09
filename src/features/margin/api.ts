/**
 * Margin API Module
 * 
 * This module serves as an adapter layer between the application and the REST API.
 * It provides functions for direct API communication with the margin endpoints.
 * Each function implements a specific API call and handles the response formatting.
 */

import apiClient from '../../services/core/axios';
import { AxiosRequestConfig } from 'axios';
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
  MarginPeriodData
} from './types';

// Mock data cho margin employees
const MOCK_EMPLOYEE_MARGINS = {
  content: [
    {
      employeeId: 1,
      employeeCode: 'NV001',
      name: 'Nguyễn Văn A',
      position: 'Developer',
      team: { id: 1, name: 'Team A' },
      status: 'Active',
      currentProject: 'Project X',
      allocation: 100,
      periods: [
        {
          period: '2025-04',
          periodLabel: 'Tháng 4/2025',
          cost: 35000000,
          revenue: 52500000,
          margin: 33.33,
          marginStatus: 'Green' as MarginStatusType
        }
      ]
    },
    {
      employeeId: 2,
      employeeCode: 'NV002',
      name: 'Trần Thị B',
      position: 'Developer',
      team: { id: 1, name: 'Team A' },
      status: 'Active',
      currentProject: 'Project Y',
      allocation: 100,
      periods: [
        {
          period: '2025-04',
          periodLabel: 'Tháng 4/2025',
          cost: 40000000,
          revenue: 50000000,
          margin: 20.00,
          marginStatus: 'Yellow' as MarginStatusType
        }
      ]
    },
    {
      employeeId: 3,
      employeeCode: 'NV003',
      name: 'Lê Văn C',
      position: 'Tester',
      team: { id: 2, name: 'Team B' },
      status: 'Active',
      currentProject: 'Project Z',
      allocation: 100,
      periods: [
        {
          period: '2025-04',
          periodLabel: 'Tháng 4/2025',
          cost: 38000000,
          revenue: 42000000,
          margin: 9.52,
          marginStatus: 'Red' as MarginStatusType
        }
      ]
    },
    {
      employeeId: 4,
      employeeCode: 'NV004',
      name: 'Phạm Thị D',
      position: 'Developer',
      team: { id: 2, name: 'Team B' },
      status: 'Active',
      currentProject: 'Project X',
      allocation: 100,
      periods: [
        {
          period: '2025-04',
          periodLabel: 'Tháng 4/2025',
          cost: 42000000,
          revenue: 63000000,
          margin: 33.33,
          marginStatus: 'Green' as MarginStatusType
        }
      ]
    },
    {
      employeeId: 5,
      employeeCode: 'NV005',
      name: 'Hoàng Văn E',
      position: 'Designer',
      team: { id: 3, name: 'Team C' },
      status: 'Active',
      currentProject: 'Project Y',
      allocation: 100,
      periods: [
        {
          period: '2025-04',
          periodLabel: 'Tháng 4/2025',
          cost: 45000000,
          revenue: 60000000,
          margin: 25.00,
          marginStatus: 'Green' as MarginStatusType
        }
      ]
    }
  ],
  summary: {
    period: 'month' as PeriodType,
    periodLabel: 'Tháng 4/2025',
    totalEmployees: 5,
    averageCost: 40000000,
    averageRevenue: 53500000,
    averageMargin: 28.57,
    statusCounts: {
      Red: 1,
      Yellow: 1,
      Green: 3
    }
  },
  pageable: {
    pageNumber: 1,
    pageSize: 5,
    totalPages: 6,
    totalElements: 26
  }
};

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
  console.log("Fetching employee margins with params:", params);
  return Promise.resolve(MOCK_EMPLOYEE_MARGINS);
  
  // Real API call (uncomment when API is ready)
  /*
  return apiClient.get('/api/v1/margins/employee', {
    ...config,
    params,
  });
  */
};

/**
 * Get detailed margin data for a specific employee
 */
export const getEmployeeMarginDetail = async (employeeId: number, params?: Omit<EmployeeMarginListParams, 'employeeId'>, config?: AxiosRequestConfig): Promise<any> => {
  const employee = MOCK_EMPLOYEE_MARGINS.content.find(emp => emp.employeeId === employeeId);
  
  if (!employee) {
    throw new Error('Employee not found');
  }
  
  return Promise.resolve({
    employee: {
      id: employee.employeeId,
      employeeCode: employee.employeeCode,
      name: employee.name,
      position: employee.position,
      team: employee.team,
      status: employee.status,
      currentProject: employee.currentProject,
    },
    summary: {
      period: 'month' as PeriodType,
      fromDate: '2025-04-01',
      toDate: '2025-04-30',
      averageCost: employee.periods[0].cost,
      averageRevenue: employee.periods[0].revenue,
      averageMargin: employee.periods[0].margin,
    },
    margins: employee.periods,
  });
};

/**
 * Get margin summary data for dashboard/reports
 */
export const getMarginSummary = async (params?: MarginSummaryParams, config?: AxiosRequestConfig): Promise<any> => {
  // Return mock data based on MOCK_EMPLOYEE_MARGINS
  return Promise.resolve({
    summary: MOCK_EMPLOYEE_MARGINS.summary,
    teams: [
      { id: 1, name: 'Team A', employeeCount: 2, averageCost: 37500000, averageRevenue: 51250000, averageMargin: 26.67 },
      { id: 2, name: 'Team B', employeeCount: 2, averageCost: 40000000, averageRevenue: 52500000, averageMargin: 21.43 },
      { id: 3, name: 'Team C', employeeCount: 1, averageCost: 45000000, averageRevenue: 60000000, averageMargin: 25.00 }
    ],
    statusGroups: [
      { status: 'Red', count: 1, percentage: 20 },
      { status: 'Yellow', count: 1, percentage: 20 },
      { status: 'Green', count: 3, percentage: 60 }
    ],
    thresholds: {
      Red: 15,
      Yellow: 30
    }
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
  // Mock import result
  return Promise.resolve({
    importId: "IMPORT-2025-04-001",
    month: month,
    totalRecords: 5,
    successCount: 5,
    errorCount: 0,
    summary: {
      teamId: options?.teamId || 0,
      teamName: options?.teamId ? `Team ${options.teamId}` : "Tất cả",
      totalEmployees: 5,
      totalCost: 200000000,
      averageCost: 40000000,
    },
    errors: [],
    importedBy: {
      id: 1,
      name: "Nguyễn Văn A",
    },
    importedAt: new Date().toISOString(),
  });
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
  // Mock update result
  return Promise.resolve({
    month: data.month,
    totalEmployees: data.employees.length,
    successCount: data.employees.length,
    errorCount: 0,
    results: data.employees.map(emp => ({
      employeeId: emp.employeeId || 0,
      employeeCode: emp.employeeCode || '',
      name: `Employee ${emp.employeeId}`,
      totalCost: emp.basicCost + (emp.allowance || 0) + (emp.overtime || 0) + (emp.otherCosts || 0),
      status: 'updated'
    })),
    errors: []
  });
}; 
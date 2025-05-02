import apiClient from '../../../core/axios';
import { AxiosRequestConfig } from 'axios';

export type OpportunityStatus = 'green' | 'yellow' | 'red';
export type MarginStatus = 'green' | 'yellow' | 'red';
export type EmployeeStatus = 'allocated' | 'available' | 'endingSoon' | 'onLeave';

export interface DashboardParams {
  fromDate?: string;
  toDate?: string;
  teamId?: number;
  widgets?: string[];
}

export interface DashboardSummaryResponse {
  dateRange: {
    fromDate: string;
    toDate: string;
  };
  widgets: {
    opportunity_status?: {
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
    };
    margin_distribution?: {
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
    };
    revenue_summary?: {
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
    };
    employee_status?: {
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
    };
    utilization_rate?: {
      overall: number;
      byTeam: Array<{
        team: string;
        rate: number;
      }>;
      trend: Array<{
        month: string;
        value: number;
      }>;
    };
  };
}

/**
 * Get dashboard summary data
 */
export const getDashboardSummary = async (
  params?: DashboardParams,
  config?: AxiosRequestConfig
): Promise<DashboardSummaryResponse> => {
  return apiClient.get('/api/v1/dashboard/summary', {
    ...config,
    params,
  });
}; 
/**
 * Reports Service Module
 * 
 * This module provides a higher-level interface for interacting with report data,
 * encapsulating API calls and adding business logic when needed.
 */

import { BaseApiService } from '../../services/core/baseApi';

import {
  // Dashboard Types
  DashboardParams,
  DashboardSummaryResponse,
  
  // Employee Report Types
  EmployeeReportParams,
  EmployeeReportResponse,
  
  // Margin Report Types
  MarginReportParams,
  MarginReportResponse,
  
  // Opportunity Report Types
  OpportunityReportParams,
  OpportunityReportResponse,
  
  // Contract Report Types
  ContractReportParams,
  ContractReportResponse,
  
  // Payment Report Types
  PaymentReportParams,
  PaymentReportResponse,
  
  // KPI Report Types
  KpiReportParams,
  KpiReportResponse,
  
  // Utilization Report Types
  UtilizationReportParams,
  UtilizationReportResponse
} from './types';

import {
  getDashboardSummary as getDashboardSummaryApi,
  getEmployeeReport as getEmployeeReportApi,
  getMarginReport as getMarginReportApi,
  getOpportunityReport as getOpportunityReportApi,
  getContractReport as getContractReportApi,
  getPaymentReport as getPaymentReportApi,
  getKpiProgressReport as getKpiProgressReportApi,
  getUtilizationReport as getUtilizationReportApi
} from './api';

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
  async getDataForDateRange(fromDate: string, toDate: string, teamId?: number): Promise<DashboardSummaryResponse> {
    return this.getSummary({
      fromDate,
      toDate,
      teamId
    });
  }
}

/**
 * Service for all report operations
 */
class ReportService extends BaseApiService {
  constructor() {
    super('/api/v1/reports');
  }

  /**
   * Get employee detailed report
   */
  async getEmployeeReport(params?: EmployeeReportParams): Promise<EmployeeReportResponse | Blob> {
    return getEmployeeReportApi(params);
  }

  /**
   * Get employee report with CSV/Excel export
   */
  async exportEmployeeReport(params: EmployeeReportParams, format: 'csv' | 'excel'): Promise<Blob> {
    return getEmployeeReportApi({
      ...params,
      exportType: format
    }) as Promise<Blob>;
  }

  /**
   * Get margin report
   */
  async getMarginReport(params?: MarginReportParams): Promise<MarginReportResponse | Blob> {
    return getMarginReportApi(params);
  }

  /**
   * Get opportunity report
   */
  async getOpportunityReport(params?: OpportunityReportParams): Promise<OpportunityReportResponse | Blob> {
    return getOpportunityReportApi(params);
  }

  /**
   * Get contract report
   */
  async getContractReport(params?: ContractReportParams): Promise<ContractReportResponse | Blob> {
    return getContractReportApi(params);
  }

  /**
   * Get payment report
   */
  async getPaymentReport(params?: PaymentReportParams): Promise<PaymentReportResponse | Blob> {
    return getPaymentReportApi(params);
  }

  /**
   * Get KPI progress report
   */
  async getKpiProgressReport(params?: KpiReportParams): Promise<KpiReportResponse | Blob> {
    return getKpiProgressReportApi(params);
  }

  /**
   * Get utilization report
   */
  async getUtilizationReport(params?: UtilizationReportParams): Promise<UtilizationReportResponse | Blob> {
    return getUtilizationReportApi(params);
  }

  /**
   * Get a complete performance report package
   * Business logic combining multiple reports into one convenient method
   */
  async getPerformanceOverview(teamId?: number, period: 'month' | 'quarter' | 'year' = 'month'): Promise<{
    marginData: MarginReportResponse;
    utilizationData: UtilizationReportResponse;
    kpiData: KpiReportResponse;
  }> {
    const [marginData, utilizationData, kpiData] = await Promise.all([
      this.getMarginReport({
        teamId,
        period,
        groupBy: 'team',
        page: 1,
        size: 100
      }) as Promise<MarginReportResponse>,
      
      this.getUtilizationReport({
        teamId,
        period,
        groupBy: 'team',
        page: 1,
        size: 100
      }) as Promise<UtilizationReportResponse>,
      
      this.getKpiProgressReport({
        teamId,
        period,
        page: 1,
        size: 100
      }) as Promise<KpiReportResponse>
    ]);

    return {
      marginData,
      utilizationData,
      kpiData
    };
  }

  /**
   * Get data for executive dashboard
   * Business logic combining multiple reports into one convenient method
   */
  async getExecutiveSummary(fromDate?: string, toDate?: string): Promise<{
    opportunities: {
      total: number;
      byStage: { stage: string; count: number; value: number }[];
    };
    contracts: {
      active: number;
      total: number;
      value: number;
    };
    revenue: {
      total: number;
      byMonth: { month: string; value: number }[];
    };
    margins: {
      average: number;
      distribution: { status: string; count: number; percentage: number }[];
    };
    utilization: {
      average: number;
      byTeam: { team: string; value: number }[];
    };
  }> {
    const [opportunityData, contractData, marginData, utilizationData] = await Promise.all([
      this.getOpportunityReport({
        fromDate,
        toDate,
        page: 1,
        size: 1 // We only need the summary data
      }) as Promise<OpportunityReportResponse>,
      
      this.getContractReport({
        fromDate,
        toDate,
        page: 1,
        size: 1 // We only need the summary data
      }) as Promise<ContractReportResponse>,
      
      this.getMarginReport({
        fromDate,
        toDate,
        page: 1,
        size: 1 // We only need the summary data
      }) as Promise<MarginReportResponse>,
      
      this.getUtilizationReport({
        fromDate,
        toDate,
        page: 1,
        size: 1 // We only need the summary data
      }) as Promise<UtilizationReportResponse>
    ]);

    return {
      opportunities: {
        total: opportunityData.summary.totalOpportunities,
        byStage: opportunityData.summary.stageDistribution
      },
      contracts: {
        active: contractData.summary.statusDistribution.find(d => d.status === 'Active')?.count || 0,
        total: contractData.summary.totalContracts,
        value: contractData.summary.totalValue
      },
      revenue: {
        total: contractData.summary.totalPaid,
        byMonth: [] // Would need additional API call for this data
      },
      margins: {
        average: marginData.summary.averageMargin,
        distribution: marginData.summary.statusDistribution
      },
      utilization: {
        average: utilizationData.summary.averageUtilization,
        byTeam: (utilizationData.teams || []).map(team => ({
          team: team.name,
          value: team.utilization
        }))
      }
    };
  }
}

// Create and export singleton instances
export const dashboardService = new DashboardService();
export const reportService = new ReportService();

// Default exports
export default { dashboardService, reportService }; 
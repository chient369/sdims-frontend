import { BaseApiService } from '../../../core/baseApi';
import {
  // Employee Report Types
  EmployeeReportParams,
  EmployeeReportResponse,
  getEmployeeReport as getEmployeeReportApi,
  
  // Margin Report Types
  MarginReportParams, 
  MarginReportResponse,
  getMarginReport as getMarginReportApi,
  
  // Opportunity Report Types
  OpportunityReportParams,
  OpportunityReportResponse,
  getOpportunityReport as getOpportunityReportApi,
  
  // Contract Report Types
  ContractReportParams,
  ContractReportResponse,
  getContractReport as getContractReportApi,
  
  // Payment Report Types
  PaymentReportParams,
  PaymentReportResponse,
  getPaymentReport as getPaymentReportApi,
  
  // KPI Progress Report Types
  KpiReportParams,
  KpiReportResponse,
  getKpiProgressReport as getKpiProgressReportApi,
  
  // Utilization Report Types
  UtilizationReportParams,
  UtilizationReportResponse,
  getUtilizationReport as getUtilizationReportApi
} from '../api';

/**
 * Centralized service for all report operations
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
   * Get margin detailed report
   */
  async getMarginReport(params?: MarginReportParams): Promise<MarginReportResponse | Blob> {
    return getMarginReportApi(params);
  }

  /**
   * Get opportunity detailed report
   */
  async getOpportunityReport(params?: OpportunityReportParams): Promise<OpportunityReportResponse | Blob> {
    return getOpportunityReportApi(params);
  }

  /**
   * Get contract detailed report
   */
  async getContractReport(params?: ContractReportParams): Promise<ContractReportResponse | Blob> {
    return getContractReportApi(params);
  }

  /**
   * Get payment status detailed report
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
   * Export any report to Excel (convenience method)
   */
  async exportToExcel(
    reportType: 'employee' | 'margin' | 'opportunity' | 'contract' | 'payment' | 'kpi' | 'utilization',
    params: any = {}
  ): Promise<Blob> {
    const exportParams = {
      ...params,
      exportType: 'excel'
    };

    switch (reportType) {
      case 'employee':
        return this.getEmployeeReport(exportParams) as Promise<Blob>;
      case 'margin':
        return this.getMarginReport(exportParams) as Promise<Blob>;
      case 'opportunity':
        return this.getOpportunityReport(exportParams) as Promise<Blob>;
      case 'contract':
        return this.getContractReport(exportParams) as Promise<Blob>;
      case 'payment':
        return this.getPaymentReport(exportParams) as Promise<Blob>;
      case 'kpi':
        return this.getKpiProgressReport(exportParams) as Promise<Blob>;
      case 'utilization':
        return this.getUtilizationReport(exportParams) as Promise<Blob>;
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }
  }
}

export const reportService = new ReportService(); 
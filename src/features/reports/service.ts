/**
 * Reports Service Module
 * 
 * This module provides a higher-level interface for interacting with report data,
 * encapsulating API calls and adding business logic when needed.
 */

import { BaseApiService } from '../../services/core/baseApi';

import {
  // Report List Types
  Report,
  ReportModule,
  ReportType,
  ReportListParams,
  ReportListResponse,
  
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
  getEmployeeReport as getEmployeeReportApi,
  getMarginReport as getMarginReportApi,
  getOpportunityReport as getOpportunityReportApi,
  getContractReport as getContractReportApi,
  getPaymentReport as getPaymentReportApi,
  getKpiProgressReport as getKpiProgressReportApi,
  getUtilizationReport as getUtilizationReportApi
} from './api';

class ReportService extends BaseApiService {
  // Predefined report definitions
  private reportDefinitions: Report[] = [
    {
      id: 'employee-list',
      name: 'Danh sách nhân viên',
      description: 'Báo cáo chi tiết về danh sách nhân viên, kỹ năng, và trạng thái hiện tại.',
      module: 'hrm',
      type: 'operational',
      url: '/reports/employee-list',
      permission: 'report:read:team',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    },
    {
      id: 'margin-detail',
      name: 'Báo cáo Margin',
      description: 'Báo cáo chi tiết về margin theo nhân viên và team.',
      module: 'margin',
      type: 'analytical',
      url: '/reports/margin-detail',
      permission: 'margin:read:team',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    },
    {
      id: 'opportunity-list',
      name: 'Danh sách cơ hội kinh doanh',
      description: 'Báo cáo chi tiết về các cơ hội kinh doanh và trạng thái.',
      module: 'opportunity',
      type: 'operational',
      url: '/reports/opportunity-list',
      permission: 'opportunity:read:all',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    },
    {
      id: 'contract-list',
      name: 'Danh sách hợp đồng',
      description: 'Báo cáo chi tiết về danh sách hợp đồng và trạng thái.',
      module: 'contract',
      type: 'operational',
      url: '/reports/contract-list',
      permission: 'contract:read:all',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    },
    {
      id: 'payment-status',
      name: 'Tình trạng thanh toán',
      description: 'Báo cáo chi tiết về tình trạng thanh toán và công nợ.',
      module: 'finance',
      type: 'analytical',
      url: '/reports/payment-status',
      permission: 'payment-status:read:all',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    },
    {
      id: 'kpi-progress',
      name: 'Tiến độ KPI',
      description: 'Báo cáo tiến độ KPI doanh thu của Sales.',
      module: 'dashboard',
      type: 'summary',
      url: '/reports/kpi-progress',
      permission: 'revenue-report:read:all',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    },
    {
      id: 'utilization',
      name: 'Tỷ lệ sử dụng nguồn lực',
      description: 'Báo cáo tỷ lệ sử dụng nguồn lực của nhân viên và team.',
      module: 'hrm',
      type: 'analytical',
      url: '/reports/utilization',
      permission: 'utilization:read:team',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    }
  ];

  constructor() {
    super('/api/v1/reports');
  }

  /**
   * Get list of available reports with filtering
   */
  async getReportsList(params?: ReportListParams): Promise<ReportListResponse> {
    // Start with local report definitions
    let reports = [...this.reportDefinitions];
    
    // Apply filters if provided
    if (params) {
      // Filter by module
      if (params.module) {
        reports = reports.filter(report => report.module === params.module);
      }
      
      // Filter by type
      if (params.type) {
        reports = reports.filter(report => report.type === params.type);
      }
      
      // Filter by search term
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        reports = reports.filter(report => 
          report.name.toLowerCase().includes(searchLower) || 
          report.description.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply sorting if provided
      if (params.sortBy) {
        const direction = params.sortDirection === 'desc' ? -1 : 1;
        reports.sort((a, b) => {
          // @ts-ignore - Dynamic property access
          const aValue = a[params.sortBy!];
          // @ts-ignore - Dynamic property access
          const bValue = b[params.sortBy!];
          
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return direction * aValue.localeCompare(bValue);
          }
          
          return direction * ((aValue > bValue) ? 1 : -1);
        });
      }
    }
    
    // Apply pagination if needed
    const page = params?.page || 1;
    const size = params?.size || reports.length;
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const paginatedReports = reports.slice(startIndex, endIndex);
    
    // Return formatted response
    return {
      data: paginatedReports,
      pagination: {
        page,
        size,
        total: reports.length,
        totalPages: Math.ceil(reports.length / size)
      }
    };
  }

  /**
   * Mở một báo cáo cụ thể
   * @param report - Report object với ID
   * @returns Báo cáo được mở
   */
  openReport(report: any): Promise<void> {
    return new Promise(async (resolve) => {
      // Trong môi trường thực, có thể cần gọi API để đánh dấu là báo cáo đã được xem
      console.log(`Mở báo cáo: ${report.id}`);
      
      // Giả lập fetch API
      await new Promise(resolve => setTimeout(resolve, 100));
      
      resolve();
    });
  }

  /**
   * Get employee report
   */
  async getEmployeeReport(params?: EmployeeReportParams): Promise<EmployeeReportResponse | Blob> {
    return getEmployeeReportApi(params);
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
   * Lấy metadata của một báo cáo cụ thể
   * @param reportId - ID báo cáo
   * @returns Metadata của báo cáo
   */
  getReportMetadata(reportId: string): Promise<any> {
    // API-RPT-002 đến API-RPT-008 đều có cấu trúc endpoint tương tự
    // Theo thiết kế API: /api/v1/reports/{reportId}
    return this.getById(reportId);
  }

  /**
   * Lấy dữ liệu của một báo cáo cụ thể
   * @param reportId - ID báo cáo
   * @param params - Các tham số lọc
   * @returns Dữ liệu báo cáo
   */
  async getReportData(reportId: string, params: Record<string, any>): Promise<any> {
    try {
      // Mapping reportId sang endpoint phù hợp
      switch (reportId) {
        case 'employee-list':
          return this.getEmployeeReport(params);
        case 'margin-detail':
          return this.getMarginReport(params);
        case 'opportunity-list':
          return this.getOpportunityReport(params);
        case 'contract-list':
          return this.getContractReport(params);
        case 'payment-status':
          return this.getPaymentReport(params);
        case 'kpi-progress':
          return this.getKpiProgressReport(params);
        case 'utilization':
          return this.getUtilizationReport(params);
        default:
          // Theo thiết kế API: POST /api/v1/reports/{reportId}/data
          return this.create(`/${reportId}/data`, params);
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu báo cáo:', error);
      throw error;
    }
  }

  /**
   * Xuất báo cáo ra file
   * @param reportId - ID báo cáo
   * @param params - Các tham số lọc và loại xuất
   * @returns Blob dữ liệu file
   */
  async exportReport(reportId: string, params: Record<string, any>): Promise<void> {
    try {
      // Xác định endpoint dựa vào reportId
      let apiEndpoint = '';
      
      // Mapping reportId sang endpoint phù hợp
      switch (reportId) {
        case 'employee-list':
          apiEndpoint = 'employee-list';
          break;
        case 'margin-detail':
          apiEndpoint = 'margin-detail';
          break;
        case 'opportunity-list':
          apiEndpoint = 'opportunity-list';
          break;
        case 'contract-list':
          apiEndpoint = 'contract-list';
          break;
        case 'payment-status':
          apiEndpoint = 'payment-status';
          break;
        case 'kpi-progress':
          apiEndpoint = 'kpi-progress';
          break;
        case 'utilization':
          apiEndpoint = 'utilization';
          break;
        default:
          apiEndpoint = reportId;
      }
      
      // Gọi API export
      const exportParams = { ...params, exportType: params.exportType || 'excel' };
      
      // Sử dụng request với responseType: 'blob' để tải file
      // Theo thiết kế API: POST /api/v1/reports/{reportId}/export
      const response = await this.request<Blob>({
        method: 'POST',
        url: `${this.endpoint}/${apiEndpoint}/export`,
        data: exportParams,
        responseType: 'blob'
      });
      
      // Tạo URL và download file
      const url = window.URL.createObjectURL(response);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportId}-${new Date().toISOString().slice(0, 10)}.${params.exportType || 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Lỗi khi xuất báo cáo:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const reportService = new ReportService(); 
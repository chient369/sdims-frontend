import apiClient from '../../../core/axios';
import { AxiosRequestConfig } from 'axios';

export type ContractStatus = 'Active' | 'Completed' | 'Terminated' | 'Draft';
export type ExportType = 'json' | 'csv' | 'excel';

export interface ContractReportParams {
  customerId?: number;
  salesId?: number;
  status?: ContractStatus;
  fromDate?: string;
  toDate?: string;
  keyword?: string;
  includePayments?: boolean;
  includeEmployees?: boolean;
  includeFiles?: boolean;
  exportType?: ExportType;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface ContractPaymentTerm {
  id: number;
  description: string;
  amount: number;
  dueDate: string;
  paymentStatus: 'Paid' | 'Pending' | 'Overdue';
  paidDate?: string;
  paidAmount?: number;
}

export interface ContractEmployee {
  id: number;
  employeeCode: string;
  name: string;
  position: string;
  allocation: number;
  startDate: string;
  endDate?: string;
}

export interface ContractFile {
  id: number;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  uploadedBy: {
    id: number;
    name: string;
  };
  size: number;
}

export interface ContractReportItem {
  id: number;
  code: string;
  name: string;
  customer: {
    id: number;
    name: string;
    industry?: string;
  };
  startDate: string;
  endDate: string;
  status: ContractStatus;
  totalValue: number;
  paidValue: number;
  remainingValue: number;
  sales: {
    id: number;
    name: string;
  };
  paymentTerms?: ContractPaymentTerm[];
  employees?: ContractEmployee[];
  files?: ContractFile[];
  createdAt: string;
  updatedAt?: string;
}

export interface ContractReportResponse {
  reportInfo: {
    reportName: string;
    generatedAt: string;
    fromDate: string;
    toDate: string;
    filters: Record<string, unknown>;
  };
  summaryMetrics: {
    totalContracts: number;
    totalValue: number;
    byStatus: {
      Active: number;
      Completed: number;
      Terminated: number;
      Draft: number;
    };
    byCustomer: Array<{
      name: string;
      count: number;
      value: number;
    }>;
    bySales: Array<{
      name: string;
      count: number;
      value: number;
    }>;
    contractTimeline: Array<{
      month: string;
      count: number;
      value: number;
    }>;
  };
  content: ContractReportItem[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    sort?: string;
  };
}

/**
 * Get detailed contract report
 */
export const getContractReport = async (
  params?: ContractReportParams,
  config?: AxiosRequestConfig
): Promise<ContractReportResponse | Blob> => {
  // If export type is excel or csv, return a Blob instead of JSON
  if (params?.exportType && params.exportType !== 'json') {
    return apiClient.get('/api/v1/reports/contract-list', {
      ...config,
      params,
      responseType: 'blob'
    });
  }
  
  return apiClient.get('/api/v1/reports/contract-list', {
    ...config,
    params,
  });
}; 
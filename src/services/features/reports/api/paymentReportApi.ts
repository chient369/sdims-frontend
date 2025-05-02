import apiClient from '../../../core/axios';
import { AxiosRequestConfig } from 'axios';

export type PaymentStatus = 'Paid' | 'Pending' | 'Overdue';
export type ExportType = 'json' | 'csv' | 'excel';

export interface PaymentReportParams {
  customerId?: number;
  salesId?: number;
  status?: PaymentStatus;
  fromDueDate?: string;
  toDueDate?: string;
  fromPaidDate?: string;
  toPaidDate?: string;
  keyword?: string;
  exportType?: ExportType;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface PaymentReportItem {
  id: number;
  contractId: number;
  contractCode: string;
  contractName: string;
  customer: {
    id: number;
    name: string;
  };
  description: string;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
  paidDate?: string;
  paidAmount?: number;
  remainingAmount?: number;
  daysOverdue?: number;
  sales: {
    id: number;
    name: string;
    email: string;
  };
  notes?: string;
}

export interface PaymentReportResponse {
  reportInfo: {
    reportName: string;
    generatedAt: string;
    filters: Record<string, unknown>;
  };
  summaryMetrics: {
    totalPaymentTerms: number;
    totalAmount: number;
    byStatus: {
      Paid: {
        count: number;
        amount: number;
      };
      Pending: {
        count: number;
        amount: number;
      };
      Overdue: {
        count: number;
        amount: number;
      };
    };
    byCustomer: Array<{
      name: string;
      pendingAmount: number;
      overdueAmount: number;
    }>;
    upcomingPayments: Array<{
      month: string;
      amount: number;
    }>;
    paymentTimeline: Array<{
      month: string;
      paid: number;
      expected: number;
    }>;
  };
  content: PaymentReportItem[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    sort?: string;
  };
}

/**
 * Get detailed payment status report
 */
export const getPaymentReport = async (
  params?: PaymentReportParams,
  config?: AxiosRequestConfig
): Promise<PaymentReportResponse | Blob> => {
  // If export type is excel or csv, return a Blob instead of JSON
  if (params?.exportType && params.exportType !== 'json') {
    return apiClient.get('/api/v1/reports/payment-status', {
      ...config,
      params,
      responseType: 'blob'
    });
  }
  
  return apiClient.get('/api/v1/reports/payment-status', {
    ...config,
    params,
  });
}; 
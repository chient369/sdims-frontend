import apiClient from '../../../core/axios';
import { AxiosRequestConfig } from 'axios';

export type FollowUpStatus = 'red' | 'yellow' | 'green';
export type DealStage = 'Appointment' | 'Demo' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
export type ExportType = 'json' | 'csv' | 'excel';

export interface OpportunityReportParams {
  customerId?: number;
  salesId?: number;
  leaderId?: number;
  dealStage?: DealStage;
  followUpStatus?: FollowUpStatus;
  onsite?: boolean;
  fromDate?: string;
  toDate?: string;
  keyword?: string;
  includeNotes?: boolean;
  includeLeaders?: boolean;
  exportType?: ExportType;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface OpportunityNote {
  id: number;
  content: string;
  createdBy: {
    id: number;
    name: string;
  };
  createdAt: string;
}

export interface OpportunityLeader {
  id: number;
  name: string;
  assignDate: string;
}

export interface OpportunityReportItem {
  id: number;
  hubspotId?: string;
  name: string;
  customer: {
    id: number;
    name: string;
    industry?: string;
  };
  dealStage: DealStage;
  estimatedValue: number;
  createdDate: string;
  lastInteractionDate: string;
  followUpStatus: FollowUpStatus;
  sales: {
    id: number;
    name: string;
    email: string;
  };
  leaders?: OpportunityLeader[];
  onsite: boolean;
  notes?: OpportunityNote[];
}

export interface OpportunityReportResponse {
  reportInfo: {
    reportName: string;
    generatedAt: string;
    fromDate: string;
    toDate: string;
    filters: Record<string, unknown>;
  };
  summaryMetrics: {
    totalOpportunities: number;
    byFollowUp: {
      red: number;
      yellow: number;
      green: number;
    };
    byDealStage: {
      [key in DealStage]?: number;
    };
    onsitePriority: number;
    byCustomer: Array<{
      name: string;
      count: number;
    }>;
    bySales: Array<{
      name: string;
      count: number;
    }>;
  };
  content: OpportunityReportItem[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    sort?: string;
  };
}

/**
 * Get detailed opportunity report
 */
export const getOpportunityReport = async (
  params?: OpportunityReportParams,
  config?: AxiosRequestConfig
): Promise<OpportunityReportResponse | Blob> => {
  // If export type is excel or csv, return a Blob instead of JSON
  if (params?.exportType && params.exportType !== 'json') {
    return apiClient.get('/api/v1/reports/opportunity-list', {
      ...config,
      params,
      responseType: 'blob'
    });
  }
  
  return apiClient.get('/api/v1/reports/opportunity-list', {
    ...config,
    params,
  });
}; 
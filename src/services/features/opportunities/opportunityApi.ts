import apiClient from '../../core/axios';
import { AxiosRequestConfig } from 'axios';
import { buildQueryParams, createFileUploadConfig } from '../../core/utils';

export interface OpportunityListParams {
  page?: number;
  limit?: number;
  keyword?: string;
  dealStage?: string;
  clientId?: string;
  assignedToId?: string;
  followupStatus?: 'Red' | 'Yellow' | 'Green';
  onsitePriority?: boolean;
  createdDateFrom?: string;
  createdDateTo?: string;
  lastInteractionFrom?: string;
  lastInteractionTo?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface OpportunityResponse {
  id: string;
  opportunityCode: string;
  name: string;
  client: {
    id: string;
    name: string;
  };
  estimatedValue: number;
  currency: string;
  dealStage: string;
  probability: number;
  expectedCloseDate: string;
  description?: string;
  createdBy: {
    id: string;
    name: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    teamId?: string;
    teamName?: string;
  }[];
  createdAt: string;
  updatedAt: string;
  lastInteractionDate?: string;
  followupStatus: 'Red' | 'Yellow' | 'Green';
  onsitePriority: boolean;
  hubspotId?: string;
  hubspotLastSynced?: string;
}

export interface OpportunityCreateData {
  name: string;
  clientId: string;
  estimatedValue: number;
  currency?: string;
  dealStage: string;
  probability?: number;
  expectedCloseDate?: string;
  description?: string;
  onsitePriority?: boolean;
}

export interface OpportunityUpdateData extends Partial<OpportunityCreateData> {}

export interface OpportunityNoteResponse {
  id: string;
  opportunityId: string;
  content: string;
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt?: string;
  attachments?: {
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    downloadUrl: string;
  }[];
}

export interface OpportunityNoteCreateData {
  content: string;
  attachments?: File[];
}

export interface SyncLogResponse {
  id: string;
  startTime: string;
  endTime: string;
  status: 'success' | 'failed' | 'in_progress';
  totalRecords: number;
  createdCount: number;
  updatedCount: number;
  errorCount: number;
  errorDetails?: string;
  triggerType: 'manual' | 'scheduled';
  triggeredBy?: {
    id: string;
    name: string;
  };
}

/**
 * Get opportunities with filtering and pagination
 */
export const getOpportunities = async (params?: OpportunityListParams, config?: AxiosRequestConfig): Promise<{
  data: OpportunityResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> => {
  return apiClient.get('/api/v1/opportunities', { 
    ...config,
    params,
  });
};

/**
 * Get opportunity by ID
 */
export const getOpportunityById = async (id: string, config?: AxiosRequestConfig): Promise<OpportunityResponse> => {
  return apiClient.get(`/api/v1/opportunities/${id}`, config);
};

/**
 * Create a new opportunity
 */
export const createOpportunity = async (data: OpportunityCreateData, config?: AxiosRequestConfig): Promise<OpportunityResponse> => {
  return apiClient.post('/api/v1/opportunities', data, config);
};

/**
 * Update an opportunity
 */
export const updateOpportunity = async (id: string, data: OpportunityUpdateData, config?: AxiosRequestConfig): Promise<OpportunityResponse> => {
  return apiClient.put(`/api/v1/opportunities/${id}`, data, config);
};

/**
 * Delete an opportunity
 */
export const deleteOpportunity = async (id: string, config?: AxiosRequestConfig): Promise<void> => {
  return apiClient.delete(`/api/v1/opportunities/${id}`, config);
};

/**
 * Trigger manual sync from Hubspot
 */
export const syncOpportunities = async (config?: AxiosRequestConfig): Promise<{
  id: string;
  status: 'in_progress';
  message: string;
}> => {
  return apiClient.post('/api/v1/opportunities/sync', {}, config);
};

/**
 * Get synchronization logs
 */
export const getSyncLogs = async (params?: {
  page?: number;
  limit?: number;
  status?: 'success' | 'failed' | 'in_progress';
  dateFrom?: string;
  dateTo?: string;
}, config?: AxiosRequestConfig): Promise<{
  data: SyncLogResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> => {
  return apiClient.get('/api/v1/opportunities/sync/logs', {
    ...config,
    params
  });
};

/**
 * Assign leader to opportunity
 */
export const assignLeaderToOpportunity = async (
  opportunityId: string,
  data: { 
    leaderId: string;
    message?: string;
    notifyLeader?: boolean;
  },
  config?: AxiosRequestConfig
): Promise<OpportunityResponse> => {
  return apiClient.post(`/api/v1/opportunities/${opportunityId}/assign`, data, config);
};

/**
 * Remove leader from opportunity
 */
export const removeLeaderFromOpportunity = async (
  opportunityId: string,
  leaderId: string,
  config?: AxiosRequestConfig
): Promise<OpportunityResponse> => {
  return apiClient.delete(`/api/v1/opportunities/${opportunityId}/assign/${leaderId}`, config);
};

/**
 * Add note to opportunity
 */
export const addOpportunityNote = async (
  opportunityId: string,
  data: OpportunityNoteCreateData,
  config?: AxiosRequestConfig
): Promise<OpportunityNoteResponse> => {
  const formData = new FormData();
  formData.append('content', data.content);
  
  if (data.attachments && data.attachments.length > 0) {
    data.attachments.forEach(file => {
      formData.append('attachments', file);
    });
  }
  
  return apiClient.post(
    `/api/v1/opportunities/${opportunityId}/notes`,
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
 * Get opportunity notes
 */
export const getOpportunityNotes = async (
  opportunityId: string,
  params?: {
    page?: number;
    limit?: number;
  },
  config?: AxiosRequestConfig
): Promise<{
  data: OpportunityNoteResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> => {
  return apiClient.get(`/api/v1/opportunities/${opportunityId}/notes`, {
    ...config,
    params
  });
};

/**
 * Update onsite priority flag
 */
export const updateOnsitePriority = async (
  opportunityId: string,
  data: {
    onsitePriority: boolean;
    reason?: string;
  },
  config?: AxiosRequestConfig
): Promise<OpportunityResponse> => {
  return apiClient.put(`/api/v1/opportunities/${opportunityId}/onsite`, data, config);
}; 
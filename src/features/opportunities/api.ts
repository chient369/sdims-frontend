import apiClient from '../../services/core/axios';
import { AxiosRequestConfig } from 'axios';
import { buildQueryParams, createFileUploadConfig } from '../../services/core/utils';
import { 
  OpportunityListParams, 
  OpportunityResponse, 
  OpportunityCreateData, 
  OpportunityUpdateData,
  OpportunityNoteResponse,
  OpportunityNoteCreateData,
  SyncLogResponse
} from './types';

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
  return apiClient.post(`/api/v1/opportunities/${opportunityId}/leaders`, data, config);
};

/**
 * Remove leader from opportunity
 */
export const removeLeaderFromOpportunity = async (
  opportunityId: string,
  leaderId: string,
  config?: AxiosRequestConfig
): Promise<OpportunityResponse> => {
  return apiClient.delete(`/api/v1/opportunities/${opportunityId}/leaders/${leaderId}`, config);
};

/**
 * Add a note to an opportunity
 */
export const addOpportunityNote = async (
  opportunityId: string,
  data: OpportunityNoteCreateData,
  config?: AxiosRequestConfig
): Promise<OpportunityNoteResponse> => {
  // Handle file uploads if there are attachments
  if (data.attachments && data.attachments.length > 0) {
    const formData = new FormData();
    formData.append('content', data.content);
    
    data.attachments.forEach((file: File) => {
      formData.append('attachments', file);
    });
    
    const uploadConfig = createFileUploadConfig(config);
    
    return apiClient.post(
      `/api/v1/opportunities/${opportunityId}/notes`, 
      formData,
      uploadConfig
    );
  }
  
  return apiClient.post(
    `/api/v1/opportunities/${opportunityId}/notes`, 
    { content: data.content },
    config
  );
};

/**
 * Get notes for an opportunity
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
 * Update opportunity onsite priority
 */
export const updateOnsitePriority = async (
  opportunityId: string,
  data: {
    onsitePriority: boolean;
    reason?: string;
  },
  config?: AxiosRequestConfig
): Promise<OpportunityResponse> => {
  return apiClient.put(`/api/v1/opportunities/${opportunityId}/onsite-priority`, data, config);
}; 
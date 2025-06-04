import apiClient from '../../services/core/axios';
import { AxiosRequestConfig } from 'axios';
import { buildQueryParams } from '../../services/core/utils';
import { 
  OpportunityListParams, 
  OpportunityResponse, 
  OpportunityCreateData, 
  OpportunityUpdateData,
  OpportunityNoteResponse,
  OpportunityNoteCreateData,
  SyncLogResponse,
  OpportunityAttachment,
  OpportunityAttachmentListParams,
  OpportunityListResponse
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
  const response = await apiClient.get<OpportunityListResponse>('/api/v1/opportunities', { 
    ...config,
    params,
  });
  
  // Kiểm tra cấu trúc API mới
  if (response.data && response.data.content) {
    return {
      data: response.data.content,
      meta: {
        total: response.data.summary.totalCount || 0,
        page: response.data.pageable.pageNumber || 1,
        limit: response.data.pageable.pageSize || 10,
        totalPages: response.data.pageable.totalPages || 1
      }
    };
  }
  
  // Trả về response gốc nếu không cần chuyển đổi
  return {
    data: [],
    meta: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0
    }
  };
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
    
    // Add new fields to formData if they exist
    if (data.type) {
      formData.append('type', data.type);
    }
    
    // Thêm activityType nếu có
    if (data.activityType) {
      formData.append('activityType', data.activityType);
    }
    
    if (data.tags && data.tags.length > 0) {
      data.tags.forEach(tag => {
        formData.append('tags[]', tag);
      });
    }
    
    if (data.isInteraction !== undefined) {
      formData.append('isInteraction', data.isInteraction.toString());
    }
    
    data.attachments.forEach((file: File) => {
      formData.append('attachments', file);
    });
    
    return apiClient.post(
      `/api/v1/opportunities/${opportunityId}/notes`, 
      formData,
      {
        ...config,
        headers: {
          ...(config?.headers || {}),
          'Content-Type': 'multipart/form-data',
        }
      }
    );
  }
  
  // No attachments, send regular JSON
  return apiClient.post(
    `/api/v1/opportunities/${opportunityId}/notes`, 
    {
      content: data.content,
      type: data.type,
      activityType: data.activityType,
      tags: data.tags,
      isInteraction: data.isInteraction
    },
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
    size?: number;
    activityType?: string | string[];
    fromDate?: string;
    toDate?: string;
    createdBy?: string | string[];
    includeAttachments?: boolean;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
  },
  config?: AxiosRequestConfig
): Promise<{
  data: OpportunityNoteResponse[];
  pageable?: {
    totalElements: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  };
}> => {
  // Xử lý params đặc biệt
  let queryParams = { ...params };
  
  // Xử lý mảng để gửi đúng định dạng API
  if (Array.isArray(queryParams.activityType)) {
    queryParams.activityType = queryParams.activityType.join(',');
  }
  
  if (Array.isArray(queryParams.createdBy)) {
    queryParams.createdBy = queryParams.createdBy.join(',');
  }
  
  const response = await apiClient.get(`/api/v1/opportunities/${opportunityId}/notes`, {
    ...config,
    params: queryParams
  });

  // Nếu API trả về định dạng mới với data array
  if (response.data && Array.isArray(response.data)) {
    return {
      data: response.data.map((note: any) => ({
        ...note,
        // Tạo trường createdBy từ authorId và authorName nếu có
        createdBy: note.authorId ? {
          id: note.authorId,
          name: note.authorName || 'Unknown'
        } : undefined,
        // Đảm bảo tags là mảng
        tags: note.tags || []
      })),
      pageable: {
        totalElements: response.data.pageable?.totalElements || 0,
        pageNumber: response.data.pageable?.pageNumber || 1,
        pageSize: response.data.pageable?.pageSize || 10,
        totalPages: response.data.pageable?.totalPages || 1
      }
    };
  }
  
  // Nếu API trả về định dạng cũ với cấu trúc data.content
  if (response.data && response.data.data && response.data.data.content) {
    return {
      data: response.data.data.content,
      pageable: {
        totalElements: response.data.data.pageable?.totalElements || 0,
        pageNumber: response.data.data.pageable?.pageNumber || 1,
        pageSize: response.data.data.pageable?.pageSize || 10,
        totalPages: response.data.data.pageable?.totalPages || 1
      }
    };
  }
  
  // Fallback: trả về dữ liệu gốc nếu không khớp với các cấu trúc đã biết
  return response.data;
};

/**
 * Update onsite priority for an opportunity (set ưu tiên onsite)
 */
export const updateOnsitePriority = async (
  opportunityId: string,
  data: {
    priority: boolean;
  },
  config?: any
): Promise<any> => {
  // Sử dụng apiClient chuẩn, endpoint PUT /api/v1/opportunities/{oppId}/onsite
  return apiClient.put(`/api/v1/opportunities/${opportunityId}/onsite`, data, config);
};

/**
 * Get files attached to an opportunity
 */
export const getOpportunityAttachments = async (
  opportunityId: string,
  params?: OpportunityAttachmentListParams,
  config?: AxiosRequestConfig
): Promise<{
  data: OpportunityAttachment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> => {
  return apiClient.get(`/api/v1/opportunities/${opportunityId}/files`, {
    ...config,
    params
  });
};

/**
 * Upload files to an opportunity
 */
export const uploadOpportunityFiles = async (
  opportunityId: string,
  files: File[],
  config?: AxiosRequestConfig
): Promise<OpportunityAttachment[]> => {
  const formData = new FormData();
  
  files.forEach((file) => {
    formData.append('files', file);
  });
  
  return apiClient.post(
    `/api/v1/opportunities/${opportunityId}/files`,
    formData,
    {
      ...config,
      headers: {
        ...(config?.headers || {}),
        'Content-Type': 'multipart/form-data',
      }
    }
  );
};

/**
 * Delete a file attached to an opportunity
 */
export const deleteOpportunityFile = async (
  opportunityId: string,
  fileId: string,
  config?: AxiosRequestConfig
): Promise<void> => {
  return apiClient.delete(
    `/api/v1/opportunities/${opportunityId}/files/${fileId}`,
    config
  );
};

/**
 * Get available teams for assigning to opportunities
 */
export const getTeams = async (
  params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
  },
  config?: AxiosRequestConfig
): Promise<any> => {
  return apiClient.get('/api/v1/teams', {
    ...config,
    params
  });
}; 
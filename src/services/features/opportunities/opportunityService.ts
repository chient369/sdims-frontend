import { BaseApiService } from '../../core/baseApi';
import {
  OpportunityCreateData,
  OpportunityListParams,
  OpportunityNoteCreateData,
  OpportunityNoteResponse,
  OpportunityResponse,
  OpportunityUpdateData,
  SyncLogResponse,
  addOpportunityNote as addOpportunityNoteApi,
  assignLeaderToOpportunity as assignLeaderToOpportunityApi,
  getOpportunityById as getOpportunityByIdApi,
  getOpportunityNotes as getOpportunityNotesApi,
  getOpportunities as getOpportunitiesApi,
  getSyncLogs as getSyncLogsApi,
  removeLeaderFromOpportunity as removeLeaderFromOpportunityApi,
  syncOpportunities as syncOpportunitiesApi,
  updateOnsitePriority as updateOnsitePriorityApi,
} from './opportunityApi';

class OpportunityService extends BaseApiService {
  constructor() {
    super('/api/v1/opportunities');
  }
  
  /**
   * Get all opportunities with filtering and pagination
   */
  async getOpportunities(params?: OpportunityListParams): Promise<{
    data: OpportunityResponse[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    return getOpportunitiesApi(params);
  }
  
  /**
   * Get opportunity by ID
   */
  async getOpportunityById(opportunityId: string): Promise<OpportunityResponse> {
    return getOpportunityByIdApi(opportunityId);
  }
  
  /**
   * Create a new opportunity
   */
  async createOpportunity(data: OpportunityCreateData): Promise<OpportunityResponse> {
    return this.create<OpportunityResponse, OpportunityCreateData>(data);
  }
  
  /**
   * Update an opportunity
   */
  async updateOpportunity(opportunityId: string, data: OpportunityUpdateData): Promise<OpportunityResponse> {
    return this.update<OpportunityResponse, OpportunityUpdateData>(opportunityId, data);
  }
  
  /**
   * Delete an opportunity
   */
  async deleteOpportunity(opportunityId: string): Promise<void> {
    return this.delete(opportunityId);
  }
  
  /**
   * Trigger manual sync from Hubspot
   */
  async syncOpportunities(): Promise<{
    id: string;
    status: 'in_progress';
    message: string;
  }> {
    return syncOpportunitiesApi();
  }
  
  /**
   * Get synchronization logs
   */
  async getSyncLogs(params?: {
    page?: number;
    limit?: number;
    status?: 'success' | 'failed' | 'in_progress';
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{
    data: SyncLogResponse[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    return getSyncLogsApi(params);
  }
  
  /**
   * Assign leader to opportunity
   */
  async assignLeaderToOpportunity(
    opportunityId: string,
    data: { 
      leaderId: string;
      message?: string;
      notifyLeader?: boolean;
    }
  ): Promise<OpportunityResponse> {
    return assignLeaderToOpportunityApi(opportunityId, data);
  }
  
  /**
   * Remove leader from opportunity
   */
  async removeLeaderFromOpportunity(
    opportunityId: string,
    leaderId: string
  ): Promise<OpportunityResponse> {
    return removeLeaderFromOpportunityApi(opportunityId, leaderId);
  }
  
  /**
   * Add note to opportunity
   */
  async addOpportunityNote(
    opportunityId: string,
    data: OpportunityNoteCreateData
  ): Promise<OpportunityNoteResponse> {
    return addOpportunityNoteApi(opportunityId, data);
  }
  
  /**
   * Get opportunity notes
   */
  async getOpportunityNotes(
    opportunityId: string,
    params?: {
      page?: number;
      limit?: number;
    }
  ): Promise<{
    data: OpportunityNoteResponse[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    return getOpportunityNotesApi(opportunityId, params);
  }
  
  /**
   * Update onsite priority flag
   */
  async updateOnsitePriority(
    opportunityId: string,
    data: {
      onsitePriority: boolean;
      reason?: string;
    }
  ): Promise<OpportunityResponse> {
    return updateOnsitePriorityApi(opportunityId, data);
  }
  
  /**
   * Get opportunities with follow-up status alerts (convenience method)
   */
  async getOpportunitiesWithAlerts(params?: {
    followupStatus?: 'Red' | 'Yellow';
    assignedToId?: string;
    limit?: number;
  }): Promise<{
    data: OpportunityResponse[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    return getOpportunitiesApi({
      followupStatus: params?.followupStatus,
      assignedToId: params?.assignedToId,
      limit: params?.limit || 10,
      sortBy: 'lastInteractionDate',
      sortDir: 'asc'
    });
  }
  
  /**
   * Get opportunities with onsite priority (convenience method)
   */
  async getOnsitePriorityOpportunities(params?: {
    assignedToId?: string;
    limit?: number;
  }): Promise<{
    data: OpportunityResponse[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    return getOpportunitiesApi({
      onsitePriority: true,
      assignedToId: params?.assignedToId,
      limit: params?.limit || 10,
      sortBy: 'lastInteractionDate',
      sortDir: 'asc'
    });
  }
}

export const opportunityService = new OpportunityService(); 
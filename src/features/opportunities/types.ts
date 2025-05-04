/**
 * Parameters for listing opportunities
 */
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

/**
 * Opportunity data structure
 */
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

/**
 * Data for creating a new opportunity
 */
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

/**
 * Data for updating an opportunity
 */
export interface OpportunityUpdateData extends Partial<OpportunityCreateData> {}

/**
 * Opportunity note structure
 */
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

/**
 * Data for creating a new opportunity note
 */
export interface OpportunityNoteCreateData {
  content: string;
  attachments?: File[];
}

/**
 * Synchronization log response
 */
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
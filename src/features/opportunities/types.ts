/**
 * Parameters for listing opportunities
 */
export interface OpportunityListParams {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: string;
  customerName?: string;
  assignedToId?: string;
  followupStatus?: 'Red' | 'Yellow' | 'Green';
  priority?: boolean;
  createdDateFrom?: string;
  createdDateTo?: string;
  lastInteractionFrom?: string;
  lastInteractionTo?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

/**
 * Employee Assignment structure
 */
export interface EmployeeAssignment {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  assignedAt: string;
}

/**
 * Opportunity data structure
 */
export interface OpportunityResponse {
  id: number;
  code: string;
  name: string;
  description?: string;
  customerName: string;
  customerContact?: string;
  customerEmail?: string;
  customerPhone?: string;
  amount: number;
  currency: string;
  status: string;
  dealSize?: string;
  source?: string;
  externalId?: string;
  closingDate?: string | null;
  closingProbability?: number | null;
  createdBy?: {
    id: number;
    name: string;
    email?: string | null;
    phone?: string | null;
    position?: string | null;
  };
  assignedTo?: {
    id: number;
    name: string;
    email?: string | null;
    phone?: string | null;
    position?: string | null;
  };
  employeeAssignments?: EmployeeAssignment[];
  lastInteractionDate?: string;
  priority: boolean;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
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
  authorId?: string;
  authorName?: string;
  content: string;
  activityType?: string;
  meetingDate?: string | null;
  isPrivate?: boolean;
  createdBy?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt?: string;
  tags?: string[];
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
  type?: string;
  activityType?: string;
  tags?: string[];
  isInteraction?: boolean;
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

/**
 * Opportunity attachment structure
 */
export interface OpportunityAttachment {
  id: string;
  opportunityId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
  };
  downloadUrl: string;
  thumbnailUrl?: string;
}

/**
 * Data for opportunity attachments operations
 */
export interface OpportunityAttachmentListParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * API response structure for opportunity list
 */
export interface OpportunityListResponse {
  status: string;
  code: number;
  errorCode: null | string;
  data: {
    summary: {
      totalCount: number;
      totalAmount: number;
      byStatus: Record<string, number>;
      byDealSize: Record<string, number>;
    };
    content: OpportunityResponse[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      totalPages: number;
      totalElements: number;
      sort: string;
    };
  };
  errors: null | any[];
  message: null | string;
}

/**
 * API response chuẩn cho chi tiết cơ hội (Opportunity Detail)
 */
export interface NewOpportunityResponse {
  status: string;
  code: number;
  data: {
    opportunity: OpportunityResponse;
    notes: OpportunityNoteResponse[];
    history: any[];
    suggestedResources?: any[];
  };
} 
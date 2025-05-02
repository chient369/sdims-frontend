// Export API functions
export {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  syncOpportunities,
  getSyncLogs,
  assignLeaderToOpportunity,
  removeLeaderFromOpportunity,
  addOpportunityNote,
  getOpportunityNotes,
  updateOnsitePriority,
} from './opportunityApi';

// Export service
export { opportunityService } from './opportunityService';

// Export types
export type {
  OpportunityListParams,
  OpportunityResponse,
  OpportunityCreateData,
  OpportunityUpdateData,
  OpportunityNoteResponse,
  OpportunityNoteCreateData,
  SyncLogResponse,
} from './opportunityApi'; 
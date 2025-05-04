import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  OpportunityListParams,
  OpportunityResponse,
  OpportunityCreateData,
  OpportunityUpdateData,
  OpportunityNoteResponse,
  OpportunityNoteCreateData,
  SyncLogResponse
} from '../features/opportunities/types';
import * as opportunityApi from '../features/opportunities/api';

// Hook for fetching opportunities with optional filtering and pagination
export function useOpportunities(params?: OpportunityListParams) {
  return useQuery({
    queryKey: ['opportunities', params],
    queryFn: () => opportunityApi.getOpportunities(params)
  });
}

// Hook for fetching a single opportunity by ID
export function useOpportunity(id: number | undefined, params?: { includeNotes?: boolean; includeHistory?: boolean }) {
  return useQuery({
    queryKey: ['opportunity', id, params],
    queryFn: () => (id ? opportunityApi.getOpportunityById(id.toString(), { params }) : Promise.reject('No ID provided')),
    enabled: !!id // Only run the query if we have an ID
  });
}

// Hook for creating a new opportunity
export function useCreateOpportunity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: OpportunityCreateData) => opportunityApi.createOpportunity(data),
    onSuccess: () => {
      // Invalidate the opportunities query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    }
  });
}

// Hook for updating an opportunity
export function useUpdateOpportunity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: OpportunityUpdateData }) => 
      opportunityApi.updateOpportunity(id.toString(), data),
    onSuccess: (_, variables) => {
      // Invalidate both the list and the specific opportunity query
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['opportunity', variables.id] });
    }
  });
}

// Hook for deleting an opportunity
export function useDeleteOpportunity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => opportunityApi.deleteOpportunity(id.toString()),
    onSuccess: () => {
      // Invalidate the opportunities query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    }
  });
}

// Hook for assigning a user to an opportunity
export function useAssignUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ opportunityId, data }: { opportunityId: number; data: { leaderId: string; message?: string; notifyLeader?: boolean } }) => 
      opportunityApi.assignLeaderToOpportunity(opportunityId.toString(), data),
    onSuccess: (_, variables) => {
      // Invalidate both the list and the specific opportunity query
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['opportunity', variables.opportunityId] });
    }
  });
}

// Hook for getting opportunity notes
export function useOpportunityNotes(opportunityId: number | undefined) {
  return useQuery({
    queryKey: ['opportunity-notes', opportunityId],
    queryFn: () => (opportunityId ? opportunityApi.getOpportunityNotes(opportunityId.toString()) : Promise.reject('No ID provided')),
    enabled: !!opportunityId
  });
}

// Hook for adding a note to an opportunity
export function useAddOpportunityNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ opportunityId, content }: { opportunityId: number; content: string }) => 
      opportunityApi.addOpportunityNote(opportunityId.toString(), { content }),
    onSuccess: (_, variables) => {
      // Invalidate the notes query
      queryClient.invalidateQueries({ queryKey: ['opportunity-notes', variables.opportunityId] });
      // Also invalidate the opportunity detail if it includes notes
      queryClient.invalidateQueries({ queryKey: ['opportunity', variables.opportunityId] });
    }
  });
}

// Hook for marking an opportunity as interacted
export function useMarkInteracted() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (opportunityId: number) => {
      // There seems to be no direct 'markInteracted' API, we would need to implement it
      // This is a placeholder - you'll need to implement the actual API endpoint
      return Promise.reject('API endpoint not implemented');
    },
    onSuccess: (_, opportunityId) => {
      // Invalidate both the list and the specific opportunity query
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['opportunity', opportunityId] });
    }
  });
}

// Hook for getting opportunity summary by status
export function useOpportunitySummaryByStatus() {
  return useQuery({
    queryKey: ['opportunity-summary-status'],
    queryFn: () => {
      // This is a placeholder - you'll need to implement the actual API endpoint
      return Promise.reject('API endpoint not implemented');
    }
  });
}

// Hook for getting priority opportunities
export function usePriorityOpportunities(params?: { limit?: number }) {
  return useQuery({
    queryKey: ['priority-opportunities', params],
    queryFn: () => {
      // Filter opportunities with onsitePriority=true
      return opportunityApi.getOpportunities({ 
        onsitePriority: true,
        limit: params?.limit
      });
    }
  });
}

// Hook for syncing opportunities from HubSpot
export function useSyncFromHubspot() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => opportunityApi.syncOpportunities(),
    onSuccess: () => {
      // Invalidate the opportunities query to refetch after sync
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      // Also invalidate sync logs
      queryClient.invalidateQueries({ queryKey: ['sync-logs'] });
    }
  });
}

// Hook for getting HubSpot sync logs
export function useSyncLogs(params?: { 
  page?: number;
  limit?: number;
  status?: 'success' | 'failed' | 'in_progress';
  dateFrom?: string;
  dateTo?: string;
}) {
  return useQuery({
    queryKey: ['sync-logs', params],
    queryFn: () => opportunityApi.getSyncLogs(params)
  });
}

// Hook for getting a specific sync log by ID
export function useSyncLogDetail(syncId: string | undefined) {
  return useQuery({
    queryKey: ['sync-log', syncId],
    queryFn: () => {
      // This is a placeholder - you'll need to implement the actual API endpoint
      return Promise.reject('API endpoint not implemented');
    },
    enabled: !!syncId
  });
} 
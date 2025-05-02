import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  useSyncFromHubspot, 
  useSyncLogs, 
  useSyncLogDetail 
} from '../../../hooks/useOpportunities';
import { 
  HubspotSyncParams,
  HubspotSyncLogResponse
} from '../../../services/api/opportunityService';

export const HubspotSyncTest: React.FC = () => {
  const { id: syncId } = useParams<{ id?: string }>();
  const [syncMode, setSyncMode] = useState<'incremental' | 'full'>('incremental');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [dealStage, setDealStage] = useState<'all' | 'open' | 'closed_won' | 'closed_lost'>('all');
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [page, setPage] = useState(1);

  // Start sync mutation
  const syncMutation = useSyncFromHubspot();

  // Fetch sync logs
  const { 
    data: logsData, 
    isLoading: isLoadingLogs, 
    error: logsError
  } = useSyncLogs({ page, size: 10 });

  // Fetch sync log detail if syncId is provided
  const {
    data: logDetail,
    isLoading: isLoadingLogDetail,
    error: logDetailError
  } = useSyncLogDetail(syncId);

  const handleStartSync = (e: React.FormEvent) => {
    e.preventDefault();
    
    const syncParams: HubspotSyncParams = {
      syncMode,
      dealStage,
      overwriteExisting,
      ...(syncMode === 'incremental' && fromDate ? { fromDate } : {}),
      ...(syncMode === 'incremental' && toDate ? { toDate } : {})
    };
    
    syncMutation.mutate(syncParams);
  };

  // If we're viewing a specific log detail
  if (syncId) {
    if (isLoadingLogDetail) {
      return <div className="p-4">Loading sync log details...</div>;
    }
    
    if (logDetailError) {
      return <div className="p-4 text-red-500">Error: {logDetailError.toString()}</div>;
    }
    
    if (!logDetail) {
      return <div className="p-4">Sync log not found</div>;
    }
    
    return (
      <div className="p-4">
        <div className="flex items-center mb-4">
          <Link to="/hubspot-sync" className="text-blue-500 hover:underline">
            &larr; Back to Sync Logs
          </Link>
          <h1 className="text-2xl font-bold ml-4">Sync Log Details: {logDetail.syncId}</h1>
        </div>
        
        {/* Sync log info */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p><strong>Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  logDetail.status === 'completed' ? 'bg-green-100 text-green-800' :
                  logDetail.status === 'failed' ? 'bg-red-100 text-red-800' :
                  logDetail.status === 'queued' ? 'bg-blue-100 text-blue-800' :
                  logDetail.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {logDetail.status}
                </span>
              </p>
              <p><strong>Initiated By:</strong> {logDetail.initiatedBy.name}</p>
              <p><strong>Started At:</strong> {new Date(logDetail.startedAt).toLocaleString()}</p>
              <p><strong>Completed At:</strong> {logDetail.completedAt ? new Date(logDetail.completedAt).toLocaleString() : 'N/A'}</p>
              <p><strong>Duration:</strong> {logDetail.duration ? `${logDetail.duration} seconds` : 'N/A'}</p>
            </div>
            <div>
              <p><strong>Sync Mode:</strong> {logDetail.syncParams.syncMode}</p>
              <p><strong>Deal Stage:</strong> {logDetail.syncParams.dealStage}</p>
              {logDetail.syncParams.fromDate && (
                <p><strong>From Date:</strong> {logDetail.syncParams.fromDate}</p>
              )}
              {logDetail.syncParams.toDate && (
                <p><strong>To Date:</strong> {logDetail.syncParams.toDate}</p>
              )}
              <p><strong>Overwrite Existing:</strong> {logDetail.syncParams.overwriteExisting ? 'Yes' : 'No'}</p>
            </div>
          </div>
          
          {/* Error message if any */}
          {logDetail.error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="font-semibold text-red-700">Error: {logDetail.error.code}</p>
              <p className="text-red-600">{logDetail.error.message}</p>
            </div>
          )}
          
          {/* Summary */}
          {logDetail.summary && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Summary</h3>
              <div className="grid grid-cols-5 gap-2 text-center">
                <div className="bg-gray-50 p-2 rounded">
                  <p className="font-semibold">Total</p>
                  <p className="text-xl">{logDetail.summary.totalOpportunities}</p>
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <p className="font-semibold text-green-700">New</p>
                  <p className="text-xl text-green-700">{logDetail.summary.newOpportunities}</p>
                </div>
                <div className="bg-blue-50 p-2 rounded">
                  <p className="font-semibold text-blue-700">Updated</p>
                  <p className="text-xl text-blue-700">{logDetail.summary.updatedOpportunities}</p>
                </div>
                <div className="bg-yellow-50 p-2 rounded">
                  <p className="font-semibold text-yellow-700">Skipped</p>
                  <p className="text-xl text-yellow-700">{logDetail.summary.skippedOpportunities}</p>
                </div>
                <div className="bg-red-50 p-2 rounded">
                  <p className="font-semibold text-red-700">Failed</p>
                  <p className="text-xl text-red-700">{logDetail.summary.failedOpportunities}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Sync details (if available) */}
        {logDetail.details && logDetail.details.length > 0 && (
          <div className="bg-white p-4 rounded shadow mb-6">
            <h3 className="text-lg font-semibold mb-2">Sync Details</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2">HubSpot Deal ID</th>
                    <th className="border p-2">Action</th>
                    <th className="border p-2">Status</th>
                    <th className="border p-2">Opportunity</th>
                    <th className="border p-2">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {logDetail.details.map((detail: any, index: number) => (
                    <tr key={index}>
                      <td className="border p-2 font-mono">{detail.hubspotDealId}</td>
                      <td className="border p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          detail.action === 'created' ? 'bg-green-100 text-green-800' :
                          detail.action === 'updated' ? 'bg-blue-100 text-blue-800' :
                          detail.action === 'skipped' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {detail.action}
                        </span>
                      </td>
                      <td className="border p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          detail.status === 'success' ? 'bg-green-100 text-green-800' :
                          detail.status === 'error' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {detail.status}
                        </span>
                      </td>
                      <td className="border p-2">
                        {detail.opportunity ? (
                          <div>
                            <div>{detail.opportunity.name}</div>
                            <div className="text-xs text-gray-500">{detail.opportunity.code}</div>
                          </div>
                        ) : 'N/A'}
                      </td>
                      <td className="border p-2">{new Date(detail.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Changes details */}
            {logDetail.details.some((d: any) => d.changes) && (
              <div className="mt-4">
                <h4 className="text-md font-semibold mb-2">Field Changes</h4>
                <div className="space-y-4">
                  {logDetail.details.filter((d: any) => d.changes).map((detail: any, index: number) => (
                    <div key={index} className="border p-3 rounded bg-gray-50">
                      <p className="font-semibold mb-2">Changes for {detail.opportunity?.name} ({detail.hubspotDealId})</p>
                      <table className="min-w-full bg-white border">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border p-2">Field</th>
                            <th className="border p-2">Old Value</th>
                            <th className="border p-2">New Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detail.changes?.map((change: any, changeIndex: number) => (
                            <tr key={changeIndex}>
                              <td className="border p-2 font-semibold">{change.field}</td>
                              <td className="border p-2 font-mono bg-red-50">{change.oldValue}</td>
                              <td className="border p-2 font-mono bg-green-50">{change.newValue}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Logs */}
        {logDetail.logs && logDetail.logs.length > 0 && (
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold mb-2">Process Logs</h3>
            <div className="space-y-1">
              {logDetail.logs.map((log: any, index: number) => (
                <div 
                  key={index} 
                  className={`p-2 rounded ${
                    log.level === 'INFO' ? 'bg-blue-50' :
                    log.level === 'WARNING' ? 'bg-yellow-50' :
                    log.level === 'ERROR' ? 'bg-red-50' :
                    'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <span className={`inline-block w-16 text-xs font-semibold ${
                      log.level === 'INFO' ? 'text-blue-700' :
                      log.level === 'WARNING' ? 'text-yellow-700' :
                      log.level === 'ERROR' ? 'text-red-700' :
                      'text-gray-700'
                    }`}>
                      {log.level}
                    </span>
                    <span>{log.message}</span>
                    <span className="ml-auto text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Main sync page (list and form)
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">HubSpot Sync Test</h1>
      
      {/* Start sync form */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-3">Start New Sync</h2>
        
        <form onSubmit={handleStartSync}>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Sync Mode</label>
              <select
                value={syncMode}
                onChange={(e) => setSyncMode(e.target.value as 'incremental' | 'full')}
                className="w-full p-2 border rounded"
              >
                <option value="incremental">Incremental</option>
                <option value="full">Full</option>
              </select>
            </div>
            
            <div>
              <label className="block mb-1 font-medium">Deal Stage</label>
              <select
                value={dealStage}
                onChange={(e) => setDealStage(e.target.value as 'all' | 'open' | 'closed_won' | 'closed_lost')}
                className="w-full p-2 border rounded"
              >
                <option value="all">All Stages</option>
                <option value="open">Open Deals</option>
                <option value="closed_won">Won Deals</option>
                <option value="closed_lost">Lost Deals</option>
              </select>
            </div>
            
            {syncMode === 'incremental' && (
              <>
                <div>
                  <label className="block mb-1 font-medium">From Date</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block mb-1 font-medium">To Date</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </>
            )}
            
            <div className="col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={overwriteExisting}
                  onChange={(e) => setOverwriteExisting(e.target.checked)}
                  className="mr-2"
                />
                <span>Overwrite existing opportunities</span>
              </label>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={syncMutation.isPending}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            {syncMutation.isPending ? 'Starting Sync...' : 'Start Sync'}
          </button>
        </form>
        
        {syncMutation.isError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-red-600">Error: {syncMutation.error.toString()}</p>
          </div>
        )}
        
        {syncMutation.isSuccess && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <p className="font-semibold text-green-700">Sync started successfully!</p>
            <p className="text-green-600">Sync ID: {syncMutation.data.syncId}</p>
            <p>Status: {syncMutation.data.status}</p>
            <p>Estimated time: {syncMutation.data.estimatedTime} seconds</p>
          </div>
        )}
      </div>
      
      {/* Sync logs list */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-3">Sync Logs</h2>
        
        {isLoadingLogs ? (
          <p className="text-gray-500">Loading sync logs...</p>
        ) : logsError ? (
          <p className="text-red-500">Error: {logsError.toString()}</p>
        ) : logsData?.content?.length === 0 ? (
          <p className="text-gray-500">No sync logs available</p>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2">Sync ID</th>
                    <th className="border p-2">Status</th>
                    <th className="border p-2">Mode</th>
                    <th className="border p-2">Initiated By</th>
                    <th className="border p-2">Started At</th>
                    <th className="border p-2">Duration</th>
                    <th className="border p-2">Results</th>
                    <th className="border p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logsData?.content?.map((log) => (
                    <tr key={log.syncId}>
                      <td className="border p-2 font-mono text-xs">{log.syncId}</td>
                      <td className="border p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          log.status === 'completed' ? 'bg-green-100 text-green-800' :
                          log.status === 'failed' ? 'bg-red-100 text-red-800' :
                          log.status === 'queued' ? 'bg-blue-100 text-blue-800' :
                          log.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="border p-2">{log.syncParams.syncMode}</td>
                      <td className="border p-2">{log.initiatedBy.name}</td>
                      <td className="border p-2">{new Date(log.startedAt).toLocaleString()}</td>
                      <td className="border p-2">{log.duration ? `${log.duration}s` : 'N/A'}</td>
                      <td className="border p-2">
                        {log.summary && (
                          <div className="text-sm">
                            <div>Total: {log.summary.totalOpportunities}</div>
                            <div className="text-green-600">New: {log.summary.newOpportunities}</div>
                            <div className="text-blue-600">Updated: {log.summary.updatedOpportunities}</div>
                          </div>
                        )}
                        {log.error && (
                          <div className="text-sm text-red-600">
                            Error: {log.error.message}
                          </div>
                        )}
                      </td>
                      <td className="border p-2">
                        <Link
                          to={`/hubspot-sync/${log.syncId}`}
                          className="px-3 py-1 bg-blue-500 text-white rounded text-xs inline-block"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {logsData?.pageable && (
              <div className="mt-4 flex justify-between items-center">
                <div>
                  Showing page {logsData.pageable.pageNumber} of {logsData.pageable.totalPages}
                  ({logsData.pageable.totalElements} total)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= (logsData.pageable.totalPages || 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HubspotSyncTest; 
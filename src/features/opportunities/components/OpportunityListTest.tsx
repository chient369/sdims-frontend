import React, { useState } from 'react';
import { useOpportunities, useCreateOpportunity, useDeleteOpportunity } from '../../../hooks/useOpportunities';

export const OpportunityListTest: React.FC = () => {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [name, setName] = useState('');
  
  // Fetch opportunities with pagination and filtering
  const { data, isLoading, error } = useOpportunities({
    page,
    limit: 5,
    keyword: keyword || undefined,
  });

  // Create opportunity mutation
  const createMutation = useCreateOpportunity();
  
  // Delete opportunity mutation
  const deleteMutation = useDeleteOpportunity();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The query will be re-run automatically due to the changed params
  };

  const handleCreate = () => {
    if (!name) return;
    
    createMutation.mutate({
      name,
      customerId: 1,
      status: 'new',
      dealSize: 'medium',
      amount: 500,
    }, {
      onSuccess: () => {
        setName('');
      }
    });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Opportunity List Test</h1>
      
      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search opportunities..."
          className="p-2 border rounded"
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
          Search
        </button>
      </form>
      
      {/* Create form */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New opportunity name"
          className="p-2 border rounded"
        />
        <button 
          onClick={handleCreate}
          disabled={createMutation.isPending || !name}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-300"
        >
          {createMutation.isPending ? 'Creating...' : 'Create'}
        </button>
      </div>
      
      {/* Status messages */}
      {isLoading && <p className="text-gray-500">Loading opportunities...</p>}
      {error && <p className="text-red-500">Error: {error.toString()}</p>}
      {createMutation.isError && (
        <p className="text-red-500">Error creating opportunity: {createMutation.error.toString()}</p>
      )}
      {deleteMutation.isError && (
        <p className="text-red-500">Error deleting opportunity: {deleteMutation.error.toString()}</p>
      )}
      
      {/* Opportunities list */}
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Opportunities</h2>
        {data?.data?.content?.length === 0 ? (
          <p className="text-gray-500">No opportunities found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">ID</th>
                  <th className="border p-2">Code</th>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Customer</th>
                  <th className="border p-2">Status</th>
                  <th className="border p-2">Amount</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.content?.map((opp) => (
                  <tr key={opp.id}>
                    <td className="border p-2">{opp.id}</td>
                    <td className="border p-2">{opp.code}</td>
                    <td className="border p-2">{opp.name}</td>
                    <td className="border p-2">{opp.customerName}</td>
                    <td className="border p-2">
                      <span 
                        className={`px-2 py-1 rounded text-xs ${
                          opp.status === 'won' ? 'bg-green-100 text-green-800' :
                          opp.status === 'lost' ? 'bg-red-100 text-red-800' :
                          opp.status === 'proposal' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {opp.status}
                      </span>
                    </td>
                    <td className="border p-2">{opp.amount.toLocaleString()}</td>
                    <td className="border p-2">
                      <button
                        onClick={() => handleDelete(opp.id)}
                        disabled={deleteMutation.isPending}
                        className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {data?.data?.pageable && (
          <div className="mt-4 flex justify-between items-center">
            <div>
              Showing page {data.data.pageable.pageNumber} of {data.data.pageable.totalPages}
              ({data.data.pageable.totalElements} total)
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
                disabled={page >= (data.data.pageable.totalPages || 1)}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
        
        {/* Summary */}
        {data?.data?.summary && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h3 className="text-lg font-semibold mb-2">Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><strong>Total Count:</strong> {data.data.summary.totalCount}</p>
                <p><strong>Total Amount:</strong> {data.data.summary.totalAmount.toLocaleString()}</p>
              </div>
              <div>
                <p><strong>By Status:</strong></p>
                <ul className="list-disc list-inside">
                  {Object.entries(data.data.summary.byStatus).map(([status, count]) => (
                    count > 0 && <li key={status}>{status}: {count}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpportunityListTest; 
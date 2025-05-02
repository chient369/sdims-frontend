import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  useOpportunity, 
  useOpportunityNotes, 
  useAddOpportunityNote,
  useMarkInteracted
} from '../../../hooks/useOpportunities';

export const OpportunityDetailTest: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const opportunityId = id ? parseInt(id, 10) : undefined;
  const [noteContent, setNoteContent] = useState('');

  // Fetch opportunity details with notes included
  const { 
    data: opportunityData, 
    isLoading: isLoadingOpportunity, 
    error: opportunityError 
  } = useOpportunity(opportunityId, { includeNotes: true, includeHistory: true });

  // Fetch opportunity notes
  const { 
    data: notesData, 
    isLoading: isLoadingNotes, 
    error: notesError 
  } = useOpportunityNotes(opportunityId);

  // Add note mutation
  const addNoteMutation = useAddOpportunityNote();

  // Mark as interacted mutation
  const markInteractedMutation = useMarkInteracted();

  // Get opportunity from the response
  const opportunity = opportunityData?.opportunity;

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opportunityId || !noteContent) return;

    addNoteMutation.mutate(
      { opportunityId, content: noteContent },
      {
        onSuccess: () => {
          setNoteContent('');
        }
      }
    );
  };

  const handleMarkInteracted = () => {
    if (!opportunityId) return;
    markInteractedMutation.mutate(opportunityId);
  };

  if (isLoadingOpportunity) {
    return <div className="p-4">Loading opportunity details...</div>;
  }

  if (opportunityError) {
    return <div className="p-4 text-red-500">Error: {opportunityError.toString()}</div>;
  }

  if (!opportunity) {
    return <div className="p-4">Opportunity not found</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Opportunity Detail Test</h1>
      
      {/* Opportunity info */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold mb-2">{opportunity.name}</h2>
            <p className="text-gray-500 text-sm mb-2">Code: {opportunity.code}</p>
            <p className="mb-2">{opportunity.description}</p>
          </div>
          <div>
            <span 
              className={`px-3 py-1 rounded text-sm ${
                opportunity.status === 'won' ? 'bg-green-100 text-green-800' :
                opportunity.status === 'lost' ? 'bg-red-100 text-red-800' :
                opportunity.status === 'proposal' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}
            >
              {opportunity.status}
            </span>
          </div>
        </div>

        <hr className="my-3" />
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Customer:</strong> {opportunity.customerName}</p>
            <p><strong>Contact:</strong> {opportunity.customerContact || 'N/A'}</p>
            <p><strong>Deal Size:</strong> {opportunity.dealSize}</p>
            <p><strong>Amount:</strong> {opportunity.amount.toLocaleString()}</p>
          </div>
          <div>
            <p><strong>Created By:</strong> {opportunity.createdBy.name}</p>
            <p><strong>Assigned To:</strong> {opportunity.assignedTo?.name || 'Unassigned'}</p>
            <p><strong>Created At:</strong> {new Date(opportunity.createdAt).toLocaleString()}</p>
            <p><strong>Updated At:</strong> {new Date(opportunity.updatedAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={handleMarkInteracted}
            disabled={markInteractedMutation.isPending}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            {markInteractedMutation.isPending ? 'Marking...' : 'Mark as Interacted'}
          </button>
        </div>
      </div>
      
      {/* Customer details section */}
      {opportunity.customerDetails && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <h3 className="text-lg font-semibold mb-2">Customer Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Name:</strong> {opportunity.customerDetails.name}</p>
              <p><strong>Contact:</strong> {opportunity.customerDetails.contact}</p>
              <p><strong>Email:</strong> {opportunity.customerDetails.email || 'N/A'}</p>
              <p><strong>Phone:</strong> {opportunity.customerDetails.phone || 'N/A'}</p>
            </div>
            <div>
              <p><strong>Address:</strong> {opportunity.customerDetails.address || 'N/A'}</p>
              <p><strong>Website:</strong> {opportunity.customerDetails.website || 'N/A'}</p>
              <p><strong>Industry:</strong> {opportunity.customerDetails.industry || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Requirements section */}
      {opportunity.requirements && opportunity.requirements.length > 0 && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <h3 className="text-lg font-semibold mb-2">Requirements</h3>
          <ul className="list-disc list-inside">
            {opportunity.requirements.map((req, index) => (
              <li key={index} className="mb-2">
                <strong>{req.name}:</strong> {req.description}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Notes section */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="text-lg font-semibold mb-2">Notes</h3>
        
        {/* Add note form */}
        <form onSubmit={handleAddNote} className="mb-4">
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Add a note..."
            className="w-full p-2 border rounded mb-2"
            rows={3}
          />
          <button
            type="submit"
            disabled={addNoteMutation.isPending || !noteContent}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-300"
          >
            {addNoteMutation.isPending ? 'Adding...' : 'Add Note'}
          </button>
        </form>
        
        {addNoteMutation.isError && (
          <p className="text-red-500 mb-4">Error adding note: {addNoteMutation.error.toString()}</p>
        )}
        
        {/* Notes list */}
        {isLoadingNotes ? (
          <p className="text-gray-500">Loading notes...</p>
        ) : notesError ? (
          <p className="text-red-500">Error loading notes: {notesError.toString()}</p>
        ) : (
          <div>
            {(notesData?.length === 0 && (!opportunity.notes || opportunity.notes.length === 0)) ? (
              <p className="text-gray-500">No notes available</p>
            ) : (
              <div className="space-y-3">
                {/* If we have notes from the opportunity detail */}
                {opportunity.notes?.map((note) => (
                  <div key={note.id} className="border-l-4 border-blue-500 pl-3 py-2">
                    <p>{note.content}</p>
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>By: {note.createdBy.name}</span>
                      <span>{new Date(note.createdAt).toLocaleString()}</span>
                    </div>
                    {note.attachments && note.attachments.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-semibold">Attachments:</p>
                        <ul className="list-disc list-inside text-sm ml-2">
                          {note.attachments.map((attachment) => (
                            <li key={attachment.id}>
                              <a 
                                href={attachment.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                {attachment.name} ({Math.round(attachment.size / 1024)} KB)
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* If we have notes from the dedicated notes endpoint */}
                {notesData && !opportunity.notes && notesData.map((note) => (
                  <div key={note.id} className="border-l-4 border-blue-500 pl-3 py-2">
                    <p>{note.content}</p>
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>By: {note.createdBy.name}</span>
                      <span>{new Date(note.createdAt).toLocaleString()}</span>
                    </div>
                    {note.attachments && note.attachments.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-semibold">Attachments:</p>
                        <ul className="list-disc list-inside text-sm ml-2">
                          {note.attachments.map((attachment) => (
                            <li key={attachment.id}>
                              <a 
                                href={attachment.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                {attachment.name} ({Math.round(attachment.size / 1024)} KB)
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* History section */}
      {opportunity.history && opportunity.history.length > 0 && (
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">History</h3>
          <div className="space-y-2">
            {opportunity.history.map((item, index) => (
              <div key={index} className="border-l-4 border-gray-300 pl-3 py-1">
                <p>
                  <span className="font-semibold">{item.type}</span>: 
                  Changed {item.field} from <span className="font-mono bg-gray-100 px-1">{item.oldValue}</span> to{' '}
                  <span className="font-mono bg-gray-100 px-1">{item.newValue}</span>
                </p>
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>By: {item.createdBy.name}</span>
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunityDetailTest; 
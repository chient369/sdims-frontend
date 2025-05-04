import React from 'react';
import { cn } from '../../utils/cn';

interface TableToolbarProps {
  selectedCount: number;
  bulkActions?: React.ReactNode;
  toolbarContent?: React.ReactNode;
}

export function TableToolbar({
  selectedCount,
  bulkActions,
  toolbarContent,
}: TableToolbarProps) {
  const showBulkActions = selectedCount > 0 && bulkActions;
  
  if (!showBulkActions && !toolbarContent) {
    return null;
  }
  
  return (
    <div className={cn(
      "flex items-center p-2 mb-2 rounded-md",
      showBulkActions ? "bg-gray-100" : ""
    )}>
      {showBulkActions ? (
        <div className="flex items-center w-full justify-between">
          <span className="text-sm font-medium text-gray-700">
            {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
          </span>
          <div className="flex items-center space-x-2">
            {bulkActions}
          </div>
        </div>
      ) : (
        toolbarContent
      )}
    </div>
  );
} 
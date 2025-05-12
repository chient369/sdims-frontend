import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  PaginationState,
} from '@tanstack/react-table';
import { cn } from '../../utils/cn';
import { TablePagination } from './TablePagination';
import { TableToolbar } from './TableToolbar';
import { Spinner } from '../ui/Spinner';

export interface TableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  isLoading?: boolean;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  enableRowSelection?: boolean;
  enableBulkActions?: boolean;
  onRowClick?: (row: TData) => void;
  rowClassName?: (row: TData) => string;
  toolbarContent?: React.ReactNode;
  bulkActions?: React.ReactNode;
  initialSorting?: SortingState;
  initialFilters?: ColumnFiltersState;
  getRowId?: (row: TData) => string;
  className?: string;
}

export function Table<TData>({
  data,
  columns,
  isLoading = false,
  enableSorting = true,
  enableFiltering = true,
  enablePagination = true,
  enableRowSelection = false,
  enableBulkActions = false,
  onRowClick,
  rowClassName,
  toolbarContent,
  bulkActions,
  initialSorting = [],
  initialFilters = [],
  getRowId,
  className,
}: TableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialFilters);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      pagination: enablePagination ? pagination : undefined,
      rowSelection: enableRowSelection ? rowSelection : undefined,
    },
    enableRowSelection,
    enableMultiRowSelection: enableRowSelection,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getRowId,
  });

  const showToolbar = toolbarContent || (enableBulkActions && bulkActions && Object.keys(rowSelection).length > 0);
  const selectedRows = useMemo(() => 
    Object.keys(rowSelection).length, 
    [rowSelection]
  );
  
  return (
    <div className={cn("flex flex-col w-full h-full", className)}>
      {showToolbar && (
        <TableToolbar
          selectedCount={selectedRows}
          bulkActions={bulkActions}
          toolbarContent={toolbarContent}
        />
      )}
      
      <div className="relative overflow-auto flex-1 min-h-0">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
            <Spinner size="md" />
          </div>
        )}
        
        <table className="w-full text-sm text-left min-w-max">
          <thead className="text-xs uppercase text-gray-700 bg-gray-50 border-b sticky top-0 z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className={cn(
                      "px-4 py-3 font-medium",
                      header.column.getCanSort() ? "cursor-pointer select-none" : "",
                      header.column.getIsSorted() && "bg-gray-100"
                    )}
                    onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                    style={{ width: header.column.getSize() }}
                  >
                    <div className="flex items-center justify-between">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      
                      {header.column.getCanSort() && (
                        <span className="ml-2">
                          {{ asc: '↑', desc: '↓' }[header.column.getIsSorted() as string] ?? '↕'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          
          <tbody className="divide-y divide-gray-200">
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => (
                <tr 
                  key={row.id}
                  className={cn(
                    "hover:bg-gray-50 transition-colors",
                    enableRowSelection && row.getIsSelected() && "bg-primary-50",
                    onRowClick && "cursor-pointer",
                    rowClassName && rowClassName(row.original)
                  )}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="px-4 py-10 text-center text-gray-500"
                >
                  {isLoading ? 'Loading...' : 'No data available'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {enablePagination && table.getRowModel().rows.length > 0 && (
          <div className="border-t sticky bottom-0 bg-white w-full">
            <TablePagination table={table} />
          </div>
        )}
      </div>
    </div>
  );
} 
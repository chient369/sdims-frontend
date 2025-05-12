import React from 'react';
import { ContractSummary } from '../types';
import { Table } from '../../../components/table';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { PermissionGuard } from '../../../components/ui';
import { Button } from '../../../components/ui/Button';
import { ColumnDef } from '@tanstack/react-table';
import {
  HiChevronDoubleLeft,
  HiChevronLeft,
  HiChevronRight,
  HiChevronDoubleRight,
} from 'react-icons/hi';

interface ContractTableProps {
  contracts: ContractSummary[];
  loading: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSortChange: (field: string, direction: 'asc' | 'desc') => void;
  onViewDetail: (id: number) => void;
}

/**
 * Custom pagination component
 */
const CustomPagination: React.FC<{
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}> = ({ page, pageSize, totalPages, onPageChange, onPageSizeChange }) => {
  return (
    <div className="flex flex-wrap items-center justify-between px-2 py-2 border-t bg-white">
      <div className="flex items-center gap-1 text-sm">
        <span className="text-gray-700 whitespace-nowrap">Dòng trên trang:</span>
        <select
          value={pageSize}
          onChange={e => onPageSizeChange(Number(e.target.value))}
          className="block text-sm border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
        >
          {[10, 20, 50, 100].map(size => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex items-center gap-1 ml-auto">
        <span className="text-sm text-gray-700 whitespace-nowrap mr-1">
          Trang {page} / {totalPages}
        </span>
        
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
            className="px-1.5 py-1"
          >
            <HiChevronDoubleLeft className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-1.5 py-1 ml-1"
          >
            <HiChevronLeft className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-1.5 py-1 ml-1"
          >
            <HiChevronRight className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
            className="px-1.5 py-1 ml-1"
          >
            <HiChevronDoubleRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * Component hiển thị bảng danh sách hợp đồng
 */
const ContractTable: React.FC<ContractTableProps> = ({
  contracts,
  loading,
  page,
  limit,
  total,
  totalPages,
  sortBy = 'createdAt',
  sortDirection = 'desc',
  onPageChange,
  onLimitChange,
  onSortChange,
  onViewDetail
}) => {
  // Cấu hình các cột cho bảng
  const columns: ColumnDef<ContractSummary, any>[] = [
    {
      id: 'basic',
      header: 'Thông tin cơ bản',
      accessorFn: (row) => row.name,
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium text-primary-700 cursor-pointer hover:underline" onClick={() => onViewDetail(row.original.id)}>
            {row.original.contractCode}
          </div>
          <div className="font-semibold">{row.original.name}</div>
          <div className="text-gray-500 text-sm">{row.original.customerName}</div>
        </div>
      ),
      meta: {
        sortable: true,
        sortField: 'name',
      },
    },
    {
      id: 'contractType',
      header: 'Loại hợp đồng',
      accessorFn: (row) => row.contractType,
      cell: ({ row }) => (
        <span>
          {row.original.contractType === 'FixedPrice' && 'Fixed Price'}
          {row.original.contractType === 'TimeAndMaterial' && 'Time & Materials'}
          {row.original.contractType === 'Retainer' && 'Retainer'}
          {row.original.contractType === 'Maintenance' && 'Maintenance'}
          {row.original.contractType === 'Other' && 'Other'}
        </span>
      ),
      meta: {
        sortable: true,
        sortField: 'contractType',
      },
    },
    {
      id: 'amount',
      header: 'Giá trị hợp đồng',
      accessorFn: (row) => row.amount,
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {formatCurrency(row.original.amount)}
        </div>
      ),
      meta: {
        sortable: true,
        sortField: 'amount',
      },
    },
    {
      id: 'dates',
      header: 'Ngày ký / Hiệu lực',
      accessorFn: (row) => row.signDate,
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="text-sm">
            <span className="text-gray-500">Ký:</span> {formatDate(row.original.signDate)}
          </div>
          {row.original.endDate && (
            <div className="text-sm">
              <span className="text-gray-500">Hết hạn:</span> {formatDate(row.original.endDate)}
            </div>
          )}
        </div>
      ),
      meta: {
        sortable: true,
        sortField: 'signDate',
      },
    },
    {
      id: 'paymentStatus',
      header: 'Trạng thái thanh toán',
      accessorFn: (row) => row.paymentStatus.status,
      cell: ({ row }) => {
        const status = row.original.paymentStatus.status;
        let statusText, statusClass;
        
        switch (status) {
          case 'paid':
            statusText = 'Đã thanh toán đủ';
            statusClass = 'bg-green-100 text-green-800';
            break;
          case 'partial':
            statusText = 'Còn công nợ';
            statusClass = 'bg-yellow-100 text-yellow-800';
            break;
          case 'overdue':
            statusText = 'Quá hạn';
            statusClass = 'bg-red-100 text-red-800';
            break;
          default:
            statusText = 'Chưa thanh toán';
            statusClass = 'bg-blue-100 text-blue-800';
        }
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${statusClass}`}>
            {statusText}
          </span>
        );
      }
    },
    {
      id: 'payment',
      header: 'Thanh toán',
      accessorFn: (row) => row.paymentStatus.paidPercentage,
      cell: ({ row }) => {
        const { paidAmount, totalAmount, paidPercentage, remainingAmount } = row.original.paymentStatus;
        
        return (
          <div className="space-y-2">
            <div className="text-sm flex justify-between">
              <span>Đã TT:</span>
              <span className="font-medium text-right">{formatCurrency(paidAmount)} ({paidPercentage.toFixed(0)}%)</span>
            </div>
            <div className="text-sm flex justify-between">
              <span>Còn lại:</span>
              <span className="font-medium text-right">{formatCurrency(remainingAmount)} ({(100 - paidPercentage).toFixed(0)}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full"
                style={{ width: `${paidPercentage}%` }}
              ></div>
            </div>
          </div>
        );
      }
    },
    {
      id: 'actions',
      header: 'Hành động',
      cell: ({ row }) => (
        <div className="flex space-x-1">
          <button
            onClick={() => onViewDetail(row.original.id)}
            className="p-1 text-gray-500 hover:text-primary-600 rounded"
            title="Xem chi tiết"
          >
            <span className="material-icons-outlined text-xl">visibility</span>
          </button>
          
          <PermissionGuard
            requiredPermission="contract:update:own"
            fallback={null}
          >
            <button
              onClick={() => handleEdit(row.original.id)}
              className="p-1 text-gray-500 hover:text-primary-600 rounded"
              title="Chỉnh sửa"
            >
              <span className="material-icons-outlined text-xl">edit</span>
            </button>
          </PermissionGuard>
          
          <PermissionGuard
            requiredPermission="contract:delete"
            fallback={null}
          >
            <button
              onClick={() => handleDelete(row.original.id)}
              className="p-1 text-gray-500 hover:text-red-600 rounded"
              title="Xóa hợp đồng"
            >
              <span className="material-icons-outlined text-xl">delete</span>
            </button>
          </PermissionGuard>
        </div>
      ),
      enableSorting: false,
    }
  ];

  // Placeholder functions cho các hành động edit và delete
  const handleEdit = (id: number) => {
    console.log(`Edit contract: ${id}`);
    // Navigation to edit page would go here
  };
  
  const handleDelete = (id: number) => {
    console.log(`Delete contract: ${id}`);
    // Delete confirmation would go here
  };
  
  // Render bảng với dữ liệu
  return (
    <div className="flex flex-col h-full border rounded-md overflow-hidden">
      <div className="flex-1 min-h-0 overflow-auto">
        <Table<ContractSummary>
          columns={columns}
          data={contracts}
          isLoading={loading}
          enablePagination={false}
        />
      </div>
      
      <div className="flex-shrink-0 w-full">
        <CustomPagination
          page={page}
          pageSize={limit}
          totalPages={totalPages}
          onPageChange={onPageChange}
          onPageSizeChange={onLimitChange}
        />
      </div>
    </div>
  );
};

export default ContractTable; 
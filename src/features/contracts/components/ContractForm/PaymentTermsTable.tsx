import React from 'react';
import { formatCurrency, formatDate } from '../../../../utils/formatters';
import { StatusBadge } from '../../../shared/StatusBadge';
import { PaymentTerm } from '../../types/paymentTerms';

interface PaymentTermsTableProps {
  fields: any[];
  totalAmount: number;
  contractAmount: number;
  isLoading: boolean;
  mode: 'create' | 'edit';
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

/**
 * Table component for displaying payment terms
 */
export const PaymentTermsTable: React.FC<PaymentTermsTableProps> = ({
  fields,
  totalAmount,
  contractAmount,
  isLoading,
  mode,
  onEdit,
  onDelete
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              STT
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Mô tả đợt thanh toán
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ngày dự kiến thu
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Số tiền
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phần trăm
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trạng thái
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ghi chú
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Hành động</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {fields.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                Chưa có đợt thanh toán nào. Vui lòng thêm đợt thanh toán.
              </td>
            </tr>
          ) : (
            fields.map((field, index) => {
              const term = field as unknown as PaymentTerm;
            
              return (
                <tr key={field.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {term?.description || ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {term?.dueDate ? formatDate(term.dueDate) : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {term?.amount ? formatCurrency(term.amount) : '0 đ'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {term?.percentage ? `${term.percentage}%` : '0%'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <StatusBadge status={term?.status || 'unpaid'} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {term?.notes || ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        type="button"
                        disabled={isLoading}
                        className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => onEdit(index)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button
                        type="button"
                        disabled={isLoading}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => onDelete(index)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
          
          {/* Total row */}
          {fields.length > 0 && (
            <tr className="bg-gray-50">
              <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                Tổng:
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {formatCurrency(totalAmount)}
                {contractAmount > 0 && (
                  <span className="ml-1 text-xs text-gray-500">
                    ({(totalAmount / Number(contractAmount) * 100).toFixed(2)}% giá trị hợp đồng)
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                100%
              </td>
              <td colSpan={3}></td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}; 
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useContractService } from '../hooks/useContractService';
import { Card, Badge, Spinner } from '../../../components/ui';
import { formatCurrency, formatDate } from '../../../utils/formatters';

interface ContractPaymentTermsProps {
  contractId: string;
  contractAmount: number;
}

/**
 * Component hiển thị danh sách đợt thanh toán của hợp đồng
 * @param contractId ID của hợp đồng
 * @param contractAmount Giá trị hợp đồng để tính phần trăm
 */
export const ContractPaymentTerms: React.FC<ContractPaymentTermsProps> = ({ contractId, contractAmount }) => {
  const contractService = useContractService();
  const [totalAmount, setTotalAmount] = useState(0);
  
  // Gọi API lấy danh sách đợt thanh toán
  const { data: paymentTermsData, isLoading, isError } = useQuery({
    queryKey: ['contract', contractId, 'payment-terms'],
    queryFn: async () => {
      return await contractService.getPaymentSchedule(contractId);
    },
    enabled: !!contractId
  });
  
  // Tính tổng số tiền
  useEffect(() => {
    if (paymentTermsData && paymentTermsData?.length > 0) {
      const sum = paymentTermsData.reduce((sum, term) => sum + (Number(term.amount) || 0), 0);
      setTotalAmount(sum);
    } else {
      setTotalAmount(0);
    }
  }, [paymentTermsData]);
  
  // Map trạng thái đợt thanh toán sang màu Badge
  const getPaymentTermStatusColor = (status: string) => {
    const statusMap: Record<string, "error" | "default" | "secondary" | "success" | "info" | "warning" | "outline"> = {
      'paid': 'success',
      'unpaid': 'secondary',
      'invoiced': 'info',
      'overdue': 'error'
    };
    return statusMap[status] || 'secondary';
  };
  
  // Map trạng thái đợt thanh toán sang text
  const getPaymentTermStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'paid': 'Đã thanh toán',
      'unpaid': 'Chưa thanh toán',
      'invoiced': 'Đã xuất hóa đơn',
      'overdue': 'Quá hạn'
    };
    return statusMap[status] || status;
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner size="md" />
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-md">
        Có lỗi khi tải dữ liệu đợt thanh toán. Vui lòng thử lại sau.
      </div>
    );
  }
  
  const paymentTerms = paymentTermsData || [];
  
  if (paymentTerms.length === 0) {
    return (
      <div className="p-4 text-gray-600 bg-gray-50 rounded-md">
        Chưa có đợt thanh toán nào được thiết lập.
      </div>
    );
  }
  
  return (
    <Card className="mt-4 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Đợt
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mô tả
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày dự kiến
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
                Ngày thanh toán
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paymentTerms.map((term) => (
              <tr key={term.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {term.termNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {term.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(term.dueDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(term.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {term.percentage}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={getPaymentTermStatusColor(term.status)}>
                    {getPaymentTermStatusText(term.status)}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {term.paidDate ? formatDate(term.paidDate) : 'Chưa thanh toán'}
                </td>
              </tr>
            ))}
            
            {/* Dòng tổng */}
            <tr className="bg-gray-50">
              <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                Tổng:
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {formatCurrency(totalAmount)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {contractAmount > 0 ? (totalAmount / contractAmount * 100).toFixed(2) : 0}%
              </td>
              <td colSpan={2}></td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
}; 
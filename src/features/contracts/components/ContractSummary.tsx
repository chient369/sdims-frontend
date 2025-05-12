import React, { useMemo } from 'react';
import { ContractSummary as ContractSummaryType } from '../types';
import { formatCurrency } from '../../../utils/formatters';

interface ContractSummaryProps {
  contracts: ContractSummaryType[];
  loading: boolean;
}

/**
 * Component hiển thị tổng hợp thông tin các hợp đồng
 */
const ContractSummary: React.FC<ContractSummaryProps> = ({ contracts, loading }) => {
  // Tính toán các thông số tổng hợp
  const summary = useMemo(() => {
    if (loading || contracts.length === 0) {
      return {
        totalContracts: 0,
        totalValue: 0,
        totalPaid: 0,
        totalRemaining: 0,
        statusCounts: {
          Draft: 0,
          InReview: 0,
          Approved: 0,
          Active: 0,
          InProgress: 0,
          OnHold: 0,
          Completed: 0,
          Terminated: 0,
          Expired: 0,
          Cancelled: 0
        }
      };
    }
    
    // Khởi tạo đối tượng tổng hợp
    const result = {
      totalContracts: contracts.length,
      totalValue: 0,
      totalPaid: 0,
      totalRemaining: 0,
      statusCounts: {
        Draft: 0,
        InReview: 0,
        Approved: 0,
        Active: 0,
        InProgress: 0,
        OnHold: 0,
        Completed: 0,
        Terminated: 0,
        Expired: 0,
        Cancelled: 0
      }
    };
    
    // Tính toán tổng giá trị hợp đồng
    contracts.forEach(contract => {
      result.totalValue += contract.amount;
      
      // Cộng dồn theo trạng thái
      if (contract.status) {
        result.statusCounts[contract.status]++;
      }
      
      // Tổng đã thanh toán và còn lại từ API
      result.totalPaid += contract.paymentStatus.paidAmount;
      result.totalRemaining += contract.paymentStatus.remainingAmount;
    });
    
    return result;
  }, [contracts, loading]);
  
  // Trường hợp đang loading
  if (loading) {
    return (
      <div className="p-4 animate-pulse">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tổng hợp</h3>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  // Render kết quả tổng hợp
  return (
    <div className="p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Tổng hợp</h3>
      
      <div className="space-y-4">
        {/* Tổng số hợp đồng */}
        <div>
          <span className="text-gray-500 text-sm">Số hợp đồng:</span>
          <div className="text-2xl font-bold">{summary.totalContracts}</div>
        </div>
        
        {/* Tổng giá trị */}
        <div>
          <span className="text-gray-500 text-sm">Tổng giá trị:</span>
          <div className="text-2xl font-bold text-primary-700">
            {formatCurrency(summary.totalValue)}
          </div>
        </div>
        
        {/* Đã thanh toán / Còn lại */}
        <div className="space-y-1">
          <span className="text-gray-500 text-sm">Đã thanh toán:</span>
          <div className="font-semibold text-green-600">
            {formatCurrency(summary.totalPaid)}
            <span className="text-sm font-normal ml-1">
              ({summary.totalValue > 0 ? Math.round((summary.totalPaid / summary.totalValue) * 100) : 0}%)
            </span>
          </div>
          
          <span className="text-gray-500 text-sm">Còn lại:</span>
          <div className="font-semibold text-amber-600">
            {formatCurrency(summary.totalRemaining)}
            <span className="text-sm font-normal ml-1">
              ({summary.totalValue > 0 ? Math.round((summary.totalRemaining / summary.totalValue) * 100) : 0}%)
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
            <div 
              className="bg-primary-600 h-2.5 rounded-full" 
              style={{ width: `${summary.totalValue > 0 ? (summary.totalPaid / summary.totalValue) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
        
        {/* Phân bổ theo trạng thái */}
        <div>
          <span className="text-gray-500 text-sm">Theo trạng thái:</span>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Đang hiệu lực:</span>
              <span className="font-medium">{summary.statusCounts.Active}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Hoàn thành:</span>
              <span className="font-medium">{summary.statusCounts.Completed}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Nháp:</span>
              <span className="font-medium">{summary.statusCounts.Draft}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tạm dừng:</span>
              <span className="font-medium">{summary.statusCounts.OnHold}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Đã hủy:</span>
              <span className="font-medium">{summary.statusCounts.Terminated}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractSummary; 
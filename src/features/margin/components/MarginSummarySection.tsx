/**
 * MarginSummarySection Component
 * 
 * Hiển thị tổng hợp thông tin margin: số nhân viên, chi phí, doanh thu,
 * margin trung bình và phân bố nhân viên theo trạng thái.
 */

import React from 'react';
import { Card, CardContent, Heading, Text } from '../../../components/ui';
import { MarginSummary } from '../types';

interface MarginSummarySectionProps {
  summary: MarginSummary;
}

const MarginSummarySection: React.FC<MarginSummarySectionProps> = ({ summary }) => {
  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Format percentage for display
  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'percent', minimumFractionDigits: 2 }).format(value / 100);
  };

  // Calculate total employees in status counts
  const totalEmployeesInStatusCounts = 
    summary.statusCounts.Red + 
    summary.statusCounts.Yellow + 
    summary.statusCounts.Green;

  // Calculate percentage for each status
  const getStatusPercentage = (count: number) => {
    return (count / totalEmployeesInStatusCounts) * 100;
  };

  // Status config
  const statusConfig = {
    Red: { label: 'Thấp', color: 'bg-red-500', textColor: 'text-red-700' },
    Yellow: { label: 'Trung bình', color: 'bg-yellow-500', textColor: 'text-yellow-700' },
    Green: { label: 'Cao', color: 'bg-green-500', textColor: 'text-green-700' }
  };

  return (
    <Card>
      <CardContent>
        <Heading level={4} className="mb-4">Tổng hợp Margin {summary.periodLabel}</Heading>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Tổng số nhân viên */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-gray-500 text-sm">Tổng số nhân viên</div>
            <div className="text-2xl font-bold">{summary.totalEmployees}</div>
          </div>
          
          {/* Tổng chi phí */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-gray-500 text-sm">Chi phí trung bình</div>
            <div className="text-2xl font-bold">{formatCurrency(summary.averageCost)}</div>
          </div>
          
          {/* Tổng doanh thu */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-gray-500 text-sm">Doanh thu trung bình</div>
            <div className="text-2xl font-bold">{formatCurrency(summary.averageRevenue)}</div>
          </div>
          
          {/* Margin trung bình */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-gray-500 text-sm">Margin trung bình</div>
            <div className="text-2xl font-bold">{formatPercentage(summary.averageMargin)}</div>
          </div>
        </div>
        
        {/* Phân bố nhân viên theo trạng thái */}
        <div>
          <Text size="lg" className="font-medium mb-2">Phân bố nhân viên theo trạng thái margin</Text>
          
          {/* Progress bar */}
          <div className="w-full h-5 rounded-full overflow-hidden flex mb-2">
            {Object.entries(summary.statusCounts).map(([status, count]) => {
              const percentage = getStatusPercentage(count);
              return (
                <div 
                  key={status}
                  className={`${statusConfig[status as keyof typeof statusConfig].color} h-full`}
                  style={{ width: `${percentage}%` }}
                  title={`${status}: ${count} nhân viên (${percentage.toFixed(1)}%)`}
                />
              );
            })}
          </div>
          
          {/* Status legend */}
          <div className="flex flex-wrap gap-4">
            {Object.entries(summary.statusCounts).map(([status, count]) => {
              const config = statusConfig[status as keyof typeof statusConfig];
              const percentage = getStatusPercentage(count);
              
              return (
                <div key={status} className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${config.color} mr-1`}></div>
                  <span className={`text-sm ${config.textColor} font-medium`}>
                    {config.label}: {count} nhân viên ({percentage.toFixed(1)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarginSummarySection; 
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@components/ui/Card';
import { useNavigate } from 'react-router-dom';

interface RevenueWidgetProps {
  data: {
    target: number;
    actual: number;
    achievement: number;
  };
  loading?: boolean;
}

export const RevenueWidget: React.FC<RevenueWidgetProps> = ({
  data,
  loading = false,
}) => {
  const navigate = useNavigate();
  
  const handleViewDetails = () => {
    navigate('/reports/revenue');
  };
  
  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex justify-between">
            <span>Doanh thu (vs KPI)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="w-full animate-pulse bg-secondary-200 h-48 rounded"></div>
        </CardContent>
      </Card>
    );
  }
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(value)
      .replace(/\s₫/, '₫')
      .replace(/\.\d{3}/, 'B');
  };
  
  const getProgressColor = (achievement: number) => {
    if (achievement < 70) return 'bg-red-500';
    if (achievement < 90) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>Doanh thu (vs KPI)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-secondary-600">KPI:</div>
          <div className="font-semibold">{formatCurrency(data.target)}</div>
        </div>
        
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-secondary-600">Đạt được:</div>
          <div className="font-semibold">{formatCurrency(data.actual)}</div>
        </div>
        
        <div className="mt-3">
          <div className="flex justify-between items-center mb-1">
            <div className="text-sm text-secondary-600">Tiến độ:</div>
            <div className="text-sm font-semibold">{data.achievement}%</div>
          </div>
          <div className="w-full bg-secondary-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${getProgressColor(data.achievement)}`}
              style={{ width: `${Math.min(data.achievement, 100)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold text-sm">₫0</div>
            </div>
            <div>
              <div className="font-semibold text-sm">KPI: {formatCurrency(data.target)}</div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <button
          onClick={handleViewDetails}
          className="text-sm text-primary-600 hover:text-primary-800 font-medium"
        >
          Xem chi tiết
        </button>
      </CardFooter>
    </Card>
  );
}; 
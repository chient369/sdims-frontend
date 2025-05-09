import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@components/ui/Card';
import { useNavigate } from 'react-router-dom';

interface DebtWidgetProps {
  data: {
    totalTransactions: number;
    totalAmount: number;
    overdue: {
      amount: number;
      transactions: number;
    };
  };
  loading?: boolean;
}

export const DebtWidget: React.FC<DebtWidgetProps> = ({
  data,
  loading = false,
}) => {
  const navigate = useNavigate();
  
  const handleViewDetails = () => {
    navigate('/finance/debts');
  };
  
  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex justify-between">
            <span>Công nợ Quá hạn</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="w-full text-center py-4">
            <div className="animate-pulse bg-secondary-200 h-16 w-16 rounded-full mx-auto mb-4"></div>
            <div className="animate-pulse bg-secondary-200 h-6 w-32 rounded mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(value)
      .replace(/\s₫/, '₫');
  };
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>Công nợ Quá hạn</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center text-center">
        <div className="text-4xl font-bold text-red-600">{data.overdue.transactions}</div>
        <div className="text-sm">Khoản thanh toán</div>
        
        <div className="mt-3 flex w-full justify-around">
          <div className="text-center">
            <div className="text-sm font-semibold text-red-600">{formatCurrency(data.overdue.amount).replace(/\.\d{3}/, 'M')}</div>
            <div className="text-xs text-secondary-600">Quá hạn &gt; 30 ngày</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-amber-600">{formatCurrency(data.totalAmount - data.overdue.amount).replace(/\.\d{3}/, 'M')}</div>
            <div className="text-xs text-secondary-600">Quá hạn &lt; 30 ngày</div>
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
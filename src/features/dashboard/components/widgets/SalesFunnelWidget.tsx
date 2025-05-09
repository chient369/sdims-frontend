import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@components/ui/Card';
import { useNavigate } from 'react-router-dom';

interface StageStat {
  stage: string;
  count: number;
  value: number;
}

interface SalesFunnelWidgetProps {
  data: {
    stages: StageStat[];
    totalValue: number;
    conversionRate: number;
  };
  loading?: boolean;
}

export const SalesFunnelWidget: React.FC<SalesFunnelWidgetProps> = ({
  data,
  loading = false,
}) => {
  const navigate = useNavigate();
  
  const handleViewDetails = () => {
    navigate('/opportunities/pipeline');
  };
  
  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="border-b-0 pb-0">
          <CardTitle className="flex justify-between text-base font-medium">
            <span>Phễu Bán hàng (Tổng quan)</span>
            <button className="text-gray-400 hover:text-gray-500">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center pt-0">
          <div className="w-full animate-pulse bg-secondary-200 h-72 rounded"></div>
        </CardContent>
      </Card>
    );
  }
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(value)
      .replace(/\s₫/, '₫');
  };
  
  // Dữ liệu mẫu theo mockup
  const stageData = [
    { name: 'Mới', count: 45, color: 'bg-blue-600' },
    { name: 'Liên hệ', count: 32, color: 'bg-blue-500' },
    { name: 'Đánh giá', count: 24, color: 'bg-blue-400' },
    { name: 'Đề xuất', count: 18, color: 'bg-blue-300' },
    { name: 'Đàm phán', count: 12, color: 'bg-blue-200' },
    { name: 'Thành công', count: 7, color: 'bg-green-500' },
  ];
  
  // Tìm giá trị lớn nhất để tính tỷ lệ
  const maxCount = Math.max(...stageData.map(stage => stage.count));
  
  return (
    <Card className="h-full">
      <CardHeader className="border-b-0 pb-0">
        <CardTitle className="flex justify-between text-base font-medium">
          <span>Phễu Bán hàng (Tổng quan)</span>
          <button className="text-gray-400 hover:text-gray-500">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex items-end h-64 gap-x-3 mb-4">
          {stageData.map((stage, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className={`${stage.color} w-full`} 
                style={{ 
                  height: `${(stage.count / maxCount) * 180}px`,
                  marginBottom: '4px'
                }}
              ></div>
              <div className="text-xs font-medium">{stage.count}</div>
              <div className="text-xs text-gray-500 mt-1">{stage.name}</div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between mt-2 pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Tỷ lệ chuyển đổi: 15.6%
          </div>
          <div className="text-xs font-medium">
            Tổng giá trị cơ hội: ₫15.8B
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex justify-center">
        <button
          onClick={handleViewDetails}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Xem chi tiết
        </button>
      </CardFooter>
    </Card>
  );
}; 
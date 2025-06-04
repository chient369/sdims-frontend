import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@components/ui/Card';
import { useNavigate } from 'react-router-dom';
import { OpportunityStatusWidget } from '../../types';

interface OpportunityWidgetProps {
  data?: OpportunityStatusWidget;
  type: 'new' | 'follow' | 'all';
  loading?: boolean;
  timeframe?: 'week' | 'month' | 'quarter' | 'year';
}

export const OpportunityWidget: React.FC<OpportunityWidgetProps> = ({
  data,
  type,
  loading = false,
  timeframe = 'month'
}) => {
  const navigate = useNavigate();
  
  const getTitle = () => {
    switch (type) {
      case 'new':
        return 'Cơ hội Mới';
      case 'follow':
        return 'Cơ hội Cần Theo dõi';
      default:
        return 'Hợp đồng Mới Ký';
    }
  };
  
  const getRoute = () => {
    switch (type) {
      case 'new':
        return '/opportunities?status=new';
      case 'follow':
        return '/opportunities?status=follow';
      default:
        return '/contracts/new';
    }
  };
  
  const getColor = () => {
    switch (type) {
      case 'new':
        return 'text-emerald-600';
      case 'follow':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };
  
  const handleViewList = () => {
    navigate(getRoute());
  };
  
  if (loading || !data) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex justify-between">
            <span>{getTitle()}</span>
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
  
  // Lấy dữ liệu phù hợp từ API dựa vào type
  let opportunityCount = 0;
  let redCount = 0;
  let yellowCount = 0;
  
  switch (type) {
    case 'new':
      // Tìm stage "new" hoặc "mới" trong byDealStage
      const newStage = data.byDealStage.find(stage => 
        stage.stage.toLowerCase() === 'new' || 
        stage.stage.toLowerCase() === 'mới' || 
        stage.stage.toLowerCase() === 'contacted'
      );
      opportunityCount = newStage ? newStage.count : 0;
      break;
    case 'follow':
      // Lấy tổng số cơ hội cần theo dõi (red + yellow)
      redCount = data.byStatus.red;
      yellowCount = data.byStatus.yellow;
      opportunityCount = redCount + yellowCount;
      break;
    default:
      // Mặc định là tổng số cơ hội
      opportunityCount = data.totalOpportunities;
  }
  
  // Map thời gian hiển thị
  const periodMap = {
    'week': 'tuần trước',
    'month': 'tháng trước',
    'quarter': 'quý trước',
    'year': 'năm trước'
  };
  
  const periodLabel = periodMap[timeframe] || 'kỳ trước';
  
  // Giả sử có thay đổi là 0 (không có thông tin về sự thay đổi từ API)
  const change = 0;
  
  return (
    <Card className="h-full">
      <CardHeader className="border-b-0 pb-0">
        <CardTitle className="flex justify-between text-base font-medium">
          <span>{getTitle()}</span>
          <button className="text-gray-400 hover:text-gray-500">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="text-center">
          <div className={`text-4xl font-bold ${getColor()}`}>{opportunityCount}</div>
          <div className="text-sm text-gray-500">
            {type === 'new' ? 'Cơ hội mới' : type === 'follow' ? 'Cần theo dõi' : 'Tổng số cơ hội'}
          </div>
          
          {change !== 0 && (
            <div className={`mt-2 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? 
                <span className="inline-flex items-center">
                  <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  +{Math.abs(change)} từ {periodLabel}
                </span> 
                : 
                <span className="inline-flex items-center">
                  <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  -{Math.abs(change)} từ {periodLabel}
                </span>
              }
            </div>
          )}
        </div>
        
        {type === 'follow' && (
          <div className="flex justify-around mt-3">
            <div className="text-center">
              <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">{redCount}</div>
              <div className="text-xs mt-1 text-gray-500">Red</div>
            </div>
            <div className="text-center">
              <div className="w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto">{yellowCount}</div>
              <div className="text-xs mt-1 text-gray-500">Yellow</div>
            </div>
          </div>
        )}

        {data.topOpportunities && data.topOpportunities.length > 0 && type !== 'follow' && (
          <div className="mt-3">
            <h4 className="text-sm font-medium mb-2">Cơ hội hàng đầu</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {data.topOpportunities.slice(0, 3).map((opp, index) => (
                <div key={index} className="text-xs p-2 border border-gray-100 rounded bg-gray-50">
                  <div className="font-medium truncate">{opp.name}</div>
                  <div className="flex justify-between text-gray-500 mt-1">
                    <span>{opp.customer}</span>
                    <span className="font-medium">{(opp.value / 1000000).toFixed(1)}M</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <button
            onClick={handleViewList}
            className="w-full text-center py-2 text-sm text-primary-600 hover:text-primary-700 border border-gray-200 rounded-md transition-colors hover:bg-gray-50"
          >
            Xem danh sách
          </button>
        </div>
      </CardContent>
    </Card>
  );
}; 
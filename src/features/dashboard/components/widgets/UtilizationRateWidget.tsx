import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@components/ui/Card';
import { UtilizationRateWidget as UtilizationRateWidgetType } from '../../types';

interface UtilizationRateWidgetProps {
  data?: UtilizationRateWidgetType;
  loading?: boolean;
  timeframe?: 'week' | 'month' | 'quarter' | 'year';
}

export const UtilizationRateWidget: React.FC<UtilizationRateWidgetProps> = ({
  data,
  loading = false,
  timeframe = 'month'
}) => {
  if (loading || !data) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex justify-between">
            <span>Tỷ lệ Sử dụng Nguồn lực (%)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="w-full animate-pulse bg-secondary-200 h-48 rounded"></div>
        </CardContent>
      </Card>
    );
  }
  
  // Lấy dữ liệu từ API
  const utilizationRate = data.overall;
  
  // Tính toán sự thay đổi (nếu có trend data)
  let changeValue = 0;
  let previousPeriod = '';
  
  if (data.trend && data.trend.length >= 2) {
    const currentMonth = data.trend[data.trend.length - 1];
    const previousMonth = data.trend[data.trend.length - 2];
    
    changeValue = currentMonth.value - previousMonth.value;
    previousPeriod = previousMonth.month;
  }
  
  // Map thời gian hiển thị
  const periodMap = {
    'week': 'tuần trước',
    'month': 'tháng trước',
    'quarter': 'quý trước',
    'year': 'năm trước'
  };
  
  const periodLabel = periodMap[timeframe] || 'kỳ trước';
  
  return (
    <Card className="h-full">
      <CardHeader className="border-b-0 pb-0">
        <CardTitle className="flex justify-between text-base font-medium">
          <span>Tỷ lệ Sử dụng Nguồn lực (%)</span>
          <button className="text-gray-400 hover:text-gray-500">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex justify-center items-center">
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 120 120" className="w-full h-full">
              <circle 
                cx="60" 
                cy="60" 
                r="54" 
                fill="none" 
                stroke="#e5e7eb" 
                strokeWidth="12" 
                strokeDasharray="339.3"
              />
              <circle 
                cx="60" 
                cy="60" 
                r="54" 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="12" 
                strokeDasharray="339.3" 
                strokeDashoffset={339.3 - (339.3 * utilizationRate) / 100}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold">{utilizationRate}%</div>
              <div className="text-xs text-gray-500">Utilization</div>
            </div>
          </div>
        </div>
        
        {changeValue !== 0 && (
          <div className="mt-2 text-center">
            <div className={`text-sm ${changeValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {changeValue >= 0 ? 
                <span className="inline-flex items-center">
                  <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  +{Math.abs(changeValue)}% từ {periodLabel}
                </span> 
                : 
                <span className="inline-flex items-center">
                  <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  -{Math.abs(changeValue)}% từ {periodLabel}
                </span>
              }
            </div>
          </div>
        )}
        
        {/* Hiển thị tỷ lệ sử dụng theo team nếu có */}
        {data.byTeam && data.byTeam.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Tỷ lệ theo Team</h4>
            <div className="space-y-2">
              {data.byTeam.map((team, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="truncate">{team.team}</span>
                  <span className="font-medium">{team.rate}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 
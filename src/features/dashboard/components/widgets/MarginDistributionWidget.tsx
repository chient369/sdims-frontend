import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@components/ui/Card';
import { PieChart } from '@components/charts/PieChart';
import { useNavigate } from 'react-router-dom';

interface MarginDistributionData {
  distribution: {
    green: { count: number; percentage: number };
    yellow: { count: number; percentage: number };
    red: { count: number; percentage: number };
  };
  totalEmployees: number;
}

interface MarginDistributionWidgetProps {
  data: MarginDistributionData;
  loading?: boolean;
}

export const MarginDistributionWidget: React.FC<MarginDistributionWidgetProps> = ({
  data,
  loading = false,
}) => {
  const navigate = useNavigate();
  
  const handleViewDetails = () => {
    navigate('/margin/teams');
  };
  
  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex justify-between">
            <span>Phân bố Margin (Team)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="w-full animate-pulse bg-secondary-200 h-48 rounded"></div>
        </CardContent>
      </Card>
    );
  }
  
  const chartData = {
    labels: ['Green', 'Yellow', 'Red'],
    datasets: [
      {
        data: [
          data.distribution.green.percentage,
          data.distribution.yellow.percentage, 
          data.distribution.red.percentage
        ],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="border-b-0 pb-0">
        <CardTitle className="flex justify-between text-base font-medium">
          <span>Phân bố Margin (Team)</span>
          <button className="text-gray-400 hover:text-gray-500">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex justify-center">
          <div className="w-52 h-52">
            <PieChart 
              data={chartData}
            />
          </div>
        </div>
        
        <div className="flex justify-around mt-4">
          <div className="text-center">
            <div className="flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
              <div className="text-sm">{data.distribution.green.percentage}%</div>
            </div>
            <div className="text-xs text-gray-500">Green</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
              <div className="text-sm">{data.distribution.yellow.percentage}%</div>
            </div>
            <div className="text-xs text-gray-500">Yellow</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
              <div className="text-sm">{data.distribution.red.percentage}%</div>
            </div>
            <div className="text-xs text-gray-500">Red</div>
          </div>
        </div>
        
        <div className="mt-4">
          <button
            onClick={handleViewDetails}
            className="w-full text-center py-2 text-sm text-primary-600 hover:text-primary-700 border border-gray-200 rounded-md transition-colors hover:bg-gray-50"
          >
            Xem chi tiết
          </button>
        </div>
      </CardContent>
    </Card>
  );
}; 
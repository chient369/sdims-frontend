import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@components/ui/Card';
import { PieChart } from '@components/charts/PieChart';
import { useNavigate } from 'react-router-dom';
import { EmployeeStatusWidget } from '../../types';

interface EmployeeAvailableWidgetProps {
  data: {
    totalEmployees: number;
    change: number;
    periodLabel: string;
  };
  loading?: boolean;
}

export const EmployeeAvailableWidget: React.FC<EmployeeAvailableWidgetProps> = ({
  data,
  loading = false,
}) => {
  const navigate = useNavigate();
  
  const handleViewList = () => {
    navigate('/hrm/employees?status=available');
  };
  
  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex justify-between">
            <span>Nhân sự Sẵn sàng (Bench)</span>
            <div className="animate-pulse bg-secondary-200 h-6 w-20 rounded"></div>
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
  
  return (
    <Card className="h-full">
      <CardHeader className="border-b-0 pb-0">
        <CardTitle className="flex justify-between text-base font-medium">
          <span>Nhân sự Sẵn sàng (Bench)</span>
          <button className="text-gray-400 hover:text-gray-500">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary-600">{data.totalEmployees}</div>
          <div className="text-sm text-gray-500">Nhân viên</div>
          
          <div className={`mt-2 text-sm ${data.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data.change >= 0 ? 
              <span className="inline-flex items-center">
                <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                +{Math.abs(data.change)} từ {data.periodLabel}
              </span> 
              : 
              <span className="inline-flex items-center">
                <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                -{Math.abs(data.change)} từ {data.periodLabel}
              </span>
            }
          </div>
        </div>

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

interface EmployeeEndingSoonWidgetProps {
  data: {
    totalEmployees: number;
    change: number;
    periodLabel: string;
  };
  loading?: boolean;
}

export const EmployeeEndingSoonWidget: React.FC<EmployeeEndingSoonWidgetProps> = ({
  data,
  loading = false,
}) => {
  const navigate = useNavigate();
  
  const handleViewList = () => {
    navigate('/hrm/employees?ending_soon=true');
  };
  
  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex justify-between">
            <span>Nhân sự Sắp hết Dự án</span>
            <div className="animate-pulse bg-secondary-200 h-6 w-20 rounded"></div>
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
  
  return (
    <Card className="h-full">
      <CardHeader className="border-b-0 pb-0">
        <CardTitle className="flex justify-between text-base font-medium">
          <span>Nhân sự Sắp hết Dự án</span>
          <button className="text-gray-400 hover:text-gray-500">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="text-center">
          <div className="text-4xl font-bold text-amber-500">{data.totalEmployees}</div>
          <div className="text-sm text-gray-500">Nhân viên</div>
          
          <div className={`mt-2 text-sm ${data.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data.change >= 0 ? 
              <span className="inline-flex items-center">
                <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                +{Math.abs(data.change)} từ {data.periodLabel}
              </span> 
              : 
              <span className="inline-flex items-center">
                <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                -{Math.abs(data.change)} từ {data.periodLabel}
              </span>
            }
          </div>
        </div>

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
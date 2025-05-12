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

interface EndingSoonEmployee {
  id: string;
  name: string;
  projectEndDate: string;
}

interface EmployeeEndingSoonWidgetProps {
  data: {
    totalEmployees: number;
    change: number;
    periodLabel: string;
    employees?: EndingSoonEmployee[];
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
  
  const handleViewEmployee = (employeeId: string) => {
    navigate(`/hrm/employees/${employeeId}`);
  };
  
  // Chuyển đổi ngày từ chuỗi sang đối tượng Date
  const parseDate = (dateString: string): Date => {
    return new Date(dateString);
  };
  
  // Tính số ngày còn lại
  const getDaysRemaining = (dateString: string): number => {
    const today = new Date();
    const endDate = parseDate(dateString);
    
    // Đặt thời gian về 0 để so sánh chỉ theo ngày
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    const timeDiff = endDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };
  
  // Xác định màu sắc dựa vào số ngày còn lại
  const getStatusColor = (daysRemaining: number): string => {
    if (daysRemaining <= 7) return 'bg-red-100 text-red-800';
    if (daysRemaining <= 15) return 'bg-amber-100 text-amber-800';
    return 'bg-blue-100 text-blue-800';
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
          <div className="w-full py-2">
            <div className="animate-pulse bg-secondary-200 h-8 w-full rounded mb-2"></div>
            <div className="animate-pulse bg-secondary-200 h-8 w-full rounded mb-2"></div>
            <div className="animate-pulse bg-secondary-200 h-8 w-full rounded mb-2"></div>
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
        {data.employees && data.employees.length > 0 ? (
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {data.employees.map(employee => {
              const daysRemaining = getDaysRemaining(employee.projectEndDate);
              const statusColor = getStatusColor(daysRemaining);
              
              return (
                <div 
                  key={employee.id}
                  className="p-2 border border-gray-100 rounded-md hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewEmployee(employee.id)}
                >
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{employee.name}</div>
                    <div className={`text-xs px-2 py-1 rounded-full ${statusColor}`}>
                      {daysRemaining} ngày
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Kết thúc: {new Date(employee.projectEndDate).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">Không có nhân viên nào sắp hết dự án</p>
          </div>
        )}

        <div className="mt-4">
          <button
            onClick={handleViewList}
            className="w-full text-center py-2 text-sm text-primary-600 hover:text-primary-700 border border-gray-200 rounded-md transition-colors hover:bg-gray-50"
          >
            Xem tất cả
          </button>
        </div>
      </CardContent>
    </Card>
  );
}; 
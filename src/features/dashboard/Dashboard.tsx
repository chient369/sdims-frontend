import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';
import { PermissionGuard } from '@components/ui';
import { 
  TimeRangeFilter, 
  DashboardAlert,
  TeamFilter,
  EmployeeAvailableWidget, 
  EmployeeEndingSoonWidget,
  UtilizationRateWidget,
  MarginDistributionWidget,
  OpportunityWidget,
  SalesFunnelWidget,
  RevenueWidget,
  DebtWidget
} from './components';
import { getDashboardSummary } from './api';
import { getAvailableEmployees } from '../hrm/api';
import { getUtilizationReport } from '../reports/api';
import { DashboardSummary } from './types';
import { useDashboardPermissions } from './hooks';

// Widget fallback component hiển thị khi user không có quyền
const WidgetFallback: React.FC<{ title: string }> = ({ title }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-center h-32 bg-gray-50 rounded-md">
        <p className="text-sm text-gray-500">Bạn không có quyền xem nội dung này</p>
      </div>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingHR, setLoadingHR] = useState<boolean>(true);
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [availableEmployees, setAvailableEmployees] = useState<any[]>([]);
  const [endingSoonEmployees, setEndingSoonEmployees] = useState<any[]>([]);
  const [utilizationRate, setUtilizationRate] = useState<number>(0);
  const [utilizationChange, setUtilizationChange] = useState<number>(0);
  const [showAlert, setShowAlert] = useState<boolean>(true);

  const { 
    canViewEmployeeWidgets,
    canViewUtilizationWidget,
    canViewMarginWidget,
    canViewOpportunityWidgets,
    canViewRevenueWidget,
    canViewDebtWidget,
    canViewSalesFunnelWidget
  } = useDashboardPermissions();

  // Memoize permission checks để tránh tính toán lại khi component re-render
  const permissionChecks = useMemo(() => ({
    canViewEmployees: canViewEmployeeWidgets(),
    canViewUtilization: canViewUtilizationWidget()
  }), [canViewEmployeeWidgets, canViewUtilizationWidget]);
  
  // Tạo hàm fetchDashboardData bên ngoài useEffect để sử dụng với useCallback
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Thêm teamId vào params nếu đã chọn
      const params = { 
        timeframe,
        teamId: selectedTeamId || undefined
      };
      const data = await getDashboardSummary(params);
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [timeframe, selectedTeamId]);

  // Tạo hàm fetchHRData bên ngoài useEffect để sử dụng với useCallback
  const fetchHRData = useCallback(async () => {
    // Kiểm tra quyền trước khi fetch dữ liệu
    if (!permissionChecks.canViewEmployees && !permissionChecks.canViewUtilization) {
      return;
    }
    
    setLoadingHR(true);
    
    try {
      // Tải dữ liệu nhân viên sẵn sàng (bench)
      if (permissionChecks.canViewEmployees) {
        const today = new Date();
        const startDateStr = today.toISOString().split('T')[0];
        
        try {
          const availableData = await getAvailableEmployees({
            startDate: startDateStr
          });
          setAvailableEmployees(availableData || []);
        } catch (error) {
          console.error('Error fetching available employees:', error);
          setAvailableEmployees([]);
        }
        
        // Mock data cho nhân viên sắp hết dự án
        const mockEndingSoon = [
          {
            id: '101',
            fullName: 'Nguyễn Văn A',
            teamName: 'Team Alpha',
            projectEndDate: '2025-07-05'
          },
          {
            id: '102',
            fullName: 'Trần Thị B',
            teamName: 'Team Beta',
            projectEndDate: '2025-07-15'
          },
          {
            id: '103',
            fullName: 'Lê Văn C',
            teamName: 'Team Alpha',
            projectEndDate: '2025-07-22'
          },
          {
            id: '104',
            fullName: 'Phạm Thị D',
            teamName: 'Team Gamma',
            projectEndDate: '2025-07-28'
          }
        ];
        
        // Filter theo teamId nếu có
        if (selectedTeamId) {
          const filteredEndingSoon = mockEndingSoon.filter(emp => 
            emp.teamName === (selectedTeamId === '1' ? 'Team Alpha' : 
                            selectedTeamId === '2' ? 'Team Beta' : 
                            selectedTeamId === '3' ? 'Team Gamma' : '')
          );
          setEndingSoonEmployees(filteredEndingSoon);
        } else {
          setEndingSoonEmployees(mockEndingSoon);
        }
      }
      
      // Tải dữ liệu utilization rate
      if (permissionChecks.canViewUtilization) {
        const today = new Date();
        let fromDate = new Date(today);
        
        switch(timeframe) {
          case 'week':
            fromDate.setDate(today.getDate() - 7);
            break;
          case 'month':
            fromDate.setMonth(today.getMonth() - 1);
            break;
          case 'quarter':
            fromDate.setMonth(today.getMonth() - 3);
            break;
          case 'year':
            fromDate.setFullYear(today.getFullYear() - 1);
            break;
        }
        
        const fromDateStr = fromDate.toISOString().split('T')[0];
        const toDateStr = today.toISOString().split('T')[0];
        
        try {
          const response = await getUtilizationReport({
            fromDate: fromDateStr,
            toDate: toDateStr,
            teamId: selectedTeamId ? parseInt(selectedTeamId, 10) : undefined,
            period: timeframe,
          });
          
          if (!(response instanceof Blob)) {
            setUtilizationRate(response.summary.averageUtilization);
            setUtilizationChange(5); // Mock data - thay đổi so với kỳ trước
          }
        } catch (error) {
          console.error('Error fetching utilization data:', error);
          setUtilizationRate(78);
          setUtilizationChange(2);
        }
      }
    } catch (error) {
      console.error('Error fetching HR data:', error);
    } finally {
      setLoadingHR(false);
    }
  }, [timeframe, selectedTeamId, permissionChecks.canViewEmployees, permissionChecks.canViewUtilization]);

  // Load data khi component mount hoặc khi dependencies thay đổi
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Tải dữ liệu HR trong useEffect riêng biệt
  useEffect(() => {
    fetchHRData();
  }, [fetchHRData]);
  
  const handleTimeframeChange = (newTimeframe: 'week' | 'month' | 'quarter' | 'year') => {
    setTimeframe(newTimeframe);
    // Lưu timeframe vào localStorage để giữ trạng thái cho lần sau
    localStorage.setItem('dashboard_timeframe', newTimeframe);
  };
  
  const handleTeamChange = (teamId: string | null) => {
    setSelectedTeamId(teamId);
    // Lưu teamId vào localStorage
    if (teamId) {
      localStorage.setItem('dashboard_teamId', teamId);
    } else {
      localStorage.removeItem('dashboard_teamId');
    }
  };
  
  const handleDismissAlert = () => {
    setShowAlert(false);
  };
  
  // Load saved filters from localStorage
  useEffect(() => {
    const savedTimeframe = localStorage.getItem('dashboard_timeframe');
    if (savedTimeframe) {
      setTimeframe(savedTimeframe as 'week' | 'month' | 'quarter' | 'year');
    }
    
    const savedTeamId = localStorage.getItem('dashboard_teamId');
    if (savedTeamId) {
      setSelectedTeamId(savedTeamId);
    }
  }, []);
  
  // Chuẩn bị dữ liệu cho các widget
  const employeeAvailableData = {
    totalEmployees: availableEmployees?.length || 0,
    change: 3, // Mock data - thay đổi so với kỳ trước
    periodLabel: timeframe === 'week' ? 'tuần trước' : 
                timeframe === 'month' ? 'tháng trước' : 
                timeframe === 'quarter' ? 'quý trước' : 'năm trước'
  };
  
  const employeeEndingSoonData = {
    totalEmployees: endingSoonEmployees?.length || 0,
    change: -2, // Mock data - thay đổi so với kỳ trước
    periodLabel: timeframe === 'week' ? 'tuần trước' : 
                timeframe === 'month' ? 'tháng trước' : 
                timeframe === 'quarter' ? 'quý trước' : 'năm trước',
    employees: endingSoonEmployees?.map(emp => ({
      id: emp.id,
      name: emp.fullName,
      projectEndDate: emp.projectEndDate
    }))
  };
  
  const utilizationRateData = {
    rate: utilizationRate,
    change: utilizationChange,
    periodLabel: timeframe === 'week' ? 'tuần trước' : 
                timeframe === 'month' ? 'tháng trước' : 
                timeframe === 'quarter' ? 'quý trước' : 'năm trước'
  };
  
  // Mock data khi chưa có data thật
  const mockData = {
    employeeAvailable: employeeAvailableData,
    employeeEndingSoon: employeeEndingSoonData,
    utilizationRate: utilizationRateData,
    marginDistribution: {
      distribution: {
        green: { count: 60, percentage: 60 },
        yellow: { count: 25, percentage: 25 },
        red: { count: 15, percentage: 15 }
      },
      totalEmployees: 100
    },
    newOpportunities: {
      totalOpportunities: 23,
      change: 7,
      periodLabel: 'tuần trước'
    },
    followOpportunities: {
      totalOpportunities: 9,
      change: 2,
      periodLabel: 'tuần trước'
    },
    salesFunnel: {
      stages: [
        { stage: 'Mới', count: 45, value: 1000000000 },
        { stage: 'Liên hệ', count: 32, value: 800000000 },
        { stage: 'Đánh giá', count: 24, value: 600000000 },
        { stage: 'Đề xuất', count: 18, value: 400000000 },
        { stage: 'Đàm phán', count: 12, value: 300000000 },
        { stage: 'Thành công', count: 7, value: 200000000 }
      ],
      totalValue: 3300000000,
      conversionRate: 15.6
    },
    revenue: {
      target: 410000000,
      actual: 348500000,
      achievement: 85
    },
    debt: {
      totalTransactions: 3,
      totalAmount: 1500000000,
      overdue: {
        amount: 800000000,
        transactions: 3
      }
    }
  };
  
  return (
    <div className="p-4 md:p-0">
      {/* Bộ lọc dashboard */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="w-full sm:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bộ phận/Team
          </label>
          <TeamFilter 
            selectedTeamId={selectedTeamId}
            onTeamChange={handleTeamChange}
          />
        </div>
        
        <TimeRangeFilter
          currentTimeframe={timeframe}
          onTimeframeChange={handleTimeframeChange}
        />
      </div>
      
      {/* Thông báo quan trọng */}
      {canViewEmployeeWidgets() && showAlert && (
        <div className="mb-6">
          <DashboardAlert
            title="Thông báo quan trọng"
            message="5 nhân viên đang ở trạng thái margin đỏ cần được xem xét"
            type="warning"
            hasDismissAction={true}
            hasViewAction={true}
            viewActionLabel="Xem chi tiết"
            viewActionUrl="/margin/employees?status=red"
            onDismiss={handleDismissAlert}
          />
        </div>
      )}
      
      {/* Row 1: HR Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-1">
          {canViewEmployeeWidgets() ? (
            <EmployeeAvailableWidget 
              data={mockData.employeeAvailable}
              loading={loadingHR}
            />
          ) : (
            <WidgetFallback title="Nhân sự Sẵn sàng" />
          )}
        </div>
        <div className="md:col-span-1">
          {canViewEmployeeWidgets() ? (
            <EmployeeEndingSoonWidget
              data={mockData.employeeEndingSoon}
              loading={loadingHR}
            />
          ) : (
            <WidgetFallback title="Nhân sự Sắp hết Dự án" />
          )}
        </div>
        <div className="md:col-span-1">
          {canViewUtilizationWidget() ? (
            <UtilizationRateWidget
              data={mockData.utilizationRate}
              loading={loadingHR}
            />
          ) : (
            <WidgetFallback title="Tỷ lệ Sử dụng Nguồn lực" />
          )}
        </div>
      </div>
      
      {/* Row 2: Margin and Opportunity Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-1">
          {canViewMarginWidget() ? (
            <MarginDistributionWidget
              data={mockData.marginDistribution}
              loading={loading}
            />
          ) : (
            <WidgetFallback title="Phân bố Margin" />
          )}
        </div>
        <div className="md:col-span-1">
          {canViewOpportunityWidgets() ? (
            <OpportunityWidget
              data={mockData.newOpportunities}
              type="new"
              loading={loading}
            />
          ) : (
            <WidgetFallback title="Cơ hội Mới" />
          )}
        </div>
        <div className="md:col-span-1">
          {canViewOpportunityWidgets() ? (
            <OpportunityWidget
              data={mockData.followOpportunities}
              type="follow"
              loading={loading}
            />
          ) : (
            <WidgetFallback title="Cơ hội Cần Theo dõi" />
          )}
        </div>
      </div>
      
      {/* Row 3: Contract, Revenue, Debt */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-1">
          {canViewOpportunityWidgets() ? (
            <OpportunityWidget
              data={{ 
                totalOpportunities: 7, 
                change: 0, 
                periodLabel: 'tuần trước' 
              }}
              type="all"
              loading={loading}
            />
          ) : (
            <WidgetFallback title="Tổng số Cơ hội" />
          )}
        </div>
        <div className="md:col-span-1">
          {canViewRevenueWidget() ? (
            <RevenueWidget
              data={mockData.revenue}
              loading={loading}
            />
          ) : (
            <WidgetFallback title="Doanh thu vs KPI" />
          )}
        </div>
        <div className="md:col-span-1">
          {canViewDebtWidget() ? (
            <DebtWidget
              data={mockData.debt}
              loading={loading}
            />
          ) : (
            <WidgetFallback title="Công nợ Quá hạn" />
          )}
        </div>
      </div>
      
      {/* Row 4: Sales Funnel */}
      <div className="grid grid-cols-1 gap-6">
        {canViewSalesFunnelWidget() ? (
          <SalesFunnelWidget
            data={mockData.salesFunnel}
            loading={loading}
          />
        ) : (
          <WidgetFallback title="Phễu Bán hàng" />
        )}
      </div>
    </div>
  );
};

export default Dashboard; 
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';
import PermissionGuard from '@components/ui/PermissionGuard';
import { 
  TimeRangeFilter, 
  DashboardAlert,
} from './components';
import TeamFilter from './components/TeamFilter';
import { 
  EmployeeAvailableWidget, 
  EmployeeEndingSoonWidget,
  UtilizationRateWidget,
  MarginDistributionWidget,
  OpportunityWidget,
  SalesFunnelWidget,
  RevenueWidget,
  DebtWidget
} from './components/widgets';
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
      // Chuẩn bị thời gian cho API
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
      
      // Thêm fromDate, toDate và teamId vào params
      const params = { 
        fromDate: fromDateStr,
        toDate: toDateStr,
        teamId: selectedTeamId || undefined,
        widgets: [
          "opportunity_status", 
          "margin_distribution", 
          "revenue_summary", 
          "employee_status", 
          "utilization_rate"
        ]
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
    if (!permissionChecks.canViewEmployees) {
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
    } catch (error) {
      console.error('Error fetching HR data:', error);
    } finally {
      setLoadingHR(false);
    }
  }, [timeframe, selectedTeamId, permissionChecks.canViewEmployees]);

  // Load data khi component mount hoặc khi dependencies thay đổi
  useEffect(() => {
    fetchDashboardData();
    fetchHRData();
  }, [fetchDashboardData, fetchHRData]);

  const handleTimeframeChange = (newTimeframe: 'week' | 'month' | 'quarter' | 'year') => {
    setTimeframe(newTimeframe);
  };

  const handleTeamChange = (teamId: string | null) => {
    setSelectedTeamId(teamId);
  };

  const handleDismissAlert = () => {
    setShowAlert(false);
  };

  // Lấy các widget data từ dashboard response
  const opportunityStatusData = dashboardData?.widgets.opportunity_status;
  const marginDistributionData = dashboardData?.widgets.margin_distribution;
  const revenueSummaryData = dashboardData?.widgets.revenue_summary;
  const employeeStatusData = dashboardData?.widgets.employee_status;
  const utilizationRateData = dashboardData?.widgets.utilization_rate;

  // Tạo dữ liệu tạm thời cho DebtWidget từ revenueSummaryData
  const debtData = revenueSummaryData?.payment ? {
    totalTransactions: 3, // Giả sử
    totalAmount: revenueSummaryData.payment.totalDue,
    overdue: {
      amount: revenueSummaryData.payment.overdue,
      transactions: 3 // Giả sử
    }
  } : {
    totalTransactions: 0,
    totalAmount: 0,
    overdue: {
      amount: 0,
      transactions: 0
    }
  };

  // Chuyển đổi dữ liệu cho SalesFunnelWidget
  const salesFunnelData = opportunityStatusData?.byDealStage ? {
    stages: opportunityStatusData.byDealStage.map(stage => ({
      stage: stage.stage,
      count: stage.count,
      value: 1000000 * stage.count // Giả sử giá trị trung bình mỗi cơ hội là 1M
    })),
    totalValue: opportunityStatusData.byDealStage.reduce((sum, stage) => sum + 1000000 * stage.count, 0),
    conversionRate: 15.6 // Giả sử
  } : {
    stages: [],
    totalValue: 0,
    conversionRate: 0
  };

  // Adapter cho EmployeeAvailableWidget
  const employeeAvailableData = {
    totalEmployees: availableEmployees?.length || 0,
    change: 3, // Mock data
    periodLabel: timeframe === 'week' ? 'tuần trước' : 
                timeframe === 'month' ? 'tháng trước' : 
                timeframe === 'quarter' ? 'quý trước' : 'năm trước'
  };

  // Adapter cho EmployeeEndingSoonWidget
  const employeeEndingSoonData = {
    totalEmployees: endingSoonEmployees?.length || 0,
    change: 1, // Mock data
    periodLabel: timeframe === 'week' ? 'tuần trước' : 
                timeframe === 'month' ? 'tháng trước' : 
                timeframe === 'quarter' ? 'quý trước' : 'năm trước',
    employees: endingSoonEmployees?.map(emp => ({
      id: emp.id,
      name: emp.fullName,
      projectEndDate: emp.projectEndDate
    }))
  };

  // Adapter cho RevenueWidget
  const revenueData = revenueSummaryData ? {
    target: revenueSummaryData.currentMonth.target,
    actual: revenueSummaryData.currentMonth.actual,
    achievement: revenueSummaryData.currentMonth.achievement
  } : {
    target: 0,
    actual: 0,
    achievement: 0
  };

  // Adapter cho MarginDistributionWidget
  const marginData = marginDistributionData ? {
    distribution: {
      green: { 
        count: marginDistributionData.distribution.green.count, 
        percentage: marginDistributionData.distribution.green.percentage 
      },
      yellow: { 
        count: marginDistributionData.distribution.yellow.count, 
        percentage: marginDistributionData.distribution.yellow.percentage 
      },
      red: { 
        count: marginDistributionData.distribution.red.count, 
        percentage: marginDistributionData.distribution.red.percentage 
      }
    },
    totalEmployees: marginDistributionData.totalEmployees
  } : {
    distribution: {
      green: { count: 0, percentage: 0 },
      yellow: { count: 0, percentage: 0 },
      red: { count: 0, percentage: 0 }
    },
    totalEmployees: 0
  };

  return (
    <div className="container mx-auto p-4">
      {showAlert && (
        <div className="mb-6">
          <DashboardAlert 
            title="Chào mừng trở lại!"
            message="Bạn có 5 cơ hội kinh doanh cần theo dõi và 3 khoản thanh toán đến hạn trong tuần này."
            type="info"
            onDismiss={handleDismissAlert}
          />
        </div>
      )}
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <TeamFilter onTeamChange={handleTeamChange} selectedTeamId={selectedTeamId} />
          <TimeRangeFilter onTimeframeChange={handleTimeframeChange} currentTimeframe={timeframe} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <PermissionGuard requiredPermission={['opportunity:read:all', 'opportunity:read:team']}>
          {canViewOpportunityWidgets() ? (
            <OpportunityWidget
              data={opportunityStatusData}
              type="all"
              loading={loading}
              timeframe={timeframe}
            />
          ) : (
            <WidgetFallback title="Tổng số Cơ hội" />
          )}
        </PermissionGuard>
        
        <PermissionGuard requiredPermission={['opportunity:read:all', 'opportunity:read:team']}>
          {canViewOpportunityWidgets() ? (
            <OpportunityWidget 
              data={opportunityStatusData}
              type="new"
              loading={loading}
              timeframe={timeframe}
            />
          ) : (
            <WidgetFallback title="Cơ hội Mới" />
          )}
        </PermissionGuard>
        
        <PermissionGuard requiredPermission={['opportunity:read:all', 'opportunity:read:team']}>
          {canViewOpportunityWidgets() ? (
            <OpportunityWidget
              data={opportunityStatusData}
              type="follow"
              loading={loading}
              timeframe={timeframe}
            />
          ) : (
            <WidgetFallback title="Cơ hội Cần Theo dõi" />
          )}
        </PermissionGuard>
        
        <PermissionGuard requiredPermission={['contract:read:all', 'contract:read:team']}>
          {canViewRevenueWidget() ? (
            <DebtWidget 
              data={debtData}
              loading={loading}
            />
          ) : (
            <WidgetFallback title="Khoản thanh toán" />
          )}
        </PermissionGuard>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <PermissionGuard requiredPermission={['opportunity:read:all', 'opportunity:read:team']}>
            {canViewSalesFunnelWidget() ? (
              <SalesFunnelWidget 
                data={salesFunnelData} 
                loading={loading} 
              />
            ) : (
              <WidgetFallback title="Phễu Sales" />
            )}
          </PermissionGuard>
        </div>
        
        <div>
          <PermissionGuard requiredPermission={['employee:read:all', 'employee:read:team']}>
            {canViewEmployeeWidgets() ? (
              <EmployeeAvailableWidget 
                data={employeeAvailableData} 
                loading={loadingHR} 
              />
            ) : (
              <WidgetFallback title="Nhân viên Sẵn sàng" />
            )}
          </PermissionGuard>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <PermissionGuard requiredPermission={['revenue:read:all', 'revenue:read:team']}>
          {canViewRevenueWidget() ? (
            <RevenueWidget 
              data={revenueData} 
              loading={loading} 
            />
          ) : (
            <WidgetFallback title="Tổng quan Doanh thu" />
          )}
        </PermissionGuard>
        
        <PermissionGuard requiredPermission={['margin:read:all', 'margin:read:team']}>
          {canViewMarginWidget() ? (
            <MarginDistributionWidget 
              data={marginData} 
              loading={loading} 
            />
          ) : (
            <WidgetFallback title="Phân bố Biên lợi nhuận" />
          )}
        </PermissionGuard>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PermissionGuard requiredPermission={['employee:read:all', 'employee:read:team']}>
          {canViewEmployeeWidgets() ? (
            <EmployeeEndingSoonWidget 
              data={employeeEndingSoonData} 
              loading={loading || loadingHR} 
            />
          ) : (
            <WidgetFallback title="Nhân viên Sắp Hết Dự án" />
          )}
        </PermissionGuard>
        
        <PermissionGuard requiredPermission={['utilization:read:all', 'utilization:read:team']}>
          {canViewUtilizationWidget() ? (
            <UtilizationRateWidget 
              data={utilizationRateData} 
              loading={loading}
              timeframe={timeframe}
            />
          ) : (
            <WidgetFallback title="Tỷ lệ Sử dụng Nguồn lực" />
          )}
        </PermissionGuard>
      </div>
    </div>
  );
};

export default Dashboard; 
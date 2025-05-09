import React, { useState, useEffect } from 'react';
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
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
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
  
  // Load dashboard data khi timeframe hoặc selectedTeamId thay đổi
  useEffect(() => {
    const fetchDashboardData = async () => {
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
    };
    
    fetchDashboardData();
  }, [timeframe, selectedTeamId]);
  
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
  
  // Mock data khi chưa có data thật
  const mockData = {
    employeeAvailable: {
      totalEmployees: 12,
      change: 3,
      periodLabel: 'tuần trước'
    },
    employeeEndingSoon: {
      totalEmployees: 8,
      change: -2,
      periodLabel: 'tuần trước'
    },
    utilizationRate: {
      rate: 78,
      change: 5,
      periodLabel: 'tuần trước'
    },
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
              loading={loading}
            />
          ) : (
            <WidgetFallback title="Nhân sự Sẵn sàng" />
          )}
        </div>
        <div className="md:col-span-1">
          {canViewEmployeeWidgets() ? (
            <EmployeeEndingSoonWidget
              data={mockData.employeeEndingSoon}
              loading={loading}
            />
          ) : (
            <WidgetFallback title="Nhân sự Sắp hết Dự án" />
          )}
        </div>
        <div className="md:col-span-1">
          {canViewUtilizationWidget() ? (
            <UtilizationRateWidget
              data={mockData.utilizationRate}
              loading={loading}
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
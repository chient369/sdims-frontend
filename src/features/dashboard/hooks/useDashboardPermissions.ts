import { useAuth } from '../../../hooks/useAuth';

/**
 * Hook để quản lý và kiểm tra quyền cho các widget trong Dashboard
 */
export const useDashboardPermissions = () => {
  const { hasPermission, hasAnyPermission, user } = useAuth();
  
  // Kiểm tra quyền xem widget Nhân sự
  const canViewEmployeeWidgets = () => {
    return hasAnyPermission([
      'employee-status:read:all', 
      'employee-status:read:team', 
      'employee-status:read:own',
      'dashboard:read:all'
    ]);
  };
  
  // Kiểm tra quyền xem widget Tỷ lệ Sử dụng
  const canViewUtilizationWidget = () => {
    return hasAnyPermission([
      'utilization:read:all', 
      'utilization:read:team',
      'dashboard:read:all'
    ]);
  };
  
  // Kiểm tra quyền xem widget Phân bố Margin
  const canViewMarginWidget = () => {
    return hasAnyPermission([
      'margin:read:all', 
      'margin:read:team',
      'margin-summary:read:all', 
      'margin-summary:read:team',
      'dashboard:read:all'
    ]);
  };
  
  // Kiểm tra quyền xem widget Cơ hội
  const canViewOpportunityWidgets = () => {
    return hasAnyPermission([
      'opportunity:read:all', 
      'opportunity:read:own', 
      'opportunity:read:assigned',
      'opportunities:read',
      'dashboard:read:all'
    ]);
  };
  
  // Kiểm tra quyền xem widget Doanh thu
  const canViewRevenueWidget = () => {
    return hasAnyPermission([
      'revenue-report:read:all', 
      'revenue-report:read:team', 
      'revenue-report:read:own',
      'sales-kpi:read:all',
      'sales-kpi:read:own',
      'dashboard:read:all'
    ]);
  };
  
  // Kiểm tra quyền xem widget Công nợ
  const canViewDebtWidget = () => {
    return hasAnyPermission([
      'debt-report:read:all', 
      'debt-report:read:own',
      'payment-alert:read:all', 
      'payment-alert:read:own',
      'payment-alert:read:assigned',
      'dashboard:read:all'
    ]);
  };
  
  // Kiểm tra quyền xem widget Phễu bán hàng
  const canViewSalesFunnelWidget = () => {
    return hasAnyPermission([
      'opportunity:read:all', 
      'opportunity:read:own', 
      'opportunity:read:assigned',
      'opportunities:read',
      'dashboard:read:all'
    ]);
  };
  
  // Xác định quyền xem Dashboard dựa trên vai trò
  const getRoleBasedPermissions = () => {
    if (!user) return [];
    
    const { role } = user;
    
    if (role === 'Admin' || role === 'Division Manager') {
      return ['dashboard:read:all'];
    } else if (role === 'Leader') {
      return ['dashboard:read:team'];
    } else if (role === 'Sales') {
      return ['dashboard:read:own'];
    }
    
    return [];
  };
  
  // Kiểm tra nếu user có thể xem toàn bộ dashboard
  const canViewFullDashboard = () => {
    return hasPermission('dashboard:read:all');
  };
  
  return {
    canViewEmployeeWidgets,
    canViewUtilizationWidget,
    canViewMarginWidget,
    canViewOpportunityWidgets,
    canViewRevenueWidget,
    canViewDebtWidget,
    canViewSalesFunnelWidget,
    canViewFullDashboard,
    getRoleBasedPermissions
  };
}; 
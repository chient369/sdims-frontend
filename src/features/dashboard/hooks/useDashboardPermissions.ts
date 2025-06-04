import { useAuth } from '../../../hooks/useAuth';
import { useMemo, useCallback } from 'react';

/**
 * Hook để quản lý và kiểm tra quyền cho các widget trong Dashboard
 */
export const useDashboardPermissions = () => {
  const { hasPermission, hasAnyPermission, user } = useAuth();
  
  // Kiểm tra quyền xem widget Nhân sự
  const canViewEmployeeWidgets = useCallback(() => {
    return hasAnyPermission([
      'employee-status:read:all', 
      'employee-status:read:team', 
      'employee-status:read:own',
      'dashboard:read:all'
    ]);
  }, [hasAnyPermission]);
  
  // Kiểm tra quyền xem widget Tỷ lệ Sử dụng
  const canViewUtilizationWidget = useCallback(() => {
    return hasAnyPermission([
      'utilization:read:all', 
      'utilization:read:team',
      'dashboard:read:all'
    ]);
  }, [hasAnyPermission]);
  
  // Kiểm tra quyền xem widget Phân bố Margin
  const canViewMarginWidget = useCallback(() => {
    return hasAnyPermission([
      'margin:read:all', 
      'margin:read:team',
      'margin-summary:read:all', 
      'margin-summary:read:team',
      'dashboard:read:all'
    ]);
  }, [hasAnyPermission]);
  
  // Kiểm tra quyền xem widget Cơ hội
  const canViewOpportunityWidgets = useCallback(() => {
    return hasAnyPermission([
      'opportunity:read:all', 
      'opportunity:read:own', 
      'opportunity:read:assigned',
      'opportunities:read',
      'dashboard:read:all'
    ]);
  }, [hasAnyPermission]);
  
  // Kiểm tra quyền xem widget Doanh thu
  const canViewRevenueWidget = useCallback(() => {
    return hasAnyPermission([
      'revenue-report:read:all', 
      'revenue-report:read:team', 
      'revenue-report:read:own',
      'sales-kpi:read:all',
      'sales-kpi:read:own',
      'dashboard:read:all'
    ]);
  }, [hasAnyPermission]);
  
  // Kiểm tra quyền xem widget Công nợ
  const canViewDebtWidget = useCallback(() => {
    return hasAnyPermission([
      'debt-report:read:all', 
      'debt-report:read:own',
      'payment-alert:read:all', 
      'payment-alert:read:own',
      'payment-alert:read:assigned',
      'dashboard:read:all'
    ]);
  }, [hasAnyPermission]);
  
  // Kiểm tra quyền xem widget Phễu bán hàng
  const canViewSalesFunnelWidget = useCallback(() => {
    return hasAnyPermission([
      'opportunity:read:all', 
      'opportunity:read:own', 
      'opportunity:read:assigned',
      'opportunities:read',
      'dashboard:read:all'
    ]);
  }, [hasAnyPermission]);
  
  // Xác định quyền xem Dashboard dựa trên vai trò
  const getRoleBasedPermissions = useCallback(() => {
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
  }, [user]);
  
  // Kiểm tra nếu user có thể xem toàn bộ dashboard
  const canViewFullDashboard = useCallback(() => {
    return hasPermission('dashboard:read:all');
  }, [hasPermission]);
  
  // Sử dụng useMemo để trả về object chỉ khi các dependencies thay đổi
  return useMemo(() => ({
    canViewEmployeeWidgets,
    canViewUtilizationWidget,
    canViewMarginWidget,
    canViewOpportunityWidgets,
    canViewRevenueWidget,
    canViewDebtWidget,
    canViewSalesFunnelWidget,
    canViewFullDashboard,
    getRoleBasedPermissions
  }), [
    canViewEmployeeWidgets,
    canViewUtilizationWidget,
    canViewMarginWidget,
    canViewOpportunityWidgets,
    canViewRevenueWidget,
    canViewDebtWidget,
    canViewSalesFunnelWidget,
    canViewFullDashboard,
    getRoleBasedPermissions
  ]);
}; 
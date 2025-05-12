import { lazy } from 'react';
import { PrivateRoute } from '../auth/routes';

// Lazy load các components để tối ưu hiệu suất
const ContractList = lazy(() => import('./pages/ContractList'));
const ContractDetail = lazy(() => import('./pages/ContractDetail'));
const ContractForm = lazy(() => import('./pages/ContractForm'));
const PaymentStatusUpdate = lazy(() => import('./pages/PaymentStatusUpdate'));
const KpiManagement = lazy(() => import('./pages/KpiManagement'));

/**
 * Routes cho module Contract
 * Định nghĩa các đường dẫn và quyền truy cập tương ứng
 */
export const ContractRoutes = [
  // Danh sách hợp đồng
  {
    path: "/contracts",
    element: (
      <PrivateRoute requiredPermissions={['contract:read:all']}>
        <ContractList />
      </PrivateRoute>
    )
  },
  // Tạo mới hợp đồng
  {
    path: "/contracts/create",
    element: (
      <PrivateRoute requiredPermissions={['contract:create']}>
        <ContractForm />
      </PrivateRoute>
    )
  },
  // Chỉnh sửa hợp đồng
  {
    path: "/contracts/edit/:id",
    element: (
      <PrivateRoute requiredPermissions={['contract:update:all']}>
        <ContractForm />
      </PrivateRoute>
    )
  },
  // Chi tiết hợp đồng
  {
    path: "/contracts/:id",
    element: (
      <PrivateRoute requiredPermissions={['contract:read:all']}>
        <ContractDetail />
      </PrivateRoute>
    )
  },
  // Cập nhật trạng thái thanh toán
  {
    path: "/contracts/payment-updates",
    element: (
      <PrivateRoute requiredPermissions={['payment-status:update:all']}>
        <PaymentStatusUpdate />
      </PrivateRoute>
    )
  },
  // Quản lý KPI doanh thu
  {
    path: "/contracts/kpi-management",
    element: (
      <PrivateRoute requiredPermissions={['sales-kpi:read:all']}>
        <KpiManagement />
      </PrivateRoute>
    )
  }
]; 
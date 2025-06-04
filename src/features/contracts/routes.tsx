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
  // Route cho các tính năng contract cơ bản
  {
    element: <PrivateRoute requiredPermissions={['contract:read:all']} />,
    children: [
      // Danh sách hợp đồng
      {
        path: "/contracts",
        element: <ContractList />
      },
      // Chi tiết hợp đồng
      {
        path: "/contracts/:id",
        element: <ContractDetail />
      }
    ]
  },
  // Route cho tạo và chỉnh sửa hợp đồng
  {
    element: <PrivateRoute requiredPermissions={['contract:create']} />,
    children: [
      // Tạo mới hợp đồng
      {
        path: "/contracts/create",
        element: <ContractForm />
      }
    ]
  },
  // Route cho chỉnh sửa hợp đồng
  {
    element: <PrivateRoute requiredPermissions={['contract:update:all']} />,
    children: [
      // Chỉnh sửa hợp đồng
      {
        path: "/contracts/:id/edit",
        element: <ContractForm />
      }
    ]
  },
  // Route cho cập nhật trạng thái thanh toán
  {
    element: <PrivateRoute requiredPermissions={['payment-status:update:all']} />,
    children: [
      // Cập nhật trạng thái thanh toán
      {
        path: "/contracts/payment-updates",
        element: <PaymentStatusUpdate />
      }
    ]
  },
  // Route cho quản lý KPI doanh thu
  {
    element: <PrivateRoute requiredPermissions={['sales-kpi:read:all']} />,
    children: [
      // Quản lý KPI doanh thu
      {
        path: "/contracts/kpi-management",
        element: <KpiManagement />
      }
    ]
  }
]; 
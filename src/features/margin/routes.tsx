import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import MarginList from './pages/MarginList';
import CostInputPage from './pages/CostInputPage';
import PermissionGuard from '../../components/ui/PermissionGuard';

// Định nghĩa kiểu route để sử dụng trong router
interface RouteConfig {
  path?: string;
  element: React.ReactNode;
  index?: boolean;
  children?: RouteConfig[];
}

/**
 * Định nghĩa routes cho tính năng Quản lý Margin
 */
const MarginRoutes: RouteConfig[] = [
  {
    path: '/margins',
    element: <Outlet />,
    children: [
      {
        index: true,
        element: (
          <PermissionGuard 
            requiredPermission={['margin:read:all', 'margin:read:team', 'margin:read:own']}
            requireAll={false}
          >
            <MarginList />
          </PermissionGuard>
        )
      },
      {
        path: 'costs',
        element: (
          <PermissionGuard 
            requiredPermission={['employee-cost:create', 'employee-cost:import']}
            requireAll={false}
          >
            <CostInputPage />
          </PermissionGuard>
        )
      },
      {
        path: '*',
        element: <Navigate to="/margins" replace />
      }
    ]
  }
];

export default MarginRoutes;
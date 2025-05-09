import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import MarginList from './pages/MarginList';
import CostInputPage from './pages/CostInputPage';
import { PrivateRoute } from '../../components/auth/PrivateRoute';

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
    path: 'margins',
    element: <Outlet />, // Thay thế empty fragment bằng Outlet
    children: [
      {
        index: true,
        element: (
          <PrivateRoute requiredPermissions={['margin:read:all', 'margin:read:team', 'margin:read:own']} requireAll={false}>
            <MarginList />
          </PrivateRoute>
        )
      },
      {
        path: 'costs',
        element: (
          <PrivateRoute requiredPermissions={['employee-cost:create', 'employee-cost:import']} requireAll={false}>
            <CostInputPage />
          </PrivateRoute>
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
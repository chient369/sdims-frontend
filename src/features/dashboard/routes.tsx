import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { PrivateRoute } from '../auth/routes';

// Lazy loaded components
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const DashboardSettings = lazy(() => import('./pages/DashboardSettings'));

// Define dashboard routes
export const DashboardRoutes = [
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <DashboardPage />
      </PrivateRoute>
    )
  },
  {
    path: "/dashboard/settings",
    element: (
      <PrivateRoute>
        <DashboardSettings />
      </PrivateRoute>
    )
  }
]; 
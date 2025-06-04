import { lazy } from 'react';
import { PrivateRoute } from '../auth/routes';

// Lazy loaded components
const DashboardPage = lazy(() => import('./Dashboard'));

// Define dashboard routes with permission check
export const DashboardRoutes = [
  {
    element: (
      <PrivateRoute 
        requiredPermissions={["dashboard:read:all", "dashboard:read:team", "dashboard:read:own"]}
        requireAll={false}
      />
    ),
    children: [
      {
        path: "/dashboard",
        element: <DashboardPage />
      }
    ]
  }
]; 
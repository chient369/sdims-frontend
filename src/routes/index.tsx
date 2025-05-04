import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import LoadingFallback from '@components/ui/LoadingFallback';
import React from 'react';
import { RouteObject } from 'react-router-dom';

// Lazy-loaded layouts
const Layout = lazy(() => import('@components/layout/MainLayout'));
const AuthLayout = lazy(() => import('@components/layout/AuthLayout'));

// Lazy-loaded components
const Login = lazy(() => import('@features/auth/Login'));
const Dashboard = lazy(() => import('@features/dashboard/Dashboard'));
const NotFound = lazy(() => import('@features/errors/NotFound'));
const Unauthorized = lazy(() => import('@features/errors/Unauthorized'));
const ComponentDemo = lazy(() => import('../pages/ComponentDemo'));
const StateManagementDemo = lazy(() => import('../pages/StateManagementDemo'));
const ApiClientDemo = lazy(() => import('../pages/ApiClientDemo'));
const NotificationExample = lazy(() => import('../components/examples/NotificationExample'));
const ChartExamplesPage = lazy(() => import('../pages/ChartExamplesPage'));

// Import feature routes
import { PrivateRoute, PublicRoute } from '../features/auth/routes';
import { OpportunityRoutes } from '../features/opportunities/routes';
import { ContractRoutes } from '../features/contracts/routes';
import { HRMRoutes } from '../features/hrm/routes';
import { MarginRoutes } from '../features/margin/routes';
import { ReportsRoutes } from '../features/reports/routes';

// Add import for test components
import OpportunityListTest from '../features/opportunities/components/OpportunityListTest';
import OpportunityDetailTest from '../features/opportunities/components/OpportunityDetailTest';
import HubspotSyncTest from '../features/opportunities/components/HubspotSyncTest';

// Define routes configuration
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/chart-examples',
    element: <ChartExamplesPage />,
  },
  // Add other routes here
];

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
          </Route>

          {/* Protected routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />

            {/* Demo pages - with Layout */}
            <Route path="/design-system" element={<ComponentDemo />} />
            <Route path="/state-management-demo" element={<StateManagementDemo />} />
            <Route path="/api-client-demo" element={<ApiClientDemo />} />
            <Route path="/notification-demo" element={<NotificationExample />} />
            <Route path="/chart-examples" element={<ChartExamplesPage />} />

            {/* Add all feature routes */}
            {OpportunityRoutes.map((route, index) => (
              <Route key={`opp-route-${index}`} path={route.path } element={route.element} />
            ))}
            
            {ContractRoutes.map((route, index) => (
              <Route key={`contract-route-${index}`} path={route.path} element={route.element} />
            ))}
            
            {HRMRoutes.map((route, index) => (
              <Route key={`hrm-route-${index}`} path={route.path} element={route.element} />
            ))}
            
            {MarginRoutes.map((route, index) => (
              <Route key={`margin-route-${index}`} path={route.path} element={route.element} />
            ))}
            
            {ReportsRoutes.map((route, index) => (
              <Route key={`reports-route-${index}`} path={route.path} element={route.element} />
            ))}
            
            {/* Test routes */}
            <Route path="/test/opportunities" element={<OpportunityListTest />} />
            <Route path="/test/opportunities/:id" element={<OpportunityDetailTest />} />
            <Route path="/test/opportunities/hubspot-sync" element={<HubspotSyncTest />} />
            
            {/* Error routes */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter; 
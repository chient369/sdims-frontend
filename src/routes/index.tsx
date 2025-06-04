import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import LoadingFallback from '@components/ui/LoadingFallback';
import React from 'react';
import { RouteObject } from 'react-router-dom';
import PermissionGuard from '@components/ui/PermissionGuard';

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
const NotificationExample = lazy(() => import('../components/examples/NotificationExample'));
const ChartExamplesPage = lazy(() => import('../pages/ChartExamplesPage'));
const MarginList = lazy(() => import('@features/margin/pages/MarginList'));
const CostInputPage = lazy(() => import('@features/margin/pages/CostInputPage'));

// Import feature routes
import { PrivateRoute, PublicRoute, AuthRoutes } from '../features/auth/routes';
import { OpportunityRoutes } from '../features/opportunities/routes';
import { ContractRoutes } from '../features/contracts/routes';
import { HRMRoutes } from '../features/hrm/routes';
import MarginRoutes from '../features/margin/routes';
import { ReportsRoutes } from '../features/reports/routes';
import { DashboardRoutes } from '../features/dashboard/routes';
import { AdminRoutes } from '../features/admin/routes';
import { PaymentStatusUpdateDemo } from '../components/examples';
import { AuthGuard as AuthPermissionGuard } from '../components/auth/AuthGuard';

// Define a basic route type for consistency
type AppRoute = {
  path?: string;
  element: React.ReactNode;
  children?: AppRoute[];
};

const AppRouter = () => {  
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Auth Layout with public routes */}
          <Route element={<AuthLayout />}>
            {/* Include all auth routes including login and logout */}
            {(AuthRoutes as AppRoute[]).map((route, index) => (
              <Route key={`auth-route-${index}`} path={route.path} element={route.element} />
            ))}
          </Route>

          {/* Main Layout with protected routes */}
          <Route element={<Layout />}>
            <Route element={<PrivateRoute />}>
              {/* Redirect mặc định về dashboard chỉ khi đúng path / */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              
              {/* Dashboard routes */}
              {(DashboardRoutes as AppRoute[]).map((route, index) => (
                route.path ? 
                  <Route key={`dashboard-route-${index}`} path={route.path} element={route.element} /> :
                  <Route key={`dashboard-route-${index}`} element={route.element}>
                    {route.children?.map((childRoute, childIndex) => (
                      <Route key={`dashboard-child-${index}-${childIndex}`} path={childRoute.path} element={childRoute.element} />
                    ))}
                  </Route>
              ))}
              
              {/* Admin routes */}
              {(AdminRoutes as AppRoute[]).map((route, index) => (
                route.path ? 
                  <Route key={`admin-route-${index}`} path={route.path} element={route.element} /> :
                  <Route key={`admin-route-${index}`} element={route.element}>
                    {route.children?.map((childRoute, childIndex) => (
                      <Route key={`admin-child-${index}-${childIndex}`} path={childRoute.path} element={childRoute.element} />
                    ))}
                  </Route>
              ))}
              
              {/* HRM routes */}
              {(HRMRoutes as AppRoute[]).map((route, index) => (
                route.path ? 
                  <Route key={`hrm-route-${index}`} path={route.path} element={route.element} /> :
                  <Route key={`hrm-route-${index}`} element={route.element}>
                    {route.children?.map((childRoute, childIndex) => (
                      <Route key={`hrm-child-${index}-${childIndex}`} path={childRoute.path} element={childRoute.element} />
                    ))}
                  </Route>
              ))}
              
              {/* Demo pages - with Layout */}
              <Route path="/design-system" element={<ComponentDemo />} />
              <Route path="/state-management-demo" element={<StateManagementDemo />} />
              <Route path="/notification-demo" element={<NotificationExample />} />
              <Route path="/chart-examples" element={<ChartExamplesPage />} />
              <Route path="/payment-status-update-demo" element={<PaymentStatusUpdateDemo />} />
              
              {/* Feature routes */}
              {(OpportunityRoutes as AppRoute[]).map((route, index) => (
                route.path ? 
                  <Route key={`opp-route-${index}`} path={route.path} element={route.element} /> :
                  <Route key={`opp-route-${index}`} element={route.element}>
                    {route.children?.map((childRoute, childIndex) => (
                      <Route key={`opp-child-${index}-${childIndex}`} path={childRoute.path} element={childRoute.element} />
                    ))}
                  </Route>
              ))}
              
              {(ContractRoutes as AppRoute[]).map((route, index) => (
                route.path ? 
                  <Route key={`contract-route-${index}`} path={route.path} element={route.element} /> :
                  <Route key={`contract-route-${index}`} element={route.element}>
                    {route.children?.map((childRoute, childIndex) => (
                      <Route key={`contract-child-${index}-${childIndex}`} path={childRoute.path} element={childRoute.element} />
                    ))}
                  </Route>
              ))}
              
              {/* Margin routes */}
              <Route path="/margins">
                <Route index element={
                  <AuthPermissionGuard 
                    permissions={['margin:read:all', 'margin:read:team', 'margin:read:own']} 
                    all={false}
                  >
                    <MarginList />
                  </AuthPermissionGuard>
                } />
                <Route path="costs" element={
                  <AuthPermissionGuard 
                    permissions={['employee-cost:create', 'employee-cost:import']} 
                    all={false}
                  >
                    <CostInputPage />
                  </AuthPermissionGuard>
                } />
              </Route>
              
              {(ReportsRoutes as AppRoute[]).map((route, index) => (
                route.path ? 
                  <Route key={`reports-route-${index}`} path={route.path} element={route.element} /> :
                  <Route key={`reports-route-${index}`} element={route.element}>
                    {route.children?.map((childRoute, childIndex) => (
                      <Route key={`reports-child-${index}-${childIndex}`} path={childRoute.path} element={childRoute.element} />
                    ))}
                  </Route>
              ))}      
            </Route>
            {/* Error routes vẫn public */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter; 
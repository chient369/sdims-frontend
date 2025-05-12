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
const NotificationExample = lazy(() => import('../components/examples/NotificationExample'));
const ChartExamplesPage = lazy(() => import('../pages/ChartExamplesPage'));


// Import feature routes
import { PrivateRoute, PublicRoute, AuthRoutes } from '../features/auth/routes';
import { OpportunityRoutes } from '../features/opportunities/routes';
import { ContractRoutes } from '../features/contracts/routes';
import { HRMRoutes } from '../features/hrm/routes';
import MarginRoutes from '../features/margin/routes';
import { ReportsRoutes } from '../features/reports/routes';
import { DashboardRoutes } from '../features/dashboard/routes';
import { PaymentStatusUpdateDemo } from '../components/examples';

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

// Define a basic route type for consistency
type AppRoute = {
  path: string;
  element: React.ReactNode;
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
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Dashboard routes */}
            {(DashboardRoutes as AppRoute[]).map((route, index) => (
              <Route key={`dashboard-route-${index}`} path={route.path} element={route.element} />
            ))}

            {/* Demo pages - with Layout */}
            <Route path="/design-system" element={<ComponentDemo />} />
            <Route path="/state-management-demo" element={<StateManagementDemo />} />
            <Route path="/notification-demo" element={<NotificationExample />} />
            <Route path="/chart-examples" element={<ChartExamplesPage />} />
            <Route path="/payment-status-update-demo" element={<PaymentStatusUpdateDemo />} />
            
            {(OpportunityRoutes as AppRoute[]).map((route, index) => (
              <Route key={`opp-route-${index}`} path={route.path} element={route.element} />
            ))}
            
            {(ContractRoutes as AppRoute[]).map((route, index) => (
              <Route key={`contract-route-${index}`} path={route.path} element={route.element} />
            ))}
            
            {(HRMRoutes as AppRoute[]).map((route, index) => (
              <Route key={`hrm-route-${index}`} path={route.path} element={route.element} />
            ))}
            
            {/* Margin routes - fixed to use route object structure */}
            {MarginRoutes.map((routeGroup) => (
              <Route 
                key={`margin-route-${routeGroup.path}`} 
                path={routeGroup.path} 
                element={routeGroup.element}
              >
                {routeGroup.children?.map((childRoute, childIndex) => (
                  childRoute.index ? (
                    <Route 
                      key={`margin-child-${childIndex}`} 
                      index 
                      element={childRoute.element} 
                    />
                  ) : (
                    <Route 
                      key={`margin-child-${childIndex}`} 
                      path={childRoute.path} 
                      element={childRoute.element} 
                    />
                  )
                ))}
              </Route>
            ))}
            
            {(ReportsRoutes as AppRoute[]).map((route, index) => (
              <Route key={`reports-route-${index}`} path={route.path} element={route.element} />
            ))}      
            
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
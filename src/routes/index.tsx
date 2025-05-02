import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import LoadingFallback from '@components/ui/LoadingFallback';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';

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

// Lazy-loaded module routes
const HRMRoutes = lazy(() => import('./HRMRoutes'));
const MarginRoutes = lazy(() => import('./MarginRoutes'));
const ContractRoutes = lazy(() => import('./ContractRoutes'));
const OpportunityRoutes = lazy(() => import('./OpportunityRoutes'));

// Add import for test components
import OpportunityListTest from '../features/opportunities/components/OpportunityListTest';
import OpportunityDetailTest from '../features/opportunities/components/OpportunityDetailTest';
import HubspotSyncTest from '../features/opportunities/components/HubspotSyncTest';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<PublicRoute component={Login} />} />
          </Route>

          {/* Demo pages - public for easy access */}
          <Route path="/design-system" element={<ComponentDemo />} />
          <Route path="/state-management-demo" element={<StateManagementDemo />} />
          <Route path="/api-client-demo" element={<ApiClientDemo />} />

          {/* Protected routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route 
              path="/dashboard" 
              element={<PrivateRoute component={Dashboard} />} 
            />

            {/* Module routes */}
            <Route 
              path="/hrm/*" 
              element={<PrivateRoute component={HRMRoutes} />} 
            />
            <Route 
              path="/margins/*" 
              element={<PrivateRoute component={MarginRoutes} />} 
            />
            <Route 
              path="/contracts/*" 
              element={<PrivateRoute component={ContractRoutes} />} 
            />
            <Route 
              path="/opportunities/*" 
              element={<PrivateRoute component={OpportunityRoutes} />} 
            />
            
            {/* Test routes */}
            <Route path="/test/opportunities" element={<OpportunityListTest />} />
            <Route path="/test/opportunities/:id" element={<OpportunityDetailTest />} />
            <Route path="/test/hubspot-sync" element={<HubspotSyncTest />} />
            <Route path="/test/hubspot-sync/:id" element={<HubspotSyncTest />} />

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
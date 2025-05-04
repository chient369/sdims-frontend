import { lazy } from 'react';
import { PrivateRoute } from '../auth/routes';

// Lazy loaded components
const ReportsDashboard = lazy(() => import('./pages/ReportsDashboard'));
const EmployeeReport = lazy(() => import('./pages/EmployeeReport'));
const MarginReport = lazy(() => import('./pages/MarginReport'));
const OpportunityReport = lazy(() => import('./pages/OpportunityReport'));
const ContractReport = lazy(() => import('./pages/ContractReport'));
const PaymentReport = lazy(() => import('./pages/PaymentReport'));
const KpiReport = lazy(() => import('./pages/KpiReport'));
const UtilizationReport = lazy(() => import('./pages/UtilizationReport'));
const ExecutiveReport = lazy(() => import('./pages/ExecutiveReport'));

// Define the reports routes
export const ReportsRoutes = [
  {
    path: "/reports",
    element: (
      <PrivateRoute>
        <ReportsDashboard />
      </PrivateRoute>
    )
  },
  {
    path: "/reports/employees",
    element: (
      <PrivateRoute>
        <EmployeeReport />
      </PrivateRoute>
    )
  },
  {
    path: "/reports/margins",
    element: (
      <PrivateRoute>
        <MarginReport />
      </PrivateRoute>
    )
  },
  {
    path: "/reports/opportunities",
    element: (
      <PrivateRoute>
        <OpportunityReport />
      </PrivateRoute>
    )
  },
  {
    path: "/reports/contracts",
    element: (
      <PrivateRoute>
        <ContractReport />
      </PrivateRoute>
    )
  },
  {
    path: "/reports/payments",
    element: (
      <PrivateRoute>
        <PaymentReport />
      </PrivateRoute>
    )
  },
  {
    path: "/reports/kpi",
    element: (
      <PrivateRoute>
        <KpiReport />
      </PrivateRoute>
    )
  },
  {
    path: "/reports/utilization",
    element: (
      <PrivateRoute>
        <UtilizationReport />
      </PrivateRoute>
    )
  },
  {
    path: "/reports/executive",
    element: (
      <PrivateRoute>
        <ExecutiveReport />
      </PrivateRoute>
    )
  }
]; 
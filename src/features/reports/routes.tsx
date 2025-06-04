import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { PrivateRoute } from '../auth/routes';

// Lazy loaded components
const ReportListPage = lazy(() => import('./pages/ReportListPage'));
const ReportViewerPage = lazy(() => import('./pages/ReportViewerPage'));
const EmployeeReport = lazy(() => import('./pages/EmployeeReport'));
const MarginReport = lazy(() => import('./pages/MarginReport'));
const OpportunityReport = lazy(() => import('./pages/OpportunityReport'));
const ContractReport = lazy(() => import('./pages/ContractReport'));
const PaymentReport = lazy(() => import('./pages/PaymentReport'));
const KpiReport = lazy(() => import('./pages/KpiReport'));
const UtilizationReport = lazy(() => import('./pages/UtilizationReport'));
const ExecutiveReport = lazy(() => import('./pages/ExecutiveReport'));

// Define reports routes with permission check
export const ReportsRoutes = [
  // Trang danh sách báo cáo và Report Viewer
  {
    element: (
      <PrivateRoute 
        requiredPermissions={["report:read", "report:read:all", "report:read:team", "report:read:own"]}
        requireAll={false}
      />
    ),
    children: [
      {
        path: "/reports",
        element: <ReportListPage />
      },
      {
        path: "/reports/:reportId",
        element: <ReportViewerPage />
      },
      // Redirect from the legacy URL to the new reports page if needed
      {
        path: "/reporting",
        element: <Navigate to="/reports" replace />
      }
    ]
  },

  // Route cho báo cáo nhân sự - yêu cầu quyền đọc nhân sự
  {
    element: (
      <PrivateRoute 
        requiredPermissions={[
          "employee:read:all",
          "employee:read:team", 
          "employee:read:own",
          "utilization:read:all",
          "utilization:read:team",
          "report:read:all",
          "report:read:team",
          "employees:read" // Thêm định dạng quyền đơn giản
        ]}
        requireAll={false}
      />
    ),
    children: [
      {
        path: "/reports/employees",
        element: <EmployeeReport />
      }
    ]
  },

  // Route cho báo cáo margin - yêu cầu quyền đọc margin
  {
    element: (
      <PrivateRoute 
        requiredPermissions={[
          "margin:read:all",
          "margin:read:team",
          "margin-summary:read:all",
          "margin-summary:read:team",
          "report:read:all"
        ]}
        requireAll={false}
      />
    ),
    children: [
      {
        path: "/reports/margins",
        element: <MarginReport />
      }
    ]
  },

  // Route cho báo cáo cơ hội - yêu cầu quyền đọc cơ hội
  {
    element: (
      <PrivateRoute 
        requiredPermissions={[
          "opportunity:read:all",
          "opportunity:read:own",
          "opportunity:read:assigned",
          "opportunities:read",
          "report:read:all",
          "report:read:team",
          "opportunity-followup:read:all"
        ]}
        requireAll={false}
      />
    ),
    children: [
      {
        path: "/reports/opportunities",
        element: <OpportunityReport />
      }
    ]
  },

  // Route cho báo cáo hợp đồng - yêu cầu quyền đọc hợp đồng
  {
    element: (
      <PrivateRoute 
        requiredPermissions={[
          "contract:read:all",
          "contract:read:own",
          "contract:read:assigned",
          "contracts:read",
          "report:read:all",
          "report:read:team"
        ]}
        requireAll={false}
      />
    ),
    children: [
      {
        path: "/reports/contracts",
        element: <ContractReport />
      }
    ]
  },

  // Route cho báo cáo thanh toán - yêu cầu quyền đọc thanh toán
  {
    element: (
      <PrivateRoute 
        requiredPermissions={[
          "payment-term:read:all",
          "payment-term:read:own",
          "payment-term:read:assigned",
          "payment-status:read:all",
          "debt-report:read:all",
          "debt-report:read:own",
          "report:read:all",
          "report:read:team"
        ]}
        requireAll={false}
      />
    ),
    children: [
      {
        path: "/reports/payments",
        element: <PaymentReport />
      }
    ]
  },

  // Route cho báo cáo KPI - yêu cầu quyền đọc KPI
  {
    element: (
      <PrivateRoute 
        requiredPermissions={[
          "sales-kpi:read:all",
          "sales-kpi:read:own",
          "revenue-report:read:all",
          "revenue-report:read:team",
          "revenue-report:read:own",
          "report:read:all",
          "report:read:team"
        ]}
        requireAll={false}
      />
    ),
    children: [
      {
        path: "/reports/kpi",
        element: <KpiReport />
      }
    ]
  },

  // Route cho báo cáo sử dụng - yêu cầu quyền đọc utilization
  {
    element: (
      <PrivateRoute 
        requiredPermissions={[
          "utilization:read:all",
          "utilization:read:team",
          "report:read:all",
          "report:read:team"
        ]}
        requireAll={false}
      />
    ),
    children: [
      {
        path: "/reports/utilization",
        element: <UtilizationReport />
      }
    ]
  },

  // Route cho báo cáo điều hành - yêu cầu quyền đọc dashboard
  {
    element: (
      <PrivateRoute 
        requiredPermissions={[
          "dashboard:read:all",
          "dashboard:read:team",
          "dashboard:read:own",
          "revenue-summary:read:all",
          "revenue-summary:read:team",
          "margin-summary:read:all",
          "margin-summary:read:team",
          "report:read:all",
          "report:read:team"
        ]}
        requireAll={false}
      />
    ),
    children: [
      {
        path: "/reports/executive",
        element: <ExecutiveReport />
      }
    ]
  }
]; 
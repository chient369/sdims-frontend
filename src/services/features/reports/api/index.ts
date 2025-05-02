// Dashboard API
export {
  getDashboardSummary
} from './dashboardApi';

export type {
  OpportunityStatus,
  MarginStatus,
  EmployeeStatus,
  DashboardParams,
  DashboardSummaryResponse
} from './dashboardApi';

// Employee Report API
export {
  getEmployeeReport
} from './employeeReportApi';

export type {
  EmployeeStatus as EmployeeReportStatus,
  ExportType as EmployeeReportExportType,
  EmployeeReportParams,
  EmployeeSkill,
  EmployeeProject,
  EmployeeReportItem,
  EmployeeReportResponse
} from './employeeReportApi';

// Margin Report API
export {
  getMarginReport
} from './marginReportApi';

export type {
  MarginReportParams,
  ReportMarginPeriodData,
  EmployeeMarginItem,
  TeamMarginItem,
  MarginReportResponse
} from './marginReportApi';

// Opportunity Report API
export {
  getOpportunityReport
} from './opportunityReportApi';

export type {
  FollowUpStatus,
  DealStage,
  ExportType as OpportunityReportExportType,
  OpportunityReportParams,
  OpportunityNote,
  OpportunityLeader,
  OpportunityReportItem,
  OpportunityReportResponse
} from './opportunityReportApi';

// Contract Report API
export {
  getContractReport
} from './contractReportApi';

export type {
  ContractStatus,
  ExportType as ContractReportExportType,
  ContractReportParams,
  ContractPaymentTerm,
  ContractEmployee,
  ContractFile,
  ContractReportItem,
  ContractReportResponse
} from './contractReportApi';

// Payment Report API
export {
  getPaymentReport
} from './paymentReportApi';

export type {
  PaymentStatus,
  ExportType as PaymentReportExportType,
  PaymentReportParams,
  PaymentReportItem,
  PaymentReportResponse
} from './paymentReportApi';

// KPI Progress Report API
export {
  getKpiProgressReport
} from './kpiReportApi';

export type {
  KpiPeriodType,
  ExportType as KpiReportExportType,
  KpiReportParams,
  KpiProgressItem,
  KpiReportResponse
} from './kpiReportApi';

// Utilization Report API
export {
  getUtilizationReport
} from './utilizationReportApi';

export type {
  UtilizationPeriodType,
  ExportType as UtilizationReportExportType,
  UtilizationReportParams,
  EmployeeUtilizationItem,
  TeamUtilizationItem,
  UtilizationReportResponse
} from './utilizationReportApi'; 
// Export API functions and types
export * from './api';

// Export Services
export * from './services';

// Export Types (these are also exported via './api' but we keep for backwards compatibility and rename conflicting types)
export type {
  // Dashboard Types
  OpportunityStatus as DashboardOpportunityStatus,
  MarginStatus as DashboardMarginStatus,
  EmployeeStatus as DashboardEmployeeStatus,
  DashboardParams,
  DashboardSummaryResponse,
  
  // Employee Report Types
  EmployeeReportStatus,
  EmployeeReportExportType,
  EmployeeReportParams,
  EmployeeSkill,
  EmployeeProject,
  EmployeeReportItem,
  EmployeeReportResponse,
  
  // Margin Report Types
  MarginReportParams,
  ReportMarginPeriodData as ReportMarginPeriodData,
  EmployeeMarginItem,
  TeamMarginItem,
  MarginReportResponse,
  
  // Opportunity Report Types
  FollowUpStatus,
  DealStage,
  OpportunityReportExportType,
  OpportunityReportParams,
  OpportunityNote,
  OpportunityLeader,
  OpportunityReportItem,
  OpportunityReportResponse,
  
  // Contract Report Types
  ContractStatus,
  ContractReportExportType,
  ContractReportParams,
  ContractPaymentTerm,
  ContractEmployee,
  ContractFile,
  ContractReportItem,
  ContractReportResponse,
  
  // Payment Report Types
  PaymentStatus,
  PaymentReportExportType,
  PaymentReportParams,
  PaymentReportItem,
  PaymentReportResponse,
  
  // KPI Report Types
  KpiPeriodType,
  KpiReportExportType,
  KpiReportParams,
  KpiProgressItem,
  KpiReportResponse,
  
  // Utilization Report Types
  UtilizationPeriodType,
  UtilizationReportExportType,
  UtilizationReportParams,
  EmployeeUtilizationItem,
  TeamUtilizationItem,
  UtilizationReportResponse
} from './api';
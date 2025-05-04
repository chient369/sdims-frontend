/**
 * Types Module for Reports Feature
 * 
 * This module contains all type definitions for the reports feature.
 * Types are organized by domain and used throughout the feature.
 */

//-----------------------------------------------------------------------------
// Common Report Types
//-----------------------------------------------------------------------------

/**
 * Export format options
 */
export type ExportType = 'json' | 'csv' | 'excel';

//-----------------------------------------------------------------------------
// Dashboard Types
//-----------------------------------------------------------------------------

/**
 * Opportunity status options for dashboard
 */
export type OpportunityStatus = 'Open' | 'Won' | 'Lost' | 'Cancelled';

/**
 * Margin status options for dashboard
 */
export type MarginStatus = 'Red' | 'Yellow' | 'Green';

/**
 * Employee status options for dashboard
 */
export type EmployeeStatus = 'Active' | 'Inactive' | 'OnLeave';

/**
 * Dashboard query parameters
 */
export interface DashboardParams {
  teamId?: number;
  fromDate?: string;
  toDate?: string;
  widgets?: string[];
}

/**
 * Dashboard summary response data
 */
export interface DashboardSummaryResponse {
  summary: {
    totalEmployees: number;
    activeEmployees: number;
    totalTeams: number;
    activeOpportunities: number;
    activeContracts: number;
    averageMargin: number;
    averageUtilization: number;
  };
  opportunitiesByStage?: {
    stage: string;
    count: number;
    value: number;
  }[];
  revenueByMonth?: {
    month: string;
    projected: number;
    actual: number;
  }[];
  marginDistribution?: {
    status: MarginStatus;
    count: number;
    percentage: number;
  }[];
  topPerformingTeams?: {
    id: number;
    name: string;
    performance: number;
    activeEmployees: number;
  }[];
  upcomingDeadlines?: {
    id: number;
    title: string;
    dueDate: string;
    type: 'Opportunity' | 'Contract' | 'Payment';
    status: string;
  }[];
}

//-----------------------------------------------------------------------------
// Employee Report Types
//-----------------------------------------------------------------------------

/**
 * Employee report status options
 */
export type EmployeeReportStatus = 'Active' | 'Inactive' | 'OnLeave' | 'All';

/**
 * Employee report export type options
 */
export type EmployeeReportExportType = ExportType;

/**
 * Employee report query parameters
 */
export interface EmployeeReportParams {
  employeeId?: number;
  teamId?: number;
  status?: EmployeeReportStatus;
  skill?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  page?: number;
  size?: number;
  exportType?: EmployeeReportExportType;
}

/**
 * Employee skill data
 */
export interface EmployeeSkill {
  id: number;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  years: number;
}

/**
 * Employee project data
 */
export interface EmployeeProject {
  id: number;
  name: string;
  role: string;
  startDate: string;
  endDate: string | null;
  allocation: number;
}

/**
 * Employee report item data
 */
export interface EmployeeReportItem {
  id: number;
  employeeCode: string;
  name: string;
  position: string;
  team: {
    id: number;
    name: string;
  };
  email: string;
  phone: string;
  joinDate: string;
  status: EmployeeReportStatus;
  skills: EmployeeSkill[];
  projects: EmployeeProject[];
  utilization: number;
  billableHours: number;
  nonBillableHours: number;
}

/**
 * Employee report response data
 */
export interface EmployeeReportResponse {
  summary: {
    totalEmployees: number;
    activeEmployees: number;
    averageUtilization: number;
    totalBillableHours: number;
    totalNonBillableHours: number;
  };
  content: EmployeeReportItem[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    sort?: string;
  };
}

//-----------------------------------------------------------------------------
// Margin Report Types
//-----------------------------------------------------------------------------

/**
 * Margin report query parameters
 */
export interface MarginReportParams {
  teamId?: number;
  employeeId?: number;
  period?: 'month' | 'quarter' | 'year';
  fromDate?: string;
  toDate?: string;
  status?: MarginStatus;
  groupBy?: 'team' | 'employee';
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  page?: number;
  size?: number;
  exportType?: ExportType;
}

/**
 * Margin period data
 */
export interface ReportMarginPeriodData {
  period: string;
  periodLabel: string;
  cost: number;
  revenue: number;
  margin: number;
  marginStatus: MarginStatus;
}

/**
 * Employee margin item data
 */
export interface EmployeeMarginItem {
  employeeId: number;
  employeeCode: string;
  name: string;
  position: string;
  team: {
    id: number;
    name: string;
  };
  status: string;
  allocation: number;
  cost: number;
  revenue: number;
  margin: number;
  marginStatus: MarginStatus;
  periods: ReportMarginPeriodData[];
}

/**
 * Team margin item data
 */
export interface TeamMarginItem {
  teamId: number;
  name: string;
  employeeCount: number;
  cost: number;
  revenue: number;
  margin: number;
  marginStatus: MarginStatus;
  statusDistribution: {
    status: MarginStatus;
    count: number;
    percentage: number;
  }[];
  periods: ReportMarginPeriodData[];
}

/**
 * Margin report response data
 */
export interface MarginReportResponse {
  summary: {
    totalTeams?: number;
    totalEmployees: number;
    averageCost: number;
    averageRevenue: number;
    averageMargin: number;
    statusDistribution: {
      status: MarginStatus;
      count: number;
      percentage: number;
    }[];
  };
  teams?: TeamMarginItem[];
  employees?: EmployeeMarginItem[];
  pageable?: {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    sort?: string;
  };
}

//-----------------------------------------------------------------------------
// Opportunity Report Types
//-----------------------------------------------------------------------------

/**
 * Opportunity follow-up status options
 */
export type FollowUpStatus = 'Pending' | 'Completed' | 'Overdue' | 'NotRequired';

/**
 * Opportunity deal stage options
 */
export type DealStage = 'Lead' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed';

/**
 * Opportunity report export type options
 */
export type OpportunityReportExportType = ExportType;

/**
 * Opportunity report query parameters
 */
export interface OpportunityReportParams {
  opportunityId?: number;
  clientId?: number;
  leaderId?: number;
  stage?: DealStage;
  status?: OpportunityStatus;
  fromDate?: string;
  toDate?: string;
  minValue?: number;
  maxValue?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  page?: number;
  size?: number;
  exportType?: OpportunityReportExportType;
}

/**
 * Opportunity note data
 */
export interface OpportunityNote {
  id: number;
  content: string;
  createdBy: {
    id: number;
    name: string;
  };
  createdAt: string;
}

/**
 * Opportunity leader data
 */
export interface OpportunityLeader {
  id: number;
  name: string;
  position: string;
  email: string;
}

/**
 * Opportunity report item data
 */
export interface OpportunityReportItem {
  id: number;
  title: string;
  client: {
    id: number;
    name: string;
  };
  value: number;
  stage: DealStage;
  status: OpportunityStatus;
  probability: number;
  leader: OpportunityLeader;
  createdAt: string;
  updatedAt: string;
  expectedCloseDate: string;
  lastContact: string;
  nextFollowUp: {
    date: string;
    status: FollowUpStatus;
    description: string;
  };
  notes: OpportunityNote[];
}

/**
 * Opportunity report response data
 */
export interface OpportunityReportResponse {
  summary: {
    totalOpportunities: number;
    totalValue: number;
    averageValue: number;
    averageProbability: number;
    stageDistribution: {
      stage: DealStage;
      count: number;
      percentage: number;
      value: number;
    }[];
    statusDistribution: {
      status: OpportunityStatus;
      count: number;
      percentage: number;
      value: number;
    }[];
  };
  content: OpportunityReportItem[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    sort?: string;
  };
}

//-----------------------------------------------------------------------------
// Contract Report Types
//-----------------------------------------------------------------------------

/**
 * Contract status options
 */
export type ContractStatus = 'Draft' | 'Active' | 'Completed' | 'Cancelled' | 'Expired';

/**
 * Contract report export type options
 */
export type ContractReportExportType = ExportType;

/**
 * Contract report query parameters
 */
export interface ContractReportParams {
  contractId?: number;
  clientId?: number;
  opportunityId?: number;
  managerId?: number;
  status?: ContractStatus;
  fromDate?: string;
  toDate?: string;
  minValue?: number;
  maxValue?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  page?: number;
  size?: number;
  exportType?: ContractReportExportType;
}

/**
 * Contract payment term data
 */
export interface ContractPaymentTerm {
  id: number;
  milestone: string;
  amount: number;
  dueDate: string;
  status: 'Pending' | 'Paid' | 'Overdue';
  paidDate?: string;
  paidAmount?: number;
}

/**
 * Contract employee data
 */
export interface ContractEmployee {
  id: number;
  name: string;
  position: string;
  role: string;
  allocation: number;
  startDate: string;
  endDate?: string;
}

/**
 * Contract file data
 */
export interface ContractFile {
  id: number;
  name: string;
  type: string;
  size: number;
  uploadedBy: {
    id: number;
    name: string;
  };
  uploadedAt: string;
  url: string;
}

/**
 * Contract report item data
 */
export interface ContractReportItem {
  id: number;
  title: string;
  client: {
    id: number;
    name: string;
  };
  opportunity?: {
    id: number;
    title: string;
  };
  value: number;
  status: ContractStatus;
  manager: {
    id: number;
    name: string;
    position: string;
  };
  startDate: string;
  endDate: string;
  signDate: string;
  description: string;
  paymentTerms: ContractPaymentTerm[];
  employees: ContractEmployee[];
  files: ContractFile[];
}

/**
 * Contract report response data
 */
export interface ContractReportResponse {
  summary: {
    totalContracts: number;
    totalValue: number;
    averageValue: number;
    totalPaid: number;
    remainingValue: number;
    statusDistribution: {
      status: ContractStatus;
      count: number;
      percentage: number;
      value: number;
    }[];
  };
  content: ContractReportItem[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    sort?: string;
  };
}

//-----------------------------------------------------------------------------
// Payment Report Types
//-----------------------------------------------------------------------------

/**
 * Payment status options
 */
export type PaymentStatus = 'Pending' | 'Paid' | 'Overdue' | 'Cancelled';

/**
 * Payment report export type options
 */
export type PaymentReportExportType = ExportType;

/**
 * Payment report query parameters
 */
export interface PaymentReportParams {
  paymentId?: number;
  contractId?: number;
  clientId?: number;
  status?: PaymentStatus;
  fromDate?: string;
  toDate?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  page?: number;
  size?: number;
  exportType?: PaymentReportExportType;
}

/**
 * Payment report item data
 */
export interface PaymentReportItem {
  id: number;
  invoice: {
    id: number;
    number: string;
  };
  contract: {
    id: number;
    title: string;
  };
  client: {
    id: number;
    name: string;
  };
  milestone: string;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
  paidDate?: string;
  paidAmount?: number;
  paymentMethod?: string;
  notes?: string;
}

/**
 * Payment report response data
 */
export interface PaymentReportResponse {
  summary: {
    totalPayments: number;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    overdueAmount: number;
    statusDistribution: {
      status: PaymentStatus;
      count: number;
      percentage: number;
      amount: number;
    }[];
  };
  content: PaymentReportItem[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    sort?: string;
  };
}

//-----------------------------------------------------------------------------
// KPI Report Types
//-----------------------------------------------------------------------------

/**
 * KPI period type options
 */
export type KpiPeriodType = 'week' | 'month' | 'quarter' | 'year';

/**
 * KPI report export type options
 */
export type KpiReportExportType = ExportType;

/**
 * KPI report query parameters
 */
export interface KpiReportParams {
  employeeId?: number;
  teamId?: number;
  period?: KpiPeriodType;
  fromDate?: string;
  toDate?: string;
  category?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  page?: number;
  size?: number;
  exportType?: KpiReportExportType;
}

/**
 * KPI progress item data
 */
export interface KpiProgressItem {
  id: number;
  name: string;
  category: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: 'OnTrack' | 'AtRisk' | 'OffTrack' | 'Completed';
  owner?: {
    id: number;
    name: string;
  };
  team?: {
    id: number;
    name: string;
  };
  history: {
    date: string;
    value: number;
  }[];
}

/**
 * KPI report response data
 */
export interface KpiReportResponse {
  summary: {
    totalKpis: number;
    averageProgress: number;
    statusDistribution: {
      status: 'OnTrack' | 'AtRisk' | 'OffTrack' | 'Completed';
      count: number;
      percentage: number;
    }[];
    categoryDistribution: {
      category: string;
      count: number;
      percentage: number;
      averageProgress: number;
    }[];
  };
  content: KpiProgressItem[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    sort?: string;
  };
}

//-----------------------------------------------------------------------------
// Utilization Report Types
//-----------------------------------------------------------------------------

/**
 * Utilization period type options
 */
export type UtilizationPeriodType = 'week' | 'month' | 'quarter' | 'year';

/**
 * Utilization report export type options
 */
export type UtilizationReportExportType = ExportType;

/**
 * Utilization report query parameters
 */
export interface UtilizationReportParams {
  employeeId?: number;
  teamId?: number;
  period?: UtilizationPeriodType;
  fromDate?: string;
  toDate?: string;
  minUtilization?: number;
  maxUtilization?: number;
  groupBy?: 'employee' | 'team';
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  page?: number;
  size?: number;
  exportType?: UtilizationReportExportType;
}

/**
 * Employee utilization item data
 */
export interface EmployeeUtilizationItem {
  employeeId: number;
  employeeCode: string;
  name: string;
  position: string;
  team: {
    id: number;
    name: string;
  };
  status: string;
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  utilization: number;
  periods: {
    period: string;
    periodLabel: string;
    totalHours: number;
    billableHours: number;
    nonBillableHours: number;
    utilization: number;
  }[];
}

/**
 * Team utilization item data
 */
export interface TeamUtilizationItem {
  teamId: number;
  name: string;
  employeeCount: number;
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  utilization: number;
  periods: {
    period: string;
    periodLabel: string;
    totalHours: number;
    billableHours: number;
    nonBillableHours: number;
    utilization: number;
  }[];
}

/**
 * Utilization report response data
 */
export interface UtilizationReportResponse {
  summary: {
    totalEmployees?: number;
    totalTeams?: number;
    totalHours: number;
    billableHours: number;
    nonBillableHours: number;
    averageUtilization: number;
    utilizationDistribution: {
      range: string;
      count: number;
      percentage: number;
    }[];
  };
  employees?: EmployeeUtilizationItem[];
  teams?: TeamUtilizationItem[];
  pageable?: {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    sort?: string;
  };
} 
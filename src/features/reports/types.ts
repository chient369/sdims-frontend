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

//-----------------------------------------------------------------------------
// Report List Types
//-----------------------------------------------------------------------------

/**
 * Represents a report in the system
 */
export interface Report {
  id: string;
  name: string;
  description: string;
  module: ReportModule;
  type: ReportType;
  url: string;
  permission?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Report module categorization
 */
export type ReportModule = 
  | 'hrm' 
  | 'margin' 
  | 'opportunity' 
  | 'contract' 
  | 'finance' 
  | 'dashboard' 
  | 'admin';

/**
 * Report type categorization
 */
export type ReportType = 
  | 'analytical' 
  | 'operational' 
  | 'summary';

/**
 * Parameters for fetching reports list
 */
export interface ReportListParams {
  search?: string;
  module?: ReportModule;
  type?: ReportType;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  size?: number;
}

/**
 * Report list response from API
 */
export interface ReportListResponse {
  data: Report[];
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

//-----------------------------------------------------------------------------
// Dashboard Data Types
//-----------------------------------------------------------------------------

/**
 * Parameters for fetching dashboard data
 */
export interface DashboardParams {
  fromDate?: string;
  toDate?: string;
  teamId?: number;
  widgets?: string[];
}

/**
 * Dashboard summary response
 */
export interface DashboardSummaryResponse {
  dateRange: {
    fromDate: string;
    toDate: string;
  };
  widgets: {
    opportunity_status?: OpportunityStatusWidget;
    margin_distribution?: MarginDistributionWidget;
    revenue_summary?: RevenueSummaryWidget;
    employee_status?: EmployeeStatusWidget;
    utilization_rate?: UtilizationRateWidget;
  };
}

// Widget specific types
export interface OpportunityStatusWidget {
  totalOpportunities: number;
  byStatus: {
    green: number;
    yellow: number;
    red: number;
  };
  byDealStage: Array<{
    stage: string;
    count: number;
  }>;
  topOpportunities: Array<{
    id: number;
    name: string;
    customer: string;
    value: number;
    stage: string;
    lastInteraction: string;
  }>;
}

export interface MarginDistributionWidget {
  totalEmployees: number;
  distribution: {
    green: {
      count: number;
      percentage: number;
    };
    yellow: {
      count: number;
      percentage: number;
    };
    red: {
      count: number;
      percentage: number;
    };
  };
  trend: Array<{
    month: string;
    value: number;
  }>;
}

export interface RevenueSummaryWidget {
  currentMonth: {
    target: number;
    actual: number;
    achievement: number;
  };
  currentQuarter: {
    target: number;
    actual: number;
    achievement: number;
  };
  ytd: {
    target: number;
    actual: number;
    achievement: number;
  };
  contracts: {
    total: number;
    newlyAdded: number;
  };
  payment: {
    totalDue: number;
    overdue: number;
    upcoming: number;
  };
}

export interface EmployeeStatusWidget {
  totalEmployees: number;
  byStatus: {
    allocated: number;
    available: number;
    endingSoon: number;
    onLeave: number;
  };
  endingSoonList: Array<{
    id: number;
    name: string;
    projectEndDate: string;
  }>;
}

export interface UtilizationRateWidget {
  overall: number;
  byTeam: Array<{
    team: string;
    rate: number;
  }>;
  trend: Array<{
    month: string;
    value: number;
  }>;
}

//-----------------------------------------------------------------------------
// Other Report Types
//-----------------------------------------------------------------------------

// Base params for all report types
export interface BaseReportParams {
  page?: number;
  size?: number;
  fromDate?: string;
  toDate?: string;
  teamId?: number;
  exportType?: 'json' | 'csv' | 'excel';
}

// Employee Report Types
export interface EmployeeReportParams extends BaseReportParams {
  search?: string;
  status?: EmployeeReportStatus;
  skills?: string[];
}

export interface EmployeeReportResponse {
  data: EmployeeReportItem[];
  summary: {
    totalEmployees: number;
    activeEmployees: number;
    averageUtilization: number;
    totalBillableHours: number;
    totalNonBillableHours: number;
  };
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

// Margin Report Types
export interface MarginReportParams extends BaseReportParams {
  groupBy?: 'team' | 'employee';
  period?: 'month' | 'quarter' | 'year';
}

export interface MarginReportResponse {
  data: Array<{
    id: number | string;
    name: string;
    team?: string;
    cost: number;
    revenue: number;
    margin: number;
    marginStatus: MarginStatus;
  }>;
  summary: {
    totalTeams?: number;
    totalEmployees: number;
    totalCost: number;
    totalRevenue: number;
    averageMargin: number;
    statusDistribution: {
      status: MarginStatus;
      count: number;
      percentage: number;
    }[];
  };
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

// Opportunity Report Types
export interface OpportunityReportParams extends BaseReportParams {
  search?: string;
  status?: OpportunityStatus;
  dealStage?: DealStage;
  salesId?: number;
  followUpStatus?: 'green' | 'yellow' | 'red';
}

export interface OpportunityReportResponse {
  data: Array<{
    id: number;
    name: string;
    customer: string;
    dealStage: string;
    value: number;
    salesOwner: string;
    createdAt: string;
    lastInteraction: string;
    followUpStatus: 'green' | 'yellow' | 'red';
  }>;
  summary: {
    totalOpportunities: number;
    totalValue: number;
    averageValue: number;
    averageProbability: number;
    stageDistribution: Array<{ 
      stage: DealStage;
      count: number;
      percentage: number;
      value: number;
    }>;
    statusDistribution: Array<{
      status: OpportunityStatus;
      count: number;
      percentage: number;
      value: number;
    }>;
  };
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

// Contract Report Types
export interface ContractReportParams extends BaseReportParams {
  search?: string;
  status?: ContractStatus;
  customerId?: number;
  salesId?: number;
}

export interface ContractReportResponse {
  data: Array<{
    id: number;
    name: string;
    customer: string;
    status: string;
    value: number;
    signedDate: string;
    startDate: string;
    endDate: string;
    salesOwner: string;
  }>;
  summary: {
    totalContracts: number;
    totalValue: number;
    averageValue: number;
    totalPaid: number;
    remainingValue: number;
    statusDistribution: Array<{
      status: ContractStatus;
      count: number;
      percentage: number;
      value: number;
    }>;
  };
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

// Payment Report Types
export interface PaymentReportParams extends BaseReportParams {
  status?: PaymentStatus;
  contractId?: number;
  customerId?: number;
}

export interface PaymentReportResponse {
  data: Array<{
    id: number;
    contractId: number;
    contractName: string;
    customer: string;
    amount: number;
    dueDate: string;
    paidDate?: string;
    status: PaymentStatus;
  }>;
  summary: {
    totalPayments: number;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    overdueAmount: number;
    statusDistribution: Array<{
      status: PaymentStatus;
      count: number;
      percentage: number;
      amount: number;
    }>;
  };
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

// KPI Report Types
export interface KpiReportParams extends BaseReportParams {
  salesId?: number;
  period?: KpiPeriodType;
}

export interface KpiReportResponse {
  data: Array<{
    id: number;
    salesName: string;
    period: string;
    target: number;
    actual: number;
    achievement: number;
  }>;
  summary: {
    totalKpis: number;
    averageProgress: number;
    statusDistribution: Array<{
      status: 'Completed' | 'OnTrack' | 'AtRisk' | 'OffTrack';
      count: number;
      percentage: number;
    }>;
    categoryDistribution: Array<{
      category: string;
      count: number;
      percentage: number;
      averageProgress: number;
    }>;
  };
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

// Utilization Report Types
export interface UtilizationReportParams extends BaseReportParams {
  employeeId?: number;
  groupBy?: 'team' | 'employee';
  period?: UtilizationPeriodType;
}

export interface UtilizationReportResponse {
  data: Array<{
    id: number | string;
    name: string;
    team?: string;
    utilization: number;
    billableHours: number;
    totalHours: number;
  }>;
  summary: {
    totalEmployees?: number;
    totalTeams?: number;
    totalHours: number;
    billableHours: number;
    nonBillableHours: number;
    averageUtilization: number;
    utilizationDistribution: Array<{
      range: string;
      count: number;
      percentage: number;
    }>;
  };
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Generic Report Response
 * Kiểu dữ liệu chung cho tất cả các loại báo cáo
 */
export interface GenericReportResponse {
  status: string;
  code: number;
  data: {
    reportInfo: ReportInfo;
    content: any[];
    summaryMetrics?: any;
    pageable?: PageableInfo;
  };
}

/**
 * Report Info
 * Thông tin chung về báo cáo
 */
export interface ReportInfo {
  reportName: string;
  generatedAt: string;
  period?: string;
  fromDate?: string;
  toDate?: string;
  filters?: Record<string, any>;
}

/**
 * Pageable Info
 * Thông tin phân trang
 */
export interface PageableInfo {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  sort: string;
}

/**
 * Report Filter
 * Cấu trúc của một bộ lọc báo cáo
 */
export interface ReportFilter {
  id: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'daterange' | 'number' | 'checkbox' | 'radio';
  defaultValue?: any;
  options?: Array<{
    value: string | number;
    label: string;
  }>;
  multiple?: boolean;
  required?: boolean;
  min?: number;
  max?: number;
  placeholder?: string;
}

/**
 * Report Viewer Props
 * Props cho component ReportViewer
 */
export interface ReportViewerProps {
  data: GenericReportResponse;
  type: string;
  isLoading: boolean;
}

/**
 * Report Header Props
 * Props cho component ReportHeader
 */
export interface ReportHeaderProps {
  title: string;
  description?: string;
  updatedAt?: string;
  onBack: () => void;
}

/**
 * Report Toolbar Props
 * Props cho component ReportToolbar
 */
export interface ReportToolbarProps {
  onExport: (type: 'excel' | 'csv' | 'pdf') => void;
  onPrint: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

/**
 * Report Filters Props
 * Props cho component ReportFilters
 */
export interface ReportFiltersProps {
  filters: ReportFilter[];
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  onApply: () => void;
  onReset: () => void;
}

/**
 * Report List Filters Props
 * Props cho component ReportFilters trên trang danh sách báo cáo
 */
export interface ReportListFiltersProps {
  searchTerm: string;
  selectedModule: ReportModule | null;
  selectedType: ReportType | null;
  onSearch: (term: string) => void;
  onModuleChange: (module: string | null) => void;
  onTypeChange: (type: string | null) => void;
  onClearFilters: () => void;
} 
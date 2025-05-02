/**
 * Shared types for reports and margin modules
 */

// Status types
export type MarginStatus = 'red' | 'yellow' | 'green';
export type FollowUpStatus = 'red' | 'yellow' | 'green';
export type OpportunityStatus = 'green' | 'yellow' | 'red';
export type EmployeeStatus = 'allocated' | 'available' | 'endingSoon' | 'onLeave' | 'resigned';
export type ContractStatus = 'Active' | 'Completed' | 'Terminated' | 'Draft';
export type PaymentStatus = 'Paid' | 'Pending' | 'Overdue';

// Period and grouping types
export type PeriodType = 'month' | 'quarter' | 'year';
export type GroupByType = 'employee' | 'team' | 'status';

// Export types
export type ExportType = 'json' | 'csv' | 'excel';

// View types
export type ViewType = 'table' | 'chart';

// Deal stages
export type DealStage = 'Appointment' | 'Demo' | 'Negotiation' | 'Closed Won' | 'Closed Lost'; 
/**
 * Types Module for Contract Feature
 * 
 * This module contains all type definitions for the contracts feature.
 * Types are organized by their domain and used throughout the feature
 * in both api.ts and service.ts files.
 */

//-----------------------------------------------------------------------------
// Core Contract Types
//-----------------------------------------------------------------------------

/**
 * Parameters for filtering and paginating contract list (API-CTR-001)
 */
export interface ContractListParams {
  page?: number;
  size?: number; // Số hợp đồng trên mỗi trang (mặc định: 20)
  search?: string; // Tìm kiếm chung
  customerName?: string; // Lọc theo tên khách hàng
  contractCode?: string; // Lọc theo mã hợp đồng
  status?: ContractStatus; // Lọc theo trạng thái hợp đồng
  contractType?: ContractType; // Lọc theo loại hợp đồng
  salesId?: string; // Lọc theo ID nhân viên Sales phụ trách
  minAmount?: number; // Giá trị hợp đồng tối thiểu
  maxAmount?: number; // Giá trị hợp đồng tối đa
  fromDate?: string; // Ngày bắt đầu (định dạng: YYYY-MM-DD)
  toDate?: string; // Ngày kết thúc (định dạng: YYYY-MM-DD)
  paymentStatus?: PaymentStatusType; // Lọc theo trạng thái thanh toán
  sortBy?: string; // Trường sắp xếp (mặc định: 'updatedAt')
  sortDirection?: 'asc' | 'desc'; // Hướng sắp xếp (mặc định: 'desc')
}

// Các kiểu trạng thái hợp đồng
export type ContractStatus = 
  | 'Draft' 
  | 'InReview' 
  | 'Approved' 
  | 'Active' 
  | 'InProgress' 
  | 'OnHold' 
  | 'Completed' 
  | 'Terminated' 
  | 'Expired' 
  | 'Cancelled';

// Các kiểu loại hợp đồng
export type ContractType = 
  | 'FixedPrice' 
  | 'TimeAndMaterial' 
  | 'Retainer' 
  | 'Maintenance' 
  | 'Other';

// Trạng thái thanh toán
export type PaymentStatusType = 'unpaid' | 'partial' | 'paid' | 'overdue';

/**
 * Phản hồi danh sách hợp đồng API-CTR-001
 */
export interface ContractListResponse {
  status: string;
  code: number;
  data: {
    content: ContractSummary[];
    pageable: PageableInfo;
  };
}

/**
 * Thông tin tóm tắt hợp đồng từ API-CTR-001
 */
export interface ContractSummary {
  id: number;
  contractCode: string;
  name: string;
  customerName: string;
  amount: number;
  contractType: ContractType;
  status: ContractStatus;
  signDate: string;
  startDate: string;
  endDate?: string;
  salesPerson: {
    id: number;
    name: string;
  };
  relatedOpportunity?: {
    id: number;
    code: string;
    name: string;
  } | null;
  paymentStatus: {
    status: PaymentStatusType;
    paidAmount: number;
    totalAmount: number;
    paidPercentage: number;
    nextDueDate?: string | null;
    nextDueAmount: number;
    totalTerms: number;
    paidTerms: number;
    remainingAmount: number;
  };
  employeeCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Thông tin phân trang
 */
export interface PageableInfo {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  sort: string;
}

/**
 * Phản hồi chi tiết hợp đồng từ API-CTR-003
 */
export interface ContractDetailResponse {
  status: string;
  code: number;
  data: {
    contract: ContractDetail;
  };
}

/**
 * Chi tiết hợp đồng từ API-CTR-003
 */
export interface ContractDetail {
  id: number;
  contractCode: string;
  name: string;
  customerName: string;
  contractType: ContractType;
  amount: number;
  signDate: string;
  startDate: string;
  endDate?: string;
  status: ContractStatus;
  salesPerson: {
    id: number;
    name: string;
  };
  relatedOpportunity?: {
    id: number;
    code: string;
    name: string;
  } | null;
  description?: string;
  paymentTerms: PaymentTerm[];
  employeeAssignments: EmployeeAssignment[];
  files: ContractFile[];
  paymentStatus: {
    status: PaymentStatusType;
    paidAmount: number;
    totalAmount: number;
    paidPercentage: number;
    nextDueDate?: string | null;
    nextDueAmount: number;
    totalTerms: number;
    paidTerms: number;
    remainingAmount: number;
  };
  tags?: string[];
  createdBy: UserReference;
  createdAt: string;
  updatedBy: UserReference;
  updatedAt: string;
}

/**
 * Đợt thanh toán của hợp đồng
 */
export interface PaymentTerm {
  id: number;
  termNumber: number;
  dueDate: string;
  amount: number;
  description?: string;
  status: 'paid' | 'unpaid' | 'invoiced' | 'overdue';
  paidDate?: string | null;
  paidAmount: number;
}

/**
 * Phân công nhân viên cho hợp đồng
 */
export interface EmployeeAssignment {
  id: number;
  employee: {
    id: number;
    name: string;
    position: string;
    team: {
      id: number;
      name: string;
    };
  };
  startDate: string;
  endDate?: string;
  allocationPercentage: number;
  billRate: number;
  role?: string;
}

/**
 * File đính kèm với hợp đồng
 */
export interface ContractFile {
  id: number;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy: UserReference;
  url: string;
}

/**
 * Thông tin người dùng tham chiếu
 */
export interface UserReference {
  id: number;
  name: string;
}

/**
 * Data required to create a new contract
 */
export interface ContractCreateData {
  contractCode: string;
  name: string;
  customerName: string;
  contractType: ContractType;
  amount: number;
  signDate: string;
  startDate: string;
  endDate?: string;
  status: ContractStatus;
  salesPersonId: number;
  description?: string;
  paymentTerms?: PaymentTerm[];
  // Tùy chọn khác nếu có
}

/**
 * Data for updating an existing contract
 */
export interface ContractUpdateData extends Partial<ContractCreateData> {}

/**
 * Data required to create a payment term
 */
export interface PaymentTermCreateData {
  termNumber: number;
  dueDate: string;
  amount: number;
  description?: string;
}

/**
 * Data for updating payment status
 */
export interface PaymentStatusUpdateData {
  status: 'paid' | 'unpaid' | 'invoiced' | 'overdue';
  paidAmount?: number;
  paidDate?: string;
  paymentMethod?: string;
  notes?: string;
}

/**
 * Data required to assign an employee to a contract
 */
export interface EmployeeAssignmentCreateData {
  employeeId: number;
  startDate: string;
  endDate?: string;
  allocationPercentage: number;
  billRate: number;
}

/**
 * Data required for bulk assignment of employees to contract
 */
export interface BulkEmployeeAssignmentData {
  employeeAssignments: EmployeeAssignmentCreateData[];
}

/**
 * Response from importing payment status
 */
export interface ImportPaymentStatusResponse {
  success: boolean;
  totalRecords: number;
  successCount: number;
  errorCount: number;
  errors: Array<{
    row: number;
    contractCode: string;
    termNumber: number;
    errorMessage: string;
  }>;
  updatedPayments: Array<{
    contractId: number;
    contractCode: string;
    termId: number;
    termNumber: number;
    status: string;
    previousStatus: string;
  }>;
}

//-----------------------------------------------------------------------------
// Revenue KPI Types
//-----------------------------------------------------------------------------

/**
 * Tham số lọc cho danh sách KPI doanh thu
 */
export interface KpiListParams {
  year?: number; // Năm cần lấy KPI (mặc định: năm hiện tại)
  quarter?: number; // Quý cần lấy KPI (từ 1-4)
  month?: number; // Tháng cần lấy KPI (từ 1-12)
  salesId?: number; // ID của nhân viên Sales
  page?: number; // Trang cần lấy
  size?: number; // Số bản ghi mỗi trang
}

/**
 * KPI doanh thu
 */
export interface SalesKpi {
  id: number;
  year: number;
  quarter?: number | null;
  month?: number | null;
  salesId: number;
  salesCode: string;
  salesName: string;
  teamId: number;
  teamName: string;
  targetRevenue: number;
  actualRevenue: number;
  achievement: number;
  status: 'IN_PROGRESS' | 'ACHIEVED' | 'MISSED' | 'NOT_STARTED';
  note?: string;
}

/**
 * Phản hồi danh sách KPI doanh thu
 */
export interface KpiListResponse {
  status: string;
  code: number;
  data: {
    kpis: SalesKpi[];
    summary: {
      totalKPIs: number;
      totalTargetRevenue: number;
      totalActualRevenue: number;
      overallAchievement: number;
    };
    pageable: PageableInfo;
  };
}

/**
 * Dữ liệu tạo/cập nhật KPI doanh thu
 */
export interface KpiFormData {
  id?: number;
  salesId: number;
  year: number;
  quarter?: number | null;
  month?: number | null;
  targetRevenue: number;
  note?: string;
}

/**
 * Phản hồi tạo/cập nhật KPI
 */
export interface KpiSaveResponse {
  status: string;
  code: number;
  message: string;
  data: SalesKpi;
}

/**
 * Phản hồi xóa KPI
 */
export interface KpiDeleteResponse {
  status: string;
  code: number;
  message: string;
  data: {
    id: number;
    year: number;
    quarter?: number | null;
    month?: number | null;
    salesId: number;
    salesCode: string;
    salesName: string;
  };
}
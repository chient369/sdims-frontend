import { BaseApiService } from '../../services/core/baseApi';
import api from '../../services/core/axios';

// Import types từ types.ts 
import {
  ContractCreateData,
  ContractListParams,
  ContractUpdateData,
  PaymentTermCreateData,
  PaymentStatusUpdateData,
  EmployeeAssignmentCreateData,
  BulkEmployeeAssignmentData,
  ContractListResponse,
  ContractDetailResponse,
  ContractDetail,
  ContractSummary,
  PaymentTerm,
  EmployeeAssignment,
  ContractFile,
  ImportPaymentStatusResponse,
  KpiListParams,
  KpiFormData,
  SalesKpi,
  KpiListResponse,
  KpiSaveResponse,
  KpiDeleteResponse
} from './types';

// Import API functions từ api.ts
import * as contractApi from './api';

/**
 * Service class for contract management
 * 
 * Provides a higher-level interface for interacting with contract data,
 * encapsulating API calls and adding business logic when needed.
 * Extends BaseApiService to leverage common CRUD operations.
 */
class ContractService extends BaseApiService {
  constructor() {
    super('/api/v1/contracts');
  }
  
  /**
   * Get all contracts with filtering and pagination
   */
  async getContracts(params?: ContractListParams): Promise<ContractListResponse> {
    return contractApi.getContracts(params);
  }

  /**
   * Get contract by ID
   */
  async getContractById(id: string): Promise<ContractDetailResponse> {
    return contractApi.getContractById(id);
  }

  /**
   * Create a new contract
   */
  async createContract(data: ContractCreateData): Promise<ContractDetail> {
    return contractApi.createContract(data);
  }

  /**
   * Update a contract
   */
  async updateContract(id: string, data: ContractUpdateData): Promise<ContractDetail> {
    return contractApi.updateContract(id, data);
  }

  /**
   * Delete a contract
   */
  async deleteContract(id: string): Promise<void> {
    return this.delete(id);
  }
  
  /**
   * Upload contract file
   */
  async uploadContractFile(
    contractId: string, 
    file: File, 
    fileCategory: string,
  ): Promise<ContractFile> {
    return contractApi.uploadContractFile(contractId, file, fileCategory);
  }

  /**
   * Get contract files
   */
  async getContractFiles(contractId: string): Promise<ContractFile[]> {
    const response = await api.get(`${this.endpoint}/${contractId}/files`);
    return response.data;
  }

  /**
   * Delete contract file
   */
  async deleteContractFile(fileId: string): Promise<void> {
    return this.delete(`/files/${fileId}`);
  }
  
  /**
   * Get payment schedule for contract
   */
  async getPaymentSchedule(contractId: string): Promise<PaymentTerm[]> {
    const response = await api.get(`${this.endpoint}/${contractId}/payment-terms`);
    return response.data;
  }
  
  /**
   * Add payment schedule item
   */
  async addPaymentScheduleItem(
    contractId: string,
    data: PaymentTermCreateData
  ): Promise<PaymentTerm> {
    return contractApi.addPaymentTerm(contractId, data);
  }
  
  /**
   * Update payment schedule item
   */
  async updatePaymentScheduleItem(
    contractId: string,
    paymentId: string,
    data: Partial<PaymentTermCreateData>
  ): Promise<PaymentTerm> {
    return api.put<PaymentTerm, PaymentTerm>(
      `${this.endpoint}/${contractId}/payment-terms/${paymentId}`,
      data
    );
  }
  
  /**
   * Update payment status for a term
   */
  async updateTermPaymentStatus(
    contractId: string,
    termId: string,
    data: PaymentStatusUpdateData
  ): Promise<PaymentTerm> {
    return contractApi.updatePaymentStatus(contractId, termId, data);
  }

  /**
   * Import payment status from file
   */
  async importPaymentStatus(
    file: File,
    notifyOwners?: boolean
  ): Promise<ImportPaymentStatusResponse> { 
    const formData = new FormData();
    formData.append('file', file);
    if (notifyOwners !== undefined) {
      formData.append('notifyOwners', notifyOwners.toString());
    }
    
    const response = await api.post(`${this.endpoint}/import-payment-status`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  /**
   * Get payment status export template
   */
  async getPaymentStatusTemplate(): Promise<Blob> {
    const response = await api.get(`${this.endpoint}/payment-status-template`, {
      responseType: 'blob'
    });
    return response.data;
  }

  /**
   * Mark payment as paid
   */
  async markPaymentAsPaid(
    contractId: string,
    paymentId: string,
    data: {
      paidDate: string;
      paidAmount: number;
      paymentMethod?: string;
    }
  ): Promise<PaymentTerm> {
    const response = await api.put(
      `${this.endpoint}/${contractId}/payment-terms/${paymentId}/mark-as-paid`,
      data
    );
    return response.data;
  }
  
  /**
   * Get contract summary by status
   */
  async getContractSummaryByStatus(): Promise<Array<{
    status: string;
    count: number;
    totalValue: number;
  }>> {
    const response = await api.get(`${this.endpoint}/summary-by-status`);
    return response.data;
  }
  
  /**
   * Get payment summary
   */
  async getPaymentSummary(params?: {
    year?: number;
    month?: number;
    clientId?: string;
  }): Promise<{
    totalDue: number;
    totalPaid: number;
    totalOverdue: number;
    dueCount: number;
    paidCount: number;
    overdueCount: number;
  }> {
    const response = await api.get(`${this.endpoint}/payment-summary`, { params });
    return response.data;
  }

  /**
   * Get employees assigned to a contract
   */
  async getContractEmployees(contractId: string): Promise<EmployeeAssignment[]> {
    return contractApi.getContractEmployees(contractId);
  }

  /**
   * Assign employee to a contract
   */
  async assignEmployeeToContract(
    contractId: string,
    data: EmployeeAssignmentCreateData
  ): Promise<EmployeeAssignment> {
    return contractApi.assignEmployeeToContract(contractId, data);
  }

  /**
   * Remove employee from a contract
   */
  async removeEmployeeFromContract(
    contractId: string,
    employeeId: string
  ): Promise<void> {
    return contractApi.removeEmployeeFromContract(contractId, employeeId);
  }

  /**
   * Assign multiple employees to a contract at once following API-CTR-013
   */
  async assignEmployeesToContract(
    contractId: string,
    data: BulkEmployeeAssignmentData
  ): Promise<EmployeeAssignment[]> {
    const response = await api.post(`${this.endpoint}/${contractId}/employees/bulk`, data);
    return response.data;
  }

  /**
   * Get revenue forecast by contract
   */
  async getRevenueForecast(params?: {
    year?: number;
    month?: number;
    contractId?: string;
    clientId?: string;
  }): Promise<Array<{
    month: string;
    expected: number;
    actual: number;
  }>> {
    const response = await api.get(`${this.endpoint}/revenue-forecast`, { params });
    return response.data;
  }

  /**
   * Get contract KPIs
   */
  async getContractKPIs(params?: {
    year?: number;
    quarter?: number;
  }): Promise<{
    totalContracts: number;
    activeContracts: number;
    newContractsThisPeriod: number;
    totalContractValue: number;
    averageContractValue: number;
    topClients: Array<{
      clientId: string;
      clientName: string;
      contractCount: number;
      totalValue: number;
    }>;
  }> {
    const response = await api.get(`${this.endpoint}/kpis`, { params });
    return response.data;
  }
}

export default ContractService;

/**
 * Lấy danh sách KPI doanh thu với các tham số lọc
 * @param params Tham số lọc và phân trang
 * @returns Promise với danh sách KPI đã lọc
 */
export const getSalesKpis = async (params?: KpiListParams): Promise<KpiListResponse> => {
  try {
    const response = await contractApi.getSalesKpis(params);
    return response;
  } catch (error) {
    console.error('Error fetching sales KPIs:', error);
    throw error;
  }
};

/**
 * Thêm mới hoặc cập nhật KPI doanh thu
 * @param data Dữ liệu KPI cần lưu
 * @returns Promise với kết quả lưu KPI
 */
export const saveSalesKpi = async (data: KpiFormData): Promise<KpiSaveResponse> => {
  try {
    const response = await contractApi.saveSalesKpi(data);
    return response;
  } catch (error) {
    console.error('Error saving sales KPI:', error);
    throw error;
  }
};

/**
 * Xóa một KPI doanh thu
 * @param kpiId ID của KPI cần xóa
 * @returns Promise với kết quả xóa KPI
 */
export const deleteSalesKpi = async (kpiId: number): Promise<KpiDeleteResponse> => {
  try {
    const response = await contractApi.deleteSalesKpi(kpiId);
    return response;
  } catch (error) {
    console.error('Error deleting sales KPI:', error);
    throw error;
  }
}; 
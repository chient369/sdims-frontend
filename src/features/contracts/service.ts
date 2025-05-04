import { BaseApiService } from '../../services/core/baseApi';
import apiClient from '../../services/core/axios';

// Import types từ types.ts 
import {
  ContractCreateData,
  ContractEmployeeCreateData,
  ContractEmployeeResponse,
  ContractFileResponse,
  ContractListParams,
  ContractResponse,
  ContractUpdateData,
  ImportPaymentStatusResponse,
  PaymentScheduleCreateData,
  PaymentScheduleItem,
  PaymentStatusUpdateData
} from './types';

// Import API functions từ api.ts
import {
  assignEmployeeToContract as assignEmployeeToContractApi,
  deleteContractFile as deleteContractFileApi,
  getContractEmployees as getContractEmployeesApi,
  getContractFiles as getContractFilesApi,
  getContractKPIs as getContractKPIsApi,
  getContractSummaryByStatus as getContractSummaryByStatusApi,
  getContracts as getContractsApi,
  getPaymentSchedule as getPaymentScheduleApi,
  getPaymentStatusTemplate as getPaymentStatusTemplateApi,
  getPaymentSummary as getPaymentSummaryApi,
  getRevenueForecast as getRevenueForecastApi,
  importPaymentStatus as importPaymentStatusApi,
  markPaymentAsPaid as markPaymentAsPaidApi,
  removeEmployeeFromContract as removeEmployeeFromContractApi,
  updatePaymentStatus as updatePaymentStatusApi,
  uploadContractFile as uploadContractFileApi,
} from './api';

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
  async getContracts(params?: ContractListParams): Promise<{
    data: ContractResponse[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    return getContractsApi(params);
  }

  /**
   * Get contract by ID
   */
  async getContractById(id: string): Promise<ContractResponse> {
    return this.getById<ContractResponse>(id);
  }

  /**
   * Create a new contract
   */
  async createContract(data: ContractCreateData): Promise<ContractResponse> {
    return this.create<ContractResponse, ContractCreateData>(data);
  }

  /**
   * Update a contract
   */
  async updateContract(id: string, data: ContractUpdateData): Promise<ContractResponse> {
    return this.update<ContractResponse, ContractUpdateData>(id, data);
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
    fileCategory: 'contract' | 'invoice' | 'proposal' | 'attachment' | 'other',
    description?: string
  ): Promise<ContractFileResponse> {
    return uploadContractFileApi(contractId, file, fileCategory, description);
  }

  /**
   * Get contract files
   */
  async getContractFiles(contractId: string): Promise<ContractFileResponse[]> {
    return getContractFilesApi(contractId);
  }

  /**
   * Delete contract file
   */
  async deleteContractFile(fileId: string): Promise<void> {
    return deleteContractFileApi(fileId);
  }
  
  /**
   * Get payment schedule for contract
   */
  async getPaymentSchedule(contractId: string): Promise<PaymentScheduleItem[]> {
    return getPaymentScheduleApi(contractId);
  }
  
  /**
   * Add payment schedule item
   */
  async addPaymentScheduleItem(
    contractId: string,
    data: PaymentScheduleCreateData
  ): Promise<PaymentScheduleItem> {
    return apiClient.post<PaymentScheduleItem, PaymentScheduleItem>(
      `${this.endpoint}/${contractId}/payment-terms`,
      data
    );
  }
  
  /**
   * Update payment schedule item
   */
  async updatePaymentScheduleItem(
    contractId: string,
    paymentId: string,
    data: Partial<PaymentScheduleCreateData>
  ): Promise<PaymentScheduleItem> {
    return apiClient.put<PaymentScheduleItem, PaymentScheduleItem>(
      `${this.endpoint}/${contractId}/payment-terms/${paymentId}`,
      data
    );
  }
  
  /**
   * Update payment status
   */
  async updatePaymentStatus(
    termId: string,
    data: PaymentStatusUpdateData
  ): Promise<PaymentScheduleItem> {
    return updatePaymentStatusApi(termId, data);
  }

  /**
   * Import payment status from file
   */
  async importPaymentStatus(
    file: File,
    notifyOwners?: boolean
  ): Promise<ImportPaymentStatusResponse> {
    return importPaymentStatusApi(file, notifyOwners);
  }

  /**
   * Get payment status export template
   */
  async getPaymentStatusTemplate(): Promise<Blob> {
    return getPaymentStatusTemplateApi();
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
  ): Promise<PaymentScheduleItem> {
    return markPaymentAsPaidApi(contractId, paymentId, data);
  }
  
  /**
   * Get contract summary by status
   */
  async getContractSummaryByStatus(): Promise<Array<{
    status: string;
    count: number;
    totalValue: number;
  }>> {
    return getContractSummaryByStatusApi();
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
    return getPaymentSummaryApi(params);
  }

  /**
   * Get employees assigned to a contract
   */
  async getContractEmployees(contractId: string): Promise<ContractEmployeeResponse[]> {
    return getContractEmployeesApi(contractId);
  }

  /**
   * Assign employee to a contract
   */
  async assignEmployeeToContract(
    contractId: string,
    data: ContractEmployeeCreateData
  ): Promise<ContractEmployeeResponse> {
    return assignEmployeeToContractApi(contractId, data);
  }

  /**
   * Remove employee from a contract
   */
  async removeEmployeeFromContract(
    contractId: string,
    employeeId: string
  ): Promise<void> {
    return removeEmployeeFromContractApi(contractId, employeeId);
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
    return getRevenueForecastApi(params);
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
    return getContractKPIsApi(params);
  }
}

// Create and export an instance
export const contractService = new ContractService(); 
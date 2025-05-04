/**
 * Contracts API Module
 * 
 * This module serves as an adapter layer between the application and the REST API.
 * It provides functions for direct API communication with the contracts endpoints.
 * Each function implements a specific API call and handles the response formatting.
 * 
 * The service layer (ContractService) uses these functions to provide higher-level
 * business operations and additional logic when needed.
 */

import apiClient from '../../services/core/axios';
import { AxiosRequestConfig } from 'axios';
import { ContractListParams, ContractResponse, ContractCreateData, ContractUpdateData, ContractFileResponse, PaymentScheduleItem, PaymentStatusUpdateData, ImportPaymentStatusResponse, ContractEmployeeResponse, ContractEmployeeCreateData, PaymentScheduleCreateData } from './types';


/**
 * Get all contracts with filtering and pagination
 */
export const getContracts = async (params?: ContractListParams, config?: AxiosRequestConfig): Promise<{
  data: ContractResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> => {
  return apiClient.get('/api/v1/contracts', { 
    ...config,
    params,
  });
};

/**
 * Get contract by ID
 */
export const getContractById = async (id: string, config?: AxiosRequestConfig): Promise<ContractResponse> => {
  return apiClient.get(`/api/v1/contracts/${id}`, config);
};

/**
 * Create a new contract
 */
export const createContract = async (data: ContractCreateData, config?: AxiosRequestConfig): Promise<ContractResponse> => {
  return apiClient.post('/api/v1/contracts', data, config);
};

/**
 * Update a contract
 */
export const updateContract = async (id: string, data: ContractUpdateData, config?: AxiosRequestConfig): Promise<ContractResponse> => {
  return apiClient.put(`/api/v1/contracts/${id}`, data, config);
};

/**
 * Delete a contract
 */
export const deleteContract = async (id: string, config?: AxiosRequestConfig): Promise<void> => {
  return apiClient.delete(`/api/v1/contracts/${id}`, config);
};

/**
 * Upload contract file
 */
export const uploadContractFile = async (
  contractId: string, 
  file: File, 
  fileCategory: 'contract' | 'invoice' | 'proposal' | 'attachment' | 'other', 
  description?: string,
  config?: AxiosRequestConfig
): Promise<ContractFileResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileCategory', fileCategory);
  if (description) {
    formData.append('description', description);
  }
  
  return apiClient.post(
    `/api/v1/contracts/${contractId}/files`, 
    formData,
    {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data'
      }
    }
  );
};

/**
 * Get contract files
 */
export const getContractFiles = async (
  contractId: string, 
  config?: AxiosRequestConfig
): Promise<ContractFileResponse[]> => {
  return apiClient.get(`/api/v1/contracts/${contractId}/files`, config);
};

/**
 * Delete contract file
 */
export const deleteContractFile = async (
  fileId: string,
  config?: AxiosRequestConfig
): Promise<void> => {
  return apiClient.delete(`/api/v1/contracts/files/${fileId}`, config);
};

/**
 * Get payment schedule for contract
 */
export const getPaymentSchedule = async (contractId: string, config?: AxiosRequestConfig): Promise<PaymentScheduleItem[]> => {
  return apiClient.get(`/api/v1/contracts/${contractId}/payment-terms`, config);
};

/**
 * Add payment schedule item
 */
export const addPaymentScheduleItem = async (
  contractId: string,
  data: PaymentScheduleCreateData,
  config?: AxiosRequestConfig
): Promise<PaymentScheduleItem> => {
  return apiClient.post(`/api/v1/contracts/${contractId}/payment-terms`, data, config);
};

/**
 * Update payment schedule item
 */
export const updatePaymentScheduleItem = async (
  contractId: string,
  paymentId: string,
  data: Partial<PaymentScheduleCreateData>,
  config?: AxiosRequestConfig
): Promise<PaymentScheduleItem> => {
  return apiClient.put(`/api/v1/contracts/${contractId}/payment-terms/${paymentId}`, data, config);
};

/**
 * Update payment status
 */
export const updatePaymentStatus = async (
  termId: string,
  data: PaymentStatusUpdateData,
  config?: AxiosRequestConfig
): Promise<PaymentScheduleItem> => {
  return apiClient.patch(`/api/v1/contracts/payment-terms/${termId}/status`, data, config);
};

/**
 * Import payment status from file
 */
export const importPaymentStatus = async (
  file: File,
  notifyOwners?: boolean,
  config?: AxiosRequestConfig
): Promise<ImportPaymentStatusResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  if (notifyOwners !== undefined) {
    formData.append('notifyOwners', String(notifyOwners));
  }
  
  return apiClient.post(
    `/api/v1/contracts/payment-terms/import-status`, 
    formData,
    {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data'
      }
    }
  );
};

/**
 * Get payment status export template
 */
export const getPaymentStatusTemplate = async (config?: AxiosRequestConfig): Promise<Blob> => {
  return apiClient.get('/api/v1/contracts/payment-terms/export-template', {
    ...config,
    responseType: 'blob'
  });
};

/**
 * Mark payment as paid
 */
export const markPaymentAsPaid = async (
  contractId: string,
  paymentId: string,
  data: {
    paidDate: string;
    paidAmount: number;
    paymentMethod?: string;
  },
  config?: AxiosRequestConfig
): Promise<PaymentScheduleItem> => {
  return apiClient.patch(`/api/v1/contracts/${contractId}/payments/${paymentId}/paid`, data, config);
};

/**
 * Get contract summary by status
 */
export const getContractSummaryByStatus = async (config?: AxiosRequestConfig): Promise<Array<{
  status: string;
  count: number;
  totalValue: number;
}>> => {
  return apiClient.get('/api/v1/contracts/summary/status', config);
};

/**
 * Get payment summary
 */
export const getPaymentSummary = async (
  params?: {
    year?: number;
    month?: number;
    clientId?: string;
  },
  config?: AxiosRequestConfig
): Promise<{
  totalDue: number;
  totalPaid: number;
  totalOverdue: number;
  dueCount: number;
  paidCount: number;
  overdueCount: number;
}> => {
  return apiClient.get('/api/v1/contracts/summary/payments', {
    ...config,
    params,
  });
};

/**
 * Get employees assigned to a contract
 */
export const getContractEmployees = async (
  contractId: string,
  config?: AxiosRequestConfig
): Promise<ContractEmployeeResponse[]> => {
  return apiClient.get(`/api/v1/contracts/${contractId}/employees`, config);
};

/**
 * Assign employee to a contract
 */
export const assignEmployeeToContract = async (
  contractId: string,
  data: ContractEmployeeCreateData,
  config?: AxiosRequestConfig
): Promise<ContractEmployeeResponse> => {
  return apiClient.post(`/api/v1/contracts/${contractId}/employees`, data, config);
};

/**
 * Remove employee from a contract
 */
export const removeEmployeeFromContract = async (
  contractId: string,
  employeeId: string,
  config?: AxiosRequestConfig
): Promise<void> => {
  return apiClient.delete(`/api/v1/contracts/${contractId}/employees/${employeeId}`, config);
};

/**
 * Get revenue forecast by contract
 */
export const getRevenueForecast = async (
  params?: {
    year?: number;
    month?: number;
    contractId?: string;
    clientId?: string;
  },
  config?: AxiosRequestConfig
): Promise<Array<{
  month: string;
  expected: number;
  actual: number;
}>> => {
  return apiClient.get('/api/v1/contracts/forecast/revenue', {
    ...config,
    params,
  });
};

/**
 * Get contract KPIs
 */
export const getContractKPIs = async (
  params?: {
    year?: number;
    quarter?: number;
  },
  config?: AxiosRequestConfig
): Promise<{
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
}> => {
  return apiClient.get('/api/v1/contracts/kpi', {
    ...config,
    params,
  });
};
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
import { 
  ContractListParams, 
  ContractSummary, 
  ContractDetail,
  ContractCreateData,
  ContractUpdateData,
  PaymentTermCreateData,
  PaymentStatusUpdateData,
  EmployeeAssignmentCreateData,
  BulkEmployeeAssignmentData,
  ContractListResponse,
  ContractDetailResponse,
  KpiListParams,
  KpiFormData,
  ContractStatus,
  ContractType,
  PageableInfo
} from './types';

// Các hàm API cho module Contract

/**
 * Lấy danh sách hợp đồng với bộ lọc và phân trang
 * @param params Tham số lọc và phân trang
 * @param config Cấu hình tùy chọn cho request
 * @returns Promise<ContractListResponse>
 */
export const getContracts = async (params?: ContractListParams, config?: AxiosRequestConfig): Promise<ContractListResponse> => {
  return apiClient.get('/api/v1/contracts', {
    ...config,
    params
  });
};

/**
 * Lấy chi tiết hợp đồng theo ID
 * @param id ID hợp đồng
 * @param config Cấu hình tùy chọn cho request
 * @returns Promise<ContractDetailResponse>
 */
export const getContractById = async (id: string, config?: AxiosRequestConfig): Promise<ContractDetailResponse> => {  
  return apiClient.get(`/api/v1/contracts/${id}`, config);
};

/**
 * Tạo hợp đồng mới
 * @param data Dữ liệu hợp đồng mới
 * @param config Cấu hình tùy chọn cho request
 * @returns Promise với đối tượng hợp đồng đã tạo
 */
export const createContract = async (data: ContractCreateData, config?: AxiosRequestConfig) => {
  return apiClient.post('/api/v1/contracts', data, config);
};

/**
 * Cập nhật hợp đồng
 * @param id ID hợp đồng
 * @param data Dữ liệu cần cập nhật
 * @param config Cấu hình tùy chọn cho request
 * @returns Promise với đối tượng hợp đồng đã cập nhật
 */
export const updateContract = async (id: string, data: ContractUpdateData, config?: AxiosRequestConfig) => {
  return apiClient.put(`/api/v1/contracts/${id}`, data, config);
};

/**
 * Lấy danh sách nhân viên được phân công vào hợp đồng
 * @param contractId ID hợp đồng
 * @param config Cấu hình tùy chọn cho request
 * @returns Promise với danh sách nhân viên
 */
export const getContractEmployees = async (contractId: string, config?: AxiosRequestConfig) => {
  const response = await apiClient.get(`/api/v1/contracts/${contractId}/employees`, config);
  return response;
};

/**
 * Phân công nhân viên vào hợp đồng
 * @param contractId ID hợp đồng
 * @param data Dữ liệu phân công
 * @param config Cấu hình tùy chọn cho request
 * @returns Promise với kết quả phân công
 */
export const assignEmployeeToContract = async (contractId: string, data: EmployeeAssignmentCreateData, config?: AxiosRequestConfig) => {
  return apiClient.post(`/api/v1/contracts/${contractId}/employees`, data, config);
};

/**
 * Phân công nhiều nhân viên vào hợp đồng
 * @param contractId ID hợp đồng
 * @param data Dữ liệu phân công hàng loạt
 * @param config Cấu hình tùy chọn cho request
 * @returns Promise với kết quả phân công
 */
export const assignEmployeesToContract = async (contractId: string, data: BulkEmployeeAssignmentData, config?: AxiosRequestConfig) => {
  return apiClient.post(`/api/v1/contracts/${contractId}/employees/bulk`, data, config);
};

/**
 * Xóa nhân viên khỏi hợp đồng
 * @param contractId ID hợp đồng
 * @param employeeId ID nhân viên
 * @param config Cấu hình tùy chọn cho request
 * @returns Promise với kết quả xóa
 */
export const removeEmployeeFromContract = async (contractId: string, employeeId: string, config?: AxiosRequestConfig) => {
  return apiClient.delete(`/api/v1/contracts/${contractId}/employees/${employeeId}`, config);
};

/**
 * Thêm đợt thanh toán cho hợp đồng
 * @param contractId ID hợp đồng
 * @param data Dữ liệu đợt thanh toán
 * @param config Cấu hình tùy chọn cho request
 * @returns Promise với kết quả tạo đợt thanh toán
 */
export const addPaymentTerm = async (contractId: string, data: PaymentTermCreateData, config?: AxiosRequestConfig) => {
  return apiClient.post(`/api/v1/contracts/${contractId}/payment-terms`, data, config);
};

/**
 * Cập nhật trạng thái thanh toán
 * @param contractId ID hợp đồng
 * @param termId ID đợt thanh toán
 * @param data Dữ liệu cập nhật trạng thái
 * @param config Cấu hình tùy chọn cho request
 * @returns Promise với kết quả cập nhật
 */
export const updatePaymentStatus = async (contractId: string, termId: string, data: PaymentStatusUpdateData, config?: AxiosRequestConfig) => {
  return apiClient.put(`/api/v1/contracts/${contractId}/payment-terms/${termId}/status`, data, config);
};

/**
 * Tải lên file đính kèm cho hợp đồng
 * @param contractId ID hợp đồng
 * @param file File cần tải lên
 * @param type Loại file
 * @param config Cấu hình tùy chọn cho request
 * @returns Promise với kết quả tải lên
 */
export const uploadContractFile = async (contractId: string, file: File, type: string, config?: AxiosRequestConfig) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  
  const axiosConfig: AxiosRequestConfig = {
    ...config,
    headers: {
      ...config?.headers,
      'Content-Type': 'multipart/form-data'
    }
  };
  
  return apiClient.post(`/api/v1/contracts/${contractId}/files`, formData, axiosConfig);
};

/**
 * Lấy danh sách KPI doanh thu với các tham số lọc
 * @param params Tham số lọc và phân trang
 * @param config Cấu hình tùy chọn cho request
 * @returns Promise với kết quả truy vấn
 */
export const getSalesKpis = async (params?: KpiListParams, config?: AxiosRequestConfig) => {
  return apiClient.get('/api/v1/sales-kpis', {
    ...config,
    params
  });
};

/**
 * Thêm mới hoặc cập nhật KPI doanh thu
 * @param data Dữ liệu KPI cần lưu
 * @param config Cấu hình tùy chọn cho request
 * @returns Promise với kết quả lưu KPI
 */
export const saveSalesKpi = async (data: KpiFormData, config?: AxiosRequestConfig) => {
  // Nếu có id, đây là cập nhật
  if (data.id) {
    return apiClient.put(`/api/v1/admin/sales-kpis/${data.id}`, data, config);
  }
  
  // Nếu không có id, đây là thêm mới
  return apiClient.post('/api/v1/admin/sales-kpis', data, config);
};

/**
 * Xóa một KPI doanh thu
 * @param kpiId ID của KPI cần xóa
 * @param config Cấu hình tùy chọn cho request
 * @returns Promise với kết quả xóa KPI
 */
export const deleteSalesKpi = async (kpiId: number, config?: AxiosRequestConfig) => {
  return apiClient.delete(`/api/v1/admin/sales-kpis/${kpiId}`, config);
};

// Export tất cả các API functions
export default {
  getContracts,
  getContractById,
  createContract,
  updateContract,
  getContractEmployees,
  assignEmployeeToContract,
  assignEmployeesToContract,
  removeEmployeeFromContract,
  addPaymentTerm,
  updatePaymentStatus,
  uploadContractFile,
  getSalesKpis,
  saveSalesKpi,
  deleteSalesKpi
};
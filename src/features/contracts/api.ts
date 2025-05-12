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

import axios from 'axios';
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
  KpiFormData
} from './types';
import { contractDetailMock } from './mocks/contractDetailMock';

// Tạo instance Axios với cấu hình cơ bản
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor để thêm token xác thực
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Sử dụng mock data
const USE_MOCK = true;

// Các hàm API cho module Contract

/**
 * Lấy danh sách hợp đồng với bộ lọc và phân trang
 * @param params Tham số lọc và phân trang
 * @returns Promise<ContractListResponse>
 */
export const getContracts = async (params?: ContractListParams): Promise<ContractListResponse> => {
  const response = await apiClient.get('/contracts', { params });
  return response.data;
};

/**
 * Lấy chi tiết hợp đồng theo ID
 * @param id ID hợp đồng
 * @returns Promise<ContractDetailResponse>
 */
export const getContractById = async (id: string): Promise<ContractDetailResponse> => {
  if (USE_MOCK) {
    // Trả về dữ liệu mock
    return Promise.resolve(contractDetailMock);
  }
  
  // Gọi API thực
  const response = await apiClient.get(`/contracts/${id}`);
  return response.data;
};

/**
 * Tạo hợp đồng mới
 * @param data Dữ liệu hợp đồng mới
 * @returns Promise với đối tượng hợp đồng đã tạo
 */
export const createContract = async (data: ContractCreateData) => {
  const response = await apiClient.post('/contracts', data);
  return response.data;
};

/**
 * Cập nhật hợp đồng
 * @param id ID hợp đồng
 * @param data Dữ liệu cần cập nhật
 * @returns Promise với đối tượng hợp đồng đã cập nhật
 */
export const updateContract = async (id: string, data: ContractUpdateData) => {
  const response = await apiClient.put(`/contracts/${id}`, data);
  return response.data;
};

/**
 * Lấy danh sách nhân viên được phân công vào hợp đồng
 * @param contractId ID hợp đồng
 * @returns Promise với danh sách nhân viên
 */
export const getContractEmployees = async (contractId: string) => {
  const response = await apiClient.get(`/contracts/${contractId}/employees`);
  return response.data;
};

/**
 * Phân công nhân viên vào hợp đồng
 * @param contractId ID hợp đồng
 * @param data Dữ liệu phân công
 * @returns Promise với kết quả phân công
 */
export const assignEmployeeToContract = async (contractId: string, data: EmployeeAssignmentCreateData) => {
  const response = await apiClient.post(`/contracts/${contractId}/employees`, data);
  return response.data;
};

/**
 * Phân công nhiều nhân viên vào hợp đồng
 * @param contractId ID hợp đồng
 * @param data Dữ liệu phân công hàng loạt
 * @returns Promise với kết quả phân công
 */
export const assignEmployeesToContract = async (contractId: string, data: BulkEmployeeAssignmentData) => {
  const response = await apiClient.post(`/contracts/${contractId}/employees/bulk`, data);
  return response.data;
};

/**
 * Xóa nhân viên khỏi hợp đồng
 * @param contractId ID hợp đồng
 * @param employeeId ID nhân viên
 * @returns Promise với kết quả xóa
 */
export const removeEmployeeFromContract = async (contractId: string, employeeId: string) => {
  const response = await apiClient.delete(`/contracts/${contractId}/employees/${employeeId}`);
  return response.data;
};

/**
 * Thêm đợt thanh toán cho hợp đồng
 * @param contractId ID hợp đồng
 * @param data Dữ liệu đợt thanh toán
 * @returns Promise với kết quả tạo đợt thanh toán
 */
export const addPaymentTerm = async (contractId: string, data: PaymentTermCreateData) => {
  const response = await apiClient.post(`/contracts/${contractId}/payment-terms`, data);
  return response.data;
};

/**
 * Cập nhật trạng thái thanh toán
 * @param contractId ID hợp đồng
 * @param termId ID đợt thanh toán
 * @param data Dữ liệu cập nhật trạng thái
 * @returns Promise với kết quả cập nhật
 */
export const updatePaymentStatus = async (contractId: string, termId: string, data: PaymentStatusUpdateData) => {
  const response = await apiClient.put(`/contracts/${contractId}/payment-terms/${termId}/status`, data);
  return response.data;
};

/**
 * Tải lên file đính kèm cho hợp đồng
 * @param contractId ID hợp đồng
 * @param file File cần tải lên
 * @param type Loại file
 * @returns Promise với kết quả tải lên
 */
export const uploadContractFile = async (contractId: string, file: File, type: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const response = await apiClient.post(`/contracts/${contractId}/files`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Lấy danh sách KPI doanh thu với các tham số lọc
 * @param params Tham số lọc và phân trang
 * @returns Promise<KpiListResponse>
 */
export const getSalesKpis = async (params?: KpiListParams) => {
  const response = await apiClient.get('/sales-kpis', { params });
  return response.data;
};

/**
 * Thêm mới hoặc cập nhật KPI doanh thu
 * @param data Dữ liệu KPI cần lưu
 * @returns Promise với kết quả lưu KPI
 */
export const saveSalesKpi = async (data: KpiFormData) => {
  // Nếu có id, đây là cập nhật
  if (data.id) {
    const response = await apiClient.put(`/admin/sales-kpis/${data.id}`, data);
    return response.data;
  }
  
  // Nếu không có id, đây là thêm mới
  const response = await apiClient.post('/admin/sales-kpis', data);
  return response.data;
};

/**
 * Xóa một KPI doanh thu
 * @param kpiId ID của KPI cần xóa
 * @returns Promise với kết quả xóa KPI
 */
export const deleteSalesKpi = async (kpiId: number) => {
  const response = await apiClient.delete(`/admin/sales-kpis/${kpiId}`);
  return response.data;
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
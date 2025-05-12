import { useMemo } from 'react';
import ContractService from '../service';
import { 
  EmployeeAssignmentCreateData, 
  ContractListParams, 
  BulkEmployeeAssignmentData,
  ContractCreateData,
  ContractUpdateData
} from '../types';

/**
 * Hook cung cấp các phương thức để tương tác với ContractService
 * @returns Instance của ContractService
 */
export function useContractService() {
  // Tạo instance của ContractService
  const contractService = useMemo(() => new ContractService(), []);
  
  /**
   * Lấy danh sách hợp đồng
   */
  const getContracts = async (params?: ContractListParams) => {
    return contractService.getContracts(params);
  };

  /**
   * Lấy thông tin chi tiết hợp đồng
   */
  const getContractById = async (id: string) => {
    return contractService.getContractById(id);
  };

  /**
   * Tạo hợp đồng mới
   */
  const createContract = async (data: ContractCreateData) => {
    return contractService.createContract(data);
  };

  /**
   * Cập nhật hợp đồng
   */
  const updateContract = async (id: string, data: ContractUpdateData) => {
    return contractService.updateContract(id, data);
  };

  /**
   * Lấy danh sách nhân viên được phân bổ vào hợp đồng
   */
  const getContractEmployees = async (contractId: string) => {
    return contractService.getContractEmployees(contractId);
  };

  /**
   * Phân bổ nhân viên vào hợp đồng
   */
  const assignEmployeeToContract = async (contractId: string, data: EmployeeAssignmentCreateData) => {
    return contractService.assignEmployeeToContract(contractId, data);
  };

  /**
   * Phân bổ nhiều nhân viên vào hợp đồng cùng lúc
   */
  const assignEmployeesToContract = async (contractId: string, data: BulkEmployeeAssignmentData) => {
    return contractService.assignEmployeesToContract(contractId, data);
  };

  /**
   * Xóa nhân viên khỏi hợp đồng
   */
  const removeEmployeeFromContract = async (contractId: string, employeeId: string) => {
    return contractService.removeEmployeeFromContract(contractId, employeeId);
  };

  return {
    getContracts,
    getContractById,
    createContract,
    updateContract,
    getContractEmployees,
    assignEmployeeToContract,
    assignEmployeesToContract,
    removeEmployeeFromContract
  };
}

export default useContractService; 
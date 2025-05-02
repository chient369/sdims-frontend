// Export API functions
export {
  getContracts,
  getContractById,
  createContract,
  updateContract,
  deleteContract,
  uploadContractFile,
  getContractFiles,
  deleteContractFile,
  getPaymentSchedule,
  addPaymentScheduleItem,
  updatePaymentScheduleItem,
  updatePaymentStatus,
  markPaymentAsPaid,
  importPaymentStatus,
  getPaymentStatusTemplate,
  getContractSummaryByStatus,
  getPaymentSummary,
  getContractEmployees,
  assignEmployeeToContract,
  removeEmployeeFromContract,
  getRevenueForecast,
  getContractKPIs,
} from './contractApi';

// Export service
export { contractService } from './contractService';

// Export types
export type {
  ContractListParams,
  ContractResponse,
  ContractCreateData,
  ContractUpdateData,
  PaymentScheduleItem,
  PaymentScheduleCreateData,
  PaymentStatusUpdateData,
  ContractFileResponse,
  ContractEmployeeResponse,
  ContractEmployeeCreateData,
  ImportPaymentStatusResponse,
} from './contractApi'; 
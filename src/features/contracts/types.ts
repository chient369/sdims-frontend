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
 * Parameters for filtering and paginating contract list
 */
export interface ContractListParams {
    page?: number;
    limit?: number;
    search?: string;
    clientId?: string;
    status?: 'draft' | 'active' | 'completed' | 'terminated' | 'on_hold';
    opportunityId?: string;
    startDateFrom?: string;
    startDateTo?: string;
    endDateFrom?: string;
    endDateTo?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }
  
  /**
   * Contract response from the API
   */
  export interface ContractResponse {
    id: string;
    code: string;
    name: string;
    clientId: string;
    clientName: string;
    opportunityId?: string;
    opportunityName?: string;
    type: 'fixed_price' | 'time_and_materials' | 'retainer';
    value: number;
    currency: string;
    startDate: string;
    endDate?: string;
    status: 'draft' | 'active' | 'completed' | 'terminated' | 'on_hold';
    salesPersonId?: string;
    salesPersonName?: string;
    description?: string;
    fileUrl?: string;
    paymentTerms?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  /**
   * Data required to create a new contract
   */
  export interface ContractCreateData {
    code: string;
    name: string;
    clientId: string;
    opportunityId?: string;
    type: 'fixed_price' | 'time_and_materials' | 'retainer';
    value: number;
    currency: string;
    startDate: string;
    endDate?: string;
    status?: 'draft' | 'active' | 'completed' | 'terminated' | 'on_hold';
    salesPersonId?: string;
    description?: string;
    paymentTerms?: string;
  }
  
  /**
   * Data for updating an existing contract
   */
  export interface ContractUpdateData extends Partial<ContractCreateData> {}
  
  //-----------------------------------------------------------------------------
  // Payment Schedule Types
  //-----------------------------------------------------------------------------
  
  /**
   * Payment schedule item from API
   */
  export interface PaymentScheduleItem {
    id: string;
    contractId: string;
    termNumber: number;
    dueDate: string;
    amount: number;
    description?: string;
    status: 'pending' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';
    paidDate?: string;
    paidAmount?: number;
    paymentMethod?: string;
  }
  
  /**
   * Data required to create a payment schedule item
   */
  export interface PaymentScheduleCreateData {
    termNumber: number;
    dueDate: string;
    amount: number;
    description?: string;
  }
  
  /**
   * Data for updating payment status
   */
  export interface PaymentStatusUpdateData {
    status: 'pending' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';
    actualAmount?: number;
    actualPaymentDate?: string;
    paymentMethod?: string;
    notes?: string;
  }
  
  //-----------------------------------------------------------------------------
  // Contract Files Types
  //-----------------------------------------------------------------------------
  
  /**
   * Contract file response from API
   */
  export interface ContractFileResponse {
    id: string;
    contractId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    fileCategory: 'contract' | 'invoice' | 'proposal' | 'attachment' | 'other';
    description?: string;
    uploadedBy: string;
    uploadedAt: string;
    downloadUrl: string;
  }
  
  //-----------------------------------------------------------------------------
  // Contract Employees Types
  //-----------------------------------------------------------------------------
  
  /**
   * Contract employee response from API
   */
  export interface ContractEmployeeResponse {
    id: string;
    contractId: string;
    employeeId: string;
    employeeName: string;
    position: string;
    startDate: string;
    endDate?: string;
    allocation: number;
    role: string;
  }
  
  /**
   * Data required to assign an employee to a contract
   */
  export interface ContractEmployeeCreateData {
    employeeId: string;
    startDate: string;
    endDate?: string;
    allocation: number;
    role?: string;
  }
  
  //-----------------------------------------------------------------------------
  // Import/Export Types
  //-----------------------------------------------------------------------------
  
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
      contractId: string;
      contractCode: string;
      termId: string;
      termNumber: number;
      status: string;
      previousStatus: string;
    }>;
  }
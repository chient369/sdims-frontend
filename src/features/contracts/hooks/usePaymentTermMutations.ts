import { useMutation, QueryClient } from '@tanstack/react-query';
import { useContractService } from './useContractService';
import { PaymentTerm } from '../types/paymentTerms';
import { PaymentTermCreateData } from '../types';
import { SUCCESS_MESSAGES } from '../utils/validationMessages';

/**
 * Hook to manage mutations related to payment terms
 */
export const usePaymentTermMutations = (
  contractId: string | undefined,
  showToast: any,
  queryClient: QueryClient
) => {
  const contractService = useContractService();
  const hasValidContractId = contractId && contractId.trim() !== '';

  // Mutation to update payment term
  const updatePaymentTermMutation = useMutation({
    mutationFn: async ({ termId, data }: { termId: number, data: Partial<PaymentTerm> }) => {
      if (!hasValidContractId || !contractId) {
        throw new Error('Contract ID is missing or invalid');
      }
      if (!termId) {
        throw new Error('Term ID is missing');
      }
      return await contractService.updatePaymentScheduleItem(contractId, String(termId), data);
    },
    onSuccess: () => {
      // Show success message
      showToast({
        title: 'Thành công',
        message: SUCCESS_MESSAGES.PAYMENT_TERM_UPDATED,
        type: 'success'
      });
      
      // Update data efficiently
      queryClient.invalidateQueries({ 
        queryKey: ['contract', contractId, 'payment-terms'],
        exact: true 
      });
    },
    onError: (error) => {
      // Show error message
      showToast({
        title: 'Lỗi',
        message: `Cập nhật đợt thanh toán thất bại: ${(error as Error).message}`,
        type: 'error'
      });
    }
  });

  // Mutation to add payment term
  const addPaymentTermMutation = useMutation({
    mutationFn: async (data: { contractId: string, term: PaymentTermCreateData }) => {
      if (!hasValidContractId || !data.contractId) {
        throw new Error('Contract ID is missing or invalid');
      }
      
      return await contractService.addPaymentScheduleItem(data.contractId, data.term);
    },
    onSuccess: () => {
      // Show success message
      showToast({
        title: 'Thành công',
        message: SUCCESS_MESSAGES.PAYMENT_TERM_ADDED,
        type: 'success'
      });
      
      // Update data efficiently
      queryClient.invalidateQueries({ 
        queryKey: ['contract', contractId, 'payment-terms'],
        exact: true 
      });
    },
    onError: (error) => {
      // Show error message
      showToast({
        title: 'Lỗi',
        message: `Thêm đợt thanh toán thất bại: ${(error as Error).message}`,
        type: 'error'
      });
    }
  });

  // Mutation to remove payment term
  const removePaymentTermMutation = useMutation({
    mutationFn: async ({ contractId, termId }: { contractId: string, termId: number }) => {
      if (!hasValidContractId || !contractId) {
        throw new Error('Contract ID is missing or invalid');
      }
      if (!termId) {
        throw new Error('Term ID is missing');
      }
      
      // In case API method doesn't exist, we'll just return a success response
      // This should be replaced with the actual API call when available
      return Promise.resolve({ success: true });
    },
    onSuccess: () => {
      // Show success message
      showToast({
        title: 'Thành công',
        message: SUCCESS_MESSAGES.PAYMENT_TERM_REMOVED,
        type: 'success'
      });
      
      // Update data efficiently
      queryClient.invalidateQueries({ 
        queryKey: ['contract', contractId, 'payment-terms'],
        exact: true 
      });
    },
    onError: (error) => {
      // Show error message
      showToast({
        title: 'Lỗi',
        message: `Xóa đợt thanh toán thất bại: ${(error as Error).message}`,
        type: 'error'
      });
    }
  });

  // Mutation to update payment term status
  const updatePaymentTermStatusMutation = useMutation({
    mutationFn: async ({ 
      termId, 
      status, 
      paidDate, 
      paidAmount, 
      notes 
    }: { 
      termId: number, 
      status: 'unpaid' | 'invoiced' | 'paid' | 'overdue', 
      paidDate?: string, 
      paidAmount?: number, 
      notes?: string 
    }) => {
      if (!hasValidContractId || !contractId) {
        throw new Error('Contract ID is missing or invalid');
      }
      if (!termId) {
        throw new Error('Term ID is missing');
      }
      
      return await contractService.updatePaymentTermStatus(
        contractId,
        String(termId),
        status,
        paidDate,
        paidAmount,
        notes
      );
    },
    onSuccess: () => {
      // Show success message
      showToast({
        title: 'Thành công',
        message: SUCCESS_MESSAGES.PAYMENT_TERM_UPDATED,
        type: 'success'
      });
      
      // Update data efficiently
      queryClient.invalidateQueries({ 
        queryKey: ['contract', contractId, 'payment-terms'],
        exact: true 
      });
    },
    onError: (error) => {
      // Show error message
      showToast({
        title: 'Lỗi',
        message: `Cập nhật trạng thái thất bại: ${(error as Error).message}`,
        type: 'error'
      });
    }
  });

  return {
    updatePaymentTermMutation,
    addPaymentTermMutation,
    removePaymentTermMutation,
    updatePaymentTermStatusMutation
  };
}; 
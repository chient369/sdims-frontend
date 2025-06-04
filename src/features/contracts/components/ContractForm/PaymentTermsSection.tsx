import React, { useState, useEffect, useCallback } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDownIcon, ChevronUpIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { formatCurrency, formatDate } from '../../../../utils/formatters';
import {
  PAYMENT_TERM_VALIDATION,
  BUSINESS_RULES,
  isValidDate,
  validateMinDateGap,
  hasDuplicateDates,
  calculatePercentage
} from '../../utils/validationConfig';
import { PAYMENT_TERMS_VALIDATION_MESSAGES, COMMON_VALIDATION_MESSAGES, SUCCESS_MESSAGES } from '../../utils/validationMessages';
import { useContractService } from '../../hooks/useContractService';
import { useToast } from '../../../../hooks/useToast';

// Components
import { EditTermModal } from '../../../../features/contracts/components/ContractForm/PaymentTermModals/EditTermModal';
import { ConfirmDeleteModal } from './PaymentTermModals/ConfirmDeleteModal';
import { PaymentTermsTable } from './PaymentTermsTable';

// Types
import { PaymentTerm } from '../../types/paymentTerms';

interface PaymentTermsSectionProps {
  mode: 'create' | 'edit';
  isLoading: boolean;
  contractId?: string;
  contractAmount: number;
}

/**
 * Payment terms section for contract form.
 * Allows adding, editing and removing payment terms with dynamic calculation of totals.
 */
export const PaymentTermsSection: React.FC<PaymentTermsSectionProps> = ({ 
  mode, 
  isLoading,
  contractId,
  contractAmount 
}) => {
  // State
  const [expanded, setExpanded] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTermIndex, setEditingTermIndex] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingTermIndex, setDeletingTermIndex] = useState<number | null>(null);
  
  // Hooks
  const { control, formState: { isSubmitted, touchedFields }, watch, setValue, getValues } = useFormContext();
  const contractService = useContractService();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  // Setup field array for payment terms
  const { fields, append, remove, update, replace } = useFieldArray({
    control,
    name: 'paymentTerms',
    keyName: 'fieldId'
  });
  
  // Tăng cường việc đồng bộ giữa fields và paymentTerms
  useEffect(() => {
    const currentPaymentTerms = getValues('paymentTerms');
    
    if (currentPaymentTerms && Array.isArray(currentPaymentTerms) && 
        JSON.stringify(currentPaymentTerms) !== JSON.stringify(fields)) {
      // Đảm bảo fields luôn phản ánh dữ liệu từ form
      replace(currentPaymentTerms);
    }
  }, [getValues, replace, fields]);

  // Check if contractId is valid in edit mode
  const hasValidContractId = mode === 'create' || (mode === 'edit' && contractId && contractId.trim() !== '');
  
  // Check if errors should be displayed
  const shouldShowErrors = isSubmitted || Object.keys(touchedFields).some(key => 
    key.startsWith('paymentTerms') && touchedFields[key as keyof typeof touchedFields]
  );
  
  // Watch form fields
  const paymentTerms = watch('paymentTerms') as PaymentTerm[];
  const contractStartDate = watch('startDate');
  const contractEndDate = watch('endDate');
  
  // Initialize empty payment terms array if needed
  useEffect(() => {
    if (mode === 'create' && (!getValues('paymentTerms') || !Array.isArray(getValues('paymentTerms')))) {
      setValue('paymentTerms', []);
    }
  }, [mode, setValue, getValues]);
  
  // Fetch payment terms if in edit mode
  const { data: paymentTermsApiData, isLoading: isPaymentTermsLoading } = useQuery({
    queryKey: ['contract', contractId, 'payment-terms'],
    queryFn: async () => {
      if (!hasValidContractId || !contractId) return [];
      
      try {
        // Gọi API lấy danh sách payment terms
        const response = await contractService.getPaymentSchedule(contractId);
        
        // Kiểm tra cấu trúc dữ liệu trả về
        if (response?.data && Array.isArray(response.data)) {
          return response.data;
        } else if (Array.isArray(response)) {
          return response;
        } else {
          return [];
        }
      } catch (error) {
        console.error('Error fetching payment terms:', error);
        return [];
      }
    },
    enabled: !!contractId && mode === 'edit',
    staleTime: 60000 // Cache trong 1 phút để tránh gọi lại quá nhiều
  });
  
  // Process API data when received
  useEffect(() => {
    // Chỉ thực hiện khi có dữ liệu API và đang ở chế độ edit
    if (mode === 'edit' && paymentTermsApiData && Array.isArray(paymentTermsApiData) && paymentTermsApiData.length > 0) {
      try {
        // Kiểm tra xem đã có dữ liệu trong form chưa
        const currentTerms = getValues('paymentTerms');
        const needsUpdate = !currentTerms || !Array.isArray(currentTerms) || currentTerms.length === 0;
        
        if (needsUpdate) {
          // Format payment terms từ API response
          const formattedTerms: PaymentTerm[] = paymentTermsApiData.map((term: any) => ({
            id: term.id,
            termNumber: Number(term.termNumber) || 0,
            description: term.description || '',
            dueDate: term.dueDate || new Date().toISOString().split('T')[0],
            amount: typeof term.amount === 'string' ? parseFloat(term.amount) : Number(term.amount) || 0,
            percentage: typeof term.percentage === 'string' ? parseFloat(term.percentage) : Number(term.percentage) || 0,
            status: (term.status || 'unpaid') as 'unpaid' | 'invoiced' | 'paid' | 'overdue',
            paidAmount: typeof term.paidAmount === 'string' ? parseFloat(term.paidAmount) : Number(term.paidAmount) || 0,
            paidDate: term.paidDate || null,
            notes: term.notes || ''
          }));
          
          // Ghi log để kiểm tra
          if (process.env.NODE_ENV === 'development') {
            console.log('Dữ liệu từ API:', paymentTermsApiData);
            console.log('Dữ liệu đã format:', formattedTerms);
          }
          
          // Cập nhật dữ liệu vào form
          setValue('paymentTerms', formattedTerms);
          
          // Đảm bảo fields cũng được cập nhật
          replace(formattedTerms);
        }
      } catch (error) {
        console.error('Error processing API data:', error);
      }
    }
  }, [paymentTermsApiData, mode, getValues, setValue, replace]); // Thêm replace vào dependencies

  // Validate payment terms
  useEffect(() => {
    const currentErrors: string[] = [];
    const currentWarnings: string[] = [];
    
    // Check if payment terms exist
    if (!paymentTerms || !Array.isArray(paymentTerms) || paymentTerms.length === 0) {
      setTotalAmount(0);
      setValidationErrors([]);
      setWarnings([]);
      return;
    }
    
    if (paymentTerms.length > 0 && contractAmount > 0) {
      // Calculate total amount
      const sum = paymentTerms.reduce((sum: number, term: PaymentTerm) => sum + (Number(term.amount) || 0), 0);
      setTotalAmount(sum);
      
      const totalPercentage = calculatePercentage(sum, contractAmount);
      
      // Validate total amount
      const allowableDifference = contractAmount * (BUSINESS_RULES.paymentTerms.totalAmountTolerance / 100);
      
      if (sum > contractAmount + allowableDifference) {
        currentErrors.push(PAYMENT_TERMS_VALIDATION_MESSAGES.TOTAL_EXCEEDS_CONTRACT);
      } else if (sum < contractAmount - allowableDifference) {
        const difference = formatCurrency(contractAmount - sum);
        currentErrors.push(PAYMENT_TERMS_VALIDATION_MESSAGES.TOTAL_LESS_THAN_CONTRACT(difference));
      }
      
      // Check if first payment is advance payment
      if (paymentTerms.length > 1 && 
          !(paymentTerms[0].description?.toLowerCase().includes('tạm ứng') || 
          paymentTerms[0].description?.toLowerCase().includes('advance') ||
          paymentTerms[0].description?.toLowerCase().includes('initial'))) {
        currentWarnings.push(PAYMENT_TERMS_VALIDATION_MESSAGES.FIRST_TERM_NOT_ADVANCE);
      }
      
      // Check percentage of first (advance) payment
      if (paymentTerms.length > 0 && paymentTerms[0].amount) {
        const firstPaymentPercentage = calculatePercentage(Number(paymentTerms[0].amount), contractAmount);
        if (firstPaymentPercentage > BUSINESS_RULES.paymentTerms.advancePaymentMaxPercentage) {
          currentErrors.push(PAYMENT_TERMS_VALIDATION_MESSAGES.TERM_ADVANCE_PERCENTAGE);
        }
      }
      
      // Check percentage of final payment
      if (paymentTerms.length > 1) {
        const lastPayment = paymentTerms[paymentTerms.length - 1];
        if (lastPayment.amount) {
          const lastPaymentPercentage = calculatePercentage(Number(lastPayment.amount), contractAmount);
          if (lastPaymentPercentage < BUSINESS_RULES.paymentTerms.finalPaymentMinPercentage) {
            currentWarnings.push(PAYMENT_TERMS_VALIDATION_MESSAGES.TERM_FINAL_PERCENTAGE_LOW);
          }
        }
      }
      
      // Check for duplicate due dates
      if (paymentTerms.length > 1) {
        const dueDates = paymentTerms.map((term: PaymentTerm) => term.dueDate).filter(Boolean);
        if (hasDuplicateDates(dueDates)) {
          currentErrors.push(PAYMENT_TERMS_VALIDATION_MESSAGES.TERM_DUPLICATE_DATE);
        }
        
        // Check minimum gap between due dates
        if (!validateMinDateGap(dueDates, BUSINESS_RULES.paymentTerms.minDueDateGap)) {
          currentWarnings.push(PAYMENT_TERMS_VALIDATION_MESSAGES.TERM_GAP_TOO_SMALL);
        }
      }
      
      // Check number of terms for high value contracts
      if (contractAmount > BUSINESS_RULES.paymentTerms.highValueThreshold && 
          paymentTerms.length < BUSINESS_RULES.paymentTerms.minTermsForHighValue) {
        currentWarnings.push(PAYMENT_TERMS_VALIDATION_MESSAGES.TOO_FEW_TERMS_HIGH_VALUE);
      }
      
      // Check if number of terms is too many
      if (paymentTerms.length > BUSINESS_RULES.paymentTerms.maxPaymentTerms) {
        currentWarnings.push(PAYMENT_TERMS_VALIDATION_MESSAGES.TOO_MANY_TERMS);
      }
      
      // Check if sum of percentages is exactly 100%
      if (Math.abs(totalPercentage - 100) > 0.1) { // Allow 0.1% tolerance
        currentErrors.push(PAYMENT_TERMS_VALIDATION_MESSAGES.PERCENTAGE_SUM_NOT_100(totalPercentage));
      }
    } else if (paymentTerms.length === 0 && contractAmount > 0) {
      currentErrors.push(PAYMENT_TERMS_VALIDATION_MESSAGES.NO_PAYMENT_TERMS);
    }
    
    setValidationErrors(currentErrors);
    setWarnings(currentWarnings);
  }, [paymentTerms, contractAmount, contractStartDate, contractEndDate]);

  // Validate individual payment term
  const validatePaymentTerm = (dueDateStr: string, amount: number, index: number): string[] => {
    const errors: string[] = [];
    
    if (!paymentTerms || !contractAmount) {
      return [];
    }
    
    // Validate due date
    if (dueDateStr) {
      const dueDate = new Date(dueDateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (!isValidDate(dueDateStr)) {
        errors.push(COMMON_VALIDATION_MESSAGES.INVALID_DATE);
      }
      
      // Check if due date is in the past (except for first term)
      if (index > 0 && dueDate < today && mode === 'create') {
        errors.push(PAYMENT_TERMS_VALIDATION_MESSAGES.TERM_DUE_DATE_PAST);
      }

      // Check if due date is before contract start date
      const startDate = watch('startDate');
      if (startDate && isValidDate(startDate) && new Date(dueDateStr) < new Date(startDate)) {
        errors.push(PAYMENT_TERMS_VALIDATION_MESSAGES.TERM_BEFORE_START_DATE);
      }

      // Check if due date is after contract end date
      const endDate = watch('endDate');
      if (endDate && isValidDate(endDate) && new Date(dueDateStr) > new Date(endDate)) {
        errors.push(PAYMENT_TERMS_VALIDATION_MESSAGES.TERM_AFTER_END_DATE);
      }
    }
    
    // Validate amount
    if (amount <= 0) {
      errors.push(PAYMENT_TERMS_VALIDATION_MESSAGES.TERM_AMOUNT_POSITIVE);
    } else if (amount < PAYMENT_TERM_VALIDATION.amount.min.value) {
      errors.push(PAYMENT_TERMS_VALIDATION_MESSAGES.TERM_AMOUNT_MIN);
    }
    
    // Validate percentage
    if (contractAmount > 0) {
      const percentage = calculatePercentage(amount, contractAmount);
      
      if (percentage < BUSINESS_RULES.paymentTerms.minPaymentPercentage) {
        errors.push(PAYMENT_TERMS_VALIDATION_MESSAGES.TERM_SMALL_PERCENTAGE(percentage));
      } else if (index === 0 && percentage > BUSINESS_RULES.paymentTerms.advancePaymentMaxPercentage) {
        errors.push(PAYMENT_TERMS_VALIDATION_MESSAGES.TERM_ADVANCE_PERCENTAGE);
      }
    }
    
    return errors;
  };

  // Add a new payment term
  const handleAddPaymentTerm = useCallback(() => {
    try {
      // Lấy dữ liệu hiện tại từ form
      const currentTerms = getValues('paymentTerms') || [];
      
      // Tính toán giá trị mặc định - 10% của tổng giá trị hợp đồng
      const defaultAmount = contractAmount > 0 ? Math.round(contractAmount * 0.1) : 0;
      const defaultPercentage = contractAmount > 0 ? 10 : 0;
      
      // Tính toán ngày dự kiến mặc định - 30 ngày từ hôm nay hoặc ngày bắt đầu hợp đồng
      let defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 30);
      
      const contractStartDate = watch('startDate');
      if (contractStartDate && isValidDate(contractStartDate)) {
        const startDate = new Date(contractStartDate);
        if (startDate > defaultDueDate) {
          defaultDueDate = new Date(startDate);
          defaultDueDate.setDate(defaultDueDate.getDate() + 30);
        }
      }
      
      // Kiểm tra số thứ tự của điều khoản tiếp theo
      const nextTermNumber = currentTerms.length > 0 
        ? Math.max(...currentTerms.map((term: any) => Number(term.termNumber) || 0)) + 1 
        : 1;
      
      // Tạo điều khoản thanh toán mới
      const newPaymentTerm: PaymentTerm = {
        termNumber: nextTermNumber,
        description: `Đợt ${nextTermNumber}`,
        dueDate: defaultDueDate.toISOString().split('T')[0],
        amount: defaultAmount,
        percentage: defaultPercentage,
        status: 'unpaid',
        paidAmount: 0,
        paidDate: null,
        notes: null
      };
      
      // Thêm vào danh sách trong form
      append(newPaymentTerm);
      
      // Tạo mảng mới cho paymentTerms và cập nhật vào form
      const updatedPaymentTerms = [...currentTerms, newPaymentTerm];
      setValue('paymentTerms', updatedPaymentTerms);
      
      // Hiển thị thông báo thành công
      showToast({
        title: 'Thành công',
        message: SUCCESS_MESSAGES.PAYMENT_TERM_ADDED,
        type: 'success'
      });
    } catch (error) {
      console.error('Lỗi khi thêm điều khoản thanh toán:', error);
      showToast({
        title: 'Lỗi',
        message: 'Không thể thêm điều khoản thanh toán',
        type: 'error'
      });
    }
  }, [append, contractAmount, getValues, setValue, showToast, watch]);

  // Open edit modal
  const handleOpenEditModal = useCallback((index: number) => {
    try {
      // Kiểm tra index hợp lệ
      if (index < 0 || index >= fields.length) {
        showToast({
          title: 'Lỗi',
          message: 'Không thể mở modal chỉnh sửa, vị trí không hợp lệ',
          type: 'error'
        });
        return;
      }
      
      // Nếu mọi thứ ok, mở modal
      setEditingTermIndex(index);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error('Error opening edit modal:', error);
      showToast({
        title: 'Lỗi',
        message: 'Không thể mở modal chỉnh sửa',
        type: 'error'
      });
    }
  }, [fields.length, showToast]);

  // Close edit modal
  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setEditingTermIndex(null);
  }, []);

  // Save edited payment term
  const handleSaveEditedTerm = useCallback((updatedTerm: PaymentTerm) => {
    if (editingTermIndex === null || editingTermIndex < 0 || editingTermIndex >= fields.length) {
      showToast({
        title: 'Lỗi',
        message: 'Không thể lưu, vị trí không hợp lệ',
        type: 'error'
      });
      return;
    }

    try {
      // Lấy dữ liệu hiện tại từ form
      const currentTerms = [...(getValues('paymentTerms') || [])];
      
      if (!Array.isArray(currentTerms) || editingTermIndex >= currentTerms.length) {
        showToast({
          title: 'Lỗi',
          message: 'Không thể lưu, dữ liệu trong form không hợp lệ',
          type: 'error'
        });
        return;
      }
      
      // Đảm bảo giá trị số được chuyển đổi đúng
      const termToUpdate: PaymentTerm = {
        ...updatedTerm,
        amount: Number(updatedTerm.amount) || 0,
        percentage: Number(updatedTerm.percentage) || 0,
        paidAmount: Number(updatedTerm.paidAmount) || 0,
        termNumber: Number(updatedTerm.termNumber) || 0
      };
      
      // Giữ lại ID nếu đã có
      const existingId = currentTerms[editingTermIndex]?.id;
      if (existingId && !termToUpdate.id) {
        termToUpdate.id = existingId;
      }
      
      // Cập nhật dữ liệu trong array
      currentTerms[editingTermIndex] = termToUpdate;
      
      // Cập nhật cả trong form và trong FieldArray
      setValue('paymentTerms', currentTerms);
      update(editingTermIndex, termToUpdate);
      
      // Hiển thị thông báo thành công
      showToast({
        title: 'Thành công',
        message: SUCCESS_MESSAGES.PAYMENT_TERM_UPDATED,
        type: 'success'
      });
      
      // Đóng modal
      handleCloseEditModal();
    } catch (error) {
      console.error('Error saving payment term:', error);
      showToast({
        title: 'Lỗi',
        message: 'Không thể lưu điều khoản thanh toán',
        type: 'error'
      });
    }
  }, [editingTermIndex, fields.length, getValues, handleCloseEditModal, setValue, showToast, update]);

  // Open delete confirmation modal
  const handleOpenDeleteModal = useCallback((index: number) => {
    setDeletingTermIndex(index);
    setIsDeleteModalOpen(true);
  }, []);

  // Close delete confirmation modal
  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setDeletingTermIndex(null);
  }, []);

  // Confirm delete payment term
  const confirmDeletePaymentTerm = useCallback(() => {
    if (deletingTermIndex === null || deletingTermIndex < 0 || deletingTermIndex >= fields.length) {
      showToast({
        title: 'Lỗi',
        message: 'Không thể xóa, vị trí không hợp lệ',
        type: 'error'
      });
      return;
    }

    try {
      // Lấy dữ liệu hiện tại từ form
      const currentTerms = [...(getValues('paymentTerms') || [])];
      
      if (!Array.isArray(currentTerms) || deletingTermIndex >= currentTerms.length) {
        showToast({
          title: 'Lỗi',
          message: 'Không thể xóa, dữ liệu trong form không hợp lệ',
          type: 'error'
        });
        return;
      }
      
      // Xóa item khỏi mảng
      currentTerms.splice(deletingTermIndex, 1);
      
      // Cập nhật lại form và fieldArray
      setValue('paymentTerms', currentTerms);
      remove(deletingTermIndex);
      
      // Đóng modal
      setIsDeleteModalOpen(false);
      setDeletingTermIndex(null);
      
      // Hiển thị thông báo thành công
      showToast({
        title: 'Thành công',
        message: SUCCESS_MESSAGES.PAYMENT_TERM_REMOVED,
        type: 'success'
      });
    } catch (error) {
      console.error('Error deleting payment term:', error);
      showToast({
        title: 'Lỗi',
        message: 'Không thể xóa điều khoản thanh toán',
        type: 'error'
      });
    }
  }, [deletingTermIndex, fields.length, getValues, remove, setValue, showToast]);

  // Update payment term status
  const handleUpdatePaymentTermStatus = useCallback((termId: number, status: 'unpaid' | 'invoiced' | 'paid' | 'overdue', paidDate?: string, paidAmount?: number, notes?: string) => {
    try {
      // Lấy danh sách hiện tại
      const currentTerms = [...(getValues('paymentTerms') || [])];
      
      if (!Array.isArray(currentTerms) || currentTerms.length === 0) {
        showToast({
          title: 'Lỗi',
          message: 'Không thể cập nhật trạng thái, dữ liệu không hợp lệ',
          type: 'error'
        });
        return;
      }
      
      // Tìm index của term cần cập nhật
      const termIndex = currentTerms.findIndex(term => {
        const termIdNumber = typeof term.id === 'string' ? parseInt(term.id, 10) : Number(term.id);
        const compareIdNumber = typeof termId === 'string' ? parseInt(termId as unknown as string, 10) : Number(termId);
        return termIdNumber === compareIdNumber;
      });
      
      if (termIndex === -1) {
        showToast({
          title: 'Lỗi',
          message: 'Không tìm thấy đợt thanh toán cần cập nhật',
          type: 'error'
        });
        return;
      }
      
      // Validate data before sending
      if (status === 'paid') {
        const errors = [];
        
        if (!paidDate) {
          errors.push('Vui lòng chọn ngày thanh toán');
        } else if (!isValidDate(paidDate)) {
          errors.push('Ngày thanh toán không hợp lệ');
        }
        
        if (!paidAmount) {
          errors.push('Vui lòng nhập số tiền đã thanh toán');
        } else if (paidAmount <= 0) {
          errors.push('Số tiền đã thanh toán phải lớn hơn 0');
        }
        
        if (errors.length > 0) {
          showToast({
            title: 'Lỗi',
            message: errors.join(', '),
            type: 'error'
          });
          return;
        }
      }
      
      // Tạo bản sao của term cần cập nhật
      const termToUpdate = { ...currentTerms[termIndex] };
      
      // Cập nhật trạng thái và các thông tin liên quan
      const updatedTerm = {
        ...termToUpdate,
        status: status as 'unpaid' | 'invoiced' | 'paid' | 'overdue',
        paidDate: status === 'paid' ? paidDate : null,
        paidAmount: status === 'paid' ? Number(paidAmount) : 0,
        notes: notes || termToUpdate.notes
      };
      
      // Cập nhật term trong mảng
      currentTerms[termIndex] = updatedTerm;
      
      // Cập nhật toàn bộ mảng vào form
      setValue('paymentTerms', currentTerms);
      
      // Tìm index tương ứng trong fields để cập nhật thông qua update
      const fieldIndex = fields.findIndex((field: any) => {
        const fieldId = typeof field.id === 'string' ? parseInt(field.id, 10) : Number(field.id);
        const compareId = typeof termId === 'string' ? parseInt(termId as unknown as string, 10) : Number(termId);
        return fieldId === compareId;
      });
      
      if (fieldIndex !== -1) {
        update(fieldIndex, updatedTerm);
      }
      
      // Hiển thị thông báo thành công
      showToast({
        title: 'Thành công',
        message: SUCCESS_MESSAGES.PAYMENT_TERM_UPDATED,
        type: 'success'
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái điều khoản thanh toán:', error);
      showToast({
        title: 'Lỗi',
        message: 'Đã xảy ra lỗi khi cập nhật trạng thái',
        type: 'error'
      });
    }
  }, [fields, getValues, setValue, showToast, update]);

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      {/* Section Header */}
      <div 
        className="px-4 py-5 sm:px-6 flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="text-lg leading-6 font-medium text-gray-900">Điều khoản thanh toán</h3>
        <button
          type="button"
          className="text-gray-400 hover:text-gray-500"
        >
          {expanded ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
        </button>
      </div>

      {/* Section Content */}
      {expanded && (
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Thêm các đợt thanh toán của hợp đồng. Tổng giá trị các đợt thanh toán nên bằng với giá trị hợp đồng.
            </p>
          </div>
            
          {/* Validation errors */}
          {shouldShowErrors && validationErrors.length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 my-2">
              <div className="flex items-start">
                <InformationCircleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">Lưu ý về điều khoản thanh toán</h3>
                  <ul className="mt-1 text-sm text-yellow-700 list-disc pl-5">
                    {validationErrors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Warnings */}
          {shouldShowErrors && warnings.length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 my-2">
              <div className="flex items-start">
                <InformationCircleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">Lưu ý</h3>
                  <ul className="mt-1 text-sm text-yellow-700 list-disc pl-5">
                    {warnings.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Payment Terms Table */}
          <PaymentTermsTable 
            fields={fields}
            totalAmount={totalAmount}
            contractAmount={contractAmount}
            isLoading={isLoading}
            mode={mode}
            onEdit={handleOpenEditModal}
            onDelete={handleOpenDeleteModal}
          />

          {/* Add Payment Term Button */}
          <div className="mt-4">
            <button
              type="button"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleAddPaymentTerm}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              Thêm đợt thanh toán
            </button>
          </div>

          {/* Edit Term Modal */}
          {isEditModalOpen && editingTermIndex !== null && fields[editingTermIndex] && (
            <EditTermModal
              isOpen={isEditModalOpen}
              onClose={handleCloseEditModal}
              term={{
                id: (fields[editingTermIndex] as any).id || undefined,
                termNumber: Number((fields[editingTermIndex] as any).termNumber) || 0,
                description: (fields[editingTermIndex] as any).description || '',
                dueDate: (fields[editingTermIndex] as any).dueDate || new Date().toISOString().split('T')[0],
                amount: typeof (fields[editingTermIndex] as any).amount === 'string' 
                  ? parseFloat((fields[editingTermIndex] as any).amount) 
                  : Number((fields[editingTermIndex] as any).amount) || 0,
                percentage: typeof (fields[editingTermIndex] as any).percentage === 'string'
                  ? parseFloat((fields[editingTermIndex] as any).percentage)
                  : Number((fields[editingTermIndex] as any).percentage) || 0,
                status: (fields[editingTermIndex] as any).status || 'unpaid',
                paidAmount: typeof (fields[editingTermIndex] as any).paidAmount === 'string'
                  ? parseFloat((fields[editingTermIndex] as any).paidAmount)
                  : Number((fields[editingTermIndex] as any).paidAmount) || 0,
                paidDate: (fields[editingTermIndex] as any).paidDate || null,
                notes: (fields[editingTermIndex] as any).notes || ''
              }}
              onSave={handleSaveEditedTerm}
              contractAmount={contractAmount}
              onUpdateStatus={handleUpdatePaymentTermStatus}
            />
          )}

          {/* Delete Confirmation Modal */}
          {isDeleteModalOpen && deletingTermIndex !== null && fields[deletingTermIndex] && (
            <ConfirmDeleteModal
              isOpen={isDeleteModalOpen}
              onClose={handleCloseDeleteModal}
              onConfirm={confirmDeletePaymentTerm}
              termDescription={(fields[deletingTermIndex] as unknown as PaymentTerm).description || `Đợt ${deletingTermIndex + 1}`}
            />
          )}
        </div>
      )}
    </div>
  );
}; 
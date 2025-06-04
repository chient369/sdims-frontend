import React, { useState, useEffect, useCallback, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '../../../../../utils/formatters';
import { PaymentTerm } from '../../../types/paymentTerms';
import { PAYMENT_TERMS_VALIDATION_MESSAGES, COMMON_VALIDATION_MESSAGES } from '../../../utils/validationMessages';
import { isValidDate } from '../../../utils/validationConfig';

interface EditTermModalProps {
  isOpen: boolean;
  onClose: () => void;
  term: PaymentTerm | null;
  onSave: (term: PaymentTerm) => void;
  contractAmount: number;
  onUpdateStatus?: (termId: number, status: 'unpaid' | 'invoiced' | 'paid' | 'overdue', paidDate?: string, paidAmount?: number, notes?: string) => void;
}

/**
 * Modal for editing payment terms
 */
export const EditTermModal: React.FC<EditTermModalProps> = ({ 
  isOpen, 
  onClose, 
  term, 
  onSave, 
  contractAmount,
  onUpdateStatus 
}) => {
  // Primary state
  const [editedTerm, setEditedTerm] = useState<PaymentTerm | null>(null);
  // UI state
  const [percentage, setPercentage] = useState<number | string>('');
  const [showStatusSection, setShowStatusSection] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Use refs to track initialization and prevent excessive re-renders
  const isInitialized = useRef(false);
  const termIdRef = useRef<number | undefined>(undefined);

  // Process incoming term to ensure valid data types
  const processTermData = useCallback((data: PaymentTerm): PaymentTerm => {
    // Only log once during development
    if (process.env.NODE_ENV === 'development') {
      console.log('Processing term data', { id: data.id, amount: data.amount });
    }
    
    try {
      // Đảm bảo tất cả các trường số có giá trị hợp lệ
      let termId: number | undefined = undefined;
      if (data.id !== undefined && data.id !== null) {
        termId = typeof data.id === 'string' ? parseInt(data.id, 10) : Number(data.id);
        if (isNaN(termId)) termId = undefined;
      }
      
      let amount = 0;
      if (data.amount !== undefined && data.amount !== null) {
        amount = typeof data.amount === 'string' ? parseFloat(data.amount) : Number(data.amount);
        if (isNaN(amount)) amount = 0;
      }
      
      let percentage = 0;
      if (data.percentage !== undefined && data.percentage !== null) {
        percentage = typeof data.percentage === 'string' ? parseFloat(data.percentage) : Number(data.percentage);
        if (isNaN(percentage)) percentage = 0;
      }
      
      let paidAmount = 0;
      if (data.paidAmount !== undefined && data.paidAmount !== null) {
        paidAmount = typeof data.paidAmount === 'string' ? parseFloat(data.paidAmount) : Number(data.paidAmount);
        if (isNaN(paidAmount)) paidAmount = 0;
      }
      
      let termNumber = 0;
      if (data.termNumber !== undefined && data.termNumber !== null) {
        termNumber = typeof data.termNumber === 'string' ? parseInt(data.termNumber, 10) : Number(data.termNumber);
        if (isNaN(termNumber)) termNumber = 0;
      }
      
      // Tính lại percentage nếu chưa có giá trị nhưng amount và contractAmount hợp lệ
      if (percentage === 0 && amount > 0 && contractAmount > 0) {
        percentage = (amount / contractAmount) * 100;
      }
      
      // Đảm bảo các trường text có giá trị mặc định
      return {
        id: termId,
        termNumber: termNumber,
        description: data.description || '',
        dueDate: data.dueDate || new Date().toISOString().split('T')[0],
        amount: amount,
        percentage: percentage,
        status: data.status || 'unpaid',
        paidAmount: paidAmount,
        paidDate: data.paidDate || null,
        notes: data.notes || ''
      };
    } catch (error) {
      console.error('Error processing term data:', error);
      // Trả về giá trị mặc định nếu xảy ra lỗi
      return {
        id: data.id,
        termNumber: 0,
        description: data.description || '',
        dueDate: new Date().toISOString().split('T')[0],
        amount: 0,
        percentage: 0,
        status: 'unpaid',
        paidAmount: 0,
        paidDate: null,
        notes: ''
      };
    }
  }, [contractAmount]);

  // Initialize values when term changes or modal opens
  useEffect(() => {
    if (term && isOpen) {
      try {
        // Check if we're getting the same term (by ID) to prevent unnecessary re-initialization
        const termId = typeof term.id === 'string' ? parseInt(term.id, 10) : term.id;
        
        if (!isInitialized.current || termId !== termIdRef.current) {
          const processedTerm = processTermData(term);
          
          // Only log once during initialization
          if (process.env.NODE_ENV === 'development') {
            console.log('Initializing edited term:', processedTerm);
          }
          
          setEditedTerm(processedTerm);
          
          // Đảm bảo set percentage đúng
          const calculatedPercentage = 
            typeof processedTerm.percentage === 'number' && !isNaN(processedTerm.percentage) 
              ? processedTerm.percentage 
              : (contractAmount > 0 && typeof processedTerm.amount === 'number' && !isNaN(processedTerm.amount)) 
                ? (processedTerm.amount / contractAmount * 100) 
                : 0;
          
          setPercentage(calculatedPercentage);
          setShowStatusSection(processedTerm.status === 'paid');
          
          // Mark as initialized and store the current term ID
          isInitialized.current = true;
          termIdRef.current = termId;
        }
      } catch (error) {
        console.error('Error initializing term data:', error);
        
        // Set safe default values in case of error
        setEditedTerm({
          id: term.id,
          termNumber: 0,
          description: '',
          dueDate: new Date().toISOString().split('T')[0],
          amount: 0,
          percentage: 0,
          status: 'unpaid',
          paidAmount: 0,
          paidDate: null,
          notes: ''
        });
        setPercentage(0);
        setShowStatusSection(false);
      }
    }
  }, [term, isOpen, processTermData, contractAmount]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setValidationErrors([]);
      isInitialized.current = false; // Reset initialization flag when modal closes
    }
  }, [isOpen]);

  // If no term or modal is not displayed, return null
  if (!isOpen || !editedTerm) {
    return null;
  }

  // Validate the form data
  const validateForm = (): boolean => {
    const errors: string[] = [];
    
    // Check description
    if (!editedTerm.description || editedTerm.description.trim() === '') {
      errors.push(PAYMENT_TERMS_VALIDATION_MESSAGES.TERM_DESCRIPTION_REQUIRED);
    }
    
    // Check due date
    if (!editedTerm.dueDate) {
      errors.push(PAYMENT_TERMS_VALIDATION_MESSAGES.TERM_DUE_DATE_REQUIRED);
    } else if (!isValidDate(editedTerm.dueDate)) {
      errors.push(COMMON_VALIDATION_MESSAGES.INVALID_DATE);
    }
    
    // Check amount
    if (editedTerm.amount === undefined || editedTerm.amount === null || isNaN(Number(editedTerm.amount))) {
      errors.push(PAYMENT_TERMS_VALIDATION_MESSAGES.TERM_AMOUNT_REQUIRED);
    } else if (Number(editedTerm.amount) <= 0) {
      errors.push(PAYMENT_TERMS_VALIDATION_MESSAGES.TERM_AMOUNT_POSITIVE);
    }
    
    // If status is paid, check payment information
    if (editedTerm.status === 'paid') {
      if (!editedTerm.paidDate) {
        errors.push('Vui lòng chọn ngày thanh toán');
      }
      
      if (editedTerm.paidAmount === undefined || editedTerm.paidAmount === null || Number(editedTerm.paidAmount) <= 0) {
        errors.push('Số tiền đã thanh toán phải lớn hơn 0');
      }
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Generic input handler for text, date, and textarea fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Input change: ${name} = ${value}`);
    }
    
    setEditedTerm(prev => {
      if (!prev) return prev;
      
      // For all inputs, just store the raw value
      return { ...prev, [name]: value };
    });
  };

  // Specific handler for amount field - updates percentage automatically
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Don't log during production to reduce console noise
    if (process.env.NODE_ENV === 'development') {
      console.log(`Amount change: ${value}`);
    }
    
    // Update the amount field with raw input value
    setEditedTerm(prev => {
      if (!prev) return prev;
      
      // Calculate percentage only if amount is a valid number
      const amount = parseFloat(value);
      if (!isNaN(amount) && contractAmount > 0) {
        const newPercentage = (amount / contractAmount * 100).toFixed(2);
        setPercentage(parseFloat(newPercentage));
        return { 
          ...prev, 
          amount: amount,
          percentage: parseFloat(newPercentage)
        };
      }
      
      // If amount is not valid, just update the amount field
      return { ...prev, amount: value };
    });
  };

  // Specific handler for percentage field - updates amount automatically
  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Percentage change: ${value}`);
    }
    
    // Always update the percentage input value
    setPercentage(value);
    
    // Update editedTerm state
    setEditedTerm(prev => {
      if (!prev) return prev;
      
      // Calculate amount only if percentage is a valid number
      const newPercentage = parseFloat(value);
      if (!isNaN(newPercentage) && contractAmount > 0) {
        const amount = (newPercentage / 100) * contractAmount;
        
        return { 
          ...prev, 
          percentage: newPercentage,
          amount: amount
        };
      }
      
      // If percentage is not valid, just update the percentage field
      return { ...prev, percentage: value };
    });
  };

  // Handler for status dropdown
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as 'unpaid' | 'invoiced' | 'paid' | 'overdue';
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Status change: ${newStatus}`);
    }
    
    // Update status and show/hide paid fields
    setShowStatusSection(newStatus === 'paid');
    
    setEditedTerm(prev => {
      if (!prev) return prev;
      
      // Reset paid fields if changing from paid to another status
      if (prev.status === 'paid' && newStatus !== 'paid') {
        return { 
          ...prev, 
          status: newStatus,
          paidAmount: 0,
          paidDate: null 
        };
      }
      
      return { ...prev, status: newStatus };
    });
  };

  // Submit for status update
  const handleUpdateStatus = () => {
    if (!validateForm()) return;
    
    if (editedTerm && editedTerm.id && onUpdateStatus) {
      // Ensure termId is a number
      const termId = typeof editedTerm.id === 'string' ? parseInt(editedTerm.id, 10) : editedTerm.id;
      
      if (isNaN(termId)) {
        console.error('Invalid term ID:', editedTerm.id);
        return;
      }
      
      // Ensure amount and paidAmount are numbers
      const amount = typeof editedTerm.amount === 'string' ? parseFloat(editedTerm.amount) : editedTerm.amount;
      const paidAmount = typeof editedTerm.paidAmount === 'string' ? parseFloat(editedTerm.paidAmount) : editedTerm.paidAmount;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Updating status:', {
          termId,
          status: editedTerm.status,
          paidDate: editedTerm.paidDate,
          paidAmount,
          notes: editedTerm.notes
        });
      }
      
      onUpdateStatus(
        termId,
        editedTerm.status,
        editedTerm.paidDate || undefined,
        paidAmount as number,
        editedTerm.notes || undefined
      );
      onClose();
    }
  };

  // Main submit handler
  const handleSubmit = () => {
    if (!validateForm()) return;
    
    if (editedTerm) {
      try {
        // Convert string inputs to numbers before saving
        const amount = typeof editedTerm.amount === 'string' ? parseFloat(editedTerm.amount) : editedTerm.amount;
        const percentage = typeof editedTerm.percentage === 'string' ? parseFloat(editedTerm.percentage) : editedTerm.percentage;
        const paidAmount = typeof editedTerm.paidAmount === 'string' ? parseFloat(editedTerm.paidAmount) : editedTerm.paidAmount;
        const termNumber = typeof editedTerm.termNumber === 'string' ? parseInt(editedTerm.termNumber, 10) : editedTerm.termNumber;
        
        // Ensure all numeric values are correctly typed before saving
        const finalTerm: PaymentTerm = {
          ...editedTerm,
          amount: isNaN(Number(amount)) ? 0 : Number(amount),
          percentage: isNaN(Number(percentage)) ? 0 : Number(percentage),
          paidAmount: isNaN(Number(paidAmount)) ? 0 : Number(paidAmount),
          termNumber: isNaN(Number(termNumber)) ? 0 : Number(termNumber)
        };
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Saving term:', finalTerm);
        }
        
        onSave(finalTerm);
      } catch (error) {
        console.error('Error saving payment term:', error);
        // Vẫn lưu dữ liệu với giá trị mặc định nếu xử lý số gặp lỗi
        onSave({
          ...editedTerm,
          amount: 0,
          percentage: 0,
          paidAmount: 0,
          termNumber: 0
        });
      }
    }
  };

  // Format for display only, but use actual value for the input
  const displayAmount = typeof editedTerm.amount === 'number' && editedTerm.amount > 0 
    ? formatCurrency(editedTerm.amount) 
    : '';
  
  const displayPaidAmount = typeof editedTerm.paidAmount === 'number' && editedTerm.paidAmount > 0 
    ? formatCurrency(editedTerm.paidAmount) 
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium">Chỉnh sửa đợt thanh toán</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        {validationErrors.length > 0 && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Vui lòng sửa các lỗi sau:</h3>
                <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Mô tả đợt thanh toán</label>
            <input
              type="text"
              name="description"
              value={editedTerm.description || ''}
              onChange={handleInputChange}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Ngày dự kiến thu</label>
            <input
              type="date"
              name="dueDate"
              value={editedTerm.dueDate || ''}
              onChange={handleInputChange}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Số tiền</label>
            <input
              type="text"
              name="amount"
              value={editedTerm.amount === 0 ? '' : editedTerm.amount}
              onChange={handleAmountChange}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              required
              min="0"
              step="any"
            />
            {displayAmount && (
              <p className="mt-1 text-xs text-gray-500">
                {displayAmount}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Phần trăm</label>
            <input
              type="text"
              name="percentage"
              value={percentage === 0 ? '' : percentage}
              onChange={handlePercentageChange}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              min="0"
              max="100"
              step="0.01"
            />
            {percentage && !isNaN(Number(percentage)) && (
              <p className="mt-1 text-xs text-gray-500">
                {percentage}% của giá trị hợp đồng
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
            <select
              name="status"
              value={editedTerm.status}
              onChange={handleStatusChange}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            >
              <option value="unpaid">Chưa thanh toán</option>
              <option value="invoiced">Đã xuất hóa đơn</option>
              <option value="paid">Đã thanh toán</option>
              <option value="overdue">Quá hạn</option>
            </select>
          </div>
          
          {/* Additional information for paid status */}
          {showStatusSection && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ngày thanh toán</label>
                <input
                  type="date"
                  name="paidDate"
                  value={editedTerm.paidDate || ''}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Số tiền đã thanh toán</label>
                <input
                  type="text"
                  name="paidAmount"
                  value={editedTerm.paidAmount === 0 ? '' : editedTerm.paidAmount}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  min="0"
                  step="any"
                />
                {displayPaidAmount && (
                  <p className="mt-1 text-xs text-gray-500">
                    {displayPaidAmount}
                  </p>
                )}
              </div>
            </>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
            <textarea
              name="notes"
              value={editedTerm.notes || ''}
              onChange={handleInputChange}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-3 border-t">
            {editedTerm.id && onUpdateStatus && editedTerm.status !== 'unpaid' && (
              <button
                type="button"
                onClick={handleUpdateStatus}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
              >
                Cập nhật trạng thái
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
            >
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 
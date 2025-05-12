import React, { useState, useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDownIcon, ChevronUpIcon, TrashIcon, PlusCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { formatCurrency, formatDate } from '../../../../utils/formatters';
import {
  PAYMENT_TERM_VALIDATION,
  BUSINESS_RULES,
  isValidDate,
  validateMinDateGap,
  hasDuplicateDates,
  hasDuplicateValues,
  calculatePercentage
} from '../../utils/validationConfig';
import { PAYMENT_TERMS_VALIDATION_MESSAGES, COMMON_VALIDATION_MESSAGES, WARNING_MESSAGES } from '../../utils/validationMessages';
import { useContractService } from '../../hooks/useContractService';

interface PaymentTermsSectionProps {
  mode: 'create' | 'edit';
  isLoading: boolean;
  contractId?: string;
  contractAmount: number;
}

interface MockPaymentTerm {
  id: number;
  termNumber: number;
  description: string;
  dueDate: string;
  amount: number;
  status: string;
  paidAmount?: number;
}

interface PaymentTerm {
  id?: string;
  termNumber: number;
  description: string;
  dueDate: string;
  amount: number;
  status: 'unpaid' | 'invoiced' | 'paid' | 'overdue';
  paidAmount: number;
}

interface PaymentTermCreateData {
  termNumber: number;
  description: string;
  dueDate: string;
  amount: number;
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
  const [expanded, setExpanded] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const { control, register, formState: { errors, isSubmitted, touchedFields }, watch, setValue, getValues } = useFormContext();
  const contractService = useContractService();
  const queryClient = useQueryClient();
  
  // Kiểm tra xem có nên hiển thị lỗi không (form đã submit hoặc một số trường đã được chạm vào)
  const shouldShowErrors = isSubmitted || Object.keys(touchedFields).some(key => 
    key.startsWith('paymentTerms') && touchedFields[key as keyof typeof touchedFields]
  );
  
  // Setup field array for payment terms
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'paymentTerms',
  });

  // Track payment terms for calculations
  const paymentTerms = watch('paymentTerms') as PaymentTerm[];
  const contractStartDate = watch('startDate');
  const contractEndDate = watch('endDate');
  
  // Fetch payment terms if in edit mode
  const { data: paymentTermsData } = useQuery<MockPaymentTerm[]>({
    queryKey: ['contract', contractId, 'payment-terms'],
    queryFn: async () => {
      if (!contractId) return [];
      
      // Mock API call
      return Promise.resolve([
        {
          id: 1,
          termNumber: 1,
          description: 'Tạm ứng',
          dueDate: '2023-02-01',
          amount: 50000000,
          status: 'paid',
          paidAmount: 50000000
        },
        {
          id: 2,
          termNumber: 2,
          description: 'Nghiệm thu giai đoạn 1',
          dueDate: '2023-03-15',
          amount: 75000000,
          status: 'unpaid'
        },
        {
          id: 3,
          termNumber: 3,
          description: 'Nghiệm thu giai đoạn 2',
          dueDate: '2023-04-30',
          amount: 75000000,
          status: 'unpaid'
        }
      ]);
    },
    enabled: !!contractId && mode === 'edit'
  });
  
  // Xử lý dữ liệu payment terms
  useEffect(() => {
    if (paymentTermsData && paymentTermsData.length > 0) {
      // Clear existing terms first
      setValue('paymentTerms', []);
      
      // Add each term
      paymentTermsData.forEach(term => {
        append({
          termNumber: term.termNumber,
          description: term.description || '',
          dueDate: term.dueDate,
          amount: term.amount,
          status: term.status,
          paidAmount: term.paidAmount,
          id: term.id
        });
      });
    }
  }, [paymentTermsData, append, setValue]);

  // Add payment term mutation
  const addPaymentTermMutation = useMutation({
    mutationFn: async (data: { contractId: string, term: PaymentTermCreateData }) => {
      // Mock API call
      return Promise.resolve({
        id: Math.floor(Math.random() * 1000),
        ...data.term,
        status: 'unpaid'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract', contractId, 'payment-terms'] });
    }
  });

  // Validate payment terms
  useEffect(() => {
    const currentErrors: string[] = [];
    const currentWarnings: string[] = [];
    
    if (paymentTerms && paymentTerms.length > 0 && contractAmount) {
      // Calculate total amount
      const totalAmount = paymentTerms.reduce((sum: number, term: PaymentTerm) => sum + (Number(term.amount) || 0), 0);
      const totalPercentage = calculatePercentage(totalAmount, contractAmount);
      
      // Validate total amount
      const allowableDifference = contractAmount * (BUSINESS_RULES.paymentTerms.totalAmountTolerance / 100);
      
      if (totalAmount > contractAmount + allowableDifference) {
        currentErrors.push(PAYMENT_TERMS_VALIDATION_MESSAGES.TOTAL_EXCEEDS_CONTRACT);
      } else if (totalAmount < contractAmount - allowableDifference) {
        const difference = formatCurrency(contractAmount - totalAmount);
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
    } else if (paymentTerms && paymentTerms.length === 0 && contractAmount > 0) {
      currentErrors.push(PAYMENT_TERMS_VALIDATION_MESSAGES.NO_PAYMENT_TERMS);
    }
    
    setValidationErrors(currentErrors);
    setWarnings(currentWarnings);
  }, [paymentTerms, contractAmount, contractStartDate, contractEndDate]);

  // Validate payment term
  const validatePaymentTerm = (dueDateStr: string, amount: number, index: number): string[] => {
    const errors: string[] = [];
    
    // Kiểm tra ngày thanh toán hợp lệ
    if (dueDateStr) {
      const dueDate = new Date(dueDateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (!isValidDate(dueDateStr)) {
        errors.push(COMMON_VALIDATION_MESSAGES.INVALID_DATE);
      }
      
      // Kiểm tra ngày thanh toán không nằm quá khứ (trừ đợt đầu tiên)
      if (index > 0 && dueDate < today && mode === 'create') {
        errors.push(PAYMENT_TERMS_VALIDATION_MESSAGES.TERM_DUE_DATE_PAST);
      }
    }
    
    // Kiểm tra số tiền hợp lệ
    if (amount <= 0) {
      errors.push(PAYMENT_TERMS_VALIDATION_MESSAGES.TERM_AMOUNT_POSITIVE);
    } else if (amount < PAYMENT_TERM_VALIDATION.amount.min.value) {
      errors.push(PAYMENT_TERMS_VALIDATION_MESSAGES.TERM_AMOUNT_MIN);
    }
    
    // Kiểm tra tỷ lệ phần trăm hợp lý
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
  const handleAddPaymentTerm = () => {
    append({
      termNumber: fields.length + 1,
      description: `Đợt ${fields.length + 1}`,
      dueDate: new Date().toISOString().split('T')[0],
      amount: 0,
      status: 'unpaid'
    });
  };

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

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    STT
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mô tả đợt thanh toán
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày dự kiến thu
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số tiền
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ghi chú
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Hành động</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fields.map((field, index) => {
                  // Thực hiện validate cho từng đợt thanh toán
                  const termErrors = validatePaymentTerm(
                    paymentTerms[index]?.dueDate || '',
                    Number(paymentTerms[index]?.amount) || 0,
                    index
                  );
                  
                  return (
                    <tr key={field.id} className={termErrors.length ? 'bg-red-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          disabled={isLoading}
                          className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                            isLoading ? 'bg-gray-100' : ''
                          }`}
                          {...register(`paymentTerms.${index}.description` as const, {
                            required: PAYMENT_TERM_VALIDATION.description.required,
                            minLength: PAYMENT_TERM_VALIDATION.description.minLength,
                            maxLength: PAYMENT_TERM_VALIDATION.description.maxLength
                          })}
                        />
                        {errors.paymentTerms && (errors.paymentTerms as any)[index] && (errors.paymentTerms as any)[index]?.description && (
                          <p className="mt-1 text-sm text-red-600">
                            {(errors.paymentTerms as any)[index]?.description?.message}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="date"
                          disabled={isLoading}
                          className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                            isLoading ? 'bg-gray-100' : ''
                          }`}
                          {...register(`paymentTerms.${index}.dueDate` as const, {
                            required: PAYMENT_TERM_VALIDATION.dueDate.required
                          })}
                        />
                        {errors.paymentTerms && (errors.paymentTerms as any)[index] && (errors.paymentTerms as any)[index]?.dueDate && (
                          <p className="mt-1 text-sm text-red-600">
                            {(errors.paymentTerms as any)[index]?.dueDate?.message}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          disabled={isLoading}
                          className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                            isLoading ? 'bg-gray-100' : ''
                          }`}
                          {...register(`paymentTerms.${index}.amount` as const, {
                            required: PAYMENT_TERM_VALIDATION.amount.required,
                            valueAsNumber: PAYMENT_TERM_VALIDATION.amount.valueAsNumber,
                            min: {
                              value: PAYMENT_TERM_VALIDATION.amount.min.value,
                              message: PAYMENT_TERM_VALIDATION.amount.min.message
                            },
                            max: {
                              value: contractAmount * 1.2, // Cho phép một chút dung sai
                              message: `Số tiền không được vượt quá ${formatCurrency(contractAmount * 1.2)}`
                            }
                          })}
                        />
                        {errors.paymentTerms && (errors.paymentTerms as any)[index] && (errors.paymentTerms as any)[index]?.amount && (
                          <p className="mt-1 text-sm text-red-600">
                            {(errors.paymentTerms as any)[index]?.amount?.message}
                          </p>
                        )}
                        {termErrors.length > 0 && (
                          <div className="mt-1">
                            {termErrors.map((error, idx) => (
                              <p key={idx} className="text-xs text-red-600">{error}</p>
                            ))}
                          </div>
                        )}
                        {paymentTerms[index]?.amount > 0 && (
                          <p className="mt-1 text-xs text-gray-500">
                            {formatCurrency(paymentTerms[index].amount)}
                            {contractAmount > 0 && (
                              <span className="ml-1">
                                ({calculatePercentage(paymentTerms[index].amount, contractAmount)}%)
                              </span>
                            )}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          disabled={isLoading}
                          className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                            isLoading ? 'bg-gray-100' : ''
                          }`}
                          placeholder="Ghi chú (không bắt buộc)"
                          {...register(`paymentTerms.${index}.notes` as const, {
                            maxLength: PAYMENT_TERM_VALIDATION.notes?.maxLength
                          })}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          disabled={isLoading}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => remove(index)}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                
                {/* Total row */}
                <tr className="bg-gray-50">
                  <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                    Tổng:
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(totalAmount)}
                    {contractAmount > 0 && (
                      <span className="ml-1 text-xs text-gray-500">
                        ({calculatePercentage(totalAmount, contractAmount)}% giá trị hợp đồng)
                      </span>
                    )}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Add Payment Term Button */}
          <div className="mt-4">
            <button
              type="button"
              disabled={isLoading}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleAddPaymentTerm}
            >
              <PlusCircleIcon className="h-5 w-5 mr-1" />
              Thêm đợt thanh toán
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 
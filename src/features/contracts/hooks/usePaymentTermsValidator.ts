import { useState, useEffect } from 'react';
import { PaymentTerm } from '../types/paymentTerms';
import {
  PAYMENT_TERM_VALIDATION,
  BUSINESS_RULES,
  isValidDate,
  validateMinDateGap,
  hasDuplicateDates,
  calculatePercentage
} from '../utils/validationConfig';
import { PAYMENT_TERMS_VALIDATION_MESSAGES, COMMON_VALIDATION_MESSAGES } from '../utils/validationMessages';
import { formatCurrency } from '../../../utils/formatters';

/**
 * Custom hook for validating payment terms
 */
export const usePaymentTermsValidator = (
  paymentTerms: PaymentTerm[] | undefined,
  contractAmount: number,
  contractStartDate?: string,
  contractEndDate?: string,
  mode: 'create' | 'edit' = 'create'
) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);

  // Validate payment terms whenever they change
  useEffect(() => {
    const currentErrors: string[] = [];
    const currentWarnings: string[] = [];
    
    // Check if payment terms exist
    if (!paymentTerms || !Array.isArray(paymentTerms) || paymentTerms.length === 0) {
      setTotalAmount(0);
      setErrors([]);
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
    
    setErrors(currentErrors);
    setWarnings(currentWarnings);
  }, [paymentTerms, contractAmount, contractStartDate, contractEndDate]);

  /**
   * Validate an individual payment term
   */
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
      if (contractStartDate && isValidDate(contractStartDate) && dueDate < new Date(contractStartDate)) {
        errors.push(PAYMENT_TERMS_VALIDATION_MESSAGES.TERM_BEFORE_START_DATE);
      }

      // Check if due date is after contract end date
      if (contractEndDate && isValidDate(contractEndDate) && dueDate > new Date(contractEndDate)) {
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

  return {
    errors,
    warnings,
    totalAmount,
    validatePaymentTerm
  };
}; 
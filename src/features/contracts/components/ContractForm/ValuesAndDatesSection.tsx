import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { ChevronDownIcon, ChevronUpIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { formatCurrency, formatDate } from '../../../../utils/formatters';
import { 
  CONTRACT_AMOUNT_VALIDATION,
  DATE_VALIDATION,
  isValidDate,
  isDateAfter,
  BUSINESS_RULES
} from '../../utils/validationConfig';
import { VALUE_DATES_VALIDATION_MESSAGES, WARNING_MESSAGES, COMMON_VALIDATION_MESSAGES } from '../../utils/validationMessages';

interface ValuesAndDatesSectionProps {
  mode: 'create' | 'edit';
  isLoading: boolean;
}

/**
 * Values and dates section for contract form.
 * Includes fields for contract amount, currency, sign date, effective date, and expiry date.
 */
export const ValuesAndDatesSection: React.FC<ValuesAndDatesSectionProps> = ({ mode, isLoading }) => {
  const [expanded, setExpanded] = useState(true);
  const [dateValidationErrors, setDateValidationErrors] = useState<string[]>([]);
  const [dateWarnings, setDateWarnings] = useState<string[]>([]);
  const { register, formState: { errors, isSubmitted, touchedFields }, watch, setValue, trigger } = useFormContext();

  // Watch date fields for validation
  const signDate = watch('signDate');
  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const amount = watch('amount');

  // Kiểm tra xem có nên hiển thị lỗi không (nếu đã submit hoặc các trường đã được chạm vào)
  const shouldShowError = isSubmitted || (touchedFields.amount || touchedFields.signDate || touchedFields.startDate || touchedFields.endDate);

  // Currency options
  const currencies = [
    { value: 'VND', label: 'VND - Việt Nam Đồng' },
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'JPY', label: 'JPY - Japanese Yen' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'SGD', label: 'SGD - Singapore Dollar' },
  ];

  // Validate date constraints
  useEffect(() => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (signDate && startDate && endDate) {
      const signDateObj = new Date(signDate);
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      
      // Ngày ký phải trước hoặc là ngày hiệu lực
      if (signDateObj > startDateObj) {
        errors.push(VALUE_DATES_VALIDATION_MESSAGES.START_DATE_AFTER_SIGN);
      }
      
      // Ngày hiệu lực phải trước ngày hết hạn
      if (startDateObj >= endDateObj) {
        errors.push(VALUE_DATES_VALIDATION_MESSAGES.END_DATE_AFTER_START);
      }
      
      // Thời hạn hợp đồng tối thiểu
      const minContractDuration = BUSINESS_RULES.contractMinDuration;
      const maxContractDuration = BUSINESS_RULES.contractMaxDuration;
      
      const differenceInTime = endDateObj.getTime() - startDateObj.getTime();
      const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
      
      if (differenceInDays < minContractDuration) {
        errors.push(VALUE_DATES_VALIDATION_MESSAGES.DATE_RANGE_TOO_SHORT);
      }

      if (differenceInDays > maxContractDuration) {
        warnings.push(WARNING_MESSAGES.LONG_CONTRACT_DURATION);
      }
    } else if (startDate && endDate) {
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      
      if (startDateObj >= endDateObj) {
        errors.push(VALUE_DATES_VALIDATION_MESSAGES.END_DATE_AFTER_START);
      }
    }
    
    // Kiểm tra giá trị hợp đồng
    if (amount !== undefined) {
      if (amount <= 0) {
        errors.push(VALUE_DATES_VALIDATION_MESSAGES.AMOUNT_POSITIVE);
      }
      
      // Cảnh báo nếu giá trị hợp đồng lớn
      if (amount > BUSINESS_RULES.paymentTerms.highValueThreshold) {
        warnings.push(WARNING_MESSAGES.HIGH_VALUE_CONTRACT);
      }
    }
    
    setDateValidationErrors(errors);
    setDateWarnings(warnings);
  }, [signDate, startDate, endDate, amount]);

  return (
    <div className="bg-white border border-gray-200 rounded overflow-hidden">
      {/* Section Header */}
      <div 
        className="px-4 py-4 flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="text-base font-medium text-gray-900">Giá trị & Ngày tháng</h3>
        <button
          type="button"
          className="text-gray-400 hover:text-gray-500"
        >
          {expanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
        </button>
      </div>

      {/* Section Content */}
      {expanded && (
        <div className="border-t border-gray-200 px-4 py-5">
          {/* Validation errors */}
          {shouldShowError && dateValidationErrors.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-4">
              <div className="flex items-start">
                <InformationCircleIcon className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Lỗi ngày tháng</h3>
                  <ul className="mt-1 text-sm text-red-700 list-disc pl-5">
                    {dateValidationErrors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {/* Validation warnings */}
          {shouldShowError && dateWarnings.length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
              <div className="flex items-start">
                <InformationCircleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">Cảnh báo</h3>
                  <ul className="mt-1 text-sm text-yellow-700 list-disc pl-5">
                    {dateWarnings.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Contract Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Giá trị hợp đồng <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="amount"
                  disabled={isLoading}
                  className={`block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                    isLoading ? 'bg-gray-50' : ''
                  }`}
                  {...register('amount', CONTRACT_AMOUNT_VALIDATION)}
                  placeholder="0"
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount.message as string}</p>
              )}
              {watch('amount') > 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  {formatCurrency(watch('amount'))} {watch('currency')}
                </p>
              )}
            </div>

            {/* Currency */}
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                Đơn vị tiền tệ <span className="text-red-500">*</span>
              </label>
              <select
                id="currency"
                disabled={isLoading}
                className={`block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                  isLoading ? 'bg-gray-50' : ''
                }`}
                {...register('currency', {
                  required: { value: true, message: VALUE_DATES_VALIDATION_MESSAGES.CURRENCY_REQUIRED },
                })}
                defaultValue="VND"
              >
                {currencies.map((currency) => (
                  <option key={currency.value} value={currency.value}>
                    {currency.label}
                  </option>
                ))}
              </select>
              {errors.currency && (
                <p className="mt-1 text-sm text-red-600">{errors.currency.message as string}</p>
              )}
            </div>

            {/* Sign Date */}
            <div>
              <label htmlFor="signDate" className="block text-sm font-medium text-gray-700 mb-1">
                Ngày ký <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="signDate"
                disabled={isLoading}
                className={`block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                  isLoading ? 'bg-gray-50' : ''
                }`}
                {...register('signDate', {
                  ...DATE_VALIDATION,
                  validate: {
                    validDate: (value) => isValidDate(value) || VALUE_DATES_VALIDATION_MESSAGES.SIGN_DATE_REQUIRED,
                    notAfterStartDate: (value) => {
                      const start = watch('startDate');
                      if (!start || !value) return true;
                      return new Date(value) <= new Date(start) || VALUE_DATES_VALIDATION_MESSAGES.START_DATE_AFTER_SIGN;
                    }
                  }
                })}
                onChange={(e) => {
                  setValue('signDate', e.target.value);
                  trigger(['signDate', 'startDate', 'endDate']);
                }}
              />
              {errors.signDate && (
                <p className="mt-1 text-sm text-red-600">{errors.signDate.message as string}</p>
              )}
            </div>

            {/* Start Date */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Ngày hiệu lực <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="startDate"
                disabled={isLoading}
                className={`block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                  isLoading ? 'bg-gray-50' : ''
                }`}
                {...register('startDate', {
                  ...DATE_VALIDATION,
                  validate: {
                    validDate: (value) => isValidDate(value) || VALUE_DATES_VALIDATION_MESSAGES.START_DATE_REQUIRED,
                    notBeforeSignDate: (value) => {
                      const sign = watch('signDate');
                      if (!sign || !value) return true;
                      return new Date(value) >= new Date(sign) || VALUE_DATES_VALIDATION_MESSAGES.START_DATE_AFTER_SIGN;
                    },
                    notAfterEndDate: (value) => {
                      const end = watch('endDate');
                      if (!end || !value) return true;
                      return new Date(value) < new Date(end) || VALUE_DATES_VALIDATION_MESSAGES.END_DATE_AFTER_START;
                    }
                  }
                })}
                onChange={(e) => {
                  setValue('startDate', e.target.value);
                  trigger(['signDate', 'startDate', 'endDate']);
                }}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate.message as string}</p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                Ngày hết hạn
              </label>
              <input
                type="date"
                id="endDate"
                disabled={isLoading}
                className={`block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                  isLoading ? 'bg-gray-50' : ''
                }`}
                {...register('endDate', {
                  validate: {
                    validDate: (value) => !value || isValidDate(value) || COMMON_VALIDATION_MESSAGES.INVALID_DATE,
                    afterStartDate: (value) => {
                      const start = watch('startDate');
                      if (!start || !value) return true;
                      
                      const startDate = new Date(start);
                      const endDate = new Date(value);
                      const differenceInTime = endDate.getTime() - startDate.getTime();
                      const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
                      
                      if (endDate <= startDate) {
                        return VALUE_DATES_VALIDATION_MESSAGES.END_DATE_AFTER_START;
                      }
                      
                      if (differenceInDays < BUSINESS_RULES.contractMinDuration) {
                        return VALUE_DATES_VALIDATION_MESSAGES.DATE_RANGE_TOO_SHORT;
                      }
                      
                      return true;
                    }
                  }
                })}
                onChange={(e) => {
                  setValue('endDate', e.target.value);
                  trigger(['signDate', 'startDate', 'endDate']);
                }}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate.message as string}</p>
              )}
              {startDate && endDate && (
                <p className="mt-1 text-xs text-gray-500">
                  Thời hạn: {calculateDuration(startDate, endDate)} ngày
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Hàm tính số ngày giữa hai ngày
const calculateDuration = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const differenceInTime = end.getTime() - start.getTime();
  return Math.ceil(differenceInTime / (1000 * 3600 * 24));
}; 
import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { ChevronDownIcon, ChevronUpIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

import { useEmployees } from '../../../../hooks/useEmployees';
import { ContractType, ContractStatus } from '../../types';
import { useContractService } from '../../hooks/useContractService';
import { 
  CONTRACT_CODE_VALIDATION, 
  CONTRACT_NAME_VALIDATION,
  DESCRIPTION_VALIDATION,
  isContractCodeUnique
} from '../../utils/validationConfig';
import { 
  GENERAL_INFO_VALIDATION_MESSAGES,
  COMMON_VALIDATION_MESSAGES 
} from '../../utils/validationMessages';

interface GeneralInfoSectionProps {
  mode: 'create' | 'edit';
  isLoading: boolean;
}

interface EmployeeResponse {
  id: number;
  name: string;
  position: string;
  department: string;
}

/**
 * General information section for contract form.
 * Includes fields for contract code, name, customer, sales person, type, and status.
 */
export const GeneralInfoSection: React.FC<GeneralInfoSectionProps> = ({ mode, isLoading }) => {
  const [expanded, setExpanded] = useState(true);
  const [validatingCode, setValidatingCode] = useState(false);
  const [codeExists, setCodeExists] = useState(false);
  const { register, formState: { errors, isSubmitted, touchedFields }, watch, setValue, trigger } = useFormContext();
  const contractService = useContractService();
  const isEditMode = mode === 'edit';
  
  // Get contract code for validation
  const contractCode = watch('contractCode');
  const contractName = watch('name');
  
  // Kiểm tra xem có nên hiển thị lỗi cho một trường cụ thể không
  const shouldShowFieldError = (fieldName: string) => {
    return isSubmitted || touchedFields[fieldName as keyof typeof touchedFields];
  };
  
  // Get employees for sales person selection
  // Original implementation:
  // const { getAllEmployeesBySalesRole } = useEmployees();
  
  const { data: salesPersons = [], isLoading: isLoadingSales } = useQuery<EmployeeResponse[]>({
    queryKey: ['employees', 'sales'],
    queryFn: async () => {
      // Original implementation:
      // return getAllEmployeesBySalesRole();
      
      // Mock data implementation:
      return Promise.resolve([
        { id: 1, name: 'Nguyễn Văn A', position: 'Sales Manager', department: 'Sales' },
        { id: 2, name: 'Trần Thị B', position: 'Sales Executive', department: 'Sales' },
        { id: 3, name: 'Lê Văn C', position: 'Sales Executive', department: 'Sales' }
      ]);
    },
  });

  // Contract types
  const contractTypes: { value: ContractType; label: string }[] = [
    { value: 'FixedPrice', label: 'Fixed Price' },
    { value: 'TimeAndMaterial', label: 'Time & Material (T&M)' },
    { value: 'Retainer', label: 'Retainer' },
    { value: 'Maintenance', label: 'Maintenance' },
    { value: 'Other', label: 'Khác' }
  ];

  // Contract statuses
  const contractStatuses: { value: ContractStatus; label: string }[] = [
    { value: 'Draft', label: 'Bản nháp' },
    { value: 'InReview', label: 'Đang xét duyệt' },
    { value: 'Approved', label: 'Đã phê duyệt' },
    { value: 'Active', label: 'Đang hoạt động' },
    { value: 'InProgress', label: 'Đang thực hiện' },
    { value: 'OnHold', label: 'Tạm dừng' },
    { value: 'Completed', label: 'Hoàn thành' },
    { value: 'Terminated', label: 'Đã hủy' },
    { value: 'Expired', label: 'Đã hết hạn' }
  ];

  // Kiểm tra mã hợp đồng
  useEffect(() => {
    if (mode === 'create' && contractCode && contractCode.length >= 3) {
      const checkContractCode = async () => {
        setValidatingCode(true);
        try {
          // Sử dụng hàm từ validation config
          const isUnique = await isContractCodeUnique(contractCode);
          setCodeExists(!isUnique);
        } catch (error) {
          console.error('Failed to check contract code:', error);
        } finally {
          setValidatingCode(false);
        }
      };
      
      const timeoutId = setTimeout(checkContractCode, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [contractCode, mode]);

  return (
    <div className="bg-white border border-gray-200 rounded overflow-hidden">
      {/* Section Header */}
      <div 
        className="px-4 py-4 flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="text-base font-medium text-gray-900">Thông tin chung</h3>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Contract Code */}
            <div>
              <label htmlFor="contractCode" className="block text-sm font-medium text-gray-700 mb-1">
                Mã hợp đồng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="contractCode"
                disabled={isLoading || isEditMode}
                className={`block w-full px-3 py-2 border ${shouldShowFieldError('contractCode') && errors.contractCode ? 'border-red-300' : 'border-gray-300'} rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                  isLoading || isEditMode ? 'bg-gray-50' : ''
                }`}
                {...register('contractCode', {
                  ...CONTRACT_CODE_VALIDATION,
                  validate: {
                    notExists: () => !codeExists || GENERAL_INFO_VALIDATION_MESSAGES.CONTRACT_CODE_EXISTS
                  }
                })}
                placeholder="Ví dụ: CTR001-2023"
              />
              {validatingCode && (
                <p className="mt-1 text-sm text-blue-600">Đang kiểm tra mã hợp đồng...</p>
              )}
              {shouldShowFieldError('contractCode') && codeExists && !errors.contractCode && (
                <p className="mt-1 text-sm text-red-600">{GENERAL_INFO_VALIDATION_MESSAGES.CONTRACT_CODE_EXISTS}</p>
              )}
              {shouldShowFieldError('contractCode') && errors.contractCode && (
                <p className="mt-1 text-sm text-red-600">{errors.contractCode.message as string}</p>
              )}
            </div>

            {/* Contract Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Tên hợp đồng/dự án <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                disabled={isLoading}
                className={`block w-full px-3 py-2 border ${shouldShowFieldError('name') && errors.name ? 'border-red-300' : 'border-gray-300'} rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                  isLoading ? 'bg-gray-50' : ''
                }`}
                {...register('name', CONTRACT_NAME_VALIDATION)}
                placeholder="Tên hợp đồng hoặc dự án"
              />
              {shouldShowFieldError('name') && errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message as string}</p>
              )}
            </div>

            {/* Customer */}
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                Khách hàng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="customerName"
                disabled={isLoading}
                className={`block w-full px-3 py-2 border ${shouldShowFieldError('customerName') && errors.customerName ? 'border-red-300' : 'border-gray-300'} rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                  isLoading ? 'bg-gray-50' : ''
                }`}
                {...register('customerName', {
                  required: { value: true, message: COMMON_VALIDATION_MESSAGES.REQUIRED_FIELD },
                  minLength: {
                    value: 3,
                    message: COMMON_VALIDATION_MESSAGES.MIN_LENGTH(3)
                  }
                })}
                placeholder="Tên khách hàng"
              />
              {shouldShowFieldError('customerName') && errors.customerName && (
                <p className="mt-1 text-sm text-red-600">{errors.customerName.message as string}</p>
              )}
            </div>

            {/* Sales Person */}
            <div>
              <label htmlFor="salesPersonId" className="block text-sm font-medium text-gray-700 mb-1">
                Người phụ trách Sales <span className="text-red-500">*</span>
              </label>
              <select
                id="salesPersonId"
                disabled={isLoading || isLoadingSales}
                className={`block w-full px-3 py-2 border ${shouldShowFieldError('salesPersonId') && errors.salesPersonId ? 'border-red-300' : 'border-gray-300'} rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                  isLoading || isLoadingSales ? 'bg-gray-50' : ''
                }`}
                {...register('salesPersonId', {
                  required: { value: true, message: GENERAL_INFO_VALIDATION_MESSAGES.SALES_PERSON_REQUIRED },
                  valueAsNumber: true
                })}
              >
                <option value="">-- Chọn người phụ trách --</option>
                {salesPersons.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
              {shouldShowFieldError('salesPersonId') && errors.salesPersonId && (
                <p className="mt-1 text-sm text-red-600">{errors.salesPersonId.message as string}</p>
              )}
            </div>

            {/* Contract Type */}
            <div>
              <label htmlFor="contractType" className="block text-sm font-medium text-gray-700 mb-1">
                Loại hợp đồng <span className="text-red-500">*</span>
              </label>
              <select
                id="contractType"
                disabled={isLoading}
                className={`block w-full px-3 py-2 border ${shouldShowFieldError('contractType') && errors.contractType ? 'border-red-300' : 'border-gray-300'} rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                  isLoading ? 'bg-gray-50' : ''
                }`}
                {...register('contractType', {
                  required: { value: true, message: GENERAL_INFO_VALIDATION_MESSAGES.CONTRACT_TYPE_REQUIRED }
                })}
              >
                {contractTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {shouldShowFieldError('contractType') && errors.contractType && (
                <p className="mt-1 text-sm text-red-600">{errors.contractType.message as string}</p>
              )}
            </div>

            {/* Contract Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái hợp đồng <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                disabled={isLoading}
                className={`block w-full px-3 py-2 border ${shouldShowFieldError('status') && errors.status ? 'border-red-300' : 'border-gray-300'} rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                  isLoading ? 'bg-gray-50' : ''
                }`}
                {...register('status', {
                  required: { value: true, message: GENERAL_INFO_VALIDATION_MESSAGES.STATUS_REQUIRED }
                })}
              >
                {contractStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              {shouldShowFieldError('status') && errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status.message as string}</p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả/Ghi chú
              </label>
              <textarea
                id="description"
                rows={3}
                disabled={isLoading}
                className={`block w-full px-3 py-2 border ${shouldShowFieldError('description') && errors.description ? 'border-red-300' : 'border-gray-300'} rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                  isLoading ? 'bg-gray-50' : ''
                }`}
                {...register('description', DESCRIPTION_VALIDATION)}
                placeholder="Mô tả thêm về hợp đồng, yêu cầu của khách hàng, điều khoản đặc biệt và các ghi chú khác"
              />
              {shouldShowFieldError('description') && errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message as string}</p>
              )}
              {watch('description') && (
                <p className="mt-1 text-xs text-gray-500">
                  {watch('description').length}/500 ký tự
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 
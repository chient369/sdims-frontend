import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDownIcon, ChevronUpIcon, TrashIcon, PlusCircleIcon, UserPlusIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

import { useContractService } from '../../hooks/useContractService';
import { useOpportunities } from '../../../../hooks/useOpportunities';
import { useEmployees } from '../../../../hooks/useEmployees';
import { EmployeeAssignment, EmployeeAssignmentCreateData } from '../../types';
import { formatDate, formatPercent } from '../../../../utils/formatters';
import { EMPLOYEE_ASSIGNMENT_VALIDATION } from '../../utils/validationConfig';
import { LINKS_VALIDATION_MESSAGES, WARNING_MESSAGES } from '../../utils/validationMessages';

// Interface cục bộ để sử dụng trong component, tránh lỗi TypeScript
interface SimplifiedEmployeeAssignment {
  id: number;
  employee: {
    id: number;
    name: string;
    position: string;
  };
  role?: string;
  allocationPercentage: number;
  startDate: string;
  endDate?: string;
  billRate?: number;
}

interface RelationshipsSectionProps {
  mode: 'create' | 'edit';
  isLoading: boolean;
  contractId?: string;
}

interface OpportunityResponse {
  id: number;
  code: string;
  name: string;
  status: string;
}

/**
 * Relationships section for contract form.
 * Allows linking the contract to opportunities and employees.
 */
export const RelationshipsSection: React.FC<RelationshipsSectionProps> = ({ 
  mode, 
  isLoading, 
  contractId 
}) => {
  const [expanded, setExpanded] = useState(true);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { register, setValue, watch, formState: { errors, isSubmitted, touchedFields } } = useFormContext();
  const contractService = useContractService();
  const queryClient = useQueryClient();
  
  // Kiểm tra xem có nên hiển thị lỗi không (form đã submit hoặc các trường đã được chạm vào)
  const shouldShowErrors = isSubmitted || touchedFields.relatedOpportunityId || 
    Object.keys(touchedFields).some(key => key.startsWith('employees'));
  
  // Opportunity state
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  
  // Employees state
  const [selectedEmployees, setSelectedEmployees] = useState<SimplifiedEmployeeAssignment[]>([]);
  
  // Get the opportunity from watch
  const relatedOpportunityId = watch('relatedOpportunityId');
  
  // Mock opportunities data
  const { data: opportunitiesData = { data: { content: [] } }, isLoading: isLoadingOpportunities } = useQuery<{
    data: {
      content: OpportunityResponse[];
    };
  }>({
    queryKey: ['opportunities'],
    queryFn: async () => {
      // Mock API call
      return Promise.resolve({
        data: {
          content: [
            { id: 1, code: 'OPP-001', name: 'Website Development', status: 'open' },
            { id: 2, code: 'OPP-002', name: 'ERP Implementation', status: 'open' },
            { id: 3, code: 'OPP-003', name: 'Mobile App Development', status: 'open' }
          ]
        }
      });
    },
  });
  
  // Fetch contract employees if in edit mode
  const { data: employeesData } = useQuery<SimplifiedEmployeeAssignment[]>({
    queryKey: ['contract', contractId, 'employees'],
    queryFn: async () => {
      if (!contractId) return [];
      
      // Mock API call
      return Promise.resolve([
        {
          id: 1,
          employee: {
            id: 1,
            name: 'Nguyễn Văn A',
            position: 'Developer'
          },
          role: 'Developer',
          allocationPercentage: 40,
          startDate: '2023-01-01',
          endDate: '2023-12-31',
          billRate: 500000
        },
        {
          id: 2,
          employee: {
            id: 2,
            name: 'Trần Thị B',
            position: 'Designer'
          },
          role: 'Designer',
          allocationPercentage: 30,
          startDate: '2023-01-01',
          endDate: '2023-12-31',
          billRate: 450000
        },
        {
          id: 3,
          employee: {
            id: 3,
            name: 'Lê Văn C',
            position: 'Project Manager'
          },
          role: 'PM',
          allocationPercentage: 30,
          startDate: '2023-01-01',
          endDate: '2023-12-31',
          billRate: 600000
        }
      ]);
    },
    enabled: !!contractId && mode === 'edit'
  });
  
  // Cập nhật state nhân viên khi dữ liệu được tải thành công
  useEffect(() => {
    if (employeesData) {
      setSelectedEmployees(employeesData);
    }
  }, [employeesData]);
  
  // Mutation to add employee to contract
  const addEmployeeMutation = useMutation({
    mutationFn: async (data: { contractId: string, employee: EmployeeAssignmentCreateData }) => {
      // Mock API call
      return Promise.resolve({
        id: Math.floor(Math.random() * 1000),
        employee: {
          id: data.employee.employeeId,
          name: 'New Employee ' + data.employee.employeeId,
          position: 'New Position'
        },
        allocationPercentage: data.employee.allocationPercentage,
        startDate: data.employee.startDate,
        endDate: data.employee.endDate,
        billRate: data.employee.billRate,
        role: 'Developer' // Đặt giá trị mặc định cho role
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contract', contractId, 'employees'] });
      
      // Cập nhật state ngay lập tức để UI phản hồi nhanh chóng
      setSelectedEmployees(prev => [...prev, data]);
    }
  });
  
  // Mutation to remove employee from contract
  const removeEmployeeMutation = useMutation({
    mutationFn: async (data: { contractId: string, employeeId: string }) => {
      // Mock API call
      return Promise.resolve({ success: true });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contract', contractId, 'employees'] });
      
      // Cập nhật state ngay lập tức để UI phản hồi nhanh chóng
      setSelectedEmployees(prev => prev.filter(emp => emp.employee.id !== Number(variables.employeeId)));
    }
  });
  
  // Validate employee allocation
  useEffect(() => {
    const errors: string[] = [];
    
    if (selectedEmployees.length > 0) {
      // Tính tổng phần trăm phân bổ
      const totalAllocation = selectedEmployees.reduce((sum, emp) => sum + emp.allocationPercentage, 0);
      
      if (totalAllocation !== 100) {
        errors.push(LINKS_VALIDATION_MESSAGES.ALLOCATION_SUM_INVALID);
      }
      
      // Kiểm tra các giới hạn về phân bổ nhân sự
      const hasProjectManager = selectedEmployees.some(emp => 
        emp.role?.toLowerCase().includes('pm') || 
        emp.role?.toLowerCase().includes('project manager')
      );
      
      if (!hasProjectManager && selectedEmployees.length >= 3) {
        errors.push(WARNING_MESSAGES.NO_PM_FOR_LARGE_TEAM);
      }
      
      // Kiểm tra phân bổ từng nhân sự
      const lowAllocation = selectedEmployees.filter(emp => emp.allocationPercentage < 10);
      if (lowAllocation.length > 0) {
        errors.push(LINKS_VALIDATION_MESSAGES.ALLOCATION_TOO_LOW);
      }
      
      const highAllocation = selectedEmployees.filter(emp => emp.allocationPercentage > 70);
      if (highAllocation.length > 0) {
        errors.push(LINKS_VALIDATION_MESSAGES.ALLOCATION_TOO_HIGH);
      }
    } else {
      errors.push(LINKS_VALIDATION_MESSAGES.NO_EMPLOYEE_SELECTED);
    }
    
    setValidationErrors(errors);
  }, [selectedEmployees]);
  
  // Handle opportunity selection
  const handleOpportunityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setValue('relatedOpportunityId', value);
    setSelectedOpportunityId(value || null);
  };
  
  // Open employee modal
  const handleAddEmployee = () => {
    if (mode === 'edit' && contractId) {
      setShowEmployeeModal(true);
    } else {
      // For create mode, we would add a temporary employee to the form
      // This would be handled in the parent component by watching this field
      // and updating appropriately
      
      // Mock adding a new employee
      const newEmployee: SimplifiedEmployeeAssignment = {
        id: Math.floor(Math.random() * 1000),
        employee: {
          id: Math.floor(Math.random() * 1000),
          name: `New Employee ${selectedEmployees.length + 1}`,
          position: 'Developer'
        },
        role: 'Developer',
        allocationPercentage: calculateDefaultAllocation(),
        startDate: new Date().toISOString(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString(),
        billRate: 500000
      };
      
      setSelectedEmployees(prev => [...prev, newEmployee]);
    }
  };
  
  // Calculate default allocation for new employee
  const calculateDefaultAllocation = (): number => {
    if (selectedEmployees.length === 0) return 100;
    
    const totalAllocation = selectedEmployees.reduce((sum, emp) => sum + emp.allocationPercentage, 0);
    const remainingAllocation = 100 - totalAllocation;
    
    if (remainingAllocation <= 0) {
      // Recalculate all allocations evenly
      return Math.floor(100 / (selectedEmployees.length + 1));
    }
    
    return remainingAllocation;
  };
  
  // Handle allocation change
  const handleAllocationChange = (employeeId: number, newAllocation: number) => {
    if (newAllocation < EMPLOYEE_ASSIGNMENT_VALIDATION.allocation.min.value || 
        newAllocation > EMPLOYEE_ASSIGNMENT_VALIDATION.allocation.max.value) {
      return; // Validate trước khi cập nhật
    }
    
    setSelectedEmployees(prev => 
      prev.map(emp => 
        emp.employee.id === employeeId 
          ? { ...emp, allocationPercentage: newAllocation } 
          : emp
      )
    );
  };
  
  // Remove employee
  const handleRemoveEmployee = (employeeId: number) => {
    if (mode === 'edit' && contractId) {
      removeEmployeeMutation.mutate({ 
        contractId, 
        employeeId: employeeId.toString() 
      });
    } else {
      // For create mode, we would remove from the form
      setSelectedEmployees(prev => prev.filter(emp => emp.employee.id !== employeeId));
    }
  };
  
  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      {/* Section Header */}
      <div 
        className="px-4 py-5 sm:px-6 flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="text-lg leading-6 font-medium text-gray-900">Liên kết</h3>
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
          {/* Validation errors */}
          {shouldShowErrors && validationErrors.length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
              <div className="flex items-start">
                <InformationCircleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">Cảnh báo phân bổ nhân sự</h3>
                  <ul className="mt-1 text-sm text-yellow-700 list-disc pl-5">
                    {validationErrors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        
          <div className="grid grid-cols-1 gap-6">
            {/* Opportunity Link */}
            <div>
              <label htmlFor="relatedOpportunityId" className="block text-sm font-medium text-gray-700">
                Cơ hội kinh doanh
              </label>
              <select
                id="relatedOpportunityId"
                disabled={isLoading || isLoadingOpportunities}
                className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
                  isLoading || isLoadingOpportunities ? 'bg-gray-100' : ''
                }`}
                value={relatedOpportunityId || ''}
                onChange={handleOpportunityChange}
              >
                <option value="">-- Chọn cơ hội kinh doanh --</option>
                {opportunitiesData.data.content.map((opportunity) => (
                  <option key={opportunity.id} value={opportunity.id}>
                    {opportunity.code} - {opportunity.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Liên kết với cơ hội kinh doanh đã có trong hệ thống
              </p>
              {!relatedOpportunityId && selectedEmployees.length > 0 && (
                <p className="mt-1 text-sm text-yellow-500">
                  {WARNING_MESSAGES.NO_OPPORTUNITY_LINK}
                </p>
              )}
            </div>

            {/* Employees */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Nhân sự tham gia
                </label>
                <button
                  type="button"
                  onClick={handleAddEmployee}
                  disabled={isLoading}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UserPlusIcon className="h-4 w-4 mr-1" />
                  Thêm nhân sự
                </button>
              </div>

              {selectedEmployees.length > 0 ? (
                <div className="mt-2 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Họ và Tên
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vị trí
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          % Phân bổ
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ngày bắt đầu
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Hành động</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedEmployees.map((assignment) => (
                        <tr key={assignment.id || assignment.employee.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {assignment.employee.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {assignment.employee.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {assignment.employee.position}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <input
                              type="number"
                              min={EMPLOYEE_ASSIGNMENT_VALIDATION.allocation.min.value}
                              max={EMPLOYEE_ASSIGNMENT_VALIDATION.allocation.max.value}
                              value={assignment.allocationPercentage}
                              disabled={isLoading}
                              className="w-16 p-1 border border-gray-300 rounded text-center"
                              onChange={(e) => handleAllocationChange(assignment.employee.id, Number(e.target.value))}
                            />
                            <span className="ml-1">%</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(assignment.startDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              type="button"
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleRemoveEmployee(assignment.employee.id)}
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {/* Total allocation row */}
                      <tr className="bg-gray-50">
                        <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                          Tổng phân bổ:
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {selectedEmployees.reduce((sum, emp) => sum + emp.allocationPercentage, 0)}%
                        </td>
                        <td colSpan={2}></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 border border-gray-200 rounded">
                  <p>Chưa có nhân sự nào tham gia dự án này.</p>
                  <p className="mt-1 text-sm">Nhấn "Thêm nhân sự" để thêm thành viên vào dự án</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Employee Modal - this would be a separate component
          or use an existing modal component from the project. Since this is just the initial
          implementation, we're leaving this as a comment for future reference. */}
    </div>
  );
}; 
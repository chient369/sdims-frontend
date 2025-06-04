import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import useAuth from '../../../../hooks/useAuth';
import { useEmployeeService } from '../../hooks/useServices';
import { employeeService, skillService } from '../../service';
import { useContractService } from '../../../contracts/hooks/useContractService';
import { 
  EmployeeResponse, 
  EmployeeCreateData,
  EmployeeUpdateData,
  EmployeeSkillCreateData
} from '../../types';
import { addOrUpdateEmployeeSkill } from '../../api';

import { ConfirmationDialog } from '../../../../components/modals/ConfirmationDialog';

import BasicInfoSection from './sections/BasicInfoSection';
import OrganizationSection from './sections/OrganizationSection';
import SkillsSection from './sections/SkillsSection';
import StatusSection from './sections/StatusSection';

// Extended skill data to handle leader assessment
interface ExtendedEmployeeSkillData {
  skillId: number;
  level: 'Basic' | 'Intermediate' | 'Advanced' | 'Expert';
  years: number;
  leaderAssessment?: 'Basic' | 'Intermediate' | 'Advanced' | 'Expert';
}

interface EmployeeFormProps {
  employeeId?: number;
  mode: 'create' | 'edit';
}

interface EmployeeData {
  id?: number;
  employeeCode: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  address?: string;
  birthDate?: string;
  joinDate?: string;
  userId?: number;
  teamId?: number;
  teamName?: string;
  position?: string;
  status: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relation?: string;
  };
  currentProject?: string;
  allocationPercent?: number;
  endDate?: string;
  resignationDate?: string;
  leaveStartDate?: string;
  leaveEndDate?: string;
  skills?: ExtendedEmployeeSkillData[];
  allocations?: {
    id?: number;
    projectId?: number;
    contractId?: number;
    projectName: string;
    startDate: string;
    endDate?: string;
    allocation: number;
    position?: string;
    role?: string;
    billingRate?: number;
  }[];
  note?: string;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employeeId, mode }) => {
  const { hasPermission, user } = useAuth();
  const employeeServiceFromHook = useEmployeeService();
  const contractService = useContractService();
  const navigate = useNavigate();
  const [skills, setSkills] = useState<ExtendedEmployeeSkillData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // States for confirmation dialogs
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [formIsDirty, setFormIsDirty] = useState(false);
  
  // Determine if the user can edit based on permissions
  // Admin or Manager can update any employee, Leaders can update team members, and employees can update their own information
  const canEdit = 
    hasPermission('employee:update:all') || 
    hasPermission('employee:update:team') || 
    (hasPermission('employee:update:own') && !!employeeId && user?.id === employeeId.toString());
  
  console.log(canEdit);
  console.log(user);
  // Initialize form with default values
  const formMethods = useForm<EmployeeData>({
    defaultValues: {
      employeeCode: '',
      name: '',
      email: '',
      position: '',
      status: 'Available',
      emergencyContact: {
        name: '',
        phone: '',
        relation: ''
      },
      joinDate: '',
      birthDate: '',
      address: ''
    }
  });
  
  // Track form changes
  useEffect(() => {
    const subscription = formMethods.watch(() => {
      setFormIsDirty(true);
    });
    return () => subscription.unsubscribe();
  }, [formMethods]);
  
  // Fetch employee data if in edit mode
  const { isLoading: isLoadingEmployee, data: employeeData } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: async () => {
      if (!employeeId) throw new Error('Employee ID is required');
      return employeeServiceFromHook.getEmployeeById(employeeId.toString());
    },
    enabled: !!employeeId && mode === 'edit'
  });
  
  // Handle employee data when it's loaded
  useEffect(() => {
    if (employeeData) {
      try {
        // Reset form with employee data
        const employee = employeeData as EmployeeData;
        
        // For each field in employee, set the value in the form
        Object.entries(employee).forEach(([key, value]) => {
          if (key !== 'skills' && key !== 'id' && value !== undefined) {
            formMethods.setValue(key as any, value);
          }
        });
        
        // Set the skills state separately (if they exist)
        if (employee.skills && employee.skills.length > 0) {
          setSkills(employee.skills.map(skill => ({
            skillId: skill.skillId,
            level: skill.level,
            years: skill.years,
            leaderAssessment: skill.leaderAssessment
          })));
        }
      } catch (err) {
        console.error('Error processing employee data:', err);
        setError('Failed to process employee data. Please try again.');
      }
    }
  }, [employeeData, formMethods]);
  
  // Create employee mutation
  const createMutation = useMutation({
    mutationFn: (data: EmployeeCreateData) => employeeServiceFromHook.createEmployee(data)
  });
  
  // Update employee mutation
  const updateMutation = useMutation({
    mutationFn: (data: { id: number, employee: Partial<EmployeeCreateData> }) => 
      employeeServiceFromHook.updateEmployee(data.id.toString(), data.employee)
  });
  
  // Handle form submission
  const onSubmit = async (data: EmployeeData) => {
    if (formIsDirty) {
      setShowSaveDialog(true);
      return;
    }
    
    await saveEmployeeData(data);
  };
  
  // Function to actually save employee data
  const saveEmployeeData = async (data: EmployeeData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Xử lý dữ liệu phù hợp với API
      const employeeFormData: EmployeeCreateData = {
        employeeCode: data.employeeCode,
        name: data.name,
        email: data.email,
        position: data.position || '',
        teamId: data.teamId || '',
        phone: data.phone || '',
        address: data.address || '',
        birthDate: data.birthDate || '',
        joinDate: data.joinDate || '',
        status: data.status as 'Available' | 'Allocated' | 'EndingSoon' | 'OnLeave' | 'Resigned' | 'PartiallyAllocated',
        userId: data.userId && !isNaN(Number(data.userId)) ? Number(data.userId) : null,
        note: data.note || ''
      };

      // Xử lý emergencyContact nếu có
      if (data.emergencyContact?.name && data.emergencyContact?.phone) {
        employeeFormData.emergencyContact = {
          name: data.emergencyContact.name,
          phone: data.emergencyContact.phone,
          relation: data.emergencyContact.relation
        };
      }

      // Create or update employee
      let employeeResponse: any;
      if (mode === 'create') {
        employeeResponse = await createMutation.mutateAsync(employeeFormData);
        
        // Xử lý skills nếu có
        if (skills.length > 0 && employeeResponse?.id) {
          for (const skill of skills) {
            await skillService.addOrUpdateEmployeeSkill(employeeResponse.id.toString(), {
              skillId: skill.skillId,
              level: skill.level,
              years: skill.years
            } as EmployeeSkillCreateData);
          }
        }
        
        // If we have allocations and the employee was created successfully
        if (data.allocations && data.allocations.length > 0 && employeeResponse?.id) {
          // Group allocations by contract
          const allocationsByContract = data.allocations.reduce((acc: Record<string, any[]>, allocation) => {
            const contractId = allocation.contractId || allocation.projectId;
            if (!contractId) return acc;
            
            if (!acc[contractId]) {
              acc[contractId] = [];
            }
            
            // Tạo dữ liệu allocation đúng chuẩn
            acc[contractId].push({
              employeeId: employeeResponse.id,
              startDate: allocation.startDate,
              endDate: allocation.endDate,
              allocationPercentage: allocation.allocation,
              billRate: allocation.billingRate || 0
            });
            
            return acc;
          }, {});
          
          // Call contract API to assign employees to contracts
          for (const [contractId, allocations] of Object.entries(allocationsByContract)) {
            await contractService.assignEmployeesToContract(contractId, {
              employeeAssignments: allocations
            });
          }
        }
        
        navigate('/hrm/employees');
      } else if (employeeId) {
        employeeResponse = await updateMutation.mutateAsync({
          id: employeeId,
          employee: employeeFormData
        });
        
        // Xử lý skills nếu có
        if (skills.length > 0) {
          for (const skill of skills) {
            await skillService.addOrUpdateEmployeeSkill(employeeId.toString(), {
              skillId: skill.skillId,
              level: skill.level,
              years: skill.years
            } as EmployeeSkillCreateData);
          }
        }
        
        // If we have allocations and the employee was updated successfully
        if (data.allocations && data.allocations.length > 0 && employeeResponse?.id) {
          // Group allocations by contract
          const allocationsByContract = data.allocations.reduce((acc: Record<string, any[]>, allocation) => {
            const contractId = allocation.contractId || allocation.projectId;
            if (!contractId) return acc;
            
            if (!acc[contractId]) {
              acc[contractId] = [];
            }
            
            // Tạo dữ liệu allocation đúng chuẩn
            acc[contractId].push({
              employeeId: employeeId,
              startDate: allocation.startDate,
              endDate: allocation.endDate,
              allocationPercentage: allocation.allocation,
              billRate: allocation.billingRate || 0
            });
            
            return acc;
          }, {});
          
          // Call contract API to assign employees to contracts
          for (const [contractId, allocations] of Object.entries(allocationsByContract)) {
            await contractService.assignEmployeesToContract(contractId, {
              employeeAssignments: allocations
            });
          }
        }
        
        navigate(`/hrm/employees/${employeeId}`);
      }
    } catch (err) {
      console.error('Error saving employee:', err);
      setError('Đã xảy ra lỗi khi lưu thông tin nhân viên. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle cancel button click
  const handleCancel = () => {
    if (formIsDirty) {
      setShowCancelDialog(true);
    } else {
      navigate('/hrm/employees');
    }
  };
  
  // Handle skills changes from the skills section
  const handleSkillsChange = (updatedSkills: ExtendedEmployeeSkillData[]) => {
    setSkills(updatedSkills);
  };
  
  return (
    <FormProvider {...formMethods}>
      <form onSubmit={formMethods.handleSubmit(onSubmit)}>
        <div className="space-y-8 divide-y divide-gray-200">
          <div className="space-y-6">
            {/* Form Header */}
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {mode === 'create' ? 'Thêm mới Nhân viên' : 'Cập nhật thông tin Nhân viên'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {mode === 'create' 
                  ? 'Điền thông tin để tạo hồ sơ nhân viên mới.'
                  : 'Cập nhật thông tin trong hồ sơ nhân viên.'}
              </p>
            </div>
            
            {/* Error message */}
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}
            
            {/* Loading indicator */}
            {isLoadingEmployee && (
              <div className="flex justify-center py-4">
                <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
            
            {/* Form Sections */}
            {!isLoadingEmployee && (
              <>
                <BasicInfoSection isEditable={canEdit} mode={mode} />
                <OrganizationSection isEditable={canEdit} />
                <SkillsSection 
                  isEditable={canEdit} 
                  skills={skills} 
                  onSkillsChange={handleSkillsChange}
                  userRole={user?.role}
                />
                <StatusSection isEditable={canEdit} />
              </>
            )}
            
            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-5">
              <button
                type="button"
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !canEdit}
                className={`py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white ${
                  canEdit 
                    ? 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xử lý...
                  </span>
                ) : mode === 'create' ? 'Tạo nhân viên' : 'Cập nhật'
                }
              </button>
            </div>
          </div>
        </div>
      </form>
      
      {/* Cancel Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        title="Xác nhận hủy bỏ"
        message="Bạn có thay đổi chưa được lưu. Bạn có chắc chắn muốn hủy bỏ?"
        confirmLabel="Hủy bỏ thay đổi"
        cancelLabel="Tiếp tục chỉnh sửa"
        confirmVariant="danger"
        onConfirm={() => navigate('/hrm/employees')}
      />
      
      {/* Save Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        title="Xác nhận lưu thay đổi"
        message="Bạn có chắc chắn muốn lưu thay đổi thông tin nhân viên?"
        confirmLabel="Lưu thay đổi"
        confirmVariant="primary"
        cancelLabel="Hủy"
        onConfirm={() => saveEmployeeData(formMethods.getValues())}
      />
    </FormProvider>
  );
};

export default EmployeeForm; 
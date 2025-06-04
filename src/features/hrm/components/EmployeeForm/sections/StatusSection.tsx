import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../../../../../hooks/useAuth';
import apiClient from '../../../../../services/core/axios';
import { useNotifications } from '../../../../../context/NotificationContext';
import { ConfirmationDialog } from '../../../../../components/modals/ConfirmationDialog';

// Define the EmployeeStatus type based on the available status options
type EmployeeStatus = 'Available' | 'Allocated' | 'Ending Soon' | 'On Leave' | 'Resigned' | 'Probation';

// Định nghĩa giao diện cho thông tin dự án từ API
interface Project {
  id: number;
  name: string;
  contractId?: number;
  contractCode?: string;
  client?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

interface StatusSectionProps {
  isEditable: boolean;
}

const StatusSection: React.FC<StatusSectionProps> = ({ isEditable }) => {
  const { register, formState: { errors }, watch, setValue, getValues } = useFormContext();
  const [expanded, setExpanded] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<EmployeeStatus | null>(null);
  
  const { hasPermission } = useAuth();
  const { showToast } = useNotifications();
  
  const status = watch('status') as EmployeeStatus;

  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projectsForStatusSection'],
    queryFn: async (): Promise<Project[]> => {
      try {
        const response = await apiClient.get('/api/v1/contracts', {
          params: { status: 'Active', page: 1, limit: 100 }
        });
        if (response.data?.data?.content) {
          return response.data.data.content.map((contract: any) => ({
            id: contract.id,
            name: contract.name,
            contractId: contract.id,
            contractCode: contract.contractCode,
            client: contract.clientName,
            startDate: contract.startDate,
            endDate: contract.endDate,
            status: contract.status
          }));
        }
        return [];
      } catch (error) {
        console.error('Lỗi khi lấy danh sách dự án cho StatusSection:', error);
        showToast('error', 'Lỗi tải dữ liệu', 'Không thể tải danh sách dự án.');
        return [];
      }
    },
  });
  
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as EmployeeStatus;
    const currentHasProjects = status === 'Allocated' || status === 'Ending Soon';
    const newHasProjects = newStatus === 'Allocated' || newStatus === 'Ending Soon';
    
    if (currentHasProjects && !newHasProjects) {
      setPendingStatusChange(newStatus);
      setShowConfirmation(true);
    } else {
      setValue('status', newStatus);
      if (!newHasProjects) {
        clearProjectFields();
      }
    }
  };
  
  const confirmStatusChange = () => {
    if (pendingStatusChange) {
      setValue('status', pendingStatusChange);
      clearProjectFields();
      setPendingStatusChange(null);
      setShowConfirmation(false);
    }
  };

  const clearProjectFields = () => {
    setValue('statusProjectName', '');
    setValue('statusProjectStartDate', '');
    setValue('statusProjectEndDate', '');
    setValue('statusAllocationPercentage', 0);
    setValue('statusProjectContractId', undefined);
    setValue('statusClientName', '');
    setValue('statusIsBillable', false);
  };
  
  const cancelStatusChange = () => {
    setPendingStatusChange(null);
    setShowConfirmation(false);
    setValue('status', getValues('status')); 
  };
  
  const updateSelectedProjectDetails = (projectIdStr: string) => {
    const projectId = parseInt(projectIdStr, 10);
    const selectedProject = projects?.find(p => p.id === projectId);
    
    if (selectedProject) {
      setValue('statusProjectName', selectedProject.name, { shouldValidate: true });
      setValue('statusProjectContractId', selectedProject.contractId || selectedProject.id);
      setValue('statusClientName', selectedProject.client || '');
      showToast('info','Thông tin dự án', `Đã chọn dự án: ${selectedProject.name}`);
    } else if (!projectIdStr) {
        setValue('statusProjectName', '');
        setValue('statusProjectContractId', undefined);
        setValue('statusClientName', '');
    }
  };
  
  const canEditStatus = isEditable && (
    hasPermission('employee-status:update:all') || 
    hasPermission('employee-status:update:team')
  );
  
  const showProjectRelatedFields = status === 'Allocated' || status === 'Ending Soon';
  const showLeaveDate = status === 'On Leave';
  const showResignationDate = status === 'Resigned';
  
  return (
    <div className="bg-white shadow-sm rounded-lg mb-6 overflow-hidden">
      {/* Header */}
      <div 
        className="px-4 py-5 border-b border-gray-200 sm:px-6 cursor-pointer flex justify-between items-center"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Trạng thái & Phân bổ
        </h3>
        <span className="text-gray-400">
          {expanded ? (
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </span>
      </div>
      
      {expanded && (
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-6">
            {/* Trạng thái */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Trạng thái nhân viên <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                {...register('status', { required: 'Trạng thái nhân viên là bắt buộc' })}
                className={`mt-1 block w-full pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
                  errors.status ? 'border-red-300' : 'border-gray-300'
                } ${!canEditStatus ? 'bg-gray-100' : ''}`}
                onChange={handleStatusChange}
                disabled={!canEditStatus}
                defaultValue={getValues('status') || ''}
              >
                <option value="">-- Chọn trạng thái --</option>
                <option value="Available">Sẵn sàng nhận dự án</option>
                <option value="Allocated">Đã phân bổ vào dự án</option>
                <option value="Ending Soon">Sắp kết thúc dự án</option>
                <option value="On Leave">Đang nghỉ phép</option>
                <option value="Resigned">Đã nghỉ việc</option>
                <option value="Probation">Đang thử việc</option>
              </select>
              {errors.status && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.status.message?.toString()}
                </p>
              )}
            </div>
            
            <ConfirmationDialog
              isOpen={showConfirmation}
              onClose={cancelStatusChange}
              onConfirm={confirmStatusChange}
              title="Xác nhận thay đổi trạng thái"
              message={
                pendingStatusChange === 'Allocated' || pendingStatusChange === 'Ending Soon'
                  ? 'Bạn sắp thay đổi trạng thái nhân viên. Điều này sẽ yêu cầu thêm thông tin về dự án được phân bổ.'
                  : 'Bạn sắp thay đổi trạng thái nhân viên từ trạng thái liên quan đến dự án. Điều này sẽ xóa thông tin phân bổ dự án hiện tại.'
              }
              confirmLabel="Xác nhận"
              cancelLabel="Hủy"
              confirmVariant={pendingStatusChange === 'Resigned' ? 'danger' : 'primary'}
            />
            
            {showProjectRelatedFields && (
              <div className="border-t border-gray-200 pt-6 mt-6 space-y-6">
                <h4 className="text-md font-medium text-gray-900">Thông tin phân bổ dự án</h4>
                
                <div>
                  <label htmlFor="statusSelectedProjectId" className="block text-sm font-medium text-gray-700">
                    Chọn dự án (để điền nhanh thông tin)
                  </label>
                  <select
                    id="statusSelectedProjectId"
                    onChange={(e) => updateSelectedProjectDetails(e.target.value)}
                    disabled={!canEditStatus || isLoadingProjects}
                    className={`mt-1 block w-full pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
                      !canEditStatus || isLoadingProjects ? 'bg-gray-100' : 'border-gray-300'
                    }`}
                    defaultValue=""
                  >
                    <option value="">-- Chọn dự án --</option>
                    {projects?.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name} {project.client ? `(${project.client})` : ''}
                      </option>
                    ))}
                  </select>
                  {isLoadingProjects && <p className="text-sm text-gray-500 mt-1">Đang tải danh sách dự án...</p>}
                </div>

                <div>
                  <label htmlFor="statusProjectName" className="block text-sm font-medium text-gray-700">
                    Tên dự án <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="statusProjectName"
                    type="text"
                    {...register('statusProjectName', { 
                      required: showProjectRelatedFields ? 'Tên dự án là bắt buộc' : false 
                    })}
                    className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md ${errors.statusProjectName ? 'border-red-300' : 'border-gray-300' } ${!canEditStatus ? 'bg-gray-100' : ''}`}
                    disabled={!canEditStatus}
                  />
                  {errors.statusProjectName && (
                    <p className="mt-2 text-sm text-red-600">{errors.statusProjectName.message?.toString()}</p>
                  )}
                </div>
                
                <input type="hidden" {...register('statusClientName')} />
                <input type="hidden" {...register('statusProjectContractId')} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="statusProjectStartDate" className="block text-sm font-medium text-gray-700">
                      Ngày bắt đầu phân bổ <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="statusProjectStartDate"
                      type="date"
                      {...register('statusProjectStartDate', { 
                        required: showProjectRelatedFields ? 'Ngày bắt đầu phân bổ là bắt buộc' : false 
                      })}
                      className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md ${errors.statusProjectStartDate ? 'border-red-300' : 'border-gray-300' } ${!canEditStatus ? 'bg-gray-100' : ''}`}
                      disabled={!canEditStatus}
                    />
                    {errors.statusProjectStartDate && (
                      <p className="mt-2 text-sm text-red-600">{errors.statusProjectStartDate.message?.toString()}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="statusProjectEndDate" className="block text-sm font-medium text-gray-700">
                      Ngày kết thúc phân bổ (dự kiến)
                    </label>
                    <input
                      id="statusProjectEndDate"
                      type="date"
                      {...register('statusProjectEndDate')}
                      className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md border-gray-300 ${!canEditStatus ? 'bg-gray-100' : ''}`}
                      disabled={!canEditStatus}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="statusAllocationPercentage" className="block text-sm font-medium text-gray-700">
                        Tỷ lệ phân bổ (%) <span className="text-red-500">*</span>
                        </label>
                        <input
                        id="statusAllocationPercentage"
                        type="number"
                        min="1"
                        max="100"
                        {...register('statusAllocationPercentage', {
                            required: showProjectRelatedFields ? 'Tỷ lệ phân bổ là bắt buộc' : false,
                            min: { value: 1, message: 'Tỷ lệ phân bổ phải ít nhất là 1%' },
                            max: { value: 100, message: 'Tỷ lệ phân bổ không thể vượt quá 100%' },
                            valueAsNumber: true,
                        })}
                        className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md ${errors.statusAllocationPercentage ? 'border-red-300' : 'border-gray-300'} ${!canEditStatus ? 'bg-gray-100' : ''}`}
                        disabled={!canEditStatus}
                        />
                        {errors.statusAllocationPercentage && (
                        <p className="mt-2 text-sm text-red-600">{errors.statusAllocationPercentage.message?.toString()}</p>
                        )}
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Thanh toán</label>
                        <label htmlFor="statusIsBillable" className="flex items-center mt-2 pt-1">
                            <input
                            id="statusIsBillable"
                            type="checkbox"
                            {...register('statusIsBillable')}
                            disabled={!canEditStatus}
                            className={`h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 ${!canEditStatus ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            />
                            <span className="ml-2 text-sm text-gray-700">
                            Có tính phí (Billable)
                            </span>
                        </label>
                    </div>
                </div>
              </div>
            )}
            
            {showResignationDate && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-2">Thông tin nghỉ việc</h4>
                <div>
                  <label htmlFor="resignationDate" className="block text-sm font-medium text-gray-700">
                    Ngày nghỉ việc <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="resignationDate"
                    type="date"
                    {...register('resignationDate', { 
                      required: status === 'Resigned' ? 'Ngày nghỉ việc là bắt buộc' : false 
                    })}
                    className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md ${errors.resignationDate ? 'border-red-300' : 'border-gray-300'} ${!canEditStatus ? 'bg-gray-100' : ''}`}
                    disabled={!canEditStatus}
                  />
                  {errors.resignationDate && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.resignationDate.message?.toString()}
                    </p>
                  )}
                </div>
              </div>
            )}
                
            {showLeaveDate && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                 <h4 className="text-md font-medium text-gray-900 mb-2">Thông tin nghỉ phép</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="leaveStartDate" className="block text-sm font-medium text-gray-700">
                      Ngày bắt đầu nghỉ <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="leaveStartDate"
                      type="date"
                      {...register('leaveStartDate', { 
                        required: status === 'On Leave' ? 'Ngày bắt đầu nghỉ là bắt buộc' : false 
                      })}
                      className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md ${errors.leaveStartDate ? 'border-red-300' : 'border-gray-300'} ${!canEditStatus ? 'bg-gray-100' : ''}`}
                      disabled={!canEditStatus}
                    />
                    {errors.leaveStartDate && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.leaveStartDate.message?.toString()}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="leaveEndDate" className="block text-sm font-medium text-gray-700">
                      Ngày kết thúc nghỉ (dự kiến)
                    </label>
                    <input
                      id="leaveEndDate"
                      type="date"
                      {...register('leaveEndDate')}
                      className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md border-gray-300 ${!canEditStatus ? 'bg-gray-100' : ''}`}
                      disabled={!canEditStatus}
                    />
                     {errors.leaveEndDate && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.leaveEndDate.message?.toString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-6 mt-6">
              <label htmlFor="statusNote" className="block text-sm font-medium text-gray-700">
                Ghi chú trạng thái
              </label>
              <textarea
                id="statusNote"
                {...register('statusNote')}
                rows={4}
                className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md border-gray-300 ${!canEditStatus ? 'bg-gray-100' : ''}`}
                disabled={!canEditStatus}
                placeholder="Thêm ghi chú cho thay đổi trạng thái này (ví dụ: lý do nghỉ phép, chi tiết phân bổ,...)"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusSection; 
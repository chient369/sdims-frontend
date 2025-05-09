import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../../../../../hooks/useAuth';
import apiClient from '../../../../../services/core/axios';
import { useNotifications } from '../../../../../context/NotificationContext';
import { ConfirmationDialog } from '../../../../../components/modals/ConfirmationDialog';
import { useContractService } from '../../../../contracts/hooks/useContractService';

// Define the EmployeeStatus type based on the available status options
type EmployeeStatus = 'Available' | 'Allocated' | 'Ending Soon' | 'On Leave' | 'Resigned' | 'Probation';

// Định nghĩa giao diện cho một phân bổ dự án
interface ProjectAllocation {
  id?: number;
  projectId?: number;
  projectName: string;
  startDate: string;
  endDate?: string;
  allocation: number; // Tỷ lệ phân bổ (%)
  position?: string;
  role?: string;
  billingRate?: number;
  contractId?: number;
  contractCode?: string;
}

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
  const [allocations, setAllocations] = useState<ProjectAllocation[]>([]);
  const [totalAllocation, setTotalAllocation] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<EmployeeStatus | null>(null);
  
  const { hasPermission } = useAuth();
  const { showToast } = useNotifications();
  
  // Watch status to show/hide conditional fields
  const status = watch('status') as EmployeeStatus;
  
  // Fetch projects data
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async (): Promise<Project[]> => {
      try {
        // Gọi API danh sách hợp đồng và lấy thông tin dự án từ hợp đồng
        const response = await apiClient.get('/api/v1/contracts', {
          params: {
            status: 'Active', // Chỉ lấy các hợp đồng đang hoạt động
            page: 1,
            limit: 50,
          }
        });
        
        // Chuyển đổi dữ liệu hợp đồng thành danh sách dự án
        if (response.data?.content) {
          const projectList = response.data.content.map((contract: any) => ({
            id: contract.id,
            name: contract.name,
            contractId: contract.id,
            contractCode: contract.contractCode,
            client: contract.clientName,
            startDate: contract.startDate,
            endDate: contract.endDate,
            status: contract.status
          }));
          return projectList;
        }
        return [];
      } catch (error) {
        console.error('Lỗi khi lấy danh sách dự án:', error);
        // Fallback to mock data nếu API chưa sẵn sàng
        return [
          { id: 1, name: 'Dự án A', client: 'Công ty ABC' },
          { id: 2, name: 'Dự án B', client: 'Công ty DEF' },
          { id: 3, name: 'Dự án C', client: 'Công ty GHI' },
          { id: 4, name: 'Dự án D', client: 'Công ty JKL' },
        ];
      }
    },
  });
  
  // Load allocations từ form nếu có
  useEffect(() => {
    const formAllocations = getValues('allocations');
    if (formAllocations && Array.isArray(formAllocations) && formAllocations.length > 0) {
      setAllocations(formAllocations);
    }
  }, [getValues]);
  
  // Tính tổng tỷ lệ phân bổ
  useEffect(() => {
    const total = allocations.reduce((sum, item) => sum + (item.allocation || 0), 0);
    setTotalAllocation(total);
    
    // Cập nhật allocations vào form data
    setValue('allocations', allocations);
  }, [allocations, setValue]);
  
  // Xử lý thay đổi trạng thái
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as EmployeeStatus;
    
    // Nếu chuyển từ trạng thái có dự án sang trạng thái không có dự án, hoặc ngược lại
    const currentHasProjects = status === 'Allocated' || status === 'Ending Soon';
    const newHasProjects = newStatus === 'Allocated' || newStatus === 'Ending Soon';
    
    if (currentHasProjects !== newHasProjects) {
      setPendingStatusChange(newStatus);
      setShowConfirmation(true);
    } else {
      setValue('status', newStatus);
    }
  };
  
  // Xác nhận thay đổi trạng thái
  const confirmStatusChange = () => {
    if (pendingStatusChange) {
      setValue('status', pendingStatusChange);
      setAllocations([]);
      setPendingStatusChange(null);
      setShowConfirmation(false);
    }
  };
  
  // Hủy thay đổi trạng thái
  const cancelStatusChange = () => {
    setPendingStatusChange(null);
    setShowConfirmation(false);
  };
  
  // Thêm một phân bổ dự án mới
  const addProjectAllocation = () => {
    if (totalAllocation >= 100) {
      showToast('error', 'Lỗi phân bổ dự án', 'Tổng tỷ lệ phân bổ không thể vượt quá 100%');
      return;
    }
    
    setAllocations([
      ...allocations,
      {
        projectName: '',
        startDate: new Date().toISOString().split('T')[0],
        allocation: 0,
        role: '',
        billingRate: 0,
        position: ''
      }
    ]);
  };
  
  // Xóa một phân bổ dự án
  const removeProjectAllocation = (index: number) => {
    setAllocations(allocations.filter((_, i) => i !== index));
  };
  
  // Cập nhật thông tin phân bổ dự án
  const updateAllocation = (index: number, field: keyof ProjectAllocation, value: any) => {
    const newAllocations = [...allocations];

    if (field === 'allocation') {
      const allocationValue = parseInt(value, 10) || 0;
      const oldAllocationValue = newAllocations[index].allocation || 0;
      
      // Kiểm tra tỷ lệ phân bổ riêng lẻ
      if (allocationValue < 1 && allocationValue !== 0) {
        // Cho phép giá trị 0 (khi xóa) nhưng không cho phép giá trị < 1%
        showToast('error', 'Lỗi phân bổ dự án', 'Tỷ lệ phân bổ phải lớn hơn hoặc bằng 1%');
        return;
      }
      
      // Tính tổng tỷ lệ phân bổ mới (trừ đi giá trị cũ và cộng giá trị mới)
      const newTotalAllocation = totalAllocation - oldAllocationValue + allocationValue;
      
      // Kiểm tra tổng tỷ lệ phân bổ
      if (newTotalAllocation > 100) {
        showToast('error', 'Lỗi phân bổ dự án', `Tổng tỷ lệ phân bổ (${newTotalAllocation}%) không thể vượt quá 100%`);
        return;
      }
      
      newAllocations[index] = {
        ...newAllocations[index],
        [field]: allocationValue
      };
    } else {
      newAllocations[index] = {
        ...newAllocations[index],
        [field]: value
      };
    }
    
    setAllocations(newAllocations);
  };
  
  // Cập nhật dự án được chọn (bao gồm cả projectId)
  const updateSelectedProject = (index: number, e: React.ChangeEvent<HTMLSelectElement>) => {
    const projectId = parseInt(e.target.value, 10);
    const selectedProject = projects?.find(p => p.id === projectId);
    
    if (selectedProject) {
      const newAllocations = [...allocations];
      newAllocations[index] = {
        ...newAllocations[index],
        projectId: selectedProject.id,
        projectName: selectedProject.name,
        contractId: selectedProject.contractId,
        contractCode: selectedProject.contractCode,
      };
      setAllocations(newAllocations);
    }
  };
  
  // Kiểm tra xem người dùng có thể sửa trạng thái phân bổ hay không
  const canEditStatus = isEditable && (
    hasPermission('employee-status:update:all') || 
    hasPermission('employee-status:update:team')
  );
  
  // Kiểm tra xem có hiển thị phần phân bổ dự án không
  const showProjectAllocation = status === 'Allocated' || status === 'Ending Soon';
  
  // Kiểm tra xem có hiển thị phần ngày nghỉ không
  const showLeaveDate = status === 'On Leave';
  
  // Kiểm tra xem có hiển thị phần ngày nghỉ việc không
  const showResignationDate = status === 'Resigned';
  
  return (
    <div className="bg-white shadow-sm rounded-lg mb-6 overflow-hidden">
      {/* Header */}
      <div 
        className="px-4 py-5 border-b border-gray-200 sm:px-6 cursor-pointer flex justify-between items-center"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Trạng thái & Phân bổ dự án
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
      
      {/* Content */}
      {expanded && (
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-6">
            {/* Trạng thái */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Trạng thái nhân viên <span className="text-red-500">*</span>
              </label>
              <select
                {...register('status', { required: 'Trạng thái nhân viên là bắt buộc' })}
                className={`mt-1 block w-full pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
                  errors.status ? 'border-red-300' : 'border-gray-300'
                } ${!canEditStatus ? 'bg-gray-100' : ''}`}
                onChange={handleStatusChange}
                disabled={!canEditStatus}
              >
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
            
            {/* Hiển thị xác nhận khi thay đổi trạng thái - Thay thế bằng ConfirmationDialog */}
            <ConfirmationDialog
              isOpen={showConfirmation}
              onClose={() => setShowConfirmation(false)}
              onConfirm={confirmStatusChange}
              title="Xác nhận thay đổi trạng thái"
              message={
                pendingStatusChange === 'Allocated'
                  ? 'Bạn sắp thay đổi trạng thái nhân viên thành "Đã phân bổ vào dự án". Điều này sẽ yêu cầu thêm thông tin về dự án được phân bổ.'
                  : 'Bạn sắp thay đổi trạng thái nhân viên từ "Đã phân bổ vào dự án" thành trạng thái khác. Điều này sẽ xóa tất cả thông tin phân bổ dự án hiện tại.'
              }
              confirmLabel="Xác nhận"
              cancelLabel="Hủy"
              confirmVariant={pendingStatusChange === 'Resigned' ? 'danger' : 'primary'}
            />
            
            {/* Phân bổ dự án */}
            {showProjectAllocation && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="text-md font-medium text-gray-900 mb-4">Phân bổ dự án</h4>
                
                {/* Hiển thị danh sách phân bổ */}
                {allocations.length === 0 ? (
                  <div className="text-sm text-gray-500 italic mb-4">
                    Chưa có dự án nào được phân bổ. Sử dụng nút "Thêm dự án" để thêm phân bổ.
                  </div>
                ) : (
                  <div className="space-y-4 mb-4">
                    {allocations.map((allocation, index) => (
                      <div key={index} className="border rounded-md p-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {/* Tên dự án */}
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Tên dự án <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={allocation.projectId || ''}
                              onChange={(e) => updateSelectedProject(index, e)}
                              disabled={!canEditStatus}
                              className={`mt-1 block w-full pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
                                !canEditStatus ? 'bg-gray-100' : 'border-gray-300'
                              }`}
                            >
                              <option value="">-- Chọn dự án --</option>
                              {projects?.map(project => (
                                <option key={project.id} value={project.id}>
                                  {project.name} {project.client ? `(${project.client})` : ''}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          {/* Tỷ lệ phân bổ */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Tỷ lệ phân bổ (%) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={allocation.allocation || ''}
                              onChange={(e) => updateAllocation(index, 'allocation', e.target.value)}
                              disabled={!canEditStatus}
                              className={`mt-1 block w-full pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
                                !canEditStatus ? 'bg-gray-100' : 'border-gray-300'
                              }`}
                            />
                          </div>
                          
                          {/* Vai trò */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Vai trò
                            </label>
                            <input
                              type="text"
                              value={allocation.role || ''}
                              onChange={(e) => updateAllocation(index, 'role', e.target.value)}
                              disabled={!canEditStatus}
                              className={`mt-1 block w-full pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
                                !canEditStatus ? 'bg-gray-100' : 'border-gray-300'
                              }`}
                              placeholder="Ví dụ: Developer, PM, QA, ..."
                            />
                          </div>
                          
                          {/* Billing Rate */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Billing Rate ($/h)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={allocation.billingRate || ''}
                              onChange={(e) => updateAllocation(index, 'billingRate', e.target.value)}
                              disabled={!canEditStatus}
                              className={`mt-1 block w-full pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
                                !canEditStatus ? 'bg-gray-100' : 'border-gray-300'
                              }`}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                          {/* Ngày bắt đầu */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Ngày bắt đầu <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              value={allocation.startDate || ''}
                              onChange={(e) => updateAllocation(index, 'startDate', e.target.value)}
                              disabled={!canEditStatus}
                              className={`mt-1 block w-full pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
                                !canEditStatus ? 'bg-gray-100' : 'border-gray-300'
                              }`}
                            />
                          </div>
                          
                          {/* Ngày kết thúc */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Ngày kết thúc
                            </label>
                            <input
                              type="date"
                              value={allocation.endDate || ''}
                              onChange={(e) => updateAllocation(index, 'endDate', e.target.value)}
                              disabled={!canEditStatus}
                              className={`mt-1 block w-full pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
                                !canEditStatus ? 'bg-gray-100' : 'border-gray-300'
                              }`}
                            />
                          </div>
                          
                          {/* Vị trí */}
                <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Vị trí
                  </label>
                  <input
                    type="text"
                              value={allocation.position || ''}
                              onChange={(e) => updateAllocation(index, 'position', e.target.value)}
                              disabled={!canEditStatus}
                              className={`mt-1 block w-full pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
                                !canEditStatus ? 'bg-gray-100' : 'border-gray-300'
                              }`}
                              placeholder="Ví dụ: Frontend Developer, Backend Developer, ..."
                            />
                          </div>
                        </div>
                        
                        {/* Nút xóa phân bổ */}
                        {canEditStatus && (
                          <div className="mt-3 flex justify-end">
                            <button
                              type="button"
                              onClick={() => removeProjectAllocation(index)}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              Xóa
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Hiển thị tổng phân bổ */}
                {allocations.length > 0 && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Tổng tỷ lệ phân bổ:</span>
                      <span className={`font-bold text-lg ${totalAllocation > 100 ? 'text-red-600' : ''}`}>
                        {totalAllocation}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${totalAllocation > 100 ? 'bg-red-600' : 'bg-green-600'}`}
                        style={{ width: `${Math.min(totalAllocation, 100)}%` }}
                      ></div>
                    </div>
                    {totalAllocation > 100 && (
                      <p className="text-sm text-red-600 mt-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="inline h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Tổng tỷ lệ phân bổ vượt quá 100%. Vui lòng điều chỉnh lại.
                      </p>
                  )}
                </div>
                )}
                
                {/* Nút thêm dự án mới */}
                {canEditStatus && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={addProjectAllocation}
                      disabled={totalAllocation >= 100}
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                        totalAllocation >= 100 ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                      }`}
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Thêm dự án
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Hiển thị trường ngày nghỉ việc nếu status là Resigned */}
            {showResignationDate && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ngày nghỉ việc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...register('resignationDate', { 
                      required: status === 'Resigned' ? 'Ngày nghỉ việc là bắt buộc' : false 
                    })}
                    className={`mt-1 block w-full pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
                      errors.resignationDate ? 'border-red-300' : 'border-gray-300'
                    } ${!canEditStatus ? 'bg-gray-100' : ''}`}
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
                
            {/* Hiển thị trường ngày nghỉ phép nếu status là On Leave */}
            {showLeaveDate && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Ngày bắt đầu nghỉ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      {...register('leaveStartDate', { 
                        required: status === 'On Leave' ? 'Ngày bắt đầu nghỉ là bắt buộc' : false 
                      })}
                      className={`mt-1 block w-full pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
                        errors.leaveStartDate ? 'border-red-300' : 'border-gray-300'
                      } ${!canEditStatus ? 'bg-gray-100' : ''}`}
                      disabled={!canEditStatus}
                    />
                    {errors.leaveStartDate && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.leaveStartDate.message?.toString()}
                      </p>
                    )}
                  </div>
              <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Ngày kết thúc nghỉ
                </label>
                <input
                  type="date"
                      {...register('leaveEndDate')}
                      className={`mt-1 block w-full pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
                        errors.leaveEndDate ? 'border-red-300' : 'border-gray-300'
                      } ${!canEditStatus ? 'bg-gray-100' : ''}`}
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
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusSection; 
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

import { ContractCreateData, ContractDetail, ContractUpdateData } from '../types';
import { useContractService } from '../hooks/useContractService';
import { usePermissions } from '../../../hooks/usePermissions';
import { useToast } from '../../../hooks/useToast';
import ErrorBoundary from '../../../components/ui/ErrorBoundary';
import { ConfirmationDialog } from '../../../components/modals/ConfirmationDialog';
import { formatCurrency } from '../../../utils/formatters';

// Import sections
import {
  GeneralInfoSection,
  ValuesAndDatesSection,
  PaymentTermsSection,
  RelationshipsSection,
  AttachmentsSection
} from '../components/ContractForm';

/**
 * Contract Form page component
 * Supports both creation of new contracts and editing existing contracts
 */
const ContractForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const contractService = useContractService();
  const { showToast } = useToast();
  const mode = id ? 'edit' : 'create';

  // Form states
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});

  // Permissions
  const { can, user } = usePermissions();
  const canCreateContract = can('contract:create');
  const canEditAllContracts = can('contract:update:all');
  const canEditOwnContracts = can('contract:update:own');
  
  // Form setup
  const methods = useForm<ContractCreateData | ContractUpdateData>({
    defaultValues: {
      contractCode: '',
      name: '',
      customerName: '',
      contractType: 'FixedPrice',
      amount: 0,
      status: 'Draft',
      salesPersonId: user?.id ? Number(user.id) : 0,
      signDate: new Date().toISOString().split('T')[0],
      startDate: new Date().toISOString().split('T')[0],
      paymentTerms: []
    },
    mode: 'onChange'
  });
  
  const { handleSubmit, reset, formState: { isDirty, isValid, errors } } = methods;

  // Check permission for contract editing
  const hasEditPermission = (contract?: ContractDetail): boolean => {
    if (!contract) return canCreateContract;
    if (canEditAllContracts) return true;
    if (canEditOwnContracts && contract.salesPerson?.id === (user?.id ? Number(user.id) : undefined)) return true;
    return false;
  };

  // Fetch contract data if in edit mode
  const { data: contractData, isLoading: isContractLoading } = useQuery({
    queryKey: ['contract', id],
    queryFn: () => id ? contractService.getContractById(id) : null,
    enabled: !!id
  });
  
  // Xử lý dữ liệu hợp đồng khi tải thành công
  useEffect(() => {
    if (contractData) {
      const contract = contractData.data;
      // Map response to form data
      reset({
        contractCode: contract.contractCode,
        name: contract.name,
        customerName: contract.customerName,
        contractType: contract.contractType,
        amount: contract.amount,
        status: contract.status,
        signDate: contract.signDate.split('T')[0],
        startDate: contract.startDate.split('T')[0],
        endDate: contract.endDate?.split('T')[0],
        salesPersonId: contract.salesPerson.id,
        description: contract.description,
      });

      // Check permission
      if (!hasEditPermission(contract)) {
        showToast({ title: 'Lỗi', message: 'Bạn không có quyền chỉnh sửa hợp đồng này', type: 'error' });
        navigate('/contracts');
      }
    }
  }, [contractData, reset, navigate, showToast, hasEditPermission]);

  // Create contract mutation
  const createMutation = useMutation({
    mutationFn: (data: ContractCreateData) => contractService.createContract(data),
    onSuccess: (response) => {
      showToast({ title: 'Thành công', message: 'Tạo hợp đồng thành công', type: 'success' });
      navigate(`/contracts/${response.id}`);
    },
    onError: (error) => {
      showToast({ title: 'Lỗi', message: 'Tạo hợp đồng thất bại: ' + (error as Error).message, type: 'error' });
    }
  });

  // Update contract mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: ContractUpdateData }) => 
      contractService.updateContract(id, data),
    onSuccess: (response) => {
      showToast({ title: 'Thành công', message: 'Cập nhật hợp đồng thành công', type: 'success' });
      navigate(`/contracts/${response.id}`);
    },
    onError: (error) => {
      showToast({ title: 'Lỗi', message: 'Cập nhật hợp đồng thất bại: ' + (error as Error).message, type: 'error' });
    }
  });

  // Form submission
  const onSubmit = (data: ContractCreateData | ContractUpdateData) => {
    if (mode === 'create') {
      createMutation.mutate(data as ContractCreateData);
    } else if (id) {
      updateMutation.mutate({ id, data });
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (isDirty) {
      setShowConfirmDialog(true);
      setConfirmAction(() => () => {
        navigate(id ? `/contracts/${id}` : '/contracts');
      });
    } else {
      navigate(id ? `/contracts/${id}` : '/contracts');
    }
  };

  // Update form dirty state
  useEffect(() => {
    setIsFormDirty(isDirty);
  }, [isDirty]);

  // Prevent navigation if form is dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isFormDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isFormDirty]);

  // Check permissions
  if (mode === 'create' && !canCreateContract) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Không có quyền truy cập</h1>
        <p className="mb-4">Bạn không có quyền tạo hợp đồng mới.</p>
        <button
          onClick={() => navigate('/contracts')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Quay lại danh sách hợp đồng
        </button>
      </div>
    );
  }

  const contract = contractData?.data.contract;

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen bg-gray-50">       
        {/* Header with back button */}
        <div className="bg-white shadow-sm px-1 py-4 flex items-center border-b border-gray-200">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mr-4 p-1.5 rounded-full text-gray-500 hover:bg-gray-100"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-medium text-gray-900">
            {mode === 'create' ? 'Thêm mới Hợp đồng' : `Chỉnh sửa Hợp đồng: ${contract?.name || ''}`}
          </h1>
        </div>

        {/* Form content */}
        <div className="w-full">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-6">
                <GeneralInfoSection 
                  mode={mode} 
                  isLoading={isContractLoading || createMutation.isPending || updateMutation.isPending} 
                />

                <ValuesAndDatesSection 
                  mode={mode} 
                  isLoading={isContractLoading || createMutation.isPending || updateMutation.isPending} 
                />

                <PaymentTermsSection 
                  mode={mode} 
                  isLoading={isContractLoading || createMutation.isPending || updateMutation.isPending}
                  contractId={id}
                  contractAmount={Number(methods.watch('amount'))}
                />

                <RelationshipsSection 
                  mode={mode} 
                  isLoading={isContractLoading || createMutation.isPending || updateMutation.isPending}
                  contractId={id}
                />

                <AttachmentsSection 
                  mode={mode} 
                  isLoading={isContractLoading || createMutation.isPending || updateMutation.isPending}
                  contractId={id}
                />
              </div>
            </form>
          </FormProvider>
        </div>

        {/* Footer with action buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-medium"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || createMutation.isPending || updateMutation.isPending}
            className={`px-6 py-2 rounded text-white font-medium ${
              !isValid || createMutation.isPending || updateMutation.isPending
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {createMutation.isPending || updateMutation.isPending 
              ? 'Đang lưu...' 
              : 'Lưu'}
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={() => {
          confirmAction();
          setShowConfirmDialog(false);
        }}
        title="Xác nhận hủy"
        message="Bạn có các thay đổi chưa lưu. Bạn có chắc chắn muốn hủy không?"
        confirmLabel="Đồng ý"
        cancelLabel="Quay lại"
      />
    </ErrorBoundary>
  );
};

export default ContractForm; 
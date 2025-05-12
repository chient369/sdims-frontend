import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui';
import { ContractFilter, ContractTable, ContractSummary } from '../components';
import { ContractListParams, ContractSummary as ContractSummaryType } from '../types';
import { useContractService } from '../hooks/useContractService';
import { PermissionGuard } from '../../../components/ui';
import { PlusIcon, ChartBarIcon } from '@heroicons/react/24/outline';

/**
 * ContractList là trang danh sách hợp đồng (MH-CTR-01)
 * Hiển thị danh sách hợp đồng với các chức năng:
 * - Lọc, tìm kiếm
 * - Hiển thị bảng dữ liệu
 * - Tổng hợp giá trị
 * - Thêm mới hợp đồng (phụ thuộc vào quyền)
 */
const ContractList: React.FC = () => {
  const navigate = useNavigate();
  const contractService = useContractService();
  
  // State cho danh sách hợp đồng và metadata
  const [contracts, setContracts] = useState<ContractSummaryType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalContracts, setTotalContracts] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  
  // State cho việc lọc và phân trang
  const [filterParams, setFilterParams] = useState<ContractListParams>({
    page: 1,
    size: 10,
    sortBy: 'createdAt',
    sortDirection: 'desc'
  });
  
  // Lấy danh sách hợp đồng từ API
  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await contractService.getContracts(filterParams);
      setContracts(response.data.content);
      setTotalContracts(response.data.pageable.totalElements);
      setTotalPages(response.data.pageable.totalPages);
      setError(null);
    } catch (err) {
      console.error('Error fetching contracts:', err);
      setError('Có lỗi xảy ra khi tải danh sách hợp đồng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [contractService, filterParams]);
  
  // Lấy danh sách hợp đồng khi component mount hoặc filterParams thay đổi
  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);
  
  // Xử lý khi thay đổi filter
  const handleFilterChange = (newParams: Partial<ContractListParams>) => {
    setFilterParams(prev => ({
      ...prev,
      ...newParams,
      page: 1 // Reset về trang 1 khi thay đổi filter
    }));
  };
  
  // Xử lý thay đổi trang
  const handlePageChange = (page: number) => {
    setFilterParams(prev => ({
      ...prev,
      page
    }));
  };
  
  // Xử lý thay đổi số lượng records/trang
  const handleLimitChange = (limit: number) => {
    setFilterParams(prev => ({
      ...prev,
      size: limit,
      page: 1 // Reset về trang 1 khi thay đổi số lượng records/trang
    }));
  };
  
  // Xử lý sắp xếp
  const handleSortChange = (sortBy: string, sortDirection: 'asc' | 'desc') => {
    setFilterParams(prev => ({
      ...prev,
      sortBy,
      sortDirection
    }));
  };
  
  // Điều hướng đến trang thêm mới hợp đồng
  const handleAddNew = () => {
    navigate('/contracts/create');
  };
  
  // Điều hướng đến trang quản lý KPI
  const handleNavigateToKPI = () => {
    navigate('/contracts/kpi-management');
  };
  
  // Điều hướng đến trang chi tiết hợp đồng
  const handleViewDetail = (contractId: number) => {
    navigate(`/contracts/${contractId}`);
  };
  
  return (
      <div className="space-y-6">
        {/* Header with title and actions */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý Hợp đồng</h1>
          <div className="flex gap-2">
            <PermissionGuard
              requiredPermission="sales-kpi:read:all"
              fallback={null}
            >
              <button
                onClick={handleNavigateToKPI}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
              >
                <ChartBarIcon className="w-4 h-4" />
                <span>Quản lý KPI</span>
              </button>
            </PermissionGuard>
            <PermissionGuard
              requiredPermission="contract:create"
              fallback={null}
            >
              <button
                onClick={handleAddNew}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Thêm mới</span>
              </button>
            </PermissionGuard>
          </div>
        </div>
        
        {/* Filter section */}
        <Card className="overflow-visible">
          <ContractFilter
            initialValues={filterParams}
            onFilterChange={handleFilterChange}
          />
        </Card>
        
        {/* Error message if any */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md">
            {error}
          </div>
        )}
        
        {/* Summary section - responsive on smaller screens */}
        <div className="lg:flex lg:space-x-4 space-y-4 lg:space-y-0 h-[calc(100vh-220px)]">
          <div className="lg:w-3/4 h-full">
            {/* Table section */}
            <Card className="h-full p-0 overflow-hidden">
              <ContractTable
                contracts={contracts}
                loading={loading}
                page={filterParams.page || 1}
                limit={filterParams.size || 10}
                total={totalContracts}
                totalPages={totalPages}
                sortBy={filterParams.sortBy}
                sortDirection={filterParams.sortDirection || 'desc'}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
                onSortChange={handleSortChange}
                onViewDetail={handleViewDetail}
              />
            </Card>
          </div>
          
          <div className="lg:w-1/4 h-full">
            {/* Summary section */}
            <Card className="h-full">
              <ContractSummary 
                contracts={contracts}
                loading={loading}
              />
            </Card>
          </div>
        </div>
      </div>
  );
};

export default ContractList; 
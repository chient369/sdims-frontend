/**
 * MarginList Page
 * 
 * Hiển thị danh sách margin của nhân viên với các bộ lọc, bảng dữ liệu và tổng hợp.
 * API tích hợp: API-MGN-001, API-MGN-002
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEmployeeMargins } from '../api';
import { 
  EmployeeMarginResponse, 
  EmployeeMarginListParams,
  MarginSummary,
  MarginStatusType,
  PeriodType
} from '../types';
import { Card, Tooltip, Button, Spinner, Heading } from '../../../components/ui';
import { Table } from '../../../components/table';
import {
  MarginStatusBadge,
  MarginFilters,
} from '../components';
import { useAuth } from '../../../context/AuthContext';

const MarginList = () => {
  const navigate = useNavigate();
  
  // Get auth context for permission checking
  const { state, hasPermission, hasAllPermission, hasAnyPermission } = useAuth();
  const { user } = state;
  
  // State for margin data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employeeMargins, setEmployeeMargins] = useState<EmployeeMarginResponse[]>([]);
  const [summary, setSummary] = useState<MarginSummary | null>(null);
  
  // State for pagination
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalPages: 0,
    totalElements: 0
  });
  
  // State for filters
  const [filters, setFilters] = useState<EmployeeMarginListParams>({
    period: 'month' as PeriodType,
    yearMonth: new Date().toISOString().slice(0, 7),  // Default to current month (YYYY-MM)
    sortBy: 'margin',
    sortDir: 'desc',
    page: 1,
    size: 10
  });

  // Thêm vào phần đầu component, sau phần khai báo các state khác
  const [tablePagination, setTablePagination] = useState({
    pageIndex: pagination.pageNumber,
    pageSize: pagination.pageSize,
  });

  // Lấy teamId của người dùng (nếu có)
  const userTeamId = useMemo(() => {
    if (user?.teams && user.teams.length > 0) {
      return Number(user.teams[0].id);
    }
    return undefined;
  }, [user]);

  // Check user's access level and set permissions
  const accessScope = useMemo(() => {
    // If user has margin:read:all permission, they can view all
    if (hasPermission('margin:read:all')) {
      return 'all';
    }
    
    // If user has margin:read:team, they can view their team
    if (hasPermission('margin:read:team')) {
      return 'team';
    }
    
    // Default to own access (margin:read:own)
    return 'own';
  }, [hasPermission]);

  // Set up filters based on permissions
  useEffect(() => {
    // If user only has access to own data, set employeeId filter
    if (accessScope === 'own' && user?.id) {
      setFilters(prev => ({
        ...prev,
        employeeId: Number(user.id),
      }));
    }
    
    // If user only has access to team data, set teamId filter
    if (accessScope === 'team' && userTeamId) {
      setFilters(prev => ({
        ...prev,
        teamId: Number(userTeamId),
      }));
    }
  }, [accessScope, user, userTeamId]);

  // Fetch margin data with current filters
  const fetchMarginData = async () => {
    setLoading(true);
    setError(null);
  
    try {
      const response = await getEmployeeMargins({
        ...filters,
        page: filters.page
      });
      
      // Kiểm tra format response (có thể là định dạng mới hoặc cũ)
      if (response.status === 'success' && response.data) {
        // Định dạng mới: { status, code, data: { content, summary, pageable } }
        setEmployeeMargins(response.data.content);
        setSummary(response.data.summary);
        setPagination({
          pageNumber: response.data.pageable.pageNumber - 1, // API starts at 1, but component at 0
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.pageable.totalPages,
          totalElements: response.data.pageable.totalElements
        });
      } else if (response.content && response.summary && response.pageable) {
        // Định dạng cũ: { content, summary, pageable }
        setEmployeeMargins(response.content);
        setSummary(response.summary);
        setPagination({
          pageNumber: response.pageable.pageNumber - 1,
          pageSize: response.pageable.pageSize,
          totalPages: response.pageable.totalPages,
          totalElements: response.pageable.totalElements
        });
      } else {
        setError('Dữ liệu phản hồi không hợp lệ');
      }
    } catch (err) {
      console.error('Failed to fetch margin data:', err);
      setError('Không thể tải dữ liệu margin. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch on initial load and when filters change
  useEffect(() => {
    fetchMarginData();
  }, [filters.teamId, filters.employeeId, filters.period, filters.yearMonth, filters.yearQuarter, 
      filters.year, filters.status, filters.page, filters.size, 
      filters.sortBy, filters.sortDir]);

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<EmployeeMarginListParams>) => {
    // Prevent changing employeeId/teamId if user has restricted permissions
    if (accessScope === 'own' && 'employeeId' in newFilters && newFilters.employeeId !== Number(user?.id)) {
      return;
    }
    
    if (accessScope === 'team' && 'teamId' in newFilters && newFilters.teamId !== userTeamId) {
      return;
    }
    
    // Reset to page 1 when filters change
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  // Handle sort changes
  const handleSortChange = (sortBy: string, sortDir: 'asc' | 'desc') => {
    setFilters(prev => ({ 
      ...prev, 
      sortBy: sortBy as 'name' | 'cost' | 'revenue' | 'margin' | 'status', 
      sortDir 
    }));
  };

  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Format percentage for display
  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'percent', minimumFractionDigits: 2 }).format(value / 100);
  };

  // Lấy tên team của người dùng
  const userTeamName = useMemo(() => {
    if (user?.teams && user.teams.length > 0) {
      return user.teams[0].name;
    }
    return '';
  }, [user]);

  // Cập nhật tablePagination khi pagination thay đổi
  useEffect(() => {
    setTablePagination({
      pageIndex: pagination.pageNumber,
      pageSize: pagination.pageSize
    });
  }, [pagination.pageNumber, pagination.pageSize]);

  // Define table columns
  const columns = [
    {
      header: 'Nhân viên',
      accessorKey: 'name',
      cell: ({ row }: any) => (
        <div>
          <div className="font-semibold">{row.original.name}</div>
          <div className="text-xs text-gray-500">{row.original.employeeCode}</div>
        </div>
      )
    },
    {
      header: 'Team',
      accessorKey: 'team.name',
      cell: ({ row }: any) => row.original.team?.name || '-'
    },
    {
      header: 'Chi phí',
      accessorKey: 'cost',
      cell: ({ row }: any) => {
        const currentPeriod = row.original.periods[0];
        return currentPeriod ? (
          <Tooltip 
            content={`Chi phí cơ bản cho ${currentPeriod.periodLabel}`}
            position="top"
          >
            <span className="text-red-600 font-medium">
              {formatCurrency(currentPeriod.cost)}
            </span>
          </Tooltip>
        ) : '-';
      }
    },
    {
      header: 'Doanh thu',
      accessorKey: 'revenue',
      cell: ({ row }: any) => {
        const currentPeriod = row.original.periods[0];
        return currentPeriod ? (
          <Tooltip 
            content={`Doanh thu cho ${currentPeriod.periodLabel}`}
            position="top"
          >
            <span className="text-green-600 font-medium">
              {formatCurrency(currentPeriod.revenue)}
            </span>
          </Tooltip>
        ) : '-';
      }
    },
    {
      header: 'Margin',
      accessorKey: 'margin',
      cell: ({ row }: any) => {
        const currentPeriod = row.original.periods[0];
        return currentPeriod ? (
          <Tooltip 
            content={`Margin cho ${currentPeriod.periodLabel}`}
            position="top"
          >
            <span className="font-semibold">
              {formatPercentage(currentPeriod.margin)}
            </span>
          </Tooltip>
        ) : '-';
      }
    },
    {
      header: 'Trạng thái',
      accessorKey: 'status',
      cell: ({ row }: any) => {
        const currentPeriod = row.original.periods[0];
        return currentPeriod ? (
          <MarginStatusBadge status={currentPeriod.marginStatus} />
        ) : '-';
      }
    },
    {
      header: 'Dự án hiện tại',
      accessorKey: 'currentProject',
      cell: ({ row }: any) => (
        <div>
          {row.original.currentProject || <span className="text-gray-400">Không có</span>}
        </div>
      )
    }
  ];

  // Handle export action
  const handleExport = () => {
    // To be implemented in future story
    alert('Chức năng xuất dữ liệu sẽ được triển khai trong giai đoạn tiếp theo');
  };
  
  // Handle navigate to cost input page
  const handleNavigateToCostInput = () => {
    navigate('/margins/costs');
  };

  // Summary cards component
  const MarginSummaryCards = ({ summary, loading }: { summary: MarginSummary | null, loading: boolean }) => {
    if (loading || !summary) return null;
    
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Tổng chi phí</h3>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.averageCost * summary.totalEmployees)}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
        <Card className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Tổng doanh thu</h3>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.averageRevenue * summary.totalEmployees)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
        <Card className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Margin trung bình</h3>
              <p className="text-2xl font-bold text-blue-600">
                {formatPercentage(summary.averageMargin)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // Render margin status legend
  const MarginLegend = () => {
    return (
      <div className="flex items-center space-x-6 text-sm mt-4 mb-2">
        <div className="text-gray-700 font-medium">Chú thích:</div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Đạt yêu cầu (≥30%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span>Cần cải thiện (15-30%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>Không đạt (&lt;15%)</span>
        </div>
      </div>
    );
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: MarginStatusType }) => {
    if (status === 'Green') {
      return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Đạt yêu cầu</span>;
    } else if (status === 'Yellow') {
      return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Cần cải thiện</span>;
    } else {
      return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">Không đạt</span>;
    }
  };

  // Kiểm tra quyền để nhập chi phí
  const canInputCosts = hasAnyPermission(['employee-cost:create', 'employee-cost:import']);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Heading level={1} className="text-secondary-900">Danh sách Margin</Heading>
        <div className="flex gap-4">
            <Button 
              onClick={handleExport}
              variant="secondary"
              className="flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Xuất dữ liệu</span>
            </Button>
            {canInputCosts && (
              <Button 
                variant="default"
                className="flex items-center space-x-2"
                onClick={handleNavigateToCostInput}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                <span>Nhập chi phí</span>
              </Button>
            )}
        </div>
      </div>
      
      {/* Hiển thị các thẻ thông tin tổng quan */}
      <MarginSummaryCards summary={summary} loading={loading} />
      
      {/* Hiển thị bộ lọc */}
      <MarginFilters 
        filters={filters} 
        onFilterChange={handleFilterChange}
        accessScope={accessScope}
        userTeamId={userTeamId}
        userTeamName={userTeamName}
      />
      
      {/* Hiển thị kết quả */}
      <Card className="mt-6">
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="py-12 flex justify-center">
              <Spinner size="md" />
            </div>
          ) : (
            <>
              <MarginLegend />
              
              <Table
                data={employeeMargins}
                columns={columns}
                enableSorting={true}
                enablePagination={true}
              />
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MarginList; 
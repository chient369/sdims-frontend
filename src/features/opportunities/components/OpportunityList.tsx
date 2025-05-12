/**
 * OpportunityList component for displaying and managing business opportunities.
 * Implements the MH-OPP-01 screen.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createColumnHelper } from '@tanstack/react-table';
import { format, formatDistance, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

import { useOpportunities } from '../../../hooks/useOpportunities';
import { syncOpportunities } from '../api';
import { OpportunityResponse, OpportunityListParams } from '../types';

import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { Table } from '../../../components/table/Table';
import { Alert } from '../../../components/ui/Alert';
import MainLayout from '../../../components/layout/MainLayout';
import PermissionGuard from '../../../components/ui/PermissionGuard';

// Constants for follow-up status colors
const FOLLOWUP_STATUS_COLORS = {
  Red: 'error',
  Yellow: 'warning',
  Green: 'success'
};

// Constants for follow-up status labels
const FOLLOWUP_STATUS_LABELS = {
  Red: 'Cần liên hệ gấp',
  Yellow: 'Sắp cần follow-up',
  Green: 'Đã follow-up gần đây'
};

const OpportunityList: React.FC = () => {
  const navigate = useNavigate();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState<OpportunityListParams>({
    page: 1,
    limit: 10,
    sortBy: 'lastInteractionDate',
    sortDir: 'asc'
  });
  
  // Load opportunities with filters
  const { 
    data: opportunitiesData, 
    isLoading, 
    error: fetchError,
    refetch 
  } = useOpportunities(filters);
  
  // Effect to restore filter state from localStorage
  useEffect(() => {
    const savedFilters = localStorage.getItem('opportunity-filters');
    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters) as OpportunityListParams;
        setFilters(current => ({ ...current, ...parsedFilters }));
      } catch (e) {
        console.error('Error parsing saved filters:', e);
      }
    }
  }, []);
  
  // Save filters to localStorage when they change
  useEffect(() => {
    localStorage.setItem('opportunity-filters', JSON.stringify(filters));
  }, [filters]);
  
  // Handle filter changes
  const handleFilterChange = (key: keyof OpportunityListParams, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      // Reset page when filter changes
      ...(key !== 'page' && { page: 1 })
    }));
  };
  
  // Reset all filters
  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      sortBy: 'lastInteractionDate',
      sortDir: 'asc'
    });
  };
  
  // Handle row click to navigate to opportunity details
  const handleRowClick = (opportunity: OpportunityResponse) => {
    navigate(`/opportunities/${opportunity.id}`);
  };
  
  // Handle manual sync with Hubspot
  const handleSync = async () => {
    try {
      setIsSyncing(true);
      setSyncSuccess(null);
      setSyncError(null);
      
      const result = await syncOpportunities();
      
      setSyncSuccess(`Đồng bộ đang được thực hiện. ID: ${result.id}`);
      // Refetch after a delay to show updated data
      setTimeout(() => {
        refetch();
      }, 2000);
    } catch (error) {
      setSyncError('Có lỗi xảy ra khi đồng bộ dữ liệu.');
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Toggle quick filter for followup status
  const handleQuickFilterFollowup = (status: 'Red' | 'Yellow' | 'Green' | null) => {
    setFilters(prev => ({
      ...prev,
      followupStatus: status === prev.followupStatus ? undefined : status === null ? undefined : status,
      page: 1
    }));
  };
  
  // Apply filters button click
  const handleApplyFilters = () => {
    refetch();
    setIsFilterOpen(false);
  };
  
  // Setup table columns
  const columnHelper = createColumnHelper<OpportunityResponse>();
  
  const columns = [
    columnHelper.accessor(row => ({ name: row.name, client: row.client, hubspotId: row.hubspotId }), {
      id: 'opportunityInfo',
      header: 'Tên cơ hội',
      cell: ({ getValue }) => {
        const value = getValue();
        return (
          <div className="flex flex-col">
            <a href={`/opportunities/${value.hubspotId}`} className="text-blue-600 hover:underline font-medium">{value.name}</a>
          </div>
        );
      }
    }),
    
    columnHelper.accessor(row => row.client.name, {
      id: 'clientName',
      header: 'Khách hàng',
      cell: info => <div className="text-gray-800">{info.getValue()}</div>
    }),
    
    columnHelper.accessor(row => ({ value: row.estimatedValue, currency: row.currency }), {
      id: 'estimatedValue',
      header: 'Giá trị ước tính',
      cell: ({ getValue }) => {
        const { value, currency } = getValue();
        // Format currency value
        return (
          <div className="font-medium">
            {value.toLocaleString('vi-VN')} {currency}
          </div>
        );
      }
    }),
    
    columnHelper.accessor('dealStage', {
      header: 'Giai đoạn',
      cell: ({ getValue }) => {
        const value = getValue();
        // Map dealStage to appropriate badge color
        let badgeClass = '';
        
        switch(value) {
          case 'Qualification':
            badgeClass = 'bg-blue-100 text-blue-800';
            break;
          case 'Demo':
            badgeClass = 'bg-purple-100 text-purple-800';
            break;
          case 'Negotiation':
            badgeClass = 'bg-yellow-100 text-yellow-800';
            break;
          case 'Closed':
            badgeClass = 'bg-green-100 text-green-800';
            break;
          default:
            badgeClass = 'bg-gray-100 text-gray-800';
        }
        
        return <span className={`px-2 py-1 rounded text-xs ${badgeClass}`}>{value}</span>;
      }
    }),
    
    columnHelper.accessor('assignedTo', {
      header: 'Người phụ trách',
      cell: ({ getValue }) => {
        const leaders = getValue();
        
        if (!leaders || leaders.length === 0) {
          return (
            <div className="flex items-center">
              <span className="text-gray-400">–</span>
            </div>
          );
        }
        
        return (
          <div className="flex items-center">
            <div className="flex -space-x-2 mr-2">
              {leaders.map((leader, idx) => (
                <div key={leader.id} className="w-7 h-7 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center text-xs overflow-hidden">
                  {leader.name.charAt(0)}
                </div>
              ))}
            </div>
            <span className="text-sm">{leaders[0].name}</span>
          </div>
        );
      }
    }),
    
    columnHelper.accessor('followupStatus', {
      header: 'Trạng thái',
      cell: ({ getValue }) => {
        const status = getValue();
        
        const statusMap = {
          'Green': { dot: 'bg-green-500', text: '' },
          'Red': { dot: 'bg-red-500', text: '' },
          'Yellow': { dot: 'bg-yellow-500', text: '' }
        };
        
        const { dot } = statusMap[status] || { dot: 'bg-gray-500', text: '' };
        
        return (
          <div className="flex items-center justify-center">
            <span className={`inline-block w-3 h-3 rounded-full ${dot}`}></span>
          </div>
        );
      }
    }),
    
    columnHelper.accessor('onsitePriority', {
      header: 'Onsite',
      cell: ({ getValue }) => {
        const isOnsite = getValue();
        
        return (
          <div className="flex items-center justify-center">
            {isOnsite && (
              <svg className="w-5 h-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            {!isOnsite && (
              <span className="inline-block w-5 h-5 text-center">–</span>
            )}
          </div>
        );
      }
    }),
    
    columnHelper.display({
      id: 'actions',
      header: 'Hành động',
      cell: ({ row }) => {
        return (
          <div className="flex items-center space-x-2">
            <PermissionGuard requiredPermission="opportunity:read:all">
              <button 
                className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/opportunities/${row.original.id}`);
                }}
                title="Xem chi tiết"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </button>
            </PermissionGuard>
            
            <PermissionGuard requiredPermission="opportunity-assign:update:all">
              <button 
                className="p-1 text-green-500 hover:text-green-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  // Implement Assign Leader logic here, for example:
                  openAssignLeaderModal(row.original.id);
                  // alert(`Assign Leader for opportunity: ${row.original.name}`);
                }}
                title="Phân công Leader"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </button>
            </PermissionGuard>
            
            <PermissionGuard requiredPermission="opportunity-note:create:all">
              <button 
                className="p-1 text-orange-500 hover:text-orange-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  // Open add note dialog
                  alert(`Add note for opportunity: ${row.original.name}`);
                }}
                title="Thêm ghi chú"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </button>
            </PermissionGuard>
            
            <PermissionGuard requiredPermission="opportunity-onsite:update:all">
              <button 
                className="p-1 text-purple-500 hover:text-purple-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  // Toggle onsite priority
                  alert(`Toggle onsite priority for: ${row.original.name}`);
                }}
                title={row.original.onsitePriority ? "Bỏ ưu tiên Onsite" : "Đánh dấu ưu tiên Onsite"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </button>
            </PermissionGuard>
          </div>
        );
      }
    })
  ];
  
  // Thêm phần modal Assign Leader vào component
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [selectedLeaderId, setSelectedLeaderId] = useState<string>('');
  const [assignNote, setAssignNote] = useState<string>('');

  // Function để mở modal Assign Leader
  const openAssignLeaderModal = (opportunityId: string) => {
    setSelectedOpportunityId(opportunityId);
    setSelectedLeaderId('');
    setAssignNote('');
    setIsAssignModalOpen(true);
  };

  // Function để đóng modal
  const closeAssignLeaderModal = () => {
    setIsAssignModalOpen(false);
  };

  // Function để xử lý việc assign leader
  const handleAssignLeader = async () => {
    if (!selectedOpportunityId || !selectedLeaderId) return;
    
    try {
      // Thực hiện gọi API để assign leader
      // await assignLeaderToOpportunity(selectedOpportunityId, selectedLeaderId, assignNote);
      
      // Mock implementation
      console.log(`Assigned leader ${selectedLeaderId} to opportunity ${selectedOpportunityId}`);
      console.log(`Note: ${assignNote}`);
      
      // Đóng modal và refetch dữ liệu
      closeAssignLeaderModal();
      refetch();
    } catch (error) {
      console.error('Error assigning leader:', error);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-4">
      <Card className="mb-6">
        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Danh sách cơ hội</h1>
          <p className="text-sm text-gray-600 mb-6">Quản lý và theo dõi các cơ hội kinh doanh từ Hubspot</p>
          
          {/* Filters based on the design */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tìm kiếm
              </label>
              <Input
                placeholder="Tên cơ hội, khách hàng..."
                value={filters.keyword || ''}
                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Người phụ trách Sales
              </label>
              <select
                value={filters.clientId || ''}
                onChange={(e) => handleFilterChange('clientId', e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Tất cả</option>
                {/* Options would be loaded from API */}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Leader được assign
              </label>
              <select
                value={filters.assignedToId || ''}
                onChange={(e) => handleFilterChange('assignedToId', e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Tất cả</option>
                <option value="not-assigned">Chưa phân công</option>
                {/* Options would be loaded from API */}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giai đoạn bán hàng
              </label>
              <select
                value={filters.dealStage || ''}
                onChange={(e) => handleFilterChange('dealStage', e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Tất cả</option>
                <option value="Qualification">Qualification</option>
                <option value="Demo">Demo</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái Follow-up
              </label>
              <select
                value={filters.followupStatus || ''}
                onChange={(e) => handleFilterChange('followupStatus', e.target.value as any)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Tất cả</option>
                <option value="Red">Cần liên hệ gấp</option>
                <option value="Yellow">Sắp cần follow-up</option>
                <option value="Green">Đã follow-up</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ưu tiên Onsite
              </label>
              <select
                value={filters.onsitePriority ? 'true' : ''}
                onChange={(e) => handleFilterChange('onsitePriority', e.target.value === 'true')}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Tất cả</option>
                <option value="true">Ưu tiên onsite</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Khoảng thời gian
              </label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={filters.createdDateFrom || ''}
                  onChange={(e) => handleFilterChange('createdDateFrom', e.target.value)}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                <input
                  type="date"
                  value={filters.createdDateTo || ''}
                  onChange={(e) => handleFilterChange('createdDateTo', e.target.value)}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-wrap justify-between mt-4 gap-2">
            <div className="flex space-x-2">
              <Button 
                variant="default"
                onClick={handleApplyFilters}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                </svg>
                Áp dụng bộ lọc
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleResetFilters}
                className="flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Xóa bộ lọc
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <PermissionGuard requiredPermission="opportunity-sync:config">
                <Button 
                  onClick={handleSync} 
                  isLoading={isSyncing}
                  disabled={isSyncing}
                  className="flex items-center gap-2"
                  variant="default"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" />
                  </svg>
                  Đồng bộ từ Hubspot
                </Button>
              </PermissionGuard>
              
              <Button
                variant="outline"
                className="flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Export
              </Button>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  className="flex items-center p-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 4a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V5a1 1 0 00-1-1H5zm12 1a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5z" clipRule="evenodd" />
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center p-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {syncSuccess && (
        <Alert 
          variant="success" 
          title="Thành công" 
          className="mb-4"
        >
          {syncSuccess}
          <button 
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            onClick={() => setSyncSuccess(null)}
          >
            <span className="sr-only">Đóng</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </Alert>
      )}
      
      {syncError && (
        <Alert 
          variant="error" 
          title="Lỗi" 
          className="mb-4"
        >
          {syncError}
          <button 
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            onClick={() => setSyncError(null)}
          >
            <span className="sr-only">Đóng</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </Alert>
      )}
      
      {/* Data Table */}
      <Card>
        {fetchError ? (
          <Alert
            variant="error"
            title="Lỗi tải dữ liệu"
            className="m-4"
          >
            Có lỗi xảy ra khi tải dữ liệu cơ hội. Vui lòng thử lại sau.
          </Alert>
        ) : (
          <Table
            data={opportunitiesData?.data || []}
            columns={columns}
            isLoading={isLoading}
            onRowClick={handleRowClick}
            enablePagination
            enableSorting
          />
        )}
        
        {/* Show message when no data */}
        {!isLoading && opportunitiesData?.data.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            <p>Không tìm thấy cơ hội kinh doanh phù hợp.</p>
            <p className="mt-2">Vui lòng thử thay đổi bộ lọc hoặc đồng bộ dữ liệu từ Hubspot.</p>
          </div>
        )}
      </Card>
      
      {/* Pagination info */}
      {opportunitiesData && opportunitiesData.data.length > 0 && (
        <div className="mt-4 text-right text-sm text-gray-500">
          Hiển thị {(filters.page || 1) * (filters.limit || 10) - (filters.limit || 10) + 1} đến{' '}
          {Math.min((filters.page || 1) * (filters.limit || 10), opportunitiesData.meta.total)} trên{' '}
          {opportunitiesData.meta.total} cơ hội
        </div>
      )}

      {/* Assign Leader Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Phân công Leader</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chọn Leader
              </label>
              <select
                value={selectedLeaderId}
                onChange={(e) => setSelectedLeaderId(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">-- Chọn Leader --</option>
                {/* Options would be loaded from API */}
                <option value="leader1">Nguyễn Văn A</option>
                <option value="leader2">Trần Thị B</option>
                <option value="leader3">Lê Văn C</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú (tùy chọn)
              </label>
              <textarea
                value={assignNote}
                onChange={(e) => setAssignNote(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                rows={3}
                placeholder="Thêm ghi chú về việc phân công này..."
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={closeAssignLeaderModal}>
                Hủy
              </Button>
              <Button variant="default" onClick={handleAssignLeader} disabled={!selectedLeaderId}>
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunityList; 
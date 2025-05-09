/**
 * MarginFilters Component
 * 
 * Cung cấp các bộ lọc cho trang Margin List: thời gian, team, trạng thái.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Input, Button } from '../../../components/ui';
import { EmployeeMarginListParams, MarginStatusType, PeriodType } from '../types';
import { useAuth } from '../../../hooks/useAuth';
import { FaFilter } from 'react-icons/fa'; // Import icon for filter button

interface MarginFiltersProps {
  filters: EmployeeMarginListParams;
  onFilterChange: (filters: Partial<EmployeeMarginListParams>) => void;
  accessScope?: string;
  userTeamId?: number;
  userTeamName?: string;
}

// Mock data for teams - should be replaced with actual API call
const TEAMS = [
  { id: 1, name: 'Team A' },
  { id: 2, name: 'Team B' },
  { id: 3, name: 'Team C' }
];

const PERIOD_OPTIONS = [
  { value: 'month', label: 'Tháng' },
  { value: 'quarter', label: 'Quý' },
  { value: 'year', label: 'Năm' }
];

const MarginFilters: React.FC<MarginFiltersProps> = ({ 
  filters, 
  onFilterChange,
  accessScope: propAccessScope,
  userTeamId: propUserTeamId,
  userTeamName
}) => {
  const { user, hasPermission } = useAuth();
  
  // Local state for filter values (before applying)
  const [localFilters, setLocalFilters] = useState<Partial<EmployeeMarginListParams>>(filters);
  
  // Determine user access level - use prop if provided, otherwise compute
  const accessScope = useMemo(() => {
    if (propAccessScope) return propAccessScope;
    
    if (hasPermission('margin:read:all')) {
      return 'all';
    }
    if (hasPermission('margin:read:team')) {
      return 'team';
    }
    return 'own';
  }, [hasPermission, propAccessScope]);
  
  // Get user's team ID - use prop if provided, otherwise compute
  const userTeamId = useMemo(() => {
    if (propUserTeamId !== undefined) return propUserTeamId;
    
    if (user?.teams && user.teams.length > 0) {
      return Number(user.teams[0].id);
    }
    return undefined;
  }, [user, propUserTeamId]);
  
  // Get user ID as number
  const userId = useMemo(() => {
    return user?.id ? Number(user.id) : undefined;
  }, [user]);
  
  // Update local filters when parent filters change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);
  
  // Handle input changes
  const handleInputChange = (name: string, value: any) => {
    // Prevent changing teamId if user can only see their team
    if (name === 'teamId' && accessScope === 'team' && value !== userTeamId && value !== undefined) {
      return;
    }
    
    // Prevent changing employeeId if user can only see their own data
    if (name === 'employeeId' && accessScope === 'own' && value !== userId && value !== undefined) {
      return;
    }
    
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };

  // Create year month options for current and past 12 months
  const getYearMonthOptions = () => {
    const options = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearMonth = date.toISOString().slice(0, 7); // YYYY-MM
      const label = `Tháng ${date.getMonth() + 1}/${date.getFullYear()}`;
      
      options.push({ value: yearMonth, label });
    }
    
    return options;
  };
  
  // Create year quarter options for current and past 8 quarters
  const getYearQuarterOptions = () => {
    const options = [];
    const now = new Date();
    const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
    const currentYear = now.getFullYear();
    
    for (let i = 0; i < 8; i++) {
      const quarterOffset = i % 4;
      const yearOffset = Math.floor(i / 4);
      const quarter = (currentQuarter - quarterOffset + 4) % 4 || 4;
      const year = currentYear - yearOffset - (currentQuarter - quarterOffset <= 0 ? 1 : 0);
      
      const yearQuarter = `${year}-Q${quarter}`;
      const label = `Quý ${quarter}/${year}`;
      
      options.push({ value: yearQuarter, label });
    }
    
    return options;
  };
  
  // Create year options for current and past 5 years
  const getYearOptions = () => {
    const options = [];
    const currentYear = new Date().getFullYear();
    
    for (let i = 0; i < 5; i++) {
      const year = currentYear - i;
      options.push({ value: year, label: `${year}` });
    }
    
    return options;
  };
  
  // Apply filters
  const applyFilters = () => {
    // Make sure to enforce access restrictions when applying filters
    let filtersToApply = { ...localFilters };
    
    if (accessScope === 'own' && userId) {
      filtersToApply.employeeId = userId;
      filtersToApply.teamId = undefined; // No team filtering for own access
    } else if (accessScope === 'team' && userTeamId) {
      filtersToApply.teamId = userTeamId;
    }
    
    onFilterChange(filtersToApply);
  };
  
  // Reset filters
  const resetFilters = () => {
    let defaultFilters: Partial<EmployeeMarginListParams> = {
      period: 'month' as PeriodType,
      yearMonth: new Date().toISOString().slice(0, 7),
      status: undefined,
    };
    
    // Handle default filters based on access level
    if (accessScope === 'own' && userId) {
      defaultFilters.employeeId = userId;
      defaultFilters.teamId = undefined;
    } else if (accessScope === 'team' && userTeamId) {
      defaultFilters.teamId = userTeamId;
      defaultFilters.employeeId = undefined;
    } else {
      defaultFilters.teamId = undefined;
      defaultFilters.employeeId = undefined;
    }
    
    setLocalFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };
  
  // Filter chips for quick status filtering
  const statusFilters = [
    { value: undefined, label: 'Tất cả' },
    { value: 'Red' as MarginStatusType, label: 'Không đạt' },
    { value: 'Yellow' as MarginStatusType, label: 'Cần cải thiện' },
    { value: 'Green' as MarginStatusType, label: 'Đạt yêu cầu' }
  ];
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        {/* Kỳ xem dữ liệu */}
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kỳ xem dữ liệu
          </label>
          <select
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={localFilters.period || 'month'}
            onChange={(e) => {
              const period = e.target.value as PeriodType;
              // Reset related time filters when period changes
              const updatedFilters: Partial<EmployeeMarginListParams> = { period };
              
              if (period === 'month') {
                updatedFilters.yearMonth = new Date().toISOString().slice(0, 7);
                updatedFilters.yearQuarter = undefined;
                updatedFilters.year = undefined;
              } else if (period === 'quarter') {
                updatedFilters.yearQuarter = getYearQuarterOptions()[0].value;
                updatedFilters.yearMonth = undefined;
                updatedFilters.year = undefined;
              } else if (period === 'year') {
                updatedFilters.year = new Date().getFullYear();
                updatedFilters.yearMonth = undefined;
                updatedFilters.yearQuarter = undefined;
              }
              
              setLocalFilters(prev => ({ ...prev, ...updatedFilters }));
            }}
          >
            {PERIOD_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Period-specific filters */}
        <div className="md:col-span-3">
          {localFilters.period === 'month' && (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tháng
              </label>
              <select
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={localFilters.yearMonth}
                onChange={(e) => handleInputChange('yearMonth', e.target.value)}
              >
                {getYearMonthOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </>
          )}
          
          {localFilters.period === 'quarter' && (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quý
              </label>
              <select
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={localFilters.yearQuarter}
                onChange={(e) => handleInputChange('yearQuarter', e.target.value)}
              >
                {getYearQuarterOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </>
          )}
          
          {localFilters.period === 'year' && (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Năm
              </label>
              <select
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={localFilters.year}
                onChange={(e) => handleInputChange('year', Number(e.target.value))}
              >
                {getYearOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
        
        {/* Team filter - only show if user has appropriate permissions */}
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Team
          </label>
          
          {accessScope === 'own' ? (
            <div className="block w-full py-2 text-sm text-gray-500">
              {user?.teams && user.teams.length > 0 ? user.teams[0].name : 'Không thuộc team nào'}
            </div>
          ) : accessScope === 'team' ? (
            <div className="block w-full py-2 text-sm text-gray-500">
              {userTeamName || (user?.teams && user.teams.length > 0 ? user.teams[0].name : 'Không có')}
            </div>
          ) : (
            <select
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={localFilters.teamId || ''}
              onChange={(e) => handleInputChange('teamId', e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">Tất cả các team</option>
              {TEAMS.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          )}
        </div>
        
        {/* Status filter */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trạng thái
          </label>
          <select
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={localFilters.status || ''}
            onChange={(e) => {
              const status = e.target.value ? e.target.value as MarginStatusType : undefined;
              handleInputChange('status', status);
            }}
          >
            <option value="">Tất cả</option>
            <option value="Red">Không đạt</option>
            <option value="Yellow">Cần cải thiện</option>
            <option value="Green">Đạt yêu cầu</option>
          </select>
        </div>
        
        {/* Actions */}
        <div className="md:col-span-1 flex justify-end">
          <Button
            variant="default"
            className="w-full"
            onClick={applyFilters}
          >
            <span className="flex items-center justify-center">
              <FaFilter className="mr-2" />
              <span>Xem / Lọc</span>
            </span>
          </Button>
        </div>
      </div>
      
      {/* Status chips for quick filtering */}
      <div className="mt-4 flex flex-wrap gap-2">
        {statusFilters.map((status) => (
          <button
            key={status.value || 'all'}
            onClick={() => {
              setLocalFilters(prev => ({ ...prev, status: status.value }));
              onFilterChange({ ...localFilters, status: status.value });
            }}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              localFilters.status === status.value
                ? 'bg-secondary-100 text-secondary-800 border border-secondary-300'
                : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            {status.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MarginFilters; 
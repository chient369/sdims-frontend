import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../../../../components/ui';

interface FilterProps {
  onFilterChange: (filters: FilterValues) => void;
  defaultExpanded?: boolean;
}

export interface FilterValues {
  activityTypes?: string[];
  dateRange?: { from: Date | null; to: Date | null };
  createdBy?: string[];
  tags?: string[];
  searchText?: string;
}

/**
 * AdvancedFiltering component for filtering opportunity notes/activities
 * @param {Function} onFilterChange - Callback when filters change
 * @param {boolean} defaultExpanded - Whether the filter panel is expanded by default
 * @returns {JSX.Element} The rendered component
 */
const AdvancedFiltering: React.FC<FilterProps> = ({
  onFilterChange,
  defaultExpanded = false
}) => {
  // States
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [filters, setFilters] = useState<FilterValues>({
    activityTypes: [],
    dateRange: { from: null, to: null },
    createdBy: [],
    tags: [],
    searchText: ''
  });
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  
  // Calculate active filter count using useMemo
  const calculatedFilterCount = useMemo(() => {
    let count = 0;
    
    if (filters.activityTypes && filters.activityTypes.length > 0) count++;
    if (filters.dateRange && (filters.dateRange.from || filters.dateRange.to)) count++;
    if (filters.createdBy && filters.createdBy.length > 0) count++;
    if (filters.tags && filters.tags.length > 0) count++;
    if (filters.searchText) count++;
    
    return count;
  }, [filters]);
  
  // Update activeFilterCount when calculatedFilterCount changes
  useEffect(() => {
    setActiveFilterCount(calculatedFilterCount);
  }, [calculatedFilterCount]);
  
  // Handle filter changes and notify parent component
  const handleFilterChange = useCallback((newFilters: Partial<FilterValues>) => {
    setFilters(prevFilters => {
      const updatedFilters = { ...prevFilters, ...newFilters };
      
      // Save filters to sessionStorage
      sessionStorage.setItem('opportunityNotesFilters', JSON.stringify(updatedFilters));
      
      // Notify parent component
      onFilterChange(updatedFilters);
      
      return updatedFilters;
    });
  }, [onFilterChange]);
  
  // Toggle activity type filter
  const toggleActivityType = useCallback((type: string) => {
    setFilters(prevFilters => {
      const currentTypes = prevFilters.activityTypes || [];
      const newTypes = currentTypes.includes(type)
        ? currentTypes.filter(t => t !== type)
        : [...currentTypes, type];
      
      const updatedFilters = { ...prevFilters, activityTypes: newTypes };
      
      // Save filters to sessionStorage
      sessionStorage.setItem('opportunityNotesFilters', JSON.stringify(updatedFilters));
      
      // Notify parent component
      onFilterChange(updatedFilters);
      
      return updatedFilters;
    });
  }, [onFilterChange]);
  
  // Handle date range change
  const handleDateChange = useCallback((field: 'from' | 'to', value: string) => {
    setFilters(prevFilters => {
      const date = value ? new Date(value) : null;
      const newDateRange = {
        from: field === 'from' ? date : (prevFilters.dateRange?.from || null),
        to: field === 'to' ? date : (prevFilters.dateRange?.to || null)
      };
      
      const updatedFilters = { ...prevFilters, dateRange: newDateRange };
      
      // Save filters to sessionStorage
      sessionStorage.setItem('opportunityNotesFilters', JSON.stringify(updatedFilters));
      
      // Notify parent component
      onFilterChange(updatedFilters);
      
      return updatedFilters;
    });
  }, [onFilterChange]);
  
  // Handle search text change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prevFilters => {
      const updatedFilters = { ...prevFilters, searchText: e.target.value };
      
      // Save filters to sessionStorage
      sessionStorage.setItem('opportunityNotesFilters', JSON.stringify(updatedFilters));
      
      // Notify parent component
      onFilterChange(updatedFilters);
      
      return updatedFilters;
    });
  }, [onFilterChange]);
  
  // Clear all filters
  const clearAllFilters = useCallback(() => {
    const emptyFilters: FilterValues = {
      activityTypes: [],
      dateRange: { from: null, to: null },
      createdBy: [],
      tags: [],
      searchText: ''
    };
    
    setFilters(emptyFilters);
    sessionStorage.removeItem('opportunityNotesFilters');
    onFilterChange(emptyFilters);
  }, [onFilterChange]);
  
  // Toggle filter panel expansion
  const toggleExpand = useCallback(() => {
    setExpanded(prev => !prev);
  }, []);
  
  // Load saved filters from sessionStorage on mount
  useEffect(() => {
    const savedFilters = sessionStorage.getItem('opportunityNotesFilters');
    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters) as FilterValues;
        
        // Convert date strings back to Date objects
        if (parsedFilters.dateRange) {
          const dateRange = {
            from: parsedFilters.dateRange.from ? new Date(parsedFilters.dateRange.from as any) : null,
            to: parsedFilters.dateRange.to ? new Date(parsedFilters.dateRange.to as any) : null
          };
          parsedFilters.dateRange = dateRange;
        }
        
        setFilters(parsedFilters);
        onFilterChange(parsedFilters);
      } catch (error) {
        console.error('Error parsing saved filters:', error);
      }
    }
  }, []); // Run only once on mount
  
  return (
    <div className="bg-white rounded-lg shadow mb-6">
      {/* Search bar - always visible */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm trong ghi chú..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={filters.searchText || ''}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      
      {/* Filter header */}
      <div 
        className="px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-gray-50"
        onClick={toggleExpand}
      >
        <div className="flex items-center">
          <h3 className="text-sm font-medium text-gray-700">Bộ lọc nâng cao</h3>
          {activeFilterCount > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <div className="flex items-center">
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearAllFilters();
              }}
              className="mr-4 text-sm text-gray-500 hover:text-gray-700"
            >
              Xóa tất cả
            </button>
          )}
          <svg
            className={`h-5 w-5 text-gray-500 transform transition-transform ${expanded ? 'rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
      {/* Filter content */}
      {expanded && (
        <div className="p-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Activity type filter */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Loại hoạt động</h4>
            <div className="space-y-2">
              {['internal-note', 'call', 'email', 'meeting', 'task'].map((type) => {
                const activityLabels: Record<string, string> = {
                  'internal-note': 'Ghi chú nội bộ',
                  'call': 'Cuộc gọi',
                  'email': 'Email',
                  'meeting': 'Cuộc họp',
                  'task': 'Công việc'
                };
                
                return (
                  <div key={type} className="flex items-center">
                    <input
                      id={`type-${type}`}
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={(filters.activityTypes || []).includes(type)}
                      onChange={() => toggleActivityType(type)}
                    />
                    <label htmlFor={`type-${type}`} className="ml-2 block text-sm text-gray-700">
                      {activityLabels[type] || type}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Date range filter */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Khoảng thời gian</h4>
            <div className="space-y-2">
              <div>
                <label htmlFor="date-from" className="block text-xs text-gray-500 mb-1">
                  Từ ngày
                </label>
                <input
                  id="date-from"
                  type="date"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={filters.dateRange?.from ? filters.dateRange.from.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleDateChange('from', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="date-to" className="block text-xs text-gray-500 mb-1">
                  Đến ngày
                </label>
                <input
                  id="date-to"
                  type="date"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={filters.dateRange?.to ? filters.dateRange.to.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleDateChange('to', e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {/* Tags filter - we can add this when the API supports tags */}
          {/* <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {['Important', 'Follow-up', 'Urgent', 'Demo', 'Meeting'].map(tag => (
                <span
                  key={tag}
                  onClick={() => {
                    const currentTags = filters.tags || [];
                    const newTags = currentTags.includes(tag)
                      ? currentTags.filter(t => t !== tag)
                      : [...currentTags, tag];
                    handleFilterChange({ tags: newTags });
                  }}
                  className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
                    (filters.tags || []).includes(tag)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div> */}
          
          {/* Apply button */}
          <div className="md:col-span-2 flex justify-end mt-4">
            <Button
              variant="default"
              onClick={() => onFilterChange(filters)}
            >
              Áp dụng bộ lọc
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFiltering; 
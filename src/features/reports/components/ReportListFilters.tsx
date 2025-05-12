import React from 'react';
import { ReportListFiltersProps } from '../types';
import { Search, Filter, X } from 'lucide-react';

/**
 * Component bộ lọc cho danh sách báo cáo
 * Cho phép tìm kiếm và lọc danh sách báo cáo theo module và loại
 */
const ReportListFilters: React.FC<ReportListFiltersProps> = ({
  searchTerm,
  selectedModule,
  selectedType,
  onSearch,
  onModuleChange,
  onTypeChange,
  onClearFilters
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-md shadow-sm p-3">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Tìm kiếm báo cáo..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="flex space-x-2">
          <select
            value={selectedModule || ''}
            onChange={(e) => onModuleChange(e.target.value || null)}
            className="block border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tất cả module</option>
            <option value="hrm">Nhân sự</option>
            <option value="margin">Margin</option>
            <option value="opportunity">Cơ hội</option>
            <option value="contract">Hợp đồng</option>
            <option value="finance">Tài chính</option>
            <option value="dashboard">Dashboard</option>
            <option value="admin">Admin</option>
          </select>
          
          <select
            value={selectedType || ''}
            onChange={(e) => onTypeChange(e.target.value || null)}
            className="block border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tất cả loại</option>
            <option value="analytical">Phân tích</option>
            <option value="operational">Vận hành</option>
            <option value="summary">Tổng hợp</option>
          </select>
        </div>
        
        {(searchTerm || selectedModule || selectedType) && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <X size={16} className="mr-1" />
            Xóa bộ lọc
          </button>
        )}
      </div>
    </div>
  );
};

export default ReportListFilters; 
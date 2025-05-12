import React, { useState, useEffect } from 'react';
import { ReportFiltersProps } from '../types';
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react';

/**
 * Component bộ lọc báo cáo
 * Hiển thị các bộ lọc có thể mở/đóng và xử lý thay đổi
 */
const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters,
  values,
  onChange,
  onApply,
  onReset
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localValues, setLocalValues] = useState<Record<string, any>>(values);

  // Cập nhật localValues khi values prop thay đổi
  useEffect(() => {
    setLocalValues(values);
  }, [values]);

  // Xử lý thay đổi giá trị bộ lọc
  const handleChange = (id: string, value: any) => {
    setLocalValues(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Áp dụng bộ lọc
  const handleApply = () => {
    onChange(localValues);
    onApply();
    setIsOpen(false); // Đóng panel sau khi áp dụng
  };

  // Reset bộ lọc
  const handleReset = () => {
    setLocalValues({});
    onChange({});
    onReset();
  };

  // Nếu không có bộ lọc nào, không hiển thị component
  if (!filters || filters.length === 0) {
    return null;
  }

  // Kiểm tra xem có bộ lọc nào đang được áp dụng không
  const hasActiveFilters = Object.keys(values).length > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-md shadow-sm mb-3">
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Filter size={16} className={hasActiveFilters ? "text-blue-600" : "text-gray-500"} />
          <h3 className="text-sm font-medium text-gray-700">
            {hasActiveFilters ? 'Bộ lọc đã áp dụng' : 'Bộ lọc báo cáo'}
          </h3>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2 py-0.5 rounded-full">
              {Object.keys(values).length}
            </span>
          )}
        </div>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>
      
      {isOpen && (
        <div className="p-3 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {filters.map(filter => (
              <div key={filter.id} className="flex flex-col">
                <label
                  htmlFor={`filter-${filter.id}`}
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  {filter.label}
                </label>
                
                {filter.type === 'select' && (
                  <select
                    id={`filter-${filter.id}`}
                    value={localValues[filter.id] || ''}
                    onChange={(e) => handleChange(filter.id, e.target.value)}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    multiple={filter.multiple}
                  >
                    <option value="">--- Chọn ---</option>
                    {filter.options?.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
                
                {filter.type === 'text' && (
                  <input
                    type="text"
                    id={`filter-${filter.id}`}
                    value={localValues[filter.id] || ''}
                    onChange={(e) => handleChange(filter.id, e.target.value)}
                    placeholder={filter.placeholder}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
                
                {filter.type === 'date' && (
                  <input
                    type="date"
                    id={`filter-${filter.id}`}
                    value={localValues[filter.id] || ''}
                    onChange={(e) => handleChange(filter.id, e.target.value)}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
                
                {filter.type === 'daterange' && (
                  <div className="flex gap-2">
                    <input
                      type="date"
                      id={`filter-${filter.id}-from`}
                      value={localValues[`${filter.id}_from`] || ''}
                      onChange={(e) => handleChange(`${filter.id}_from`, e.target.value)}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="date"
                      id={`filter-${filter.id}-to`}
                      value={localValues[`${filter.id}_to`] || ''}
                      onChange={(e) => handleChange(`${filter.id}_to`, e.target.value)}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-end mt-3 gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <X size={16} className="mr-1" />
              Xóa bộ lọc
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportFilters; 
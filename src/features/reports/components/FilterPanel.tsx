import React, { useState } from 'react';
import { ReportFiltersProps, ReportFilter } from '../types';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

/**
 * Component panel bộ lọc cho báo cáo
 * Hỗ trợ nhiều loại filter khác nhau như text, select, date, daterange, v.v.
 */
const FilterPanel: React.FC<ReportFiltersProps> = ({
  filters,
  values,
  onChange,
  onApply,
  onReset
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [localValues, setLocalValues] = useState<Record<string, any>>(values || {});
  
  // Xử lý thay đổi giá trị filter
  const handleChange = (id: string, value: any) => {
    const newValues = { ...localValues, [id]: value };
    setLocalValues(newValues);
  };
  
  // Xử lý apply filter
  const handleApply = () => {
    onChange(localValues);
    onApply();
  };
  
  // Xử lý reset filter
  const handleReset = () => {
    setLocalValues({});
    onChange({});
    onReset();
  };
  
  // Hiển thị điều khiển filter dựa trên loại
  const renderFilterControl = (filter: ReportFilter) => {
    const { id, label, type, options, placeholder, multiple } = filter;
    const value = localValues[id];
    
    switch (type) {
      case 'text':
        return (
          <input
            type="text"
            id={id}
            value={value || ''}
            onChange={(e) => handleChange(id, e.target.value)}
            placeholder={placeholder || `Nhập ${label}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        );
        
      case 'select':
        return (
          <select
            id={id}
            value={value || ''}
            onChange={(e) => handleChange(id, e.target.value)}
            multiple={multiple}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- Chọn {label} --</option>
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
        
      case 'date':
        return (
          <input
            type="date"
            id={id}
            value={value || ''}
            onChange={(e) => handleChange(id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        );
        
      case 'daterange':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="date"
              id={`${id}-from`}
              value={(value && value.from) || ''}
              onChange={(e) => handleChange(id, { ...value, from: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <span>đến</span>
            <input
              type="date"
              id={`${id}-to`}
              value={(value && value.to) || ''}
              onChange={(e) => handleChange(id, { ...value, to: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        );
        
      case 'number':
        return (
          <input
            type="number"
            id={id}
            value={value || ''}
            onChange={(e) => handleChange(id, e.target.value)}
            placeholder={placeholder || `Nhập ${label}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        );
        
      case 'checkbox':
        return (
          <div className="flex flex-wrap gap-4">
            {options?.map((option) => (
              <label key={option.value} className="inline-flex items-center">
                <input
                  type="checkbox"
                  value={option.value}
                  checked={Array.isArray(value) ? value.includes(option.value) : false}
                  onChange={(e) => {
                    const newValue = Array.isArray(value) ? [...value] : [];
                    if (e.target.checked) {
                      newValue.push(option.value);
                    } else {
                      const index = newValue.indexOf(option.value);
                      if (index > -1) {
                        newValue.splice(index, 1);
                      }
                    }
                    handleChange(id, newValue);
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );
        
      case 'radio':
        return (
          <div className="flex flex-wrap gap-4">
            {options?.map((option) => (
              <label key={option.value} className="inline-flex items-center">
                <input
                  type="radio"
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => handleChange(id, option.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  // Không hiển thị nếu không có filter
  if (!filters || filters.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 border-b cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-medium text-gray-700 flex items-center">
          {isExpanded ? <ChevronUp size={18} className="mr-2" /> : <ChevronDown size={18} className="mr-2" />}
          Bộ lọc báo cáo
        </h3>
        <div className="flex items-center text-sm text-gray-500">
          {Object.keys(localValues).length > 0 && (
            <span className="mr-2">
              {Object.keys(localValues).length} bộ lọc đang áp dụng
            </span>
          )}
        </div>
      </div>
      
      {/* Body */}
      {isExpanded && (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {filters.map((filter) => (
              <div key={filter.id}>
                <label htmlFor={filter.id} className="block text-sm font-medium text-gray-700 mb-1">
                  {filter.label} {filter.required && <span className="text-red-500">*</span>}
                </label>
                {renderFilterControl(filter)}
              </div>
            ))}
          </div>
          
          {/* Applied filters */}
          {Object.keys(localValues).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.entries(localValues).map(([key, value]) => {
                if (!value) return null;
                
                const filter = filters.find(f => f.id === key);
                if (!filter) return null;
                
                let displayValue = '';
                
                if (filter.type === 'select' || filter.type === 'radio') {
                  const option = filter.options?.find(o => o.value === value);
                  displayValue = option?.label || value;
                } else if (filter.type === 'daterange' && value.from && value.to) {
                  displayValue = `${value.from} - ${value.to}`;
                } else if (filter.type === 'checkbox' && Array.isArray(value)) {
                  const selectedOptions = filter.options?.filter(o => value.includes(o.value)) || [];
                  displayValue = selectedOptions.map(o => o.label).join(', ');
                } else {
                  displayValue = String(value);
                }
                
                return (
                  <div key={key} className="inline-flex items-center bg-blue-50 text-blue-700 text-sm rounded-full px-3 py-1">
                    <span className="font-medium mr-1">{filter.label}:</span>
                    <span>{displayValue}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newValues = { ...localValues };
                        delete newValues[key];
                        setLocalValues(newValues);
                      }}
                      className="ml-1 p-1 rounded-full hover:bg-blue-100"
                      aria-label="Xóa bộ lọc"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Xóa bộ lọc
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel; 
import React from 'react';

interface TimeRangeFilterProps {
  currentTimeframe: 'week' | 'month' | 'quarter' | 'year';
  onTimeframeChange: (timeframe: 'week' | 'month' | 'quarter' | 'year') => void;
}

export const TimeRangeFilter: React.FC<TimeRangeFilterProps> = ({
  currentTimeframe,
  onTimeframeChange,
}) => {
  const timeframeOptions = [
    { value: 'week', label: 'Tuần' },
    { value: 'month', label: 'Tháng' },
    { value: 'quarter', label: 'Quý' },
    { value: 'year', label: 'Năm' },
  ];
  
  return (
    <div className="flex space-x-2">
      {timeframeOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => onTimeframeChange(option.value as 'week' | 'month' | 'quarter' | 'year')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            currentTimeframe === option.value
              ? 'bg-primary-600 text-white'
              : 'bg-white text-secondary-700 hover:bg-secondary-100'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}; 
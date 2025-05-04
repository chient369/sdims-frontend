import React from 'react';
import { Chart } from './Chart';
import { ChartData, ChartOptions } from 'chart.js';

interface GaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  thresholds?: {
    warning: number;
    danger: number;
  };
  label?: string;
  height?: number;
  width?: number;
  className?: string;
  showValue?: boolean;
  valueFormat?: (value: number) => string;
}

/**
 * Gauge chart component for displaying progress, achievement, or metrics against thresholds
 */
export const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  min = 0,
  max = 100,
  thresholds = { warning: 70, danger: 90 },
  label = 'Value',
  height,
  width,
  className,
  showValue = true,
  valueFormat,
}) => {
  // Ensure value is within min and max
  const normalizedValue = Math.min(Math.max(value, min), max);
  
  // Calculate percentage for display
  const percentage = ((normalizedValue - min) / (max - min)) * 100;
  
  // Determine color based on thresholds
  const getColor = (value: number, min: number, max: number) => {
    const percent = ((value - min) / (max - min)) * 100;
    if (percent >= thresholds.danger) return '#EF4444'; // Red
    if (percent >= thresholds.warning) return '#F59E0B'; // Amber
    return '#10B981'; // Green
  };
  
  // Create the dataset
  const data: ChartData<'doughnut'> = {
    labels: ['Value', 'Remaining'],
    datasets: [
      {
        data: [normalizedValue, max - normalizedValue],
        backgroundColor: [
          getColor(normalizedValue, min, max),
          '#E5E7EB', // Light gray for remaining
        ],
        borderWidth: 0,
      },
    ],
  };
  
  // Display value formatter
  const formatValue = (val: number) => {
    if (valueFormat) return valueFormat(val);
    return val.toFixed(0);
  };
  
  const options: ChartOptions<'doughnut'> = {
    cutout: '75%',
    circumference: 180,
    rotation: 270,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };
  
  return (
    <div className={`relative ${className}`} style={{ height: height || 200, width: width || '100%' }}>
      <Chart
        type="doughnut"
        data={data}
        options={options}
        height={height}
        width={width}
      />
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center" 
             style={{ marginTop: '25px' }}>
          <span className="text-3xl font-bold text-gray-700">
            {formatValue(normalizedValue)}
          </span>
          <span className="text-sm text-gray-500">{label}</span>
        </div>
      )}
    </div>
  );
}; 
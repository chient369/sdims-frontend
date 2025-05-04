import React, { useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  ChartData,
  ChartOptions,
  ChartType,
  registerables,
} from 'chart.js';
import { cn } from '../../utils/cn';

// Đăng ký tất cả các components của Chart.js
ChartJS.register(...registerables);

// Thiết lập mặc định phù hợp với theme
ChartJS.defaults.color = '#6B7280';
ChartJS.defaults.font.family = "'Inter', 'Helvetica', 'Arial', sans-serif";

interface ChartProps {
  type: ChartType;
  data: ChartData;
  options?: ChartOptions;
  height?: number;
  width?: number;
  className?: string;
}

/**
 * Base chart component that wraps Chart.js
 */
export const Chart: React.FC<ChartProps> = ({
  type,
  data,
  options,
  height = 300,
  width,
  className,
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Hủy chart cũ nếu có
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Tạo chart mới
    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new ChartJS(ctx, {
        type,
        data,
        options: {
          responsive: true,
          maintainAspectRatio: width !== undefined,
          ...options,
        },
      });
    }

    // Cleanup khi unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [type, data, options, width]);

  return (
    <div 
      className={cn("chart-container", className)} 
      style={{ height, width: width || '100%' }}
    >
      <canvas ref={chartRef} />
    </div>
  );
}; 
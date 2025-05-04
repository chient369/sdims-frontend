import React from 'react';
import { Chart } from './Chart';
import { ChartData, ChartOptions } from 'chart.js';

interface PieChartProps {
  data: ChartData<'pie'>;
  options?: ChartOptions<'pie'>;
  height?: number;
  width?: number;
  className?: string;
}

/**
 * Pie chart component for displaying distribution or composition
 */
export const PieChart: React.FC<PieChartProps> = ({
  data,
  options,
  height,
  width,
  className,
}) => {
  const defaultOptions: ChartOptions<'pie'> = {
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((acc: number, data: number) => acc + data, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${percentage}%`;
          },
        },
      },
      legend: {
        position: 'right',
        align: 'center',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <Chart
      type="pie"
      data={data}
      options={{ ...defaultOptions, ...options }}
      height={height}
      width={width}
      className={className}
    />
  );
}; 
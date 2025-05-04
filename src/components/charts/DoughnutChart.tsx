import React from 'react';
import { Chart } from './Chart';
import { ChartData, ChartOptions } from 'chart.js';

interface DoughnutChartProps {
  data: ChartData<'doughnut'>;
  options?: ChartOptions<'doughnut'>;
  height?: number;
  width?: number;
  className?: string;
  cutout?: string;
}

/**
 * Doughnut chart component for displaying distribution or composition with a hole in the center
 */
export const DoughnutChart: React.FC<DoughnutChartProps> = ({
  data,
  options,
  height,
  width,
  className,
  cutout = '60%',
}) => {
  const defaultOptions: ChartOptions<'doughnut'> = {
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
    cutout,
  };

  return (
    <Chart
      type="doughnut"
      data={data}
      options={{ ...defaultOptions, ...options }}
      height={height}
      width={width}
      className={className}
    />
  );
}; 
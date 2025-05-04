import React from 'react';
import { Chart } from './Chart';
import { ChartData, ChartOptions } from 'chart.js';

interface BarChartProps {
  data: ChartData<'bar'>;
  options?: ChartOptions<'bar'>;
  height?: number;
  width?: number;
  className?: string;
  horizontal?: boolean;
}

/**
 * Bar chart component for comparing categories
 */
export const BarChart: React.FC<BarChartProps> = ({
  data,
  options,
  height,
  width,
  className,
  horizontal = false,
}) => {
  const defaultOptions: ChartOptions<'bar'> = {
    indexAxis: horizontal ? 'y' : 'x',
    plugins: {
      tooltip: {
        mode: 'index',
        intersect: false,
      },
      legend: {
        position: 'top',
        align: 'end',
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: true,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#E5E7EB',
        },
        border: {
          dash: [2, 4],
        },
        ticks: {
          padding: 10,
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      bar: {
        borderRadius: 4,
      },
    },
  };

  return (
    <Chart
      type="bar"
      data={data}
      options={{ ...defaultOptions, ...options }}
      height={height}
      width={width}
      className={className}
    />
  );
}; 
import React from 'react';
import { Chart } from './Chart';
import { ChartData, ChartOptions } from 'chart.js';

interface LineChartProps {
  data: ChartData<'line'>;
  options?: ChartOptions<'line'>;
  height?: number;
  width?: number;
  className?: string;
}

/**
 * Line chart component for displaying trends over time
 */
export const LineChart: React.FC<LineChartProps> = ({
  data,
  options,
  height,
  width,
  className,
}) => {
  const defaultOptions: ChartOptions<'line'> = {
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
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
    elements: {
      line: {
        tension: 0.3, // smooth curve
      },
      point: {
        radius: 2,
        hitRadius: 6,
        hoverRadius: 5,
      },
    },
  };

  return (
    <Chart
      type="line"
      data={data}
      options={{ ...defaultOptions, ...options }}
      height={height}
      width={width}
      className={className}
    />
  );
}; 
import React from 'react';
import { Chart } from './Chart';
import { ChartData, ChartOptions } from 'chart.js';

interface AreaChartProps {
  data: ChartData<'line'>;
  options?: ChartOptions<'line'>;
  height?: number;
  width?: number;
  className?: string;
  stacked?: boolean;
}

/**
 * Area chart component for displaying trends and accumulated values
 */
export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  options,
  height,
  width,
  className,
  stacked = false,
}) => {
  // Make sure all datasets have fill=true to create the area effect
  const modifiedData = {
    ...data,
    datasets: data.datasets.map(dataset => ({
      ...dataset,
      fill: true,
    })),
  };

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
        stacked: stacked,
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
      data={modifiedData}
      options={{ ...defaultOptions, ...options }}
      height={height}
      width={width}
      className={className}
    />
  );
}; 
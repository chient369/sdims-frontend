import React from 'react';
import { LineChart } from './LineChart';
import { BarChart } from './BarChart';
import { PieChart } from './PieChart';
import { DoughnutChart } from './DoughnutChart';
import { AreaChart } from './AreaChart';

/**
 * Component to demonstrate usage of different chart types
 */
const ChartExample: React.FC = () => {
  // Sample data for line chart
  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [125000, 167000, 145000, 195000, 210000, 250000],
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
      },
      {
        label: 'Target',
        data: [150000, 150000, 150000, 200000, 200000, 200000],
        borderColor: '#94A3B8',
        borderDash: [5, 5],
      }
    ],
  };

  // Sample data for bar chart
  const barData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: '2022',
        data: [65, 59, 80, 81],
        backgroundColor: 'rgba(79, 70, 229, 0.6)',
      },
      {
        label: '2023',
        data: [45, 70, 65, 85],
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
      },
    ],
  };

  // Sample data for pie/doughnut chart
  const pieData = {
    labels: ['IT', 'Marketing', 'Sales', 'HR', 'Finance'],
    datasets: [
      {
        data: [300, 150, 100, 75, 125],
        backgroundColor: [
          '#4F46E5', // Primary
          '#7C3AED', // Purple
          '#0EA5E9', // Sky
          '#10B981', // Emerald
          '#F59E0B', // Amber
        ],
      },
    ],
  };

  // Sample data for area chart
  const areaData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Allocated',
        data: [45, 52, 60, 65, 68, 72],
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
      },
      {
        label: 'Bench',
        data: [12, 8, 5, 10, 12, 8],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
      },
      {
        label: 'Leave',
        data: [3, 4, 5, 2, 3, 3],
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
      }
    ],
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-6">Chart Components Examples</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-4">Line Chart</h2>
          <LineChart data={lineData} height={300} />
        </div>
        
        {/* Bar Chart */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-4">Bar Chart</h2>
          <BarChart data={barData} height={300} />
        </div>
        
        {/* Pie Chart */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-4">Pie Chart</h2>
          <PieChart data={pieData} height={300} />
        </div>
        
        {/* Doughnut Chart */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-4">Doughnut Chart</h2>
          <DoughnutChart data={pieData} height={300} />
        </div>
        
        {/* Area Chart */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-4">Area Chart</h2>
          <AreaChart data={areaData} height={300} />
        </div>
        
        {/* Stacked Area Chart */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-4">Stacked Area Chart</h2>
          <AreaChart data={areaData} height={300} stacked={true} />
        </div>
        
        {/* Horizontal Bar Chart */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-4">Horizontal Bar Chart</h2>
          <BarChart data={barData} height={300} horizontal={true} />
        </div>
      </div>
    </div>
  );
};

export default ChartExample; 
import React, { useState } from 'react';
import { 
  LineChart, 
  BarChart, 
  PieChart, 
  DoughnutChart, 
  AreaChart,
  GaugeChart
} from '../components/charts';
import { Link } from 'react-router-dom';

type DateRange = 'day' | 'week' | 'month' | 'quarter' | 'year';

const ChartExamplesPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange>('month');

  // Sample revenue data with different date ranges
  const getRevenueData = () => {
    const rangeLabels: Record<DateRange, string[]> = {
      day: ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'],
      week: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      month: ['W1', 'W2', 'W3', 'W4'],
      quarter: ['Jan', 'Feb', 'Mar'],
      year: ['Q1', 'Q2', 'Q3', 'Q4']
    };

    const rangeData: Record<DateRange, number[]> = {
      day: [12000, 18000, 25000, 22000, 30000, 28000],
      week: [45000, 52000, 49000, 60000, 55000, 58000, 65000],
      month: [150000, 180000, 210000, 250000],
      quarter: [580000, 620000, 750000],
      year: [1800000, 2100000, 1950000, 2400000]
    };

    const rangeTargets: Record<DateRange, number[]> = {
      day: [15000, 15000, 20000, 20000, 25000, 25000],
      week: [50000, 50000, 50000, 50000, 50000, 50000, 50000],
      month: [160000, 160000, 200000, 200000],
      quarter: [600000, 600000, 700000],
      year: [2000000, 2000000, 2000000, 2000000]
    };

    return {
      labels: rangeLabels[dateRange],
      datasets: [
        {
          label: 'Actual Revenue',
          data: rangeData[dateRange],
          borderColor: '#4F46E5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          fill: true,
        },
        {
          label: 'Target Revenue',
          data: rangeTargets[dateRange],
          borderColor: '#94A3B8',
          borderDash: [5, 5],
          backgroundColor: 'rgba(0, 0, 0, 0)',
        }
      ],
    };
  };

  // Sample department headcount and budget data
  const departmentData = {
    labels: ['Engineering', 'Sales', 'Marketing', 'Customer Support', 'Admin'],
    datasets: [
      {
        label: 'Headcount',
        data: [42, 28, 15, 22, 8],
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

  // Sample project comparisons
  const projectData = {
    labels: ['Project Alpha', 'Project Beta', 'Project Gamma', 'Project Delta', 'Project Epsilon'],
    datasets: [
      {
        label: 'Revenue (millions)',
        data: [4.2, 3.8, 3.2, 2.9, 2.5],
        backgroundColor: 'rgba(79, 70, 229, 0.7)',
      },
      {
        label: 'Expenses (millions)',
        data: [2.8, 2.2, 2.1, 1.8, 1.6],
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
      }
    ],
  };

  // Sample resource allocation
  const resourceData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Active Projects',
        data: [32, 35, 40, 42, 45, 48],
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.3)',
      },
      {
        label: 'Available Resources',
        data: [18, 15, 10, 8, 5, 2],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.3)',
      },
      {
        label: 'Resource Gap',
        data: [0, 0, 0, 0, 2, 5],
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.3)',
      }
    ],
  };

  // Sample skill distribution
  const skillData = {
    labels: ['JavaScript', 'React', 'Angular', 'Node.js', 'Python', 'Java', 'DevOps'],
    datasets: [
      {
        label: 'Team Skills',
        data: [85, 75, 45, 65, 55, 60, 40],
        backgroundColor: 'rgba(79, 70, 229, 0.7)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 1,
      },
    ],
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">SDIMS Chart Examples</h1>
        <Link 
          to="/dashboard" 
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
      
      {/* Date range selector */}
      <div className="mb-8 bg-white p-4 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-4">Select Date Range for Revenue Chart</h2>
        <div className="inline-flex rounded-md shadow-sm">
          {(['day', 'week', 'month', 'quarter', 'year'] as DateRange[]).map((range) => (
            <button
              key={range}
              type="button"
              className={`px-4 py-2 text-sm font-medium border ${
                range === dateRange
                  ? 'bg-indigo-100 text-indigo-700 border-indigo-300 z-10'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              } ${
                range === 'day' ? 'rounded-l-md' : ''
              } ${
                range === 'year' ? 'rounded-r-md' : ''
              } ${
                range !== 'day' ? '-ml-px' : ''
              }`}
              onClick={() => setDateRange(range)}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* KPI Gauges Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Key Performance Indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-base font-medium text-gray-500 mb-2">Utilization Rate</h3>
            <GaugeChart 
              value={78} 
              min={0} 
              max={100} 
              thresholds={{ warning: 50, danger: 30 }} 
              label="Target: 80%" 
              valueFormat={formatPercent}
            />
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-base font-medium text-gray-500 mb-2">Margin</h3>
            <GaugeChart 
              value={32} 
              min={0} 
              max={50} 
              thresholds={{ warning: 25, danger: 15 }} 
              label="Target: 35%" 
              valueFormat={formatPercent}
            />
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-base font-medium text-gray-500 mb-2">Revenue Goal</h3>
            <GaugeChart 
              value={790000} 
              min={0} 
              max={1000000} 
              thresholds={{ warning: 60, danger: 40 }} 
              label="Q1 Target" 
              valueFormat={(v) => formatCurrency(v)}
            />
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-base font-medium text-gray-500 mb-2">Bench Rate</h3>
            <GaugeChart 
              value={12} 
              min={0} 
              max={30} 
              thresholds={{ warning: 15, danger: 20 }} 
              label="Target: <10%" 
              valueFormat={formatPercent}
            />
          </div>
        </div>
      </div>
      
      {/* Revenue Trends - Line Chart */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Revenue Trends ({dateRange})</h2>
        <LineChart 
          data={getRevenueData()} 
          height={350}
          options={{
            plugins: {
              tooltip: {
                callbacks: {
                  label: (context) => {
                    return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                  }
                }
              }
            }
          }}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Department Distribution - Doughnut Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Department Distribution</h2>
          <DoughnutChart 
            data={departmentData} 
            height={300}
            options={{
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const label = context.label || '';
                      const value = context.parsed || 0;
                      const total = context.dataset.data.reduce((acc: number, data: number) => acc + data, 0);
                      const percentage = ((value / total) * 100).toFixed(1);
                      return `${label}: ${value} (${percentage}%)`;
                    }
                  }
                }
              }
            }}
          />
        </div>
        
        {/* Project Comparison - Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Project Financials</h2>
          <BarChart 
            data={projectData} 
            height={300}
            options={{
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      return `${context.dataset.label}: $${context.parsed.y}M`;
                    }
                  }
                }
              }
            }}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resource Allocation - Area Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Resource Allocation</h2>
          <AreaChart 
            data={resourceData} 
            height={300}
            stacked={true}
          />
        </div>
        
        {/* Skill Distribution - Horizontal Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Team Skills Distribution</h2>
          <BarChart 
            data={skillData} 
            height={300}
            horizontal={true}
            options={{
              indexAxis: 'y',
              scales: {
                x: {
                  beginAtZero: true,
                  max: 100,
                  ticks: {
                    callback: (value) => `${value}%`
                  }
                }
              },
              plugins: {
                legend: {
                  display: false
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartExamplesPage; 
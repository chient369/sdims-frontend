import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { marginService } from '../service';
import { 
  MarginSummary, 
  TeamMarginData, 
  StatusGroupMarginData,
  MarginStatusType
} from '../types';

/**
 * Margin Dashboard Page
 * Displays a summary of margin data with key indicators and charts
 */
const MarginDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [yearMonth, setYearMonth] = useState(getCurrentYearMonth());
  const [summary, setSummary] = useState<MarginSummary | null>(null);
  const [teams, setTeams] = useState<TeamMarginData[]>([]);
  const [statusGroups, setStatusGroups] = useState<StatusGroupMarginData[]>([]);
  const [distribution, setDistribution] = useState<{
    status: MarginStatusType;
    count: number;
    percentage: number;
  }[]>([]);
  
  useEffect(() => {
    loadDashboardData();
  }, [period, yearMonth]);
  
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Get margin summary 
      const summaryResponse = await marginService.getMarginSummary({
        period,
        yearMonth: period === 'month' ? yearMonth : undefined,
        view: 'table',
      });
      
      setSummary(summaryResponse.summary);
      setTeams(summaryResponse.teams || []);
      setStatusGroups(summaryResponse.statusGroups || []);
      
      // Get status distribution
      const distributionData = await marginService.getMarginStatusDistribution(
        undefined, // no team filter
        period === 'month' ? yearMonth : undefined
      );
      
      setDistribution(distributionData.distribution);
    } catch (error) {
      console.error('Error loading margin dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriod(e.target.value as 'month' | 'quarter' | 'year');
  };
  
  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYearMonth(e.target.value);
  };
  
  // Helper function to get current YYYY-MM
  function getCurrentYearMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
  
  const getStatusColor = (status: MarginStatusType) => {
    switch (status) {
      case 'Red': return 'bg-red-100 text-red-800';
      case 'Yellow': return 'bg-yellow-100 text-yellow-800';
      case 'Green': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Margin Dashboard</h1>
        <div className="flex gap-4">
          <Link 
            to="/margins/import" 
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded"
          >
            Import Cost Data
          </Link>
          <Link 
            to="/margins/employees" 
            className="bg-secondary-600 hover:bg-secondary-700 text-white px-4 py-2 rounded"
          >
            View All Employees
          </Link>
        </div>
      </div>
      
      {/* Filter controls */}
      <div className="flex gap-4 mb-6 bg-white p-4 rounded shadow">
        <div className="w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
          <select
            value={period}
            onChange={handlePeriodChange}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="month">Monthly</option>
            <option value="quarter">Quarterly</option>
            <option value="year">Yearly</option>
          </select>
        </div>
        
        {period === 'month' && (
          <div className="w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <input
              type="month"
              value={yearMonth}
              onChange={handleMonthChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
        )}
      </div>
      
      {/* Dashboard content */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Total Employees</h3>
                <p className="text-3xl font-bold text-primary-600">{summary.totalEmployees}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Average Cost</h3>
                <p className="text-3xl font-bold text-red-600">${summary.averageCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Average Revenue</h3>
                <p className="text-3xl font-bold text-green-600">${summary.averageRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Average Margin</h3>
                <p className="text-3xl font-bold text-blue-600">{summary.averageMargin.toFixed(2)}%</p>
              </div>
            </div>
          )}
          
          {/* Status distribution */}
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Margin Status Distribution</h2>
            <div className="flex items-center mb-4">
              {distribution.map((item) => (
                <div key={item.status} className="flex-1 mx-1">
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-gray-600">
                          {item.count} ({item.percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                      <div 
                        style={{ width: `${item.percentage}%` }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                          item.status === 'Red' ? 'bg-red-500' :
                          item.status === 'Yellow' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Teams overview */}
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Teams Overview</h2>
              <Link 
                to="/margins/teams" 
                className="text-primary-600 hover:text-primary-800 text-sm font-medium"
              >
                View All Teams
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employees
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Margin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teams.length > 0 ? (
                    teams.map((team) => (
                      <tr key={team.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            <Link to={`/margins/teams/${team.id}`} className="hover:text-primary-600">
                              {team.name}
                            </Link>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {team.employeeCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${team.cost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${team.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {team.margin.toFixed(2)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(team.marginStatus)}`}>
                            {team.marginStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        No team data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MarginDashboard; 
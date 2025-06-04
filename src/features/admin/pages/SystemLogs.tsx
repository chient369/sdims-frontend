import React, { useState } from 'react';

// Types for log entry
interface LogEntry {
  id: number;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  source: string;
  message: string;
  user?: string;
  details?: string;
}

/**
 * System Logs component for viewing and filtering system logs
 * @returns {JSX.Element} The rendered component
 */
const SystemLogs: React.FC = () => {
  // Mock log data
  const allLogs: LogEntry[] = [
    {
      id: 1,
      timestamp: '2025-05-15 10:15:32',
      level: 'info',
      source: 'auth.service',
      message: 'User login successful',
      user: 'admin@example.com'
    },
    {
      id: 2,
      timestamp: '2025-05-15 10:18:45',
      level: 'warning',
      source: 'user.service',
      message: 'Failed attempt to update user with invalid data',
      user: 'admin@example.com',
      details: 'Validation failed: email format is invalid'
    },
    {
      id: 3,
      timestamp: '2025-05-15 10:22:14',
      level: 'error',
      source: 'database.service',
      message: 'Database connection failed',
      details: 'Connection timeout after 30s'
    },
    {
      id: 4,
      timestamp: '2025-05-15 11:05:22',
      level: 'info',
      source: 'user.service',
      message: 'User profile updated',
      user: 'user@example.com'
    },
    {
      id: 5,
      timestamp: '2025-05-15 11:12:36',
      level: 'debug',
      source: 'api.controller',
      message: 'API request received',
      details: 'GET /api/users?page=1&limit=10'
    },
    {
      id: 6,
      timestamp: '2025-05-15 11:30:45',
      level: 'error',
      source: 'file.service',
      message: 'File upload failed',
      user: 'manager@example.com',
      details: 'File size exceeds maximum allowed size (15MB)'
    },
    {
      id: 7,
      timestamp: '2025-05-15 12:01:18',
      level: 'info',
      source: 'auth.service',
      message: 'User logout',
      user: 'user@example.com'
    },
    {
      id: 8,
      timestamp: '2025-05-15 12:15:33',
      level: 'warning',
      source: 'system.service',
      message: 'High CPU usage detected',
      details: 'CPU usage at 85% for more than 5 minutes'
    },
  ];
  
  // Filter state
  const [filters, setFilters] = useState({
    level: '',
    source: '',
    user: '',
    search: '',
  });
  
  // Apply filters to logs
  const filteredLogs = allLogs.filter(log => {
    if (filters.level && log.level !== filters.level) return false;
    if (filters.source && log.source !== filters.source) return false;
    if (filters.user && (!log.user || !log.user.includes(filters.user))) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const messageMatch = log.message.toLowerCase().includes(searchLower);
      const detailsMatch = log.details ? log.details.toLowerCase().includes(searchLower) : false;
      const userMatch = log.user ? log.user.toLowerCase().includes(searchLower) : false;
      if (!messageMatch && !detailsMatch && !userMatch) return false;
    }
    return true;
  });
  
  // Get unique values for filter dropdowns
  const uniqueLevels = Array.from(new Set(allLogs.map(log => log.level)));
  const uniqueSources = Array.from(new Set(allLogs.map(log => log.source)));
  
  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      level: '',
      source: '',
      user: '',
      search: '',
    });
  };
  
  // Helper for log level badge styling
  const getLevelBadgeClass = (level: LogEntry['level']) => {
    switch (level) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'debug': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">System Logs</h1>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Log Level</label>
            <select
              name="level"
              value={filters.level}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded min-w-[120px]"
            >
              <option value="">All Levels</option>
              {uniqueLevels.map(level => (
                <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Source</label>
            <select
              name="source"
              value={filters.source}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded min-w-[160px]"
            >
              <option value="">All Sources</option>
              {uniqueSources.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">User</label>
            <input
              type="text"
              name="user"
              value={filters.user}
              onChange={handleFilterChange}
              placeholder="Filter by user"
              className="w-full px-3 py-2 border border-gray-300 rounded min-w-[200px]"
            />
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search messages and details"
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          
          <div className="self-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Logs table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.timestamp}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded ${getLevelBadgeClass(log.level)}`}>
                        {log.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{log.source}</td>
                    <td className="px-6 py-4 text-sm">
                      <div>{log.message}</div>
                      {log.details && (
                        <div className="mt-1 text-xs text-gray-500">{log.details}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.user || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No logs match the current filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SystemLogs; 
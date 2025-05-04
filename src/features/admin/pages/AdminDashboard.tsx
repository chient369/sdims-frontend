import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { userService, roleService, systemLogService } from '../service';

/**
 * Admin Dashboard Component
 * 
 * Displays an overview of all admin sections with quick access links and summary data
 */
const AdminDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<{
    activeUsers: number;
    totalRoles: number;
    errorCount: number;
    recentErrors: any[];
  }>({
    activeUsers: 0,
    totalRoles: 0,
    errorCount: 0,
    recentErrors: []
  });
  
  useEffect(() => {
    loadDashboardData();
  }, []);
  
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch data in parallel
      const [activeUsersCount, rolesData, logSummary, recentErrors] = await Promise.all([
        userService.getActiveUsersCount(),
        roleService.getRoles({ page: 1, size: 1 }),
        systemLogService.getLogsSummary(),
        systemLogService.getRecentCriticalErrors(5)
      ]);
      
      setDashboardData({
        activeUsers: activeUsersCount,
        totalRoles: rolesData.pageable.totalElements,
        errorCount: logSummary.totalErrors + logSummary.totalWarnings,
        recentErrors: recentErrors
      });
    } catch (error) {
      console.error('Error loading admin dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-secondary-900 mb-6">Admin Dashboard</h1>
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-500">ACTIVE USERS</h3>
              <p className="text-3xl font-bold text-primary-600">{dashboardData.activeUsers}</p>
              <div className="mt-4">
                <Link to="/admin/users" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                  View All Users →
                </Link>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-500">TOTAL ROLES</h3>
              <p className="text-3xl font-bold text-primary-600">{dashboardData.totalRoles}</p>
              <div className="mt-4">
                <Link to="/admin/roles" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                  Manage Roles →
                </Link>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-500">SYSTEM ALERTS</h3>
              <p className="text-3xl font-bold text-red-600">{dashboardData.errorCount}</p>
              <div className="mt-4">
                <Link to="/admin/logs" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                  View System Logs →
                </Link>
              </div>
            </div>
          </div>
          
          {/* Admin Sections */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Administration Sections</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminSectionCard 
                title="User Management" 
                description="Create, update, and manage system users"
                icon="👤"
                path="/admin/users"
              />
              <AdminSectionCard 
                title="Role Management" 
                description="Configure roles and permissions"
                icon="🔐"
                path="/admin/roles"
              />
              <AdminSectionCard 
                title="System Configuration" 
                description="Manage system-wide settings and parameters"
                icon="⚙️"
                path="/admin/config"
              />
              <AdminSectionCard 
                title="System Logs" 
                description="Monitor system activities and errors"
                icon="📋"
                path="/admin/logs"
              />
            </div>
          </div>
          
          {/* Recent System Alerts */}
          {dashboardData.recentErrors.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Recent System Alerts</h2>
                <Link 
                  to="/admin/logs" 
                  className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                >
                  View All Logs
                </Link>
              </div>
              
              <div className="space-y-3">
                {dashboardData.recentErrors.map((error, index) => (
                  <div key={index} className="p-3 bg-red-50 border border-red-200 rounded">
                    <div className="flex items-start">
                      <div className="mr-3 text-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-red-800">{error.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {error.module} - {new Date(error.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface AdminSectionCardProps {
  title: string;
  description: string;
  icon: string;
  path: string;
}

const AdminSectionCard: React.FC<AdminSectionCardProps> = ({ title, description, icon, path }) => {
  return (
    <Link 
      to={path} 
      className="flex p-4 border border-gray-200 rounded-lg transition-shadow hover:shadow-md"
    >
      <div className="text-3xl mr-4">{icon}</div>
      <div>
        <h3 className="font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </Link>
  );
};

export default AdminDashboard; 
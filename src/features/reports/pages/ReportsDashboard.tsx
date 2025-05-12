import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../dashboard';
import { DashboardSummaryResponse } from '../types';
import { usePermissions } from '../../../hooks/usePermissions';

/**
 * Reports Dashboard Component
 * 
 * Displays an overview of all available reports with quick access links
 */
const ReportsDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardSummaryResponse | null>(null);
  const { can, canAny, user } = usePermissions();
  
  useEffect(() => {
    loadDashboardData();
  }, []);
  
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = await dashboardService.getSummary({
        widgets: ['opportunitiesByStage', 'revenueByMonth', 'marginDistribution']
      });
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const canViewEmployeeReports = () => {
    return canAny([
      'employee:read:all', 
      'employee:read:team', 
      'employee:read:own', 
      'employees:read',
      'utilization:read:all', 
      'utilization:read:team', 
      'project-history:read:all',
      'project-history:read:team',
      'project-history:read:own',
      'employee-status:read:all',
      'employee-status:read:team',
      'employee-status:read:own',
      'report:read:all', 
      'report:read:team'
    ]);
  };
  
  const canViewMarginReports = () => {
    return canAny([
      'margin:read:all', 
      'margin:read:team', 
      'margin-summary:read:all', 
      'margin-summary:read:team',
      'revenue:read:all',
      'revenue:read:team',
      'employee-cost:read:all',
      'employee-cost:read:team',
      'report:read:all'
    ]);
  };
  
  const canViewOpportunityReports = () => {
    return canAny([
      'opportunity:read:all', 
      'opportunity:read:own', 
      'opportunity:read:assigned',
      'opportunities:read',
      'opportunity-followup:read:all',
      'opportunity-note:read:all',
      'opportunity-note:read:assigned',
      'report:read:all'
    ]);
  };
  
  const canViewContractReports = () => {
    return canAny([
      'contract:read:all', 
      'contract:read:own', 
      'contract:read:assigned',
      'contracts:read',
      'contract-link:update:all',
      'contract-link:update:own',
      'contract-link:update:assigned',
      'contract-file:read:all',
      'contract-file:read:own',
      'contract-file:read:assigned',
      'report:read:all'
    ]);
  };
  
  const canViewPaymentReports = () => {
    return canAny([
      'payment-term:read:all', 
      'payment-term:read:own', 
      'payment-term:read:assigned', 
      'payment-status:read:all',
      'debt-report:read:all',
      'debt-report:read:own',
      'payment-alert:read:all',
      'payment-alert:read:own',
      'payment-alert:read:assigned',  
      'report:read:all'
    ]);
  };
  
  const canViewKpiReports = () => {
    return canAny([
      'sales-kpi:read:all', 
      'sales-kpi:read:own',
      'revenue-report:read:all',
      'revenue-report:read:team',
      'revenue-report:read:own',
      'revenue-summary:read:all',
      'revenue-summary:read:team',
      'revenue-summary:read:own',
      'report:read:all'
    ]);
  };
  
  const canViewUtilizationReports = () => {
    return canAny([
      'utilization:read:all', 
      'utilization:read:team',
      'employee-status:read:all',
      'employee-status:read:team',
      'employee-alert:read:all',
      'employee-alert:read:team',
      'report:read:all'
    ]);
  };
  
  const canViewExecutiveReports = () => {
    const hasAccess = canAny([
      'dashboard:read:all',
      'dashboard:read:team',
      'dashboard:read:own',
      'margin-summary:read:all',
      'margin-summary:read:team',
      'revenue-summary:read:all',
      'revenue-summary:read:team',
      'revenue-summary:read:own',
      'report:read:all'
    ]);
    
    if (!hasAccess) {
      console.log('Executive report access denied. User permissions:', user?.permissions || []);
    }
    
    return hasAccess;
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-secondary-900 mb-6">Reports Dashboard</h1>
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Reports Section */}
          <div className="md:col-span-2 space-y-6">
            {/* Summary Cards */}
            {dashboardData && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-gray-500">EMPLOYEES</h3>
                  <p className="text-2xl font-bold text-primary-600">{dashboardData.summary.totalEmployees}</p>
                </div>
                <div className="bg-white p-5 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-gray-500">OPPORTUNITIES</h3>
                  <p className="text-2xl font-bold text-primary-600">{dashboardData.summary.activeOpportunities}</p>
                </div>
                <div className="bg-white p-5 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-gray-500">MARGIN</h3>
                  <p className="text-2xl font-bold text-primary-600">{dashboardData.summary.averageMargin.toFixed(1)}%</p>
                </div>
                <div className="bg-white p-5 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-gray-500">UTILIZATION</h3>
                  <p className="text-2xl font-bold text-primary-600">{dashboardData.summary.averageUtilization.toFixed(1)}%</p>
                </div>
              </div>
            )}
            
            {/* Reports List */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Reports</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {canViewEmployeeReports() && (
                  <ReportCard 
                    title="Employee Reports" 
                    description="Staff details, skills, project assignments and utilization rates"
                    icon="👥"
                    path="/reports/employees"
                  />
                )}
                
                {canViewMarginReports() && (
                  <ReportCard 
                    title="Margin Reports" 
                    description="Margin analysis by team, employee and time period"
                    icon="💰"
                    path="/reports/margins"
                  />
                )}
                
                {canViewOpportunityReports() && (
                  <ReportCard 
                    title="Opportunity Reports" 
                    description="Sales pipeline, deal flow and conversion metrics"
                    icon="📊"
                    path="/reports/opportunities"
                  />
                )}
                
                {canViewContractReports() && (
                  <ReportCard 
                    title="Contract Reports" 
                    description="Contract status, value and payment schedules"
                    icon="📄"
                    path="/reports/contracts"
                  />
                )}
                
                {canViewPaymentReports() && (
                  <ReportCard 
                    title="Payment Reports" 
                    description="Payment tracking, invoices and financial status"
                    icon="💵"
                    path="/reports/payments"
                  />
                )}
                
                {canViewKpiReports() && (
                  <ReportCard 
                    title="KPI Reports" 
                    description="Key performance indicators and business metrics"
                    icon="🎯"
                    path="/reports/kpi"
                  />
                )}
                
                {canViewUtilizationReports() && (
                  <ReportCard 
                    title="Utilization Reports" 
                    description="Resource utilization, billable hours and capacity"
                    icon="⏱️"
                    path="/reports/utilization"
                  />
                )}
                
                {canViewExecutiveReports() && (
                  <ReportCard 
                    title="Executive Dashboard" 
                    description="High-level business overview for executives"
                    icon="📈"
                    path="/reports/executive"
                    highlight={true}
                  />
                )}
              </div>
            </div>
          </div>
          
          {/* Quick Access Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h2>
              <ul className="space-y-2">
                {canViewEmployeeReports() && (
                  <li>
                    <Link to="/reports/employees" className="text-primary-600 hover:text-primary-800 font-medium">
                      Q3 Employee Utilization
                    </Link>
                  </li>
                )}
                
                {canViewMarginReports() && (
                  <li>
                    <Link to="/reports/margins" className="text-primary-600 hover:text-primary-800 font-medium">
                      Monthly Margin Analysis
                    </Link>
                  </li>
                )}
                
                {canViewOpportunityReports() && (
                  <li>
                    <Link to="/reports/opportunities" className="text-primary-600 hover:text-primary-800 font-medium">
                      Sales Pipeline Overview
                    </Link>
                  </li>
                )}
                
                {canViewExecutiveReports() && (
                  <li>
                    <Link to="/reports/executive" className="text-primary-600 hover:text-primary-800 font-medium">
                      Executive Summary
                    </Link>
                  </li>
                )}
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Export</h2>
              <div className="space-y-3">
                {can('report:export') && (
                  <>
                    <button 
                      className="w-full px-4 py-2 bg-secondary-100 text-secondary-700 rounded hover:bg-secondary-200 transition flex items-center"
                      onClick={() => {/* Implement export functionality */}}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export as Excel
                    </button>
                    
                    <button 
                      className="w-full px-4 py-2 bg-secondary-100 text-secondary-700 rounded hover:bg-secondary-200 transition flex items-center"
                      onClick={() => {/* Implement export functionality */}}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export as CSV
                    </button>
                    
                    <button 
                      className="w-full px-4 py-2 bg-secondary-100 text-secondary-700 rounded hover:bg-secondary-200 transition flex items-center"
                      onClick={() => {/* Implement export functionality */}}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export as PDF
                    </button>
                  </>
                )}
                
                {!can('report:export') && (
                  <div className="text-gray-500 text-sm text-center py-3">
                    You don't have permission to export reports
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface ReportCardProps {
  title: string;
  description: string;
  icon: string;
  path: string;
  highlight?: boolean;
}

const ReportCard: React.FC<ReportCardProps> = ({ title, description, icon, path, highlight = false }) => {
  return (
    <Link 
      to={path} 
      className={`block p-4 rounded-lg border transition-shadow hover:shadow-md ${
        highlight 
          ? 'border-primary-500 bg-primary-50' 
          : 'border-gray-200 hover:border-primary-300'
      }`}
    >
      <div className="flex items-start">
        <div className="text-2xl mr-3">{icon}</div>
        <div>
          <h3 className={`font-medium ${highlight ? 'text-primary-700' : 'text-gray-900'}`}>{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default ReportsDashboard; 
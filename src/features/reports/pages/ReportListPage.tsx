import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReportList, ReportListFilters, ViewSwitcher } from '../components';
import { Report, ReportListParams, ReportModule, ReportType } from '../types';
import { reportService } from '../service';
import { usePermissions } from '../../../hooks/usePermissions';

/**
 * Page component for displaying the list of reports
 * @returns {JSX.Element} - The rendered page
 */
const ReportListPage: React.FC = () => {
  const navigate = useNavigate();
  const { can } = usePermissions();
  const canFnRef = useRef(can);
  
  // State management
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<ReportModule | null>(null);
  const [selectedType, setSelectedType] = useState<ReportType | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  
  // Cập nhật reference khi `can` thay đổi
  useEffect(() => {
    canFnRef.current = can;
  }, [can]);
  
  // Handle loading reports
  const loadReports = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Create filter params
      const params: ReportListParams = {
        search: searchTerm,
        module: selectedModule || undefined,
        type: selectedType || undefined,
        page: 1,
        size: 50,
      };
      
      // Get reports
      const response = await reportService.getReportsList(params);
      
      // Filter by permissions sử dụng canFnRef.current để tránh dependency
      const filteredReports = response.data.filter(
        report => !report.permission || canFnRef.current(report.permission)
      );
      
      setReports(filteredReports);
    } catch (error) {
      console.error('Error loading reports:', error);
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedModule, selectedType]); // Remove `can` từ dependencies
  
  // Load reports on initial render and when filters change
  useEffect(() => {
    loadReports();
  }, [loadReports]);
  
  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };
  
  // Handle module filter change
  const handleModuleChange = (module: string | null) => {
    setSelectedModule(module as ReportModule | null);
  };
  
  // Handle type filter change
  const handleTypeChange = (type: string | null) => {
    setSelectedType(type as ReportType | null);
  };
  
  // Handle clearing filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedModule(null);
    setSelectedType(null);
  };
  
  // Handle opening a report
  const handleOpenReport = async (report: Report) => {
    try {
      await reportService.openReport(report);
      
      // Navigate to the report view page
      navigate(`/reports/${report.id}`);
    } catch (error) {
      console.error('Error opening report:', error);
    }
  };
  
  // Toggle view mode between card and table
  const handleViewModeChange = (mode: 'card' | 'table') => {
    setViewMode(mode);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Danh sách Báo cáo</h1>
        
        <div className="flex items-center space-x-4">
          <ViewSwitcher 
            currentView={viewMode} 
            onViewChange={handleViewModeChange} 
          />
        </div>
      </div>
      
      <div className="mb-6">
        <ReportListFilters
          searchTerm={searchTerm}
          selectedModule={selectedModule}
          selectedType={selectedType}
          onSearch={handleSearch}
          onModuleChange={handleModuleChange}
          onTypeChange={handleTypeChange}
          onClearFilters={handleClearFilters}
        />
      </div>
      
      <ReportList
        reports={reports}
        isLoading={isLoading}
        onOpenReport={handleOpenReport}
        groupByModule={true}
        viewMode={viewMode}
      />
    </div>
  );
};

export default ReportListPage; 
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GenericReportResponse, ReportFilter } from '../types';
import { ReportViewer, ReportFilters, ReportToolbar, ReportHeader } from '../components';
import { reportService } from '../service';
import { useToast } from '../../../hooks';
import { Spinner } from '../../../components/ui';

/**
 * Generic Report Viewer Page Component (MH-RPT-02)
 * Hiển thị và tương tác với một báo cáo cụ thể dựa trên reportId
 * Xử lý việc tải dữ liệu báo cáo, lọc và xuất báo cáo
 */
const ReportViewerPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  // State cho dữ liệu báo cáo và metadata
  const [reportData, setReportData] = useState<GenericReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reportMetadata, setReportMetadata] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // State cho filters
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [availableFilters, setAvailableFilters] = useState<ReportFilter[]>([]);
  
  // Loại báo cáo đang xem
  const [reportType, setReportType] = useState<string>('');
  
  // Tải metadata của báo cáo
  const loadReportMetadata = useCallback(async () => {
    if (!reportId) return;
    
    console.log('Đang tải metadata cho báo cáo:', reportId);
    
    try {
      const metadata = await reportService.getReportMetadata(reportId);
      console.log('Metadata báo cáo đã tải:', metadata);
      
      setReportMetadata(metadata);
      setReportType(metadata.type || reportId); // Fallback to reportId if type is not available
      setAvailableFilters(metadata.filters || []);
      
      // Thiết lập bộ lọc mặc định từ metadata
      if (metadata.defaultFilters) {
        setFilters(metadata.defaultFilters);
      }
    } catch (error) {
      console.error('Không thể tải metadata báo cáo:', error);
      setError('Không thể tải thông tin báo cáo. Vui lòng thử lại sau.');
      showToast({
        title: 'Lỗi',
        message: 'Không thể tải thông tin báo cáo',
        type: 'error'
      });
    }
  }, [reportId, showToast]);
  
  // Tải dữ liệu báo cáo dựa trên filters
  const loadReportData = useCallback(async () => {
    if (!reportId) return;
    
    console.log('Đang tải dữ liệu cho báo cáo:', reportId, 'với filters:', filters);
    
    setIsLoading(true);
    
    try {
      const data = await reportService.getReportData(reportId, filters);
      console.log('Dữ liệu báo cáo đã tải:', data);
      
      setReportData(data);
      setError(null);
    } catch (error) {
      console.error('Không thể tải dữ liệu báo cáo:', error);
      setError('Không thể tải dữ liệu báo cáo. Vui lòng thử lại sau.');
      showToast({
        title: 'Lỗi',
        message: 'Không thể tải dữ liệu báo cáo',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [reportId, filters, showToast]);
  
  // Tải metadata khi component được khởi tạo
  useEffect(() => {
    loadReportMetadata();
  }, [loadReportMetadata]);
  
  // Tải dữ liệu báo cáo khi reportType hoặc filters thay đổi
  useEffect(() => {
    if (reportId) {
      loadReportData();
    }
  }, [reportId, loadReportData]);
  
  // Xử lý khi thay đổi bộ lọc
  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
  };
  
  // Xử lý xuất báo cáo
  const handleExport = async (exportType: 'excel' | 'csv' | 'pdf') => {
    if (!reportId) return;
    
    try {
      setIsLoading(true);
      await reportService.exportReport(reportId, { ...filters, exportType });
      showToast({
        title: 'Thành công',
        message: 'Báo cáo đã được xuất thành công',
        type: 'success'
      });
    } catch (error) {
      console.error('Không thể xuất báo cáo:', error);
      showToast({
        title: 'Lỗi',
        message: 'Không thể xuất báo cáo',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Xử lý in báo cáo
  const handlePrint = () => {
    window.print();
  };
  
  // Xử lý refresh dữ liệu
  const handleRefresh = () => {
    loadReportData();
  };
  
  // Xử lý quay lại
  const handleBack = () => {
    navigate('/reports');
  };
  
  // Hiển thị trạng thái loading
  if (isLoading && !reportData) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }
  
  // Hiển thị lỗi
  if (error && !reportData) {
    return (
      <div className="w-full">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={handleBack}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
          >
            Quay lại danh sách báo cáo
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full">
      {reportMetadata && (
        <ReportHeader
          title={reportMetadata.name}
          description={reportMetadata.description}
          updatedAt={reportData?.data?.reportInfo?.generatedAt}
          onBack={handleBack}
        />
      )}
      
      <div className="mb-4">
        <ReportFilters
          filters={availableFilters}
          values={filters}
          onChange={handleFilterChange}
          onApply={loadReportData}
          onReset={() => setFilters({})}
        />
      </div>
      
      <ReportToolbar
        onExport={handleExport}
        onPrint={handlePrint}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />
      
      {reportData && (
        <ReportViewer 
          data={reportData}
          type={reportType}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default ReportViewerPage; 
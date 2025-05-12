import React, { useState, useRef, useEffect } from 'react';
import { ReportToolbarProps } from '../types';
import { FileDown, Printer, RefreshCw } from 'lucide-react';

/**
 * Thanh công cụ cho báo cáo
 * Hỗ trợ export, in và làm mới dữ liệu báo cáo
 */
const ReportToolbar: React.FC<ReportToolbarProps> = ({
  onExport,
  onPrint,
  onRefresh,
  isLoading
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Xử lý click bên ngoài để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="relative" ref={exportRef}>
        <button
          type="button"
          onClick={() => setShowExportMenu(!showExportMenu)}
          className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none"
          disabled={isLoading}
        >
          <FileDown size={16} />
          <span>Xuất báo cáo</span>
        </button>
        
        {showExportMenu && (
          <div className="absolute left-0 mt-1 w-28 bg-white rounded-md shadow-lg z-10 border border-gray-200 py-1">
            <button
              onClick={() => {
                onExport('excel');
                setShowExportMenu(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Excel
            </button>
            <button
              onClick={() => {
                onExport('csv');
                setShowExportMenu(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              CSV
            </button>
            <button
              onClick={() => {
                onExport('pdf');
                setShowExportMenu(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              PDF
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onPrint}
        className="flex items-center gap-1 bg-gray-200 text-gray-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-300 focus:outline-none"
        disabled={isLoading}
      >
        <Printer size={16} />
        <span>In báo cáo</span>
      </button>

      <div className="flex-1"></div>

      <button
        type="button"
        onClick={onRefresh}
        className="flex items-center gap-1 bg-gray-200 text-gray-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-300 focus:outline-none"
        disabled={isLoading}
      >
        <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        <span>Làm mới</span>
      </button>
    </div>
  );
};

export default ReportToolbar; 
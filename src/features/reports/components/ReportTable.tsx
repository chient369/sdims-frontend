import React from 'react';
import { Report } from '../types';

interface ReportTableProps {
  reports: Report[];
  onOpenReport: (report: Report) => void;
}

/**
 * Component for displaying reports in a table format
 * @param {ReportTableProps} props - Component props
 * @returns {JSX.Element} - The rendered component
 */
const ReportTable: React.FC<ReportTableProps> = ({
  reports,
  onOpenReport
}) => {
  // Get module display class
  const getModuleClass = (module: string): string => {
    const moduleClasses: Record<string, string> = {
      'hrm': 'bg-blue-100 text-blue-800',
      'finance': 'bg-rose-100 text-rose-800',
      'contract': 'bg-indigo-100 text-indigo-800',
      'opportunity': 'bg-amber-100 text-amber-800',
      'margin': 'bg-emerald-100 text-emerald-800',
      'dashboard': 'bg-purple-100 text-purple-800'
    };
    
    return moduleClasses[module] || 'bg-slate-100 text-slate-800';
  };
  
  // Get report type display class
  const getTypeClass = (type: string): string => {
    const typeClasses: Record<string, string> = {
      'analytical': 'bg-indigo-50 text-indigo-700',
      'operational': 'bg-emerald-50 text-emerald-700',
      'summary': 'bg-amber-50 text-amber-700'
    };
    
    return typeClasses[type] || 'bg-gray-50 text-gray-700';
  };
  
  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Tên báo cáo
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Mô tả
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Module
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Loại
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.map((report) => (
              <tr 
                key={report.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onOpenReport(report)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{report.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 truncate max-w-xs">{report.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getModuleClass(report.module)}`}>
                    {report.module.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeClass(report.type)}`}>
                    {report.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-3">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenReport(report);
                      }}
                      className="text-primary-600 hover:text-primary-900 font-medium"
                    >
                      Xem
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportTable; 
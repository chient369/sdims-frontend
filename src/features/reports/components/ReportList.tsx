import React from 'react';
import { Report, ReportModule } from '../types';
import ReportCard from './ReportCard';
import ReportTable from './ReportTable';

interface ReportListProps {
  reports: Report[];
  isLoading: boolean;
  onOpenReport: (report: Report) => void;
  groupByModule?: boolean;
  viewMode?: 'card' | 'table';
}

/**
 * Component for displaying a list of reports, optionally grouped by module
 * @param {ReportListProps} props - Component props
 * @returns {JSX.Element} - The rendered component
 */
const ReportList: React.FC<ReportListProps> = ({
  reports,
  isLoading,
  onOpenReport,
  groupByModule = true,
  viewMode = 'card'
}) => {
  // Group reports by module if needed
  const groupedReports = React.useMemo(() => {
    if (!groupByModule) {
      return { 'all': reports };
    }

    return reports.reduce<Record<string, Report[]>>((groups, report) => {
      const module = report.module;
      if (!groups[module]) {
        groups[module] = [];
      }
      groups[module].push(report);
      return groups;
    }, {});
  }, [reports, groupByModule]);

  // Get translated module name
  const getModuleName = (moduleKey: string): string => {
    const moduleNames: Record<string, string> = {
      'hrm': 'Nhân sự',
      'finance': 'Tài chính',
      'contract': 'Hợp đồng',
      'opportunity': 'Kinh doanh',
      'margin': 'Margin',
      'dashboard': 'Dashboard',
      'all': 'Tất cả báo cáo'
    };
    return moduleNames[moduleKey] || moduleKey;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Empty state
  if (reports.length === 0) {
    return (
      <div className="text-center py-10">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-semibold text-gray-900">Không có báo cáo nào</h3>
        <p className="mt-1 text-sm text-gray-500">
          Không tìm thấy báo cáo nào phù hợp với bộ lọc hiện tại.
        </p>
      </div>
    );
  }

  // Card View
  if (viewMode === 'card') {
    return (
      <div>
        {Object.entries(groupedReports).map(([module, moduleReports]) => (
          <div key={module} className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {getModuleName(module)}
              <span className="text-gray-500 text-sm ml-2">({moduleReports.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {moduleReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onOpen={() => onOpenReport(report)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Table View
  return (
    <ReportTable
      reports={reports}
      onOpenReport={onOpenReport}
    />
  );
};

export default ReportList; 
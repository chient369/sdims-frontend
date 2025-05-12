import React, { useMemo } from 'react';
import { ReportViewerProps } from '../types';
import { Table } from '../../../components/table';
import { LineChart, BarChart, PieChart, DoughnutChart } from '../../../components/charts';
import { ColumnDef } from '@tanstack/react-table';

// Định nghĩa kiểu cho dữ liệu đồ thị
interface TrendItem {
  period: string;
  value: number;
}

interface SkillItem {
  name: string;
  count: number;
}

/**
 * Component chính để hiển thị dữ liệu báo cáo
 * Hỗ trợ hiển thị dưới dạng bảng và các loại biểu đồ khác nhau
 */
const ReportViewer: React.FC<ReportViewerProps> = ({
  data,
  type,
  isLoading
}) => {
  console.log('ReportViewer received data:', data);
  console.log('ReportViewer type:', type);
  
  // Xác định cấu trúc dữ liệu bảng
  const tableData = useMemo(() => {
    console.log('Processing table data from:', data?.data?.content);
    if (!data || !data.data || !data.data.content) {
      console.warn('Missing content data in report');
      return [];
    }
    return data.data.content;
  }, [data]);
  
  // Xác định cấu trúc cột dựa trên loại báo cáo
  const tableColumns = useMemo(() => {
    if (!tableData || tableData.length === 0) {
      console.warn('No table data available to generate columns');
      return [];
    }
    
    // Cấu hình cột tùy thuộc vào loại báo cáo
    if (type === 'employee-list') {
      console.log('Generating columns for employee-list report');
      return [
        {
          accessorKey: 'employeeCode',
          header: 'Mã NV',
        },
        {
          accessorKey: 'name',
          header: 'Họ tên',
        },
        {
          accessorKey: 'email',
          header: 'Email',
        },
        {
          accessorKey: 'position',
          header: 'Vị trí',
        },
        {
          accessorKey: 'team.name',
          header: 'Team',
          // Đặc biệt xử lý dữ liệu lồng nhau
          cell: ({ row }: any) => row.original.team?.name || '-',
        },
        {
          accessorKey: 'status',
          header: 'Trạng thái',
          cell: ({ row }: any) => {
            const status = row.original.status;
            let className = '';
            let statusText = status || '';
            
            // Áp dụng màu sắc dựa vào trạng thái
            switch (status) {
              case 'Allocated':
                className = 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium';
                statusText = 'Đã phân bổ';
                break;
              case 'Available':
                className = 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium';
                statusText = 'Sẵn sàng';
                break;
              case 'EndingSoon':
                className = 'bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium';
                statusText = 'Sắp kết thúc';
                break;
              case 'OnLeave':
                className = 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium';
                statusText = 'Nghỉ phép';
                break;
              case 'Resigned':
                className = 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium';
                statusText = 'Đã nghỉ việc';
                break;
              default:
                className = 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium';
            }
            
            return <span className={className}>{statusText}</span>;
          },
        },
        {
          accessorKey: 'utilization',
          header: 'Tỷ lệ sử dụng (%)',
          cell: ({ row }: any) => {
            const utilization = row.original.utilization || 0;
            let className = '';
            
            // Áp dụng màu sắc dựa vào tỷ lệ sử dụng
            if (utilization >= 90) {
              className = 'text-green-600 font-medium';
            } else if (utilization >= 70) {
              className = 'text-blue-600 font-medium';
            } else if (utilization >= 50) {
              className = 'text-amber-600 font-medium';
            } else {
              className = 'text-red-600 font-medium';
            }
            
            return <span className={className}>{utilization}%</span>;
          },
        },
        {
          accessorKey: 'joinDate',
          header: 'Ngày tham gia',
          cell: ({ row }: any) => {
            // Format ngày tháng từ ISO string sang định dạng dd/MM/yyyy
            const joinDate = row.original.joinDate;
            if (!joinDate) return '-';
            
            try {
              const date = new Date(joinDate);
              return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              });
            } catch (error) {
              return joinDate; // Trả về giá trị gốc nếu có lỗi
            }
          },
        },
        {
          accessorKey: 'totalExperience',
          header: 'Kinh nghiệm (năm)',
        },
        {
          accessorKey: 'currentProject.name',
          header: 'Dự án hiện tại',
          cell: ({ row }: any) => row.original.currentProject?.name || '-',
        }
      ] as ColumnDef<any, any>[];
    }
    
    // Các loại báo cáo khác hoặc mặc định
    console.log('Generating default columns from first item:', tableData[0]);
    
    // Tạo mảng các column definition theo @tanstack/react-table
    const columns = Object.keys(tableData[0]).map(key => ({
      accessorKey: key,
      header: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
    } as ColumnDef<any, any>));
    
    console.log('Generated columns:', columns);
    return columns;
  }, [tableData, type]);
  
  // Xác định xem báo cáo có biểu đồ không và loại biểu đồ
  const hasChart = useMemo(() => {
    return data?.data?.summaryMetrics && 
      (data.data.summaryMetrics.marginTrend || 
       data.data.summaryMetrics.marginDistribution || 
       data.data.summaryMetrics.topSkills);
  }, [data]);
  
  // Dữ liệu cho biểu đồ xu hướng
  const trendChartData = useMemo(() => {
    if (!data?.data?.summaryMetrics?.marginTrend) return null;
    
    const { marginTrend } = data.data.summaryMetrics;
    
    return {
      labels: marginTrend.map((item: TrendItem) => item.period),
      datasets: [
        {
          label: 'Margin (%)',
          data: marginTrend.map((item: TrendItem) => item.value),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
        }
      ]
    };
  }, [data]);
  
  // Dữ liệu cho biểu đồ phân bố
  const distributionChartData = useMemo(() => {
    if (!data?.data?.summaryMetrics?.marginDistribution) return null;
    
    const { marginDistribution } = data.data.summaryMetrics;
    
    return {
      labels: marginDistribution.labels,
      datasets: [
        {
          data: marginDistribution.values,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
          ],
          borderWidth: 1,
        }
      ]
    };
  }, [data]);
  
  // Dữ liệu cho biểu đồ kỹ năng hàng đầu
  const topSkillsChartData = useMemo(() => {
    if (!data?.data?.summaryMetrics?.topSkills) return null;
    
    const { topSkills } = data.data.summaryMetrics;
    
    return {
      labels: topSkills.map((skill: SkillItem) => skill.name),
      datasets: [
        {
          label: 'Số lượng nhân viên',
          data: topSkills.map((skill: SkillItem) => skill.count),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        }
      ]
    };
  }, [data]);
  
  // Hiển thị khu vực tổng hợp (summary)
  const renderSummary = () => {
    if (!data?.data?.summaryMetrics) return null;
    
    const metrics = data.data.summaryMetrics;
    
    // Kiểm tra loại báo cáo để hiển thị metrics phù hợp
    if (type === 'employee-list') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-700">Tổng số nhân viên</h3>
            <p className="text-3xl font-bold text-blue-600">{metrics.totalEmployees}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-700">Đã phân bổ dự án</h3>
            <p className="text-3xl font-bold text-green-600">{metrics.allocatedCount}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-700">Nhân viên sẵn sàng</h3>
            <p className="text-3xl font-bold text-amber-600">{metrics.availableCount}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-700">Tỷ lệ sử dụng</h3>
            <p className="text-3xl font-bold text-purple-600">{metrics.utilizationRate}%</p>
          </div>
        </div>
      );
    }
    
    if (type === 'margin-detail') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-700">Margin trung bình</h3>
            <p className="text-3xl font-bold text-blue-600">{metrics.averageMargin}%</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-700">Margin thấp</h3>
            <p className="text-3xl font-bold text-red-600">{metrics.redCount}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-700">Margin trung bình</h3>
            <p className="text-3xl font-bold text-amber-600">{metrics.yellowCount}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-700">Margin cao</h3>
            <p className="text-3xl font-bold text-green-600">{metrics.greenCount}</p>
          </div>
        </div>
      );
    }
    
    // Mặc định cho các loại báo cáo khác
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Tổng hợp</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(metrics).map(([key, value]) => {
            if (typeof value === 'object') return null;
            return (
              <div key={key} className="text-center">
                <p className="text-sm text-gray-500">{key}</p>
                <p className="text-xl font-semibold">{String(value)}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Hiển thị biểu đồ
  const renderCharts = () => {
    if (!hasChart) return null;
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Biểu đồ</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trendChartData && (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h4 className="text-base font-medium text-gray-600 mb-2">Xu hướng Margin</h4>
              <div className="h-64">
                <LineChart data={trendChartData} />
              </div>
            </div>
          )}
          
          {distributionChartData && (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h4 className="text-base font-medium text-gray-600 mb-2">Phân bố Margin</h4>
              <div className="h-64">
                <PieChart data={distributionChartData} />
              </div>
            </div>
          )}
          
          {topSkillsChartData && (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h4 className="text-base font-medium text-gray-600 mb-2">Top Kỹ năng</h4>
              <div className="h-64">
                <BarChart data={topSkillsChartData} />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Hiển thị bảng dữ liệu
  const renderTable = () => {
    if (!tableData || tableData.length === 0 || !tableColumns || tableColumns.length === 0) {
      console.warn('Cannot render table: missing data or columns');
      return (
        <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
          <p className="text-gray-500">Không có dữ liệu báo cáo</p>
        </div>
      );
    }
    
    console.log('Rendering table with data:', tableData.length, 'rows');
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <Table
          data={tableData}
          columns={tableColumns}
          isLoading={isLoading}
          enablePagination={true}
        />
      </div>
    );
  };
  
  // Hiển thị khi không có dữ liệu
  if (!data) {
    console.warn('No report data provided');
    return (
      <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
        <p className="text-gray-500">Không có dữ liệu báo cáo</p>
      </div>
    );
  }
  
  return (
    <div>
      {renderSummary()}
      {renderCharts()}
      {renderTable()}
    </div>
  );
};

export default ReportViewer; 
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table } from '../../../components/table/Table';
import { ColumnDef } from '@tanstack/react-table';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/modals/Modal';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Progress } from '../../../components/ui/Progress';
import { Heading, Text } from '../../../components/ui/Typography';
import { getSalesKpis, saveSalesKpi, deleteSalesKpi } from '../service';
import { SalesKpi, KpiFormData, KpiListParams } from '../types';

// Temporary formatter until utils are properly set up
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Trang quản lý KPI doanh thu cho nhân viên Sales
 * @returns JSX.Element
 */
const KpiManagement = () => {
  const navigate = useNavigate();
  
  // State cho dữ liệu và loading
  const [kpis, setKpis] = useState<SalesKpi[]>([]);
  const [summary, setSummary] = useState({
    totalKPIs: 0,
    totalTargetRevenue: 0,
    totalActualRevenue: 0,
    overallAchievement: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  
  // State cho bộ lọc
  const [filters, setFilters] = useState<KpiListParams>({
    year: new Date().getFullYear(),
    page: 1,
    size: 10
  });
  
  // State cho form modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentKpi, setCurrentKpi] = useState<KpiFormData | null>(null);
  const [modalTitle, setModalTitle] = useState('Thêm mới KPI');
  
  // Tải dữ liệu KPI
  const fetchKpis = async () => {
    setIsLoading(true);
    try {
      const response = await getSalesKpis(filters);
      if (response.status === 'success') {
        setKpis(response.data.kpis);
        setSummary(response.data.summary);
      }
    } catch (error) {
      console.error('Error fetching KPIs:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Gọi khi component mount hoặc filters thay đổi
  useEffect(() => {
    fetchKpis();
  }, [filters]);
  
  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };
  
  // Mở modal để thêm mới KPI
  const handleAddKpi = () => {
    setCurrentKpi({
      salesId: 0,
      year: filters.year || new Date().getFullYear(),
      targetRevenue: 0
    });
    setModalTitle('Thêm mới KPI');
    setIsModalOpen(true);
  };
  
  // Mở modal để chỉnh sửa KPI
  const handleEditKpi = (kpi: SalesKpi) => {
    setCurrentKpi({
      id: kpi.id,
      salesId: kpi.salesId,
      year: kpi.year,
      quarter: kpi.quarter,
      month: kpi.month,
      targetRevenue: kpi.targetRevenue,
      note: kpi.note
    });
    setModalTitle('Chỉnh sửa KPI');
    setIsModalOpen(true);
  };
  
  // Xử lý xóa KPI
  const handleDeleteKpi = async (kpiId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa KPI này?')) return;
    
    setIsLoading(true);
    try {
      const response = await deleteSalesKpi(kpiId);
      if (response.status === 'success') {
        fetchKpis();
      }
    } catch (error) {
      console.error('Error deleting KPI:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Xử lý lưu KPI (thêm mới hoặc cập nhật)
  const handleSaveKpi = async (formData: KpiFormData) => {
    setIsLoading(true);
    try {
      const response = await saveSalesKpi(formData);
      if (response.status === 'success') {
        setIsModalOpen(false);
        fetchKpis();
      }
    } catch (error) {
      console.error('Error saving KPI:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Định nghĩa cột cho bảng
  const columns = useMemo<ColumnDef<SalesKpi>[]>(() => [
    {
      accessorKey: 'salesName',
      header: 'Nhân viên Sales',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.salesName}</div>
          <div className="text-sm text-gray-500">{row.original.salesCode}</div>
        </div>
      )
    },
    {
      accessorKey: 'period',
      header: 'Kỳ',
      cell: ({ row }) => {
        const kpi = row.original;
        let period = `Năm ${kpi.year}`;
        if (kpi.quarter) period += ` - Quý ${kpi.quarter}`;
        if (kpi.month) period += ` - Tháng ${kpi.month}`;
        return <span>{period}</span>;
      }
    },
    {
      accessorKey: 'targetRevenue',
      header: 'KPI Doanh thu',
      cell: ({ row }) => formatCurrency(row.original.targetRevenue)
    },
    {
      accessorKey: 'actualRevenue',
      header: 'Doanh thu thực tế',
      cell: ({ row }) => formatCurrency(row.original.actualRevenue)
    },
    {
      accessorKey: 'achievement',
      header: 'Tiến độ',
      cell: ({ row }) => {
        const achievement = row.original.achievement;
        let badgeColor: 'success' | 'warning' | 'error' = 'error';
        
        if (achievement >= 100) badgeColor = 'success';
        else if (achievement >= 70) badgeColor = 'warning';
        
        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Badge variant={badgeColor}>{achievement}%</Badge>
            </div>
            <Progress value={achievement} />
          </div>
        );
      }
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const status = row.original.status;
        let badgeVariant: 'success' | 'warning' | 'error' | 'info' = 'info';
        let statusLabel = 'Chưa bắt đầu';
        
        switch (status) {
          case 'ACHIEVED':
            badgeVariant = 'success';
            statusLabel = 'Đạt';
            break;
          case 'IN_PROGRESS':
            badgeVariant = 'info';
            statusLabel = 'Đang thực hiện';
            break;
          case 'MISSED':
            badgeVariant = 'error';
            statusLabel = 'Không đạt';
            break;
          case 'NOT_STARTED':
            badgeVariant = 'warning';
            statusLabel = 'Chưa bắt đầu';
            break;
        }
        
        return <Badge variant={badgeVariant}>{statusLabel}</Badge>;
      }
    },
    {
      id: 'actions',
      header: 'Hành động',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleEditKpi(row.original)}
          >
            Sửa
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleDeleteKpi(row.original.id)}
          >
            Xóa
          </Button>
        </div>
      ),
    },
  ], []);
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <Heading level={4}>Quản lý KPI Doanh thu</Heading>
        <Button variant="default" onClick={handleAddKpi}>Thêm mới KPI</Button>
      </div>
      
      {/* Khu vực bộ lọc */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Năm</label>
            <Input
              type="number"
              value={filters.year || ''}
              onChange={(e) => handleFilterChange('year', parseInt(e.target.value))}
              min={2020}
              max={2030}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quý</label>
            <select
              className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2"
              value={filters.quarter || ''}
              onChange={(e) => handleFilterChange('quarter', e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">Tất cả</option>
              <option value="1">Quý 1</option>
              <option value="2">Quý 2</option>
              <option value="3">Quý 3</option>
              <option value="4">Quý 4</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tháng</label>
            <select
              className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2"
              value={filters.month || ''}
              onChange={(e) => handleFilterChange('month', e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">Tất cả</option>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>
      
      {/* Thông tin tổng hợp */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <Text variant="muted" size="sm" className="uppercase">Tổng KPI</Text>
          <Heading level={4}>{summary.totalKPIs}</Heading>
        </Card>
        <Card className="p-4">
          <Text variant="muted" size="sm" className="uppercase">Tổng mục tiêu</Text>
          <Heading level={4}>{formatCurrency(summary.totalTargetRevenue)}</Heading>
        </Card>
        <Card className="p-4">
          <Text variant="muted" size="sm" className="uppercase">Tổng doanh thu thực tế</Text>
          <Heading level={4}>{formatCurrency(summary.totalActualRevenue)}</Heading>
        </Card>
        <Card className="p-4">
          <Text variant="muted" size="sm" className="uppercase">Tỷ lệ đạt</Text>
          <Heading level={4}>{summary.overallAchievement}%</Heading>
        </Card>
      </div>
      
      {/* Bảng danh sách KPI */}
      <Card className="overflow-hidden">
        <Table
          data={kpis}
          columns={columns}
          isLoading={isLoading}
          enablePagination
        />
      </Card>
      
      {/* Modal form thêm/sửa KPI */}
      {isModalOpen && (
        <Modal isOpen={true} onClose={() => setIsModalOpen(false)}>
          <div className="p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">{modalTitle}</h3>
            <KpiForm
              initialData={currentKpi}
              onSubmit={handleSaveKpi}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

/**
 * Form thêm/sửa KPI doanh thu
 */
interface KpiFormProps {
  initialData: KpiFormData | null;
  onSubmit: (data: KpiFormData) => void;
  onCancel: () => void;
}

const KpiForm: React.FC<KpiFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<KpiFormData>({
    id: initialData?.id,
    salesId: initialData?.salesId || 0,
    year: initialData?.year || new Date().getFullYear(),
    quarter: initialData?.quarter,
    month: initialData?.month,
    targetRevenue: initialData?.targetRevenue || 0,
    note: initialData?.note
  });
  
  // Danh sách nhân viên Sales (Giả lập, thực tế sẽ lấy từ API)
  const salesList = [
    { id: 1, name: 'Nguyễn Văn A', code: 'SL001' },
    { id: 2, name: 'Trần Thị B', code: 'SL002' },
    { id: 3, name: 'Lê Văn C', code: 'SL003' },
  ];
  
  const handleInputChange = (field: keyof KpiFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nhân viên Sales</label>
        <select
          className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2"
          value={formData.salesId}
          onChange={(e) => handleInputChange('salesId', parseInt(e.target.value))}
          required
        >
          <option value="">-- Chọn nhân viên Sales --</option>
          {salesList.map(sales => (
            <option key={sales.id} value={sales.id}>
              {sales.name} ({sales.code})
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Năm</label>
        <Input
          type="number"
          value={formData.year}
          onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
          min={2020}
          max={2030}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quý (tùy chọn)</label>
          <select
            className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2"
            value={formData.quarter || ''}
            onChange={(e) => handleInputChange('quarter', e.target.value ? parseInt(e.target.value) : null)}
          >
            <option value="">Không chọn</option>
            <option value="1">Quý 1</option>
            <option value="2">Quý 2</option>
            <option value="3">Quý 3</option>
            <option value="4">Quý 4</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tháng (tùy chọn)</label>
          <select
            className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2"
            value={formData.month || ''}
            onChange={(e) => handleInputChange('month', e.target.value ? parseInt(e.target.value) : null)}
          >
            <option value="">Không chọn</option>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">KPI Doanh thu (VND)</label>
        <Input
          type="number"
          value={formData.targetRevenue}
          onChange={(e) => handleInputChange('targetRevenue', parseFloat(e.target.value))}
          min={0}
          step={1000000}
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
        <textarea
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2"
          value={formData.note || ''}
          onChange={(e) => handleInputChange('note', e.target.value)}
          rows={3}
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel} type="button">Hủy</Button>
        <Button type="submit">Lưu</Button>
      </div>
    </form>
  );
};

export default KpiManagement; 
/**
 * Payment Status Update Page - MH-CTR-04
 * 
 * Trang cập nhật trạng thái thanh toán cho kế toán và admin
 * Cho phép cập nhật trạng thái theo 2 cách:
 * 1. Cập nhật thủ công từng đợt thanh toán
 * 2. Import hàng loạt từ file Excel/CSV
 * 
 * @returns {JSX.Element} Component render
 */

import React, { useState, useEffect, useCallback } from 'react';
import ContractService from '../service';
import { useToast } from '../../../hooks/useToast';
import { useParams, useNavigate } from 'react-router-dom';
import { usePermissions } from '../../../hooks/usePermissions';
import { PaymentTerm, PaymentStatusUpdateData, ImportPaymentStatusResponse } from '../types';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  PaginationState,
  createColumnHelper,
} from '@tanstack/react-table';

// UI components
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Alert } from '../../../components/ui/Alert';
import { Spinner } from '../../../components/ui/Spinner';
import { Table } from '../../../components/table/Table';
import { FileUploader } from '../../../components/files/FileUploader';

// Create service instance
const contractService = new ContractService();

// Extend PaymentTerm for UI needs
interface PaymentTermDisplay extends PaymentTerm {
  contractId: number;
  contractCode: string;
  contractName: string;
  customerName: string;
}

/**
 * Payment Status Update Page Component
 */
const PaymentStatusUpdate: React.FC = () => {
  // Permission checking
  const { can, isAny } = usePermissions();
  const hasAccessPermission = isAny(['Admin', 'Accountant']);
  const canUpdatePayment = can('payment-status:update:all');

  // Router hooks
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  // State for active tab
  const [activeTab, setActiveTab] = useState<'manual' | 'import'>('manual');
  
  // State for payment terms
  const [loading, setLoading] = useState<boolean>(true);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTermDisplay[]>([]);
  const [filteredTerms, setFilteredTerms] = useState<PaymentTermDisplay[]>([]);
  
  // State for filters
  const [filters, setFilters] = useState({
    search: '',
    contractId: '',
    customerId: '',
    status: 'all',
    dueDateRange: {
      start: '',
      end: ''
    }
  });
  
  // State for editing payment terms
  const [editingTerms, setEditingTerms] = useState<Record<number, PaymentStatusUpdateData>>({});
  
  // State for import file
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportPaymentStatusResponse | null>(null);
  const [importing, setImporting] = useState<boolean>(false);
  
  // Redirect if no permission
  useEffect(() => {
    if (!hasAccessPermission) {
      showToast({
        title: "Không có quyền",
        message: 'Bạn không có quyền truy cập chức năng này',
        type: 'error'
      });
      navigate('/contracts');
    }
  }, [hasAccessPermission, navigate, showToast]);
  
  // Fetch payment terms on mount
  useEffect(() => {
    const fetchPaymentTerms = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call to get all payment terms
        const response = await contractService.getPaymentSummary({
          year: new Date().getFullYear()
        });
        
        // Flatten payment terms from all contracts
        const allTerms: PaymentTerm[] = [];
        // This is just a placeholder, needs to be adjusted based on actual API response
        
        // Tạo dữ liệu mẫu cho việc phát triển UI
        const mockTerms: PaymentTermDisplay[] = [
          {
            id: 1,
            contractId: 101,
            contractCode: 'CTR-101',
            contractName: 'Dự án A',
            customerName: 'Công ty ABC',
            termNumber: 1,
            description: 'Đợt thanh toán 1',
            dueDate: '2023-05-15',
            amount: 10000000,
            status: 'unpaid',
            paidAmount: 0
          },
          {
            id: 2,
            contractId: 101,
            contractCode: 'CTR-101',
            contractName: 'Dự án A',
            customerName: 'Công ty ABC',
            termNumber: 2,
            description: 'Đợt thanh toán 2',
            dueDate: '2023-06-15',
            amount: 20000000,
            status: 'overdue',
            paidAmount: 0
          },
          {
            id: 3,
            contractId: 102,
            contractCode: 'CTR-102',
            contractName: 'Dự án B',
            customerName: 'Công ty XYZ',
            termNumber: 1,
            description: 'Đợt thanh toán đầu tiên',
            dueDate: '2023-04-20',
            amount: 15000000,
            status: 'paid',
            paidDate: '2023-04-18',
            paidAmount: 15000000
          }
        ];
        
        setPaymentTerms(mockTerms);
        setFilteredTerms(mockTerms);
      } catch (error) {
        console.error('Error fetching payment terms:', error);
        showToast({
          title: "Lỗi",
          message: 'Không thể tải dữ liệu thanh toán',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPaymentTerms();
  }, [showToast]);
  
  // Apply filters
  const applyFilters = useCallback(() => {
    let result = [...paymentTerms];
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(term => 
        term.description?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply status filter
    if (filters.status !== 'all') {
      result = result.filter(term => term.status === filters.status);
    }
    
    // Apply due date filter
    if (filters.dueDateRange.start) {
      result = result.filter(term => 
        new Date(term.dueDate) >= new Date(filters.dueDateRange.start)
      );
    }
    
    if (filters.dueDateRange.end) {
      result = result.filter(term => 
        new Date(term.dueDate) <= new Date(filters.dueDateRange.end)
      );
    }
    
    setFilteredTerms(result);
  }, [filters, paymentTerms]);
  
  // Apply filters when filters change
  useEffect(() => {
    applyFilters();
  }, [filters, applyFilters]);
  
  // Handle filter change
  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle date range change
  const handleDateRangeChange = (type: 'start' | 'end', value: string) => {
    setFilters(prev => ({
      ...prev,
      dueDateRange: {
        ...prev.dueDateRange,
        [type]: value
      }
    }));
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      contractId: '',
      customerId: '',
      status: 'all',
      dueDateRange: {
        start: '',
        end: ''
      }
    });
  };
  
  // Handle payment term edit
  const handleTermEdit = (termId: number, field: keyof PaymentStatusUpdateData, value: any) => {
    setEditingTerms(prev => ({
      ...prev,
      [termId]: {
        ...prev[termId],
        [field]: value
      }
    }));
  };
  
  // Save changes for manual update
  const saveChanges = async () => {
    if (!canUpdatePayment) {
      showToast({
        title: "Không có quyền",
        message: 'Bạn không có quyền cập nhật trạng thái thanh toán',
        type: 'error'
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Make API calls for each edited term
      const termIds = Object.keys(editingTerms).map(Number);
      const updatePromises = termIds.map(async (termId) => {
        const term = paymentTerms.find(t => t.id === termId);
        if (!term) return null;
        
        // Giả định rằng mỗi term có contractId (cần điều chỉnh theo API thực tế)
        const contractId = String(term.id).split('-')[0]; // Placeholder logic
        
        return contractService.updateTermPaymentStatus(
          contractId,
          String(termId),
          editingTerms[termId]
        );
      });
      
      await Promise.all(updatePromises);
      
      // Reset editing state
      setEditingTerms({});
      
      // Refresh payment terms
      // TODO: Replace with actual API call
      
      showToast({
        title: "Thành công",
        message: 'Cập nhật trạng thái thanh toán thành công',
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      showToast({
        title: "Lỗi",
        message: 'Không thể cập nhật trạng thái thanh toán',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle file change for import
  const handleFileChange = (files: File[]) => {
    if (files.length > 0) {
      setImportFile(files[0]);
      setImportResult(null);
    }
  };
  
  // Download template file
  const downloadTemplate = async () => {
    try {
      const templateBlob = await contractService.getPaymentStatusTemplate();
      const url = URL.createObjectURL(templateBlob);
      
      // Create temporary link to download file
      const link = document.createElement('a');
      link.href = url;
      link.download = 'payment_status_template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Release the object URL
      URL.revokeObjectURL(url);
      
      showToast({
        title: "Tải xuống",
        message: 'Tải xuống file mẫu thành công',
        type: 'success'
      });
    } catch (error) {
      console.error('Error downloading template:', error);
      showToast({
        title: "Lỗi",
        message: 'Không thể tải file mẫu',
        type: 'error'
      });
    }
  };
  
  // Import payment statuses from file
  const importPaymentStatuses = async () => {
    if (!importFile) {
      showToast({
        title: "Thiếu thông tin",
        message: 'Vui lòng chọn file để import',
        type: 'error'
      });
      return;
    }
    
    if (!canUpdatePayment) {
      showToast({
        title: "Không có quyền",
        message: 'Bạn không có quyền cập nhật trạng thái thanh toán',
        type: 'error'
      });
      return;
    }
    
    try {
      setImporting(true);
      const result = await contractService.importPaymentStatus(importFile);
      setImportResult(result);
      
      const message = result.success 
        ? `Import thành công ${result.successCount}/${result.totalRecords} bản ghi`
        : `Import thất bại với ${result.errorCount} lỗi`;
      
      showToast({
        title: result.success ? "Import thành công" : "Import thất bại",
        message,
        type: result.success ? 'success' : 'error'
      });
      
      // Refresh payment terms if successful
      if (result.success && result.successCount > 0) {
        // TODO: Fetch updated payment terms
      }
    } catch (error) {
      console.error('Error importing payment statuses:', error);
      showToast({
        title: "Lỗi",
        message: 'Không thể import trạng thái thanh toán',
        type: 'error'
      });
    } finally {
      setImporting(false);
    }
  };
  
  // Table columns for manual update
  const columnHelper = createColumnHelper<PaymentTermDisplay>();
  
  const columns = [
    columnHelper.accessor('contractCode', {
      header: 'Mã HĐ',
      cell: info => (
        <a 
          href={`/contracts/${info.row.original.contractId}`}
          className="text-blue-600 hover:underline"
        >
          {info.getValue()}
        </a>
      )
    }),
    columnHelper.accessor('contractName', {
      header: 'Tên HĐ',
      cell: info => info.getValue()
    }),
    columnHelper.accessor('customerName', {
      header: 'Khách hàng',
      cell: info => info.getValue()
    }),
    columnHelper.accessor('termNumber', {
      header: 'Đợt TT',
      cell: info => info.getValue()
    }),
    columnHelper.accessor('description', {
      header: 'Mô tả',
      cell: info => info.getValue()
    }),
    columnHelper.accessor('dueDate', {
      header: 'Ngày dự kiến Thu',
      cell: info => new Date(info.getValue()).toLocaleDateString('vi-VN')
    }),
    columnHelper.accessor('amount', {
      header: 'Số tiền dự kiến',
      cell: info => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(info.getValue())
    }),
    columnHelper.accessor('status', {
      header: 'Trạng thái',
      cell: info => {
        const termId = info.row.original.id;
        const currentValue = editingTerms[termId]?.status || info.getValue();
        
        return (
          <select
            className="w-full border border-gray-300 rounded px-2 py-1"
            value={currentValue}
            onChange={e => handleTermEdit(termId, 'status', e.target.value)}
            disabled={!canUpdatePayment}
          >
            <option value="unpaid">Chưa thu</option>
            <option value="paid">Đã thu</option>
            <option value="invoiced">Đã xuất hóa đơn</option>
            <option value="overdue">Quá hạn</option>
          </select>
        );
      }
    }),
    columnHelper.accessor('paidDate', {
      header: 'Ngày Thu thực tế',
      cell: info => {
        const termId = info.row.original.id;
        const currentValue = editingTerms[termId]?.paidDate || info.getValue() || '';
        
        return (
          <input
            type="date"
            className="w-full border border-gray-300 rounded px-2 py-1"
            value={currentValue}
            onChange={e => handleTermEdit(termId, 'paidDate', e.target.value)}
            disabled={!canUpdatePayment || (editingTerms[termId]?.status || info.row.original.status) !== 'paid'}
          />
        );
      }
    }),
    columnHelper.accessor('paidAmount', {
      header: 'Số tiền Thực thu',
      cell: info => {
        const termId = info.row.original.id;
        const currentValue = editingTerms[termId]?.paidAmount !== undefined 
          ? editingTerms[termId].paidAmount 
          : info.getValue() || 0;
        
        return (
          <input
            type="number"
            className="w-full border border-gray-300 rounded px-2 py-1"
            value={currentValue}
            onChange={e => handleTermEdit(termId, 'paidAmount', Number(e.target.value))}
            disabled={!canUpdatePayment || (editingTerms[termId]?.status || info.row.original.status) !== 'paid'}
          />
        );
      }
    }),
    columnHelper.display({
      id: 'notes',
      header: 'Ghi chú',
      cell: info => {
        const termId = info.row.original.id;
        const currentValue = editingTerms[termId]?.notes || '';
        
        return (
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-2 py-1"
            value={currentValue}
            onChange={e => handleTermEdit(termId, 'notes', e.target.value)}
            disabled={!canUpdatePayment}
            placeholder="Nhập ghi chú"
          />
        );
      }
    })
  ];
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Cập nhật Trạng thái Thanh toán</h1>
      
      {!hasAccessPermission ? (
        <Alert 
          variant="error" 
          title="Không có quyền truy cập" 
        >
          Bạn không có quyền truy cập chức năng này
        </Alert>
      ) : (
        <>
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`py-2 px-4 ${activeTab === 'manual' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
              onClick={() => setActiveTab('manual')}
            >
              Cập nhật Thủ công
            </button>
            <button
              className={`py-2 px-4 ${activeTab === 'import' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
              onClick={() => setActiveTab('import')}
            >
              Import từ File
            </button>
          </div>
          
          {/* Filter Section - for both tabs */}
          <Card className="mb-6">
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4">Bộ lọc</h2>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
                  <Input
                    type="text"
                    placeholder="Mã HĐ, Tên HĐ, Khách hàng"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="all">Tất cả</option>
                    <option value="unpaid">Chưa thu</option>
                    <option value="overdue">Quá hạn</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                  <Input
                    type="date"
                    value={filters.dueDateRange.start}
                    onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                  <Input
                    type="date"
                    value={filters.dueDateRange.end}
                    onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex mt-4 justify-end">
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="mr-2"
                >
                  Xóa bộ lọc
                </Button>
                <Button 
                  variant="default"
                  onClick={applyFilters}
                >
                  Tìm kiếm
                </Button>       
              </div>
            </div>
          </Card>
          
          {/* Manual Update Tab */}
          {activeTab === 'manual' && (
            <Card>
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Danh sách Đợt thanh toán</h2>
                  
                  <div>
                    {Object.keys(editingTerms).length > 0 && (
                      <Button
                        variant="default"
                        onClick={saveChanges}
                        disabled={loading || !canUpdatePayment}
                      >
                        {loading ? <Spinner size="sm" /> : null}
                        Lưu thay đổi
                      </Button>
                    )}
                  </div>
                </div>
                
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Spinner size="lg" />
                  </div>
                ) : filteredTerms.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Không có đợt thanh toán nào phù hợp với bộ lọc
                  </div>
                ) : (
                  <Table
                    columns={columns}
                    data={filteredTerms}
                    enablePagination={false}
                    isLoading={loading}
                  />
                )}
              </div>
            </Card>
          )}
          
          {/* Import Tab */}
          {activeTab === 'import' && (
            <Card>
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-4">Import Trạng thái Thanh toán từ File</h2>
                
                <div className="bg-gray-50 p-4 mb-6 rounded border border-gray-200">
                  <h3 className="font-medium mb-2">Hướng dẫn:</h3>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Tải file mẫu (template) để đảm bảo dữ liệu được định dạng đúng</li>
                    <li>Điền thông tin cập nhật vào file mẫu (không thay đổi cấu trúc)</li>
                    <li>Tải lên file đã điền và tiến hành import</li>
                  </ol>
                  
                  <Button
                    variant="outline"
                    onClick={downloadTemplate}
                    className="mt-4"
                  >
                    Tải file mẫu (Template)
                  </Button>
                </div>
                
                <div className="mb-6">
                  <FileUploader
                    onFilesChange={handleFileChange}
                    accept={".xlsx,.xls,.csv"}
                    multiple={false}
                    maxSize={5 * 1024 * 1024}
                    label="Kéo thả file ở đây hoặc nhấn để chọn"
                  />
                  
                  {importFile && (
                    <div className="mt-2 text-sm">
                      File đã chọn: <span className="font-medium">{importFile.name}</span> ({Math.round(importFile.size / 1024)} KB)
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end">
                  <Button
                    variant="default"
                    onClick={importPaymentStatuses}
                    disabled={!importFile || importing || !canUpdatePayment}
                  >
                    {importing ? <Spinner size="sm" className="mr-2" /> : null}
                    Import Dữ liệu
                  </Button>
                </div>
                
                {/* Import Results */}
                {importResult && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2">Kết quả Import:</h3>
                    
                    <div className="bg-gray-50 p-4 rounded border">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <span className="text-gray-600">Tổng số bản ghi:</span>
                          <span className="ml-2 font-medium">{importResult.totalRecords}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Thành công:</span>
                          <span className="ml-2 font-medium text-green-600">{importResult.successCount}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Thất bại:</span>
                          <span className="ml-2 font-medium text-red-600">{importResult.errorCount}</span>
                        </div>
                      </div>
                      
                      {importResult.errorCount > 0 && (
                        <div>
                          <h4 className="font-medium mb-2 text-red-600">Các lỗi:</h4>
                          <table className="min-w-full border border-gray-200">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="py-2 px-3 border-b text-left">Dòng</th>
                                <th className="py-2 px-3 border-b text-left">Mã HĐ</th>
                                <th className="py-2 px-3 border-b text-left">Đợt TT</th>
                                <th className="py-2 px-3 border-b text-left">Lỗi</th>
                              </tr>
                            </thead>
                            <tbody>
                              {importResult.errors.map((error, index) => (
                                <tr key={index} className="border-b">
                                  <td className="py-2 px-3">{error.row}</td>
                                  <td className="py-2 px-3">{error.contractCode}</td>
                                  <td className="py-2 px-3">{error.termNumber}</td>
                                  <td className="py-2 px-3 text-red-600">{error.errorMessage}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      
                      {importResult.successCount > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-2 text-green-600">Các bản ghi đã cập nhật:</h4>
                          <table className="min-w-full border border-gray-200">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="py-2 px-3 border-b text-left">Mã HĐ</th>
                                <th className="py-2 px-3 border-b text-left">Đợt TT</th>
                                <th className="py-2 px-3 border-b text-left">Trạng thái mới</th>
                                <th className="py-2 px-3 border-b text-left">Trạng thái cũ</th>
                              </tr>
                            </thead>
                            <tbody>
                              {importResult.updatedPayments.map((payment, index) => (
                                <tr key={index} className="border-b">
                                  <td className="py-2 px-3">{payment.contractCode}</td>
                                  <td className="py-2 px-3">{payment.termNumber}</td>
                                  <td className="py-2 px-3 font-medium">{payment.status}</td>
                                  <td className="py-2 px-3 text-gray-500">{payment.previousStatus}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default PaymentStatusUpdate; 
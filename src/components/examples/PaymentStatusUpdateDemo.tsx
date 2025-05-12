import React, { useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Table } from '../table/Table';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import { Spinner } from '../ui/Spinner';
import { FileUploader } from '../files/FileUploader';
import { useToast } from '../../hooks/useToast';

// Định nghĩa kiểu dữ liệu
interface PaymentTerm {
  id: number;
  termNumber: number;
  dueDate: string;
  amount: number;
  description?: string;
  status: 'paid' | 'unpaid' | 'invoiced' | 'overdue';
  paidDate?: string | null;
  paidAmount: number;
}

interface PaymentTermDisplay extends PaymentTerm {
  contractId: number;
  contractCode: string;
  contractName: string;
  customerName: string;
}

interface PaymentStatusUpdateData {
  status: 'paid' | 'unpaid' | 'invoiced' | 'overdue';
  paidAmount?: number;
  paidDate?: string;
  notes?: string;
}

interface ImportPaymentStatusResponse {
  success: boolean;
  totalRecords: number;
  successCount: number;
  errorCount: number;
  errors: Array<{
    row: number;
    contractCode: string;
    termNumber: number;
    errorMessage: string;
  }>;
  updatedPayments: Array<{
    contractId: number;
    contractCode: string;
    termId: number;
    termNumber: number;
    status: string;
    previousStatus: string;
  }>;
}

// Mock data
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
  },
  {
    id: 4,
    contractId: 103,
    contractCode: 'CTR-103',
    contractName: 'Dự án C',
    customerName: 'Công ty DEF',
    termNumber: 1,
    description: 'Đợt thanh toán 1',
    dueDate: '2023-07-10',
    amount: 25000000,
    status: 'invoiced',
    paidAmount: 0
  },
  {
    id: 5,
    contractId: 103,
    contractCode: 'CTR-103',
    contractName: 'Dự án C',
    customerName: 'Công ty DEF',
    termNumber: 2,
    description: 'Đợt thanh toán 2',
    dueDate: '2023-08-20',
    amount: 15000000,
    status: 'unpaid',
    paidAmount: 0
  }
];

/**
 * Demo Component cho Payment Status Update
 */
const PaymentStatusUpdateDemo: React.FC = () => {
  // Toast hook
  const { showToast } = useToast();
  
  // State for active tab
  const [activeTab, setActiveTab] = useState<'manual' | 'import'>('manual');
  
  // State for payment terms
  const [loading, setLoading] = useState<boolean>(false);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTermDisplay[]>(mockTerms);
  const [filteredTerms, setFilteredTerms] = useState<PaymentTermDisplay[]>(mockTerms);
  
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
  
  // Apply filters
  const applyFilters = () => {
    let result = [...paymentTerms];
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(term => 
        term.contractCode.toLowerCase().includes(searchLower) ||
        term.contractName.toLowerCase().includes(searchLower) ||
        term.customerName.toLowerCase().includes(searchLower) ||
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
    setFilteredTerms(paymentTerms);
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
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Update local data
      const updatedTerms = paymentTerms.map(term => {
        if (editingTerms[term.id]) {
          return {
            ...term,
            ...editingTerms[term.id]
          };
        }
        return term;
      });
      
      setPaymentTerms(updatedTerms);
      setFilteredTerms(updatedTerms);
      setEditingTerms({});
      setLoading(false);
      
      // Show toast
      showToast({
        title: 'Thành công',
        message: 'Cập nhật trạng thái thanh toán thành công',
        type: 'success'
      });
    }, 1000);
  };
  
  // Handle file change for import
  const handleFileChange = (files: File[]) => {
    if (files.length > 0) {
      setImportFile(files[0]);
      setImportResult(null);
    }
  };
  
  // Download template file
  const downloadTemplate = () => {
    showToast({
      title: 'Tải file mẫu',
      message: 'Đang tải xuống file mẫu (tính năng demo)',
      type: 'info'
    });
  };
  
  // Import payment statuses from file
  const importPaymentStatuses = async () => {
    if (!importFile) {
      showToast({
        title: 'Lỗi',
        message: 'Vui lòng chọn file để import',
        type: 'error'
      });
      return;
    }
    
    setImporting(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockResult: ImportPaymentStatusResponse = {
        success: true,
        totalRecords: 3,
        successCount: 2,
        errorCount: 1,
        errors: [
          {
            row: 3,
            contractCode: 'CTR-105',
            termNumber: 2,
            errorMessage: 'Không tìm thấy hợp đồng với mã CTR-105'
          }
        ],
        updatedPayments: [
          {
            contractId: 101,
            contractCode: 'CTR-101',
            termId: 1,
            termNumber: 1,
            status: 'paid',
            previousStatus: 'unpaid'
          },
          {
            contractId: 102,
            contractCode: 'CTR-102',
            termId: 3,
            termNumber: 1,
            status: 'paid',
            previousStatus: 'paid'
          }
        ]
      };
      
      setImportResult(mockResult);
      setImporting(false);
      
      // Update local data to simulate actual changes
      const updatedTerms = paymentTerms.map(term => {
        const updated = mockResult.updatedPayments.find(
          update => update.termId === term.id
        );
        
        if (updated) {
          return {
            ...term,
            status: updated.status as any,
            paidDate: term.status !== 'paid' && updated.status === 'paid' 
              ? new Date().toISOString().split('T')[0] 
              : term.paidDate,
            paidAmount: term.status !== 'paid' && updated.status === 'paid'
              ? term.amount
              : term.paidAmount
          };
        }
        
        return term;
      });
      
      setPaymentTerms(updatedTerms);
      
      // Show toast
      showToast({
        title: mockResult.success ? 'Import thành công' : 'Import thất bại',
        message: `Đã import ${mockResult.successCount}/${mockResult.totalRecords} bản ghi`,
        type: mockResult.success ? 'success' : 'error'
      });
    }, 1500);
  };
  
  // Table columns for manual update
  const columnHelper = createColumnHelper<PaymentTermDisplay>();
  
  const columns = [
    columnHelper.accessor('contractCode', {
      header: 'Mã HĐ',
      cell: info => (
        <a 
          href="#"
          className="text-blue-600 hover:underline"
          onClick={(e) => {
            e.preventDefault();
            showToast({
              title: 'Chuyển trang',
              message: `Đang chuyển đến chi tiết hợp đồng ${info.row.original.contractCode}`,
              type: 'info'
            });
          }}
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
            disabled={(editingTerms[termId]?.status || info.row.original.status) !== 'paid'}
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
            disabled={(editingTerms[termId]?.status || info.row.original.status) !== 'paid'}
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
            placeholder="Nhập ghi chú"
          />
        );
      }
    })
  ];
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Cập nhật Trạng thái Thanh toán (Demo)</h1>
      
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
                <option value="paid">Đã thu</option>
                <option value="invoiced">Đã xuất hóa đơn</option>
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
                    disabled={loading}
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
                disabled={!importFile || importing}
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
    </div>
  );
};

export default PaymentStatusUpdateDemo; 
import React, { useState } from 'react';
import { ContractListParams, ContractStatus, ContractType, PaymentStatusType } from '../types';

interface ContractFilterProps {
  initialValues?: Partial<ContractListParams>;
  onFilterChange: (params: Partial<ContractListParams>) => void;
}

/**
 * Component filter cho danh sách hợp đồng
 * Hỗ trợ tìm kiếm nhanh và filter nâng cao
 */
const ContractFilter: React.FC<ContractFilterProps> = ({
  initialValues = {},
  onFilterChange
}) => {
  // State cho hiển thị/ẩn filter nâng cao
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // State cho các giá trị filter
  const [search, setSearch] = useState(initialValues.search || '');
  const [status, setStatus] = useState<ContractStatus | ''>((initialValues.status as ContractStatus) || '');
  const [contractType, setContractType] = useState<ContractType | ''>((initialValues.contractType as ContractType) || '');
  const [customerName, setCustomerName] = useState(initialValues.customerName || '');
  const [salesId, setSalesId] = useState(initialValues.salesId || '');
  const [fromDate, setFromDate] = useState(initialValues.fromDate || '');
  const [toDate, setToDate] = useState(initialValues.toDate || '');
  
  // State cho quick filters trạng thái thanh toán
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusType | 'all'>('all');
  
  // Các trạng thái thanh toán
  const paymentStatusOptions = [
    { value: 'all', label: 'Tất cả', color: 'bg-gray-100' },
    { value: 'paid', label: 'Đã thanh toán đủ', color: 'bg-green-100 text-green-800' },
    { value: 'partial', label: 'Còn công nợ', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'overdue', label: 'Có thanh toán quá hạn', color: 'bg-red-100 text-red-800' }
  ];
  
  // Xử lý submit form tìm kiếm nhanh
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ search });
  };
  
  // Xử lý thay đổi trạng thái thanh toán
  const handlePaymentStatusChange = (status: string) => {
    const statusValue = status as PaymentStatusType | 'all';
    setPaymentStatus(statusValue);
    
    // Map payment status sang các filter tương ứng
    let params: Partial<ContractListParams> = {};
    
    if (status !== 'all') {
      params.paymentStatus = status as PaymentStatusType;
    }
    
    onFilterChange(params);
  };
  
  // Xử lý áp dụng filter nâng cao
  const handleApplyAdvancedFilter = () => {
    onFilterChange({
      status: status || undefined,
      contractType: contractType || undefined,
      customerName: customerName || undefined,
      salesId: salesId || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined
    });
  };
  
  // Xử lý xóa tất cả filter
  const handleClearFilter = () => {
    setSearch('');
    setStatus('');
    setContractType('');
    setCustomerName('');
    setSalesId('');
    setFromDate('');
    setToDate('');
    setPaymentStatus('all');
    
    onFilterChange({
      search: '',
      status: undefined,
      contractType: undefined,
      customerName: undefined,
      salesId: undefined,
      fromDate: undefined,
      toDate: undefined,
      paymentStatus: undefined
    });
  };
  
  return (
    <div className={`space-y-4 p-1`}>
      {/* Quick search bar và button mở rộng */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <input
              type="search"
              className="block w-full p-2 pl-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-primary-500 focus:border-primary-500"
              placeholder="Tìm theo tên, mã hợp đồng, khách hàng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-2 bottom-1.5 text-primary-700 font-medium rounded-lg text-sm px-3 py-1"
            >
              Tìm
            </button>
          </div>
        </form>
        
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:outline-none flex items-center whitespace-nowrap"
        >
          {showAdvanced ? "Thu gọn" : "Mở rộng"} 
          <span className="material-icons-outlined ml-1 text-sm">
            {showAdvanced}
          </span>
        </button>
      </div>
      
      {/* Payment status quick filter chips */}
      <div className="flex flex-wrap gap-2">
        {paymentStatusOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
              paymentStatus === option.value 
              ? `${option.color} border-2 border-primary-500` 
              : `${option.color} bg-opacity-50 hover:bg-opacity-70`
            }`}
            onClick={() => handlePaymentStatusChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      
      {/* Advanced filter section - collapsible */}
      {showAdvanced && (
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Filter row 1 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại hợp đồng
              </label>
              <select
                className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:ring-primary-500 focus:border-primary-500"
                value={contractType}
                onChange={(e) => setContractType(e.target.value as ContractType | '')}
              >
                <option value="">Tất cả</option>
                <option value="FixedPrice">Fixed Price</option>
                <option value="TimeAndMaterial">Time & Materials</option>
                <option value="Retainer">Retainer</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái hợp đồng
              </label>
              <select
                className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:ring-primary-500 focus:border-primary-500"
                value={status}
                onChange={(e) => setStatus(e.target.value as ContractStatus | '')}
              >
                <option value="">Tất cả</option>
                <option value="Draft">Nháp</option>
                <option value="InReview">Đang xét duyệt</option>
                <option value="Approved">Đã duyệt</option>
                <option value="Active">Đang hiệu lực</option>
                <option value="InProgress">Đang thực hiện</option>
                <option value="OnHold">Tạm dừng</option>
                <option value="Completed">Hoàn thành</option>
                <option value="Terminated">Đã hủy</option>
                <option value="Expired">Hết hạn</option>
                <option value="Cancelled">Đã hủy bỏ</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Người phụ trách
              </label>
              <select
                className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:ring-primary-500 focus:border-primary-500"
                value={salesId}
                onChange={(e) => setSalesId(e.target.value)}
              >
                <option value="">Tất cả</option>
                {/* Placeholder for salesperson options - would be fetched from API */}
                <option value="1">Nguyễn Văn A</option>
                <option value="2">Trần Thị B</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Filter row 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thời gian hiệu lực
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="date"
                    className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Từ ngày"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
                <div>
                  <input
                    type="date"
                    className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Đến ngày"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên khách hàng
              </label>
              <input
                type="text"
                className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:ring-primary-500 focus:border-primary-500"
                placeholder="Nhập tên khách hàng..."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
          </div>
          
          {/* Filter action buttons */}
          <div className="flex justify-end space-x-2 border-t pt-4">
            <button
              type="button"
              onClick={handleClearFilter}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50"
            >
              Xóa bộ lọc
            </button>
            <button
              type="button"
              onClick={handleApplyAdvancedFilter}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractFilter; 
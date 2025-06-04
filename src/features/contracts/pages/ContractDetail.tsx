import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Button, 
  Card, 
  CardHeader,
  CardContent,
  CardTitle,
  Badge, 
  Spinner, 
  Alert, 
  Progress, 
  PermissionGuard
} from '../../../components/ui';
import { Table } from '../../../components/table';
import { FileList } from '../../../components/files';
import { FileInfo } from '../../../components/files/FilePreview';
import { ContractDetail as ContractDetailType, PaymentStatusType, ContractDetailResponse, ContractFile, EmployeeAssignment } from '../types';
import { getContractById, removeEmployeeFromContract, uploadContractFile, getContractEmployees } from '../api';
import { ContractPaymentTerms } from '../components/ContractPaymentTerms';
import apiClient from '../../../services/core/axios';

/**
 * Xóa file đính kèm của hợp đồng
 * @param contractId ID hợp đồng
 * @param fileId ID file cần xóa
 * @returns Promise với kết quả xóa file
 */
export const deleteContractFile = async (contractId: string, fileId: string) => {
  return apiClient.delete(`/api/v1/contracts/${contractId}/files/${fileId}`);
};

/**
 * Lấy danh sách tài liệu đính kèm của hợp đồng
 * @param contractId ID hợp đồng
 * @returns Promise với danh sách tài liệu
 */
export const getContractFiles = async (contractId: string) => {
  return apiClient.get(`/api/v1/contracts/${contractId}/files`);
};

/**
 * Chi tiết hợp đồng - Hiển thị thông tin đầy đủ của một hợp đồng
 * @returns JSX.Element
 */
const ContractDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [contract, setContract] = useState<ContractDetailType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [fileLoading, setFileLoading] = useState<boolean>(false);
  const [employeesLoading, setEmployeesLoading] = useState<boolean>(false);
  const [files, setFiles] = useState<ContractFile[]>([]);
  const [employees, setEmployees] = useState<EmployeeAssignment[]>([]);
  const [filesError, setFilesError] = useState<string | null>(null);
  const [employeesError, setEmployeesError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContractDetails = async () => {
      try {
        setLoading(true);
        if (!id) throw new Error('Contract ID is required');
        
        const response = await getContractById(id);
        if (!response.data || !response.data) {
          throw new Error('Dữ liệu hợp đồng không hợp lệ');
        }
        setContract(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching contract details:', err);
        // Xử lý lỗi với thông báo cụ thể hơn
        if (err.status === 404) {
          setError('Không tìm thấy hợp đồng với ID đã cung cấp');
        } else if (err.message) {
          setError(err.message);
        } else {
          setError('Không thể tải thông tin hợp đồng. Vui lòng thử lại sau.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchContractDetails();
  }, [id]);

  // Fetch contract files when tab is changed to files tab
  useEffect(() => {
    if (activeTab === 2 && id) {
      fetchContractFiles();
    }
  }, [activeTab, id]);

  // Fetch contract employees when tab is changed to employees tab
  useEffect(() => {
    if (activeTab === 3 && id) {
      fetchContractEmployees();
    }
  }, [activeTab, id]);

  // Thiết lập dữ liệu ban đầu khi contract được tải
  useEffect(() => {
    if (contract) {
      // Khởi tạo files từ contract nếu chưa có dữ liệu
      if (files.length === 0 && contract.files && contract.files.length > 0) {
        setFiles(contract.files);
      }
      
      // Khởi tạo employees từ contract nếu chưa có dữ liệu
      if (employees.length === 0 && contract.employeeAssignments && contract.employeeAssignments.length > 0) {
        setEmployees(contract.employeeAssignments);
      }
    }
  }, [contract, files, employees]);

  // Fetch contract files
  const fetchContractFiles = async () => {
    if (!id) return;
    
    try {
      setFileLoading(true);
      setFilesError(null);
      const response = await getContractFiles(id);
      if (response && response.data) {
        setFiles(response.data);
      }
    } catch (err: any) {
      console.error('Error fetching contract files:', err);
      setFilesError(err?.message || 'Không thể tải danh sách tài liệu');
      
      // Sử dụng dữ liệu từ contract nếu có lỗi và có dữ liệu sẵn
      if (contract?.files && contract.files.length > 0) {
        setFiles(contract.files);
      }
    } finally {
      setFileLoading(false);
    }
  };

  // Fetch contract employees
  const fetchContractEmployees = async () => {
    if (!id) return;
    
    try {
      setEmployeesLoading(true);
      setEmployeesError(null);
      const response = await getContractEmployees(id);
      if (response && response.data && Array.isArray(response.data)) {
        setEmployees(response.data);
      } else {
        console.error('Unexpected employee data structure:', response);
        setEmployeesError('Cấu trúc dữ liệu nhân viên không hợp lệ');
      }
    } catch (err: any) {
      console.error('Error fetching contract employees:', err);
      setEmployeesError(err?.message || 'Không thể tải danh sách nhân viên phân bổ');
      
      // Sử dụng dữ liệu từ contract nếu có lỗi và có dữ liệu sẵn
      if (contract?.employeeAssignments && contract.employeeAssignments.length > 0) {
        setEmployees(contract.employeeAssignments);
      }
    } finally {
      setEmployeesLoading(false);
    }
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-96">
          <Spinner size="lg" />
        </div>
    );
  }

  if (error || !contract) {
    return (
        <div className="p-4">
          <Alert 
            variant="error" 
            title="Lỗi"
          >
            {error || 'Không tìm thấy hợp đồng'}
          </Alert>
          <div className="mt-4">
            <Button onClick={() => navigate('/contracts/list')}>
              Quay lại danh sách
            </Button>
          </div>
        </div>
    );
  }

  // Định dạng tiền tệ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Định dạng ngày tháng
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Map trạng thái hợp đồng sang màu badge
  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'Draft': 'gray',
      'InReview': 'purple',
      'Approved': 'blue',
      'Active': 'green',
      'InProgress': 'green',
      'OnHold': 'yellow',
      'Completed': 'indigo',
      'Terminated': 'red',
      'Expired': 'orange',
      'Cancelled': 'red'
    };
    return statusMap[status] || 'gray';
  };

  // Map trạng thái thanh toán sang màu badge
  const getPaymentStatusColor = (status: PaymentStatusType) => {
    const statusMap: Record<string, string> = {
      'unpaid': 'gray',
      'partial': 'yellow',
      'paid': 'green',
      'overdue': 'red'
    };
    return statusMap[status] || 'gray';
  };

  // Map trạng thái đợt thanh toán sang màu badge
  const getPaymentTermStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'paid': 'green',
      'unpaid': 'gray',
      'invoiced': 'blue',
      'overdue': 'red'
    };
    return statusMap[status] || 'gray';
  };

  const getPaymentTermStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'paid': 'Đã thanh toán',
      'unpaid': 'Chưa thanh toán',
      'invoiced': 'Đã xuất hóa đơn',
      'overdue': 'Quá hạn'
    };
    return statusMap[status] || status;
  };

  // Định nghĩa các tabs
  const tabs = [
    { name: 'Thông tin chung', icon: 'document-text' },
    { name: 'Điều khoản thanh toán', icon: 'cash' },
    { name: 'Tài liệu đính kèm', icon: 'paper-clip' },
    { name: 'Nhân viên phân bổ', icon: 'users' }
  ];

  // Cột bảng điều khoản thanh toán
  const paymentTermsColumns = [
    { 
      header: 'Đợt', 
      accessor: 'termNumber',
      cell: (row: any) => <span className="font-medium">Đợt {row.termNumber}</span>
    },
    { 
      header: 'Ngày dự kiến', 
      accessor: 'dueDate',
      cell: (row: any) => formatDate(row.dueDate)
    },
    { 
      header: 'Số tiền', 
      accessor: 'amount',
      cell: (row: any) => formatCurrency(row.amount)
    },
    { 
      header: 'Mô tả', 
      accessor: 'description',
      cell: (row: any) => row.description || 'N/A'
    },
    { 
      header: 'Trạng thái', 
      accessor: 'status',
      cell: (row: any) => (
        <Badge color={getPaymentTermStatusColor(row.status)}>
          {getPaymentTermStatusText(row.status)}
        </Badge>
      )
    },
    { 
      header: 'Ngày thanh toán', 
      accessor: 'paidDate',
      cell: (row: any) => row.paidDate ? formatDate(row.paidDate) : 'N/A'
    },
    { 
      header: 'Số tiền đã thanh toán', 
      accessor: 'paidAmount',
      cell: (row: any) => formatCurrency(row.paidAmount)
    },
    {
      header: 'Thao tác',
      accessor: 'actions',
      cell: (row: any) => (
        <PermissionGuard requiredPermission="payment-status:update:all">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/contracts/${contract.id}/payment-terms/${row.id}/update`)}
          >
            Cập nhật
          </Button>
        </PermissionGuard>
      )
    }
  ];

  // Xử lý cập nhật trạng thái thanh toán
  const handleUpdatePaymentStatus = (termId: number) => {
    if (id) {
      navigate(`/contracts/${id}/payment-terms/${termId}/update`);
    }
  };

  // Cột bảng nhân viên phân bổ
  const employeesColumns = [
    { 
      header: 'Mã NV', 
      accessorFn: (row: any) => row.id,
      id: 'id',
      cell: (info: any) => <span className="font-medium">{info.getValue()}</span>
    },
    { 
      header: 'Họ và Tên', 
      accessorFn: (row: any) => row.employee?.name,
      id: 'employeeName',
      cell: (info: any) => (
        <div className="font-medium text-blue-600 hover:underline">
          <a href={`/employees/${info.row.original.employee?.id}`}>{info.getValue() || 'N/A'}</a>
        </div>
      )
    },
    { 
      header: 'Vị trí', 
      accessorFn: (row: any) => row.employee?.position,
      id: 'position',
      cell: (info: any) => info.getValue() || 'N/A'
    },
    { 
      header: 'Team', 
      accessorFn: (row: any) => row.employee?.team?.name,
      id: 'teamName',
      cell: (info: any) => info.getValue() || 'N/A'
    },
    { 
      header: 'Vai trò', 
      accessorFn: (row: any) => row.role,
      id: 'role',
      cell: (info: any) => info.getValue() || 'N/A'
    },
    { 
      header: 'Phân bổ (%)', 
      accessorFn: (row: any) => row.allocationPercentage,
      id: 'allocationPercentage',
      cell: (info: any) => info.getValue() ? `${info.getValue()}%` : 'N/A'
    },
    { 
      header: 'Bill Rate', 
      accessorFn: (row: any) => row.billRate,
      id: 'billRate',
      cell: (info: any) => info.getValue() ? formatCurrency(info.getValue()) : 'N/A'
    },
    { 
      header: 'Ngày bắt đầu', 
      accessorFn: (row: any) => row.startDate,
      id: 'startDate',
      cell: (info: any) => info.getValue() ? formatDate(info.getValue()) : 'N/A'
    },
    { 
      header: 'Ngày kết thúc', 
      accessorFn: (row: any) => row.endDate,
      id: 'endDate',
      cell: (info: any) => info.getValue() ? formatDate(info.getValue()) : 'N/A'
    },
    {
      header: 'Thao tác',
      id: 'actions',
      cell: (info: any) => (
        <PermissionGuard requiredPermission="contract-link:update:all">
          <Button 
            variant="outline" 
            color="red" 
            size="sm"
            onClick={() => handleRemoveEmployee(info.row.original.employee?.id)}
          >
            Gỡ bỏ
          </Button>
        </PermissionGuard>
      )
    }
  ];

  // Xử lý gỡ bỏ nhân viên
  const handleRemoveEmployee = async (employeeId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn gỡ bỏ nhân viên này khỏi hợp đồng?')) {
      return;
    }
    
    try {
      if (!id) return;
      
      setEmployeesLoading(true);
      await removeEmployeeFromContract(id, employeeId.toString());
      
      // Cập nhật danh sách nhân viên
      setEmployees(prevEmployees => prevEmployees.filter(
        emp => emp.employee?.id !== employeeId
      ));
      
      // Cập nhật contract object nếu có
      if (contract) {
        setContract({
          ...contract,
          employeeAssignments: contract.employeeAssignments.filter(
            assignment => assignment.employee.id !== employeeId
          )
        });
      }
      
      // Hiển thị thông báo thành công
      alert('Đã gỡ bỏ nhân viên khỏi hợp đồng thành công');
    } catch (err) {
      console.error('Error removing employee:', err);
      alert('Không thể gỡ bỏ nhân viên. Vui lòng thử lại sau.');
    } finally {
      setEmployeesLoading(false);
    }
  };

  // Xử lý xóa tài liệu
  const handleDeleteFile = async (fileId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) {
      return;
    }
    
    try {
      if (!id) return;
      
      setFileLoading(true);
      await deleteContractFile(id, fileId.toString());
      
      // Cập nhật danh sách tài liệu (xóa tại client)
      setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
      
      // Cập nhật contract object nếu có
      if (contract) {
        setContract({
          ...contract,
          files: contract.files.filter(file => file.id !== fileId)
        });
      }
      
      // Hiển thị thông báo thành công
      alert('Đã xóa tài liệu thành công');
    } catch (err: any) {
      console.error('Error deleting file:', err);
      alert(err?.message || 'Không thể xóa tài liệu. Vui lòng thử lại sau.');
    } finally {
      setFileLoading(false);
    }
  };

  // Xử lý tải tài liệu lên
  const handleFileUpload = () => {
    // Chuyển hướng đến trang tải lên tài liệu
    if (id) {
      navigate(`/contracts/${id}/files/upload`);
    }
  };

  // Kiểm tra dữ liệu trước khi hiển thị
  const hasPaymentTerms = contract?.paymentTerms && contract.paymentTerms.length > 0;
  const hasFiles = files && files.length > 0;
  const hasEmployees = employees && employees.length > 0;

  // Render active tab content
  const renderTabContent = () => {
    if (!contract) return null;
    
    switch (activeTab) {
      case 0: // Thông tin chung
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="divide-y divide-gray-200">
                  <div className="py-3 grid grid-cols-3">
                    <dt className="text-sm font-medium text-gray-500">Mã hợp đồng</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{contract.contractCode}</dd>
                  </div>
                  <div className="py-3 grid grid-cols-3">
                    <dt className="text-sm font-medium text-gray-500">Tên hợp đồng</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{contract.name}</dd>
                  </div>
                  <div className="py-3 grid grid-cols-3">
                    <dt className="text-sm font-medium text-gray-500">Khách hàng</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{contract.customerName}</dd>
                  </div>
                  <div className="py-3 grid grid-cols-3">
                    <dt className="text-sm font-medium text-gray-500">Loại hợp đồng</dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      {contract.contractType === 'FixedPrice' ? 'Trọn gói' : 
                       contract.contractType === 'TimeAndMaterial' ? 'Thời gian và vật liệu' : 
                       contract.contractType === 'Retainer' ? 'Thuê ngoài dài hạn' : 
                       contract.contractType === 'Maintenance' ? 'Bảo trì' : 
                       contract.contractType}
                    </dd>
                  </div>
                  <div className="py-3 grid grid-cols-3">
                    <dt className="text-sm font-medium text-gray-500">Giá trị hợp đồng</dt>
                    <dd className="text-sm text-gray-900 font-medium col-span-2">{formatCurrency(contract.amount)}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thời gian và trạng thái</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="divide-y divide-gray-200">
                  <div className="py-3 grid grid-cols-3">
                    <dt className="text-sm font-medium text-gray-500">Ngày ký</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{formatDate(contract.signDate)}</dd>
                  </div>
                  <div className="py-3 grid grid-cols-3">
                    <dt className="text-sm font-medium text-gray-500">Ngày hiệu lực</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{formatDate(contract.startDate)}</dd>
                  </div>
                  <div className="py-3 grid grid-cols-3">
                    <dt className="text-sm font-medium text-gray-500">Ngày kết thúc</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{formatDate(contract.endDate)}</dd>
                  </div>
                  <div className="py-3 grid grid-cols-3">
                    <dt className="text-sm font-medium text-gray-500">Trạng thái</dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      <Badge color={getStatusColor(contract.status)}>
                        {contract.status === 'Draft' ? 'Nháp' :
                         contract.status === 'InReview' ? 'Đang xem xét' :
                         contract.status === 'Approved' ? 'Đã phê duyệt' :
                         contract.status === 'Active' ? 'Đang hoạt động' :
                         contract.status === 'InProgress' ? 'Đang thực hiện' :
                         contract.status === 'OnHold' ? 'Tạm hoãn' :
                         contract.status === 'Completed' ? 'Hoàn thành' :
                         contract.status === 'Terminated' ? 'Đã chấm dứt' :
                         contract.status === 'Expired' ? 'Đã hết hạn' :
                         contract.status === 'Cancelled' ? 'Đã hủy' :
                         contract.status}
                      </Badge>
                    </dd>
                  </div>
                  <div className="py-3 grid grid-cols-3">
                    <dt className="text-sm font-medium text-gray-500">Người phụ trách (Sales)</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{contract.salesPerson.name}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Thông tin bổ sung</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="divide-y divide-gray-200">
                  {contract.relatedOpportunity && (
                    <div className="py-3 grid grid-cols-6">
                      <dt className="text-sm font-medium text-gray-500 col-span-1">Cơ hội liên quan</dt>
                      <dd className="text-sm text-gray-900 col-span-5">
                        <a href={`/opportunities/${contract.relatedOpportunity.id}`} className="text-blue-600 hover:underline">
                          {contract.relatedOpportunity.name} ({contract.relatedOpportunity.code})
                        </a>
                      </dd>
                    </div>
                  )}
                  <div className="py-3 grid grid-cols-6">
                    <dt className="text-sm font-medium text-gray-500 col-span-1">Mô tả</dt>
                    <dd className="text-sm text-gray-900 col-span-5">
                      {contract.description || 'Không có mô tả'}
                    </dd>
                  </div>
                  {contract.tags && contract.tags.length > 0 && (
                    <div className="py-3 grid grid-cols-6">
                      <dt className="text-sm font-medium text-gray-500 col-span-1">Tags</dt>
                      <dd className="text-sm col-span-5 flex flex-wrap gap-2">
                        {contract.tags.map((tag, index) => (
                          <Badge key={index} color="blue" className="text-xs">{tag}</Badge>
                        ))}
                      </dd>
                    </div>
                  )}
                  <div className="py-3 grid grid-cols-6">
                    <dt className="text-sm font-medium text-gray-500 col-span-1">Thông tin cập nhật</dt>
                    <dd className="text-sm text-gray-900 col-span-5">
                      Tạo bởi {contract.createdBy.name} lúc {new Date(contract.createdAt).toLocaleString('vi-VN')}
                      <br />
                      Cập nhật lần cuối bởi {contract.updatedBy.name} lúc {new Date(contract.updatedAt).toLocaleString('vi-VN')}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        );

      case 1: // Điều khoản thanh toán
        return (
          <div>
            <h3 className="text-lg font-medium mb-4">Điều khoản thanh toán</h3>
            <ContractPaymentTerms 
              contractId={id || ''} 
              contractAmount={contract.amount}
            />
          </div>
        );

      case 2: // Tài liệu đính kèm
        return (
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Tài liệu đính kèm</CardTitle>
              <PermissionGuard requiredPermission="contract-file:create:all">
                <Button 
                  size="sm"
                  onClick={handleFileUpload}
                >
                  Tải lên tài liệu
                </Button>
              </PermissionGuard>
            </CardHeader>
            <CardContent>
              {fileLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Spinner size="md" />
                </div>
              ) : filesError ? (
                <Alert variant="error">
                  {filesError}
                </Alert>
              ) : !hasFiles ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Chưa có tài liệu nào được đính kèm</p>
                  <PermissionGuard requiredPermission="contract-file:create:all">
                    <Button 
                      className="mt-4"
                      onClick={handleFileUpload}
                    >
                      Tải lên tài liệu đầu tiên
                    </Button>
                  </PermissionGuard>
                </div>
              ) : (
                <div className="space-y-3">
                  {files.map(file => (
                    <div 
                      key={file.id}
                      className="flex border rounded-lg overflow-hidden bg-white transition-shadow hover:shadow-md p-3"
                    >
                      <div className="w-10 h-10 shrink-0 bg-gray-100 flex items-center justify-center rounded-md mr-3">
                        <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className="text-sm font-medium text-gray-900 truncate">{file.name}</h3>
                          <p className="text-xs text-gray-500">
                            {new Date(file.uploadedAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'unit',
                            unit: 'byte',
                            unitDisplay: 'short',
                            maximumFractionDigits: 1
                          }).format(file.size)}
                        </p>
                        <div className="mt-2 flex space-x-2">
                          <button 
                            onClick={() => setPreviewFile(file.url)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Xem
                          </button>
                          <a 
                            href={file.url} 
                            download={file.name}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Tải xuống
                          </a>
                          <PermissionGuard requiredPermission="contract-file:delete:all">
                            <button 
                              className="text-xs text-red-600 hover:text-red-800"
                              onClick={() => handleDeleteFile(file.id)}
                            >
                              Xóa
                            </button>
                          </PermissionGuard>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 3: // Nhân viên phân bổ
        return (
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Nhân viên phân bổ</CardTitle>
              <PermissionGuard requiredPermission="contract-link:update:all">
                <Button 
                  size="sm"
                  onClick={() => navigate(`/contracts/${contract.id}/employees/assign`)}
                >
                  Thêm nhân viên
                </Button>
              </PermissionGuard>
            </CardHeader>
            <CardContent>
              {employeesLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Spinner size="md" />
                </div>
              ) : employeesError ? (
                <Alert variant="error">
                  {employeesError}
                </Alert>
              ) : !hasEmployees ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Chưa có nhân viên nào được phân bổ</p>
                  <PermissionGuard requiredPermission="contract-link:update:all">
                    <Button 
                      className="mt-4"
                      onClick={() => navigate(`/contracts/${contract.id}/employees/assign`)}
                    >
                      Thêm nhân viên đầu tiên
                    </Button>
                  </PermissionGuard>
                </div>
              ) : (
                <>                    
                  <Table
                    data={employees}
                    columns={employeesColumns}
                    enableSorting={false}
                  />
                </>
              )}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="mb-4">
          <div className="flex items-center text-sm">
            <Link to="/contracts/list" className="text-blue-600 hover:text-blue-800">
              Hợp đồng
            </Link>
            <svg 
              className="h-4 w-4 mx-2 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M9 5l7 7-7 7" 
              />
            </svg>
            <span className="text-gray-500 font-medium">
              {contract.name}
            </span>
          </div>
        </div>

        {/* Header section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900 mr-3">{contract.name}</h1>
                <Badge color={getStatusColor(contract.status)}>
                  {contract.status === 'Draft' ? 'Nháp' :
                   contract.status === 'InReview' ? 'Đang xem xét' :
                   contract.status === 'Approved' ? 'Đã phê duyệt' :
                   contract.status === 'Active' ? 'Đang hoạt động' :
                   contract.status === 'InProgress' ? 'Đang thực hiện' :
                   contract.status === 'OnHold' ? 'Tạm hoãn' :
                   contract.status === 'Completed' ? 'Hoàn thành' :
                   contract.status === 'Terminated' ? 'Đã chấm dứt' :
                   contract.status === 'Expired' ? 'Đã hết hạn' :
                   contract.status === 'Cancelled' ? 'Đã hủy' :
                   contract.status}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                <span className="font-medium">Mã:</span> {contract.contractCode} | 
                <span className="font-medium ml-2">Khách hàng:</span> {contract.customerName}
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate('/contracts/list')}
              >
                Quay lại
              </Button>

              <PermissionGuard requiredPermission="contract:update:all">
                <Button onClick={() => navigate(`/contracts/${contract.id}/edit`)}>
                  Chỉnh sửa
                </Button>
              </PermissionGuard>
            </div>
          </div>
          
          {/* Thêm thanh tiến độ thanh toán */}
          {contract.paymentStatus && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <h3 className="text-sm font-medium text-gray-700">Tiến độ thanh toán</h3>
                  <Badge className="ml-2" color={getPaymentStatusColor(contract.paymentStatus.status)}>
                    {contract.paymentStatus.status === 'unpaid' ? 'Chưa thanh toán' :
                     contract.paymentStatus.status === 'partial' ? 'Thanh toán một phần' :
                     contract.paymentStatus.status === 'paid' ? 'Đã thanh toán đủ' :
                     contract.paymentStatus.status === 'overdue' ? 'Quá hạn' :
                     contract.paymentStatus.status}
                  </Badge>
                </div>
                <div className="text-sm font-medium">
                  {formatCurrency(contract.paymentStatus.paidAmount)} / {formatCurrency(contract.amount)}
                  <span className="ml-2 text-xs text-gray-500">
                    ({contract.paymentStatus.paidPercentage.toFixed(2)}%)
                  </span>
                </div>
              </div>
              <Progress 
                value={contract.paymentStatus.paidPercentage} 
                className={
                  contract.paymentStatus.status === 'paid' ? 'bg-green-100' :
                  contract.paymentStatus.status === 'partial' ? 'bg-blue-100' :
                  contract.paymentStatus.status === 'overdue' ? 'bg-red-100' : 'bg-gray-100'
                }
              />
              
              {/* Thông tin thêm về thanh toán */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-gray-500">Đã thanh toán</div>
                  <div className="font-medium">{formatCurrency(contract.paymentStatus.paidAmount)}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-gray-500">Còn lại</div>
                  <div className="font-medium">{formatCurrency(contract.paymentStatus.remainingAmount)}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-gray-500">Đợt thanh toán tiếp theo</div>
                  <div className="font-medium">
                    {contract.paymentStatus.nextDueDate ? 
                      formatDate(contract.paymentStatus.nextDueDate) : 
                      'Không có'}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-gray-500">Số tiền đợt tiếp theo</div>
                  <div className="font-medium">
                    {contract.paymentStatus.nextDueAmount ? 
                      formatCurrency(contract.paymentStatus.nextDueAmount) : 
                      'Không có'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6">
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === index
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab content */}
        <div className="mt-6">
          {renderTabContent()}
        </div>

        {/* File preview modal */}
        {previewFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-auto">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-medium">Xem tài liệu</h3>
                <button 
                  onClick={() => setPreviewFile(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                {previewFile.endsWith('.pdf') ? (
                  <iframe 
                    src={previewFile} 
                    className="w-full h-[70vh]" 
                    title="File Preview"
                    sandbox="allow-same-origin allow-scripts"
                  />
                ) : previewFile.match(/\.(jpe?g|png|gif|bmp)$/i) ? (
                  <img 
                    src={previewFile} 
                    alt="Preview" 
                    className="max-w-full max-h-[70vh] mx-auto" 
                  />
                ) : (
                  <div className="flex items-center justify-center h-[70vh]">
                    <div className="text-center">
                      <p className="mb-4">Không thể xem trước loại tài liệu này</p>
                      <a 
                        href={previewFile} 
                        download 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md"
                      >
                        Tải xuống để xem
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
  );
};

export default ContractDetail; 
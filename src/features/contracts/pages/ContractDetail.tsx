import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  MainLayout 
} from '../../../components/layout';
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
import { ContractDetail as ContractDetailType, PaymentStatusType } from '../types';
import { getContractById } from '../api';

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

  useEffect(() => {
    const fetchContractDetails = async () => {
      try {
        setLoading(true);
        if (!id) throw new Error('Contract ID is required');
        
        const response = await getContractById(id);
        setContract(response.data.contract);
        setError(null);
      } catch (err) {
        console.error('Error fetching contract details:', err);
        setError('Không thể tải thông tin hợp đồng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchContractDetails();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-96">
          <Spinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  if (error || !contract) {
    return (
      <MainLayout>
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
      </MainLayout>
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

  // Cột bảng nhân viên phân bổ
  const employeesColumns = [
    { 
      header: 'Mã NV', 
      accessor: 'employee.id',
      cell: (row: any) => <span className="font-medium">{row.employee.id}</span>
    },
    { 
      header: 'Họ và Tên', 
      accessor: 'employee.name',
      cell: (row: any) => (
        <div className="font-medium text-blue-600 hover:underline">
          <a href={`/employees/${row.employee.id}`}>{row.employee.name}</a>
        </div>
      )
    },
    { 
      header: 'Vị trí', 
      accessor: 'employee.position',
      cell: (row: any) => row.employee.position
    },
    { 
      header: 'Team', 
      accessor: 'employee.team.name',
      cell: (row: any) => row.employee.team.name
    },
    { 
      header: 'Phân bổ (%)', 
      accessor: 'allocationPercentage',
      cell: (row: any) => `${row.allocationPercentage}%`
    },
    { 
      header: 'Ngày bắt đầu', 
      accessor: 'startDate',
      cell: (row: any) => formatDate(row.startDate)
    },
    { 
      header: 'Ngày kết thúc', 
      accessor: 'endDate',
      cell: (row: any) => row.endDate ? formatDate(row.endDate) : 'N/A'
    },
    {
      header: 'Thao tác',
      accessor: 'actions',
      cell: (row: any) => (
        <PermissionGuard requiredPermission="contract-link:update:all">
          <Button 
            variant="outline" 
            color="red" 
            size="sm"
            onClick={() => {/* Handle remove employee */}}
          >
            Gỡ bỏ
          </Button>
        </PermissionGuard>
      )
    }
  ];

  // Render active tab content
  const renderTabContent = () => {
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
          <div className="space-y-6">
            {/* Tổng quan thanh toán */}
            <Card>
              <CardHeader>
                <CardTitle>Tổng quan thanh toán</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="px-4 py-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-500">Tổng giá trị</p>
                    <p className="text-lg font-semibold">{formatCurrency(contract.amount)}</p>
                  </div>
                  <div className="px-4 py-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-500">Đã thanh toán</p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(contract.paymentStatus.paidAmount)}
                      <span className="text-sm font-normal ml-1">
                        ({contract.paymentStatus.paidPercentage.toFixed(1)}%)
                      </span>
                    </p>
                  </div>
                  <div className="px-4 py-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-500">Còn lại</p>
                    <p className="text-lg font-semibold text-blue-600">
                      {formatCurrency(contract.paymentStatus.remainingAmount)}
                    </p>
                  </div>
                  <div className="px-4 py-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-500">Trạng thái</p>
                    <p>
                      <Badge color={getPaymentStatusColor(contract.paymentStatus.status)}>
                        {contract.paymentStatus.status === 'unpaid' ? 'Chưa thanh toán' :
                         contract.paymentStatus.status === 'partial' ? 'Một phần' :
                         contract.paymentStatus.status === 'paid' ? 'Đã thanh toán đầy đủ' :
                         contract.paymentStatus.status === 'overdue' ? 'Quá hạn' :
                         contract.paymentStatus.status}
                      </Badge>
                    </p>
                  </div>
                </div>

                <div className="mb-2">
                  <p className="text-sm text-gray-500 mb-1">Tiến độ thanh toán</p>
                  <Progress 
                    value={contract.paymentStatus.paidPercentage} 
                    className={
                      contract.paymentStatus.status === 'paid' ? 'bg-green-200' :
                      contract.paymentStatus.status === 'overdue' ? 'bg-red-200' :
                      contract.paymentStatus.status === 'partial' ? 'bg-blue-200' : 'bg-gray-200'
                    }
                  />
                </div>

                {contract.paymentStatus.nextDueDate && (
                  <div className="mt-4 p-3 border border-yellow-200 bg-yellow-50 rounded-md">
                    <p className="text-sm text-yellow-800">
                      <span className="font-medium">Đợt thanh toán tiếp theo:</span> {formatDate(contract.paymentStatus.nextDueDate)} - {formatCurrency(contract.paymentStatus.nextDueAmount)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bảng điều khoản thanh toán */}
            <Card>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>Điều khoản thanh toán</CardTitle>
                <PermissionGuard requiredPermission="payment-term:create:all">
                  <Button 
                    size="sm"
                    onClick={() => navigate(`/contracts/${contract.id}/payment-terms/add`)}
                  >
                    Thêm đợt thanh toán
                  </Button>
                </PermissionGuard>
              </CardHeader>
              <Table
                data={contract.paymentTerms}
                columns={paymentTermsColumns}
              />
            </Card>
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
                  onClick={() => navigate(`/contracts/${contract.id}/files/upload`)}
                >
                  Tải lên tài liệu
                </Button>
              </PermissionGuard>
            </CardHeader>
            <CardContent>
              {contract.files.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Chưa có tài liệu nào được đính kèm</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {contract.files.map(file => (
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
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Tải xuống
                          </a>
                          <PermissionGuard requiredPermission="contract-file:delete:all">
                            <button className="text-xs text-red-600 hover:text-red-800">
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
            <Table
              data={contract.employeeAssignments}
              columns={employeesColumns}
            />
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <MainLayout>
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
                <iframe 
                  src={previewFile} 
                  className="w-full h-[70vh]" 
                  title="File Preview"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ContractDetail; 
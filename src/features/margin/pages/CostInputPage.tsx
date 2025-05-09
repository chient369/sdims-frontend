import React from 'react';
import { MainLayout } from '../../../components/layout';
import { CostInputForm } from '../components';
import { useNavigate } from 'react-router-dom';
import { Heading, Card, Button } from '../../../components/ui';
import { useAuth } from '../../../context/AuthContext';

/**
 * Trang Cập nhật Chi phí Nhân viên (MH-MGN-02)
 * Trang này hiển thị form cập nhật chi phí và import chi phí từ file
 * @returns {JSX.Element} Rendered component
 */
const CostInputPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, hasAnyPermission } = useAuth();

  const handleSuccess = () => {
    // Hiển thị thông báo thành công và chuyển hướng sau 3 giây
    setTimeout(() => navigate('/margins'), 3000);
  };

  // Kiểm tra quyền để nhập chi phí
  const canInputCosts = hasAnyPermission(['employee-cost:create', 'employee-cost:import']);

  if (!canInputCosts) {
    return (
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Card className="p-8 text-center">
            <Heading level={3} className="text-red-600 mb-4">Không có quyền truy cập</Heading>
            <p className="mb-6 text-gray-600">Bạn không có quyền truy cập vào chức năng này.</p>
            <Button onClick={() => navigate('/margins')}>Quay lại Danh sách Margin</Button>
          </Card>
        </div>
    );
  }

  return (
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb - sử dụng breadcrumb đơn giản vì không có component Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <a href="/" className="hover:text-primary-600">Trang chủ</a>
          <span className="mx-2">/</span>
          <a href="/margins" className="hover:text-primary-600">Quản lý Margin</a>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Cập nhật Chi phí</span>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Heading level={1} className="text-secondary-900">Cập nhật Chi phí Nhân viên</Heading>
          <Button 
            variant="outline" 
            onClick={() => navigate('/margins')}
            className="flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Quay lại</span>
          </Button>
        </div>

        <Card className="mb-6 p-4">
          <p className="text-sm text-gray-600">
            Trang này cho phép bạn cập nhật chi phí nhân viên theo tháng, phục vụ cho việc tính toán margin. 
            Có thể nhập chi phí thủ công hoặc import từ file Excel/CSV.
          </p>
        </Card>

        <CostInputForm onSuccess={handleSuccess} />
      </div>
  );
};

export default CostInputPage; 
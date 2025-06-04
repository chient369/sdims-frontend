import React from 'react';

interface StatusBadgeProps {
  status: string;
}

/**
 * Component for displaying status badges with appropriate colors
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let bgColor = '';
  let textColor = '';
  let statusText = '';

  switch (status) {
    case 'unpaid':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      statusText = 'Chưa thanh toán';
      break;
    case 'invoiced':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      statusText = 'Đã xuất hóa đơn';
      break;
    case 'paid':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      statusText = 'Đã thanh toán';
      break;
    case 'overdue':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      statusText = 'Quá hạn';
      break;
    case 'active':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      statusText = 'Đang hoạt động';
      break;
    case 'inactive':
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
      statusText = 'Không hoạt động';
      break;
    case 'pending':
      bgColor = 'bg-orange-100';
      textColor = 'text-orange-800';
      statusText = 'Đang chờ';
      break;
    case 'completed':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      statusText = 'Hoàn thành';
      break;
    case 'cancelled':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      statusText = 'Đã hủy';
      break;
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
      statusText = status || 'Không xác định';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {statusText}
    </span>
  );
}; 
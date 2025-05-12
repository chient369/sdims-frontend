import React from 'react';
import { ReportHeaderProps } from '../types';
import { format } from 'date-fns';

/**
 * Component hiển thị header của báo cáo
 * Bao gồm tiêu đề, mô tả và ngày cập nhật
 */
const ReportHeader: React.FC<ReportHeaderProps> = ({
  title,
  description,
  updatedAt,
  onBack // giữ lại prop nhưng không sử dụng
}) => {
  // Format ngày cập nhật
  const formattedDate = updatedAt 
    ? format(new Date(updatedAt), 'dd/MM/yyyy HH:mm')
    : '';

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
        
        {updatedAt && (
          <p className="text-sm text-gray-500">
            Cập nhật lần cuối: {formattedDate}
          </p>
        )}
      </div>
      
      {description && (
        <p className="text-gray-600 text-sm mt-1">{description}</p>
      )}
    </div>
  );
};

export default ReportHeader; 
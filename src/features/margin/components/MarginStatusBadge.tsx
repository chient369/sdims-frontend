/**
 * MarginStatusBadge Component
 * 
 * Hiển thị trạng thái margin với màu sắc tương ứng (Red, Yellow, Green)
 */

import React from 'react';
import { Badge, Tooltip } from '../../../components/ui';
import { MarginStatusType } from '../types';

interface MarginStatusBadgeProps {
  status: MarginStatusType;
}

const statusConfig = {
  Red: {
    label: 'Thấp',
    color: 'danger',
    description: 'Margin < 30%'
  },
  Yellow: {
    label: 'Trung bình',
    color: 'warning',
    description: '30% ≤ Margin < 50%'
  },
  Green: {
    label: 'Cao',
    color: 'success',
    description: 'Margin ≥ 50%'
  }
};

const MarginStatusBadge: React.FC<MarginStatusBadgeProps> = ({ status }) => {
  const { label, color, description } = statusConfig[status];
  
  return (
    <Tooltip content={description} position="top">
      <Badge
        color={color as 'success' | 'warning' | 'danger'}
      >
        {label}
      </Badge>
    </Tooltip>
  );
};

export default MarginStatusBadge; 
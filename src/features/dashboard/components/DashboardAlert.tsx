import React from 'react';
import { useNavigate } from 'react-router-dom';

interface DashboardAlertProps {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  hasDismissAction?: boolean;
  hasViewAction?: boolean;
  viewActionLabel?: string;
  viewActionUrl?: string;
  onDismiss?: () => void;
}

export const DashboardAlert: React.FC<DashboardAlertProps> = ({
  title,
  message,
  type = 'info',
  hasDismissAction = true,
  hasViewAction = false,
  viewActionLabel = 'Xem chi tiết',
  viewActionUrl,
  onDismiss,
}) => {
  const navigate = useNavigate();
  
  const getAlertTypeStyles = () => {
    switch (type) {
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };
  
  const getIconStyles = () => {
    switch (type) {
      case 'warning':
        return 'text-amber-400';
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'info':
      default:
        return 'text-blue-400';
    }
  };
  
  const handleViewAction = () => {
    if (viewActionUrl) {
      navigate(viewActionUrl);
    }
  };
  
  return (
    <div className={`rounded-md border p-4 ${getAlertTypeStyles()}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {type === 'warning' && (
            <svg className={`h-5 w-5 ${getIconStyles()}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
          {type === 'info' && (
            <svg className={`h-5 w-5 ${getIconStyles()}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">{title}</h3>
          <div className="mt-1 text-sm opacity-90">{message}</div>
          
          {(hasViewAction || hasDismissAction) && (
            <div className="mt-3 flex">
              {hasViewAction && viewActionUrl && (
                <button
                  onClick={handleViewAction}
                  className="mr-4 text-sm font-medium underline"
                >
                  {viewActionLabel}
                </button>
              )}
              
              {hasDismissAction && onDismiss && (
                <button
                  onClick={onDismiss}
                  className="text-sm font-medium underline"
                >
                  Đánh dấu đã đọc
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 
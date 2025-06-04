import React from 'react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  termDescription: string;
}

/**
 * Modal for confirming deletion of a payment term
 */
export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  termDescription
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900">Xác nhận xóa</h3>
          <p className="text-sm text-gray-500 mt-2">
            Bạn có chắc chắn muốn xóa đợt thanh toán "{termDescription}" không? Hành động này không thể hoàn tác.
          </p>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}; 
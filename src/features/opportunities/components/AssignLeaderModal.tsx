/**
 * AssignLeaderModal component for assigning leader to an opportunity
 */
import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { assignLeaderToOpportunity } from '../api';

interface AssignLeaderModalProps {
  opportunityId: string;
  opportunityName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  leaders?: { id: string; name: string }[];
}

const AssignLeaderModal: React.FC<AssignLeaderModalProps> = ({
  opportunityId,
  opportunityName,
  isOpen,
  onClose,
  onSuccess,
  leaders = []
}) => {
  const [selectedLeaderId, setSelectedLeaderId] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [notifyLeader, setNotifyLeader] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  if (!isOpen) return null;
  
  const handleAssign = async () => {
    if (!selectedLeaderId) {
      setError('Vui lòng chọn Leader');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      await assignLeaderToOpportunity(opportunityId, {
        leaderId: selectedLeaderId,
        message,
        notifyLeader
      });
      
      onSuccess();
      onClose();
    } catch (err) {
      setError('Có lỗi xảy ra khi phân công Leader. Vui lòng thử lại sau.');
      console.error('Error assigning leader:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Phân công Leader
          </h3>
          
          <p className="text-sm text-gray-600 mb-4">
            Phân công Leader cho cơ hội: <span className="font-medium">{opportunityName}</span>
          </p>
          
          <div className="mb-4">
            <label htmlFor="leader" className="block text-sm font-medium text-gray-700 mb-1">
              Chọn Leader
            </label>
            <select
              id="leader"
              value={selectedLeaderId}
              onChange={(e) => setSelectedLeaderId(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">-- Chọn Leader --</option>
              {leaders.map((leader) => (
                <option key={leader.id} value={leader.id}>
                  {leader.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú (tùy chọn)
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Nhập ghi chú cho Leader..."
            />
          </div>
          
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={notifyLeader}
                onChange={(e) => setNotifyLeader(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Gửi thông báo cho Leader
              </span>
            </label>
          </div>
          
          {error && (
            <div className="mb-4 p-2 bg-error-50 border border-error-200 text-error-800 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={onClose} 
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button 
              onClick={handleAssign} 
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Phân công
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AssignLeaderModal; 
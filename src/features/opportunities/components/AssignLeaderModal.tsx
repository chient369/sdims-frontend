/**
 * AssignLeaderModal component for assigning leader to an opportunity
 */
import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { assignLeaderToOpportunity, getTeams } from '../api';
import { Spinner } from '../../../components/ui';
import { useNotifications } from '../../../context/NotificationContext';

export interface AssignLeaderModalProps {
  opportunityId: string;
  onClose: () => void;
  onAssign: (leaderId: string, message?: string, notifyLeader?: boolean) => Promise<void>;
  opportunityName?: string;
}

interface Team {
  id: number;
  name: string;
  department: string;
  description: string;
  leaderId: number;
  leaderName: string;
  createdAt: string;
  updatedAt: string;
}

const AssignLeaderModal: React.FC<AssignLeaderModalProps> = ({
  opportunityId,
  opportunityName = 'Cơ hội',
  onClose,
  onAssign
}) => {
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [notifyLeader, setNotifyLeader] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState<boolean>(false);
  const { showToast } = useNotifications();
  
  // Fetch teams when component mounts
  useEffect(() => {
    console.log('AssignLeaderModal mounted - Calling fetchTeams');
    
    const fetchTeams = async () => {
      try {
        setIsLoadingTeams(true);
        console.log('Starting API call to get Teams');
        const response = await getTeams();
        console.log('Teams API response received:', response);
        
        // API response được xử lý bởi axios interceptor
        // Response trả về đã được format theo cấu trúc trong API
        if (response && Array.isArray(response.data.content)) {
          console.log('Setting teams from response.content');
          setTeams(response.data.content);
        }
      } catch (err) {
        console.error('Error fetching teams:', err);
        setError('Không thể tải danh sách teams');
      } finally {
        setIsLoadingTeams(false);
        console.log('Teams loading completed');
      }
    };
    
    fetchTeams();
    
    // Cleanup function
    return () => {
      console.log('AssignLeaderModal unmounted');
    };
  }, []);
  
  const handleAssign = async () => {
    if (!selectedTeam) {
      setError('Vui lòng chọn Team');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Tìm team được chọn
      const selectedTeamObj = teams.find(team => team.id.toString() === selectedTeam);
      
      if (!selectedTeamObj) {
        setError('Team không hợp lệ');
        setIsSubmitting(false);
        return;
      }
      
      // Sử dụng leaderId của team thay vì id
      const leaderId = selectedTeamObj.leaderId.toString();
      
      await onAssign(leaderId, message, notifyLeader);
      
      // Hiển thị thông báo Toast khi phân công thành công
      showToast(
        'success',
        'Phân công thành công',
        `Đã phân công team cho cơ hội: ${opportunityName}`
      );
    } catch (err) {
      setError('Có lỗi xảy ra khi phân công Team. Vui lòng thử lại sau.');
      console.error('Error assigning team:', err);
      
      // Hiển thị thông báo Toast khi phân công thất bại
      showToast(
        'error',
        'Phân công thất bại',
        'Có lỗi xảy ra khi phân công Team. Vui lòng thử lại sau.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Phân công Team
          </h3>
          
          <p className="text-sm text-gray-600 mb-4">
            Phân công team cho cơ hội: <span className="font-medium">{opportunityName}</span>
          </p>
          
          <div className="mb-4">
            <label htmlFor="leader" className="block text-sm font-medium text-gray-700 mb-1">
              Chọn Team
            </label>
            {isLoadingTeams ? (
              <div className="flex justify-center py-3">
                <Spinner size="sm" />
              </div>
            ) : (
            <select
              id="leader"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                disabled={isSubmitting}
            >
                <option value="">-- Chọn Team --</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id.toString()}>
                    {team.name} ({team.department}) - Leader: {team.leaderName}
                </option>
              ))}
            </select>
            )}
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
              placeholder="Nhập ghi chú cho Team..."
              disabled={isSubmitting}
            />
          </div>
          
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={notifyLeader}
                onChange={(e) => setNotifyLeader(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                disabled={isSubmitting}
              />
              <span className="ml-2 text-sm text-gray-700">
                Gửi thông báo cho Team
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
              disabled={isSubmitting || isLoadingTeams}
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
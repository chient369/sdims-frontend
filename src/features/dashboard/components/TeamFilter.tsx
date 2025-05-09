import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Card, CardContent } from '@components/ui/Card';
import { TeamInfo } from '../../hrm/types';
import { employeeService } from '../../hrm/service';

export interface TeamFilterProps {
  selectedTeamId: string | null;
  onTeamChange: (teamId: string | null) => void;
  className?: string;
}

/**
 * TeamFilter component cho Dashboard
 * Hiển thị dropdown để lọc dữ liệu dashboard theo team/bộ phận
 */
const TeamFilter: React.FC<TeamFilterProps> = ({ 
  selectedTeamId, 
  onTeamChange,
  className 
}) => {
  const { user, hasPermission } = useAuth();
  const [teams, setTeams] = useState<TeamInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Xác định user có thể xem tất cả team hay chỉ xem team của mình
  const canViewAllTeams = hasPermission('dashboard:read:all');
  
  useEffect(() => {
    const loadTeams = async () => {
      try {
        setLoading(true);
        // Trong thực tế, đây sẽ là API call để lấy danh sách team
        // const response = await teamService.getTeams();
        // setTeams(response.data);

        // Mock data cho demo
        const mockTeams: TeamInfo[] = [
          { id: '1', name: 'Team Alpha', description: 'Development Team', memberCount: 8, createdAt: '', updatedAt: '' },
          { id: '2', name: 'Team Beta', description: 'Design Team', memberCount: 5, createdAt: '', updatedAt: '' },
          { id: '3', name: 'Team Gamma', description: 'QA Team', memberCount: 4, createdAt: '', updatedAt: '' },
          { id: '4', name: 'Team Delta', description: 'Sales Team', memberCount: 6, createdAt: '', updatedAt: '' },
          { id: '5', name: 'Team Epsilon', description: 'Marketing Team', memberCount: 3, createdAt: '', updatedAt: '' }
        ];
        
        setTeams(mockTeams);
      } catch (error) {
        console.error('Failed to load teams:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
  }, []);

  // Filter theo quyền của user
  const userTeamId = user?.teamId;
  const visibleTeams = canViewAllTeams 
    ? teams 
    : teams.filter(team => team.id === userTeamId);

  // Nếu user chỉ có quyền xem team của mình, tự động chọn team đó
  useEffect(() => {
    if (!canViewAllTeams && userTeamId && !selectedTeamId) {
      onTeamChange(userTeamId);
    }
  }, [canViewAllTeams, userTeamId, selectedTeamId, onTeamChange]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    onTeamChange(value ? value : null);
  };

  return (
    <div className={className}>
      <select
        id="team-filter"
        className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
        value={selectedTeamId || ''}
        onChange={handleChange}
        disabled={loading || !canViewAllTeams}
      >
        {canViewAllTeams && <option value="">Tất cả bộ phận</option>}
        
        {visibleTeams.map(team => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TeamFilter; 
import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';

import { getTeams } from '../../../api';
import { TeamInfo } from '../../../types';

interface OrganizationSectionProps {
  isEditable: boolean;
}

const OrganizationSection: React.FC<OrganizationSectionProps> = ({ isEditable }) => {
  const { register, formState: { errors }, setValue, watch } = useFormContext();
  const [expanded, setExpanded] = useState(true);
  const [teams, setTeams] = useState<TeamInfo[]>([]);
  
  const selectedTeamId = watch('teamId');
  
  // Fetch teams
  const { data: teamsData, isLoading: isLoadingTeams } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const response = await getTeams();
      return response.content;
    },
    enabled: isEditable
  });
  
  // Update teams state when data changes
  useEffect(() => {
    if (teamsData) {
      setTeams(teamsData);
    }
  }, [teamsData]);
  
  // Get leader info based on selected team
  const selectedTeam = teams.find(team => team.id === Number(selectedTeamId));
  const leaderName = selectedTeam?.leaderName || '';
  
  return (
    <div className="mb-8 border border-gray-200 rounded-md overflow-hidden">
      <div 
        className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <h2 className="text-lg font-medium text-gray-900">Thông tin Tổ chức</h2>
        <button type="button" className="text-gray-400 hover:text-gray-500">
          {expanded ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
      </div>
      
      {expanded && (
        <div className="px-4 py-5 bg-white sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Join Date */}
            <div>
              <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700">
                Ngày vào công ty
              </label>
              <input
                type="date"
                id="joinDate"
                disabled={!isEditable}
                className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                  !isEditable ? 'bg-gray-100' : ''
                }`}
                {...register('joinDate')}
              />
              {errors.joinDate && (
                <p className="mt-1 text-sm text-red-600">{errors.joinDate.message as string}</p>
              )}
            </div>
            
            {/* Position */}
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                Vị trí công việc
              </label>
              <select
                id="position"
                disabled={!isEditable}
                className={`mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  !isEditable ? 'bg-gray-100' : ''
                }`}
                {...register('position')}
              >
                <option value="">-- Chọn vị trí --</option>
                <option value="Developer">Developer</option>
                <option value="Designer">Designer</option>
                <option value="QA Engineer">QA Engineer</option>
                <option value="Business Analyst">Business Analyst</option>
                <option value="Project Manager">Project Manager</option>
                <option value="Team Leader">Team Leader</option>
                <option value="General Manager">General Manager</option>
                <option value="Sales">Sales</option>
                <option value="HR">HR</option>
                <option value="Admin">Admin</option>
              </select>
              {errors.position && (
                <p className="mt-1 text-sm text-red-600">{errors.position.message as string}</p>
              )}
            </div>
            
            {/* Team */}
            <div>
              <label htmlFor="teamId" className="block text-sm font-medium text-gray-700">
                Team
              </label>
              <select
                id="teamId"
                disabled={!isEditable || isLoadingTeams}
                className={`mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  !isEditable || isLoadingTeams ? 'bg-gray-100' : ''
                }`}
                {...register('teamId')}
              >
                <option value="">-- Chọn team --</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              {errors.teamId && (
                <p className="mt-1 text-sm text-red-600">{errors.teamId.message as string}</p>
              )}
            </div>
            
            {/* Leader */}
            <div>
              <label htmlFor="leader" className="block text-sm font-medium text-gray-700">
                Leader trực tiếp
              </label>
              <input
                type="text"
                id="leader"
                value={leaderName}
                disabled
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Leader được tự động chọn dựa trên team
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationSection; 
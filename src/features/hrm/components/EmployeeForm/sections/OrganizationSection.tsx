import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';

import { getTeams } from '../../../api';
import { TeamInfo, NewEmployeeApiResponse } from '../../../types';

interface OrganizationSectionProps {
  isEditable: boolean;
  potentialLeaders: NewEmployeeApiResponse[];
  isLoadingLeaders: boolean;
}

const OrganizationSection: React.FC<OrganizationSectionProps> = ({ 
  isEditable, 
  potentialLeaders, 
  isLoadingLeaders 
}) => {
  const { register, formState: { errors }, setValue, watch } = useFormContext();
  const [expanded, setExpanded] = useState(true);
  const [teams, setTeams] = useState<TeamInfo[]>([]);
  
  const selectedTeamId = watch('teamId');
  console.log('[OrganizationSection] Initial selectedTeamId from form context:', selectedTeamId);
  
  // Watch for changes in teamId to auto-select reportingLeaderId
  useEffect(() => {
    if (selectedTeamId && teams.length > 0 && potentialLeaders.length > 0) {
      const numSelectedTeamId = Number(selectedTeamId);
      const selectedTeam = teams.find(team => team.id === numSelectedTeamId);
      
      if (selectedTeam && selectedTeam.leaderId) {
        const leaderExists = potentialLeaders.find(leader => leader.id === selectedTeam.leaderId);
        if (leaderExists) {
          console.log(`[OrganizationSection] Team selected: ${selectedTeam.name}. Auto-setting reportingLeaderId to: ${selectedTeam.leaderId}`);
          setValue('reportingLeaderId', selectedTeam.leaderId.toString(), { shouldValidate: true, shouldDirty: true });
        } else {
          console.warn(`[OrganizationSection] Leader ID ${selectedTeam.leaderId} for team ${selectedTeam.name} not found in potentialLeaders. Clearing reportingLeaderId.`);
          setValue('reportingLeaderId', '', { shouldValidate: true, shouldDirty: true }); // Clear if leader not found
        }
      } else if (selectedTeam) {
        console.log(`[OrganizationSection] Team ${selectedTeam.name} selected, but has no leaderId. Clearing reportingLeaderId.`);
        setValue('reportingLeaderId', '', { shouldValidate: true, shouldDirty: true }); // Clear if team has no leader
      }
    } else if (!selectedTeamId) {
      // If no team is selected, clear the reporting leader
      // This might be too aggressive if user manually changes leader then unselects team
      // Consider if this behavior is desired. For now, it ensures consistency.
      // console.log("[OrganizationSection] No team selected. Clearing reportingLeaderId (if it wasn't already empty).");
      // setValue('reportingLeaderId', '', { shouldValidate: true, shouldDirty: true });
    }
  }, [selectedTeamId, teams, potentialLeaders, setValue]);
  
  // Fetch teams
  const { data: teamsData, isLoading: isLoadingTeams } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const response = await getTeams(); // Declared type is likely { content: TeamInfo[] }
                                        // Actual runtime type from log is { data: { content: TeamInfo[] } }
      
      // Check for the runtime structure first (response.data.content)
      if (response && typeof response === 'object' && 'data' in response) {
        const responseWithData = response as any; // Type assertion to access .data
        if (responseWithData.data && Array.isArray(responseWithData.data.content)) {
          return responseWithData.data.content;
        }
      } 
      // Fallback to check for the declared structure (response.content)
      else if (response && typeof response === 'object' && 'content' in response && Array.isArray(response.content)) {
        return response.content;
      }
      
      console.warn('[OrganizationSection] Teams data from getTeams() is not in a recognized format:', response);
      return []; // Return empty array to prevent error
    },
    enabled: isEditable
  });
  
  // Update teams state when data changes
  useEffect(() => {
    if (teamsData) {
      setTeams(teamsData);
      // After teams are loaded, if a teamId is already selected (e.g. when editing an employee),
      // we might need to trigger the auto-selection of the leader again.
      // The dependency array of the main useEffect [selectedTeamId, teams, potentialLeaders, setValue] handles this
      // because `teams` state updates here.
    }
  }, [teamsData]);
  
  // Get leader info based on selected team (this is informational, not for setting the form value directly anymore)
  // const selectedTeamForInfo = teams.find(team => team.id === Number(selectedTeamId));
  // const leaderNameDisplay = selectedTeamForInfo?.leaderName || '';
  
  // Create a key that changes when teams are loaded to help re-mount/re-render the select
  const teamSelectKey = isLoadingTeams ? 'teams-loading' : 'teams-loaded';
  
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
            {/* Join Date changed to Hire Date */}
            <div>
              <label htmlFor="hireDate" className="block text-sm font-medium text-gray-700">
                Ngày vào công ty
              </label>
              <input
                type="date"
                id="hireDate"
                disabled={!isEditable}
                className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                  !isEditable ? 'bg-gray-100' : ''
                }`}
                {...register('hireDate')}
              />
              {errors.hireDate && (
                <p className="mt-1 text-sm text-red-600">{errors.hireDate.message as string}</p>
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
                key={teamSelectKey}
                disabled={!isEditable || isLoadingTeams}
                className={`mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  !isEditable || isLoadingTeams ? 'bg-gray-100' : ''
                }`}
                {...register('teamId')}
                value={watch('teamId') || ''}
              >
                <option value="">-- Chọn team --</option>
                {teams.map(team => {
                  console.log(`[OrganizationSection] Rendering team option: ID=${team.id.toString()}, Name=${team.name}. Watched teamId: ${watch('teamId')}`);
                  return (
                    <option key={team.id.toString()} value={team.id.toString()}>
                      {team.name}
                    </option>
                  );
                })}
              </select>
              {errors.teamId && (
                <p className="mt-1 text-sm text-red-600">{errors.teamId.message as string}</p>
              )}
            </div>
            
            {/* Reporting Leader - Changed from auto-selected based on team to selectable */}
            <div>
              <label htmlFor="reportingLeaderId" className="block text-sm font-medium text-gray-700">
                Người quản lý trực tiếp
              </label>
              <select
                id="reportingLeaderId"
                disabled={!isEditable || isLoadingLeaders}
                className={`mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  !isEditable || isLoadingLeaders ? 'bg-gray-100' : ''
                }`}
                {...register('reportingLeaderId')}
              >
                <option value="">-- Chọn người quản lý --</option>
                {potentialLeaders.map(leader => (
                  <option key={leader.id.toString()} value={leader.id.toString()}>
                    {`${leader.firstName || ''} ${leader.lastName || ''}`.trim()} ({leader.employeeCode})
                  </option>
                ))}
              </select>
              {errors.reportingLeaderId && (
                <p className="mt-1 text-sm text-red-600">{errors.reportingLeaderId.message as string}</p>
              )}
            </div>

            {/* Leader (Informational based on team) - Kept for reference if needed, or can be removed */}
            {/* <div>
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
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationSection; 
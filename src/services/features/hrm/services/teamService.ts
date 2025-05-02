import { BaseApiService } from '../../../core/baseApi';
import {
  TeamInfo,
  TeamCreateData,
  TeamUpdateData,
  TeamMemberResponse,
  getTeams as getTeamsApi,
  getTeamById as getTeamByIdApi,
  createTeam as createTeamApi,
  updateTeam as updateTeamApi,
  deleteTeam as deleteTeamApi,
  getTeamMembers as getTeamMembersApi,
  addTeamMember as addTeamMemberApi,
  removeTeamMember as removeTeamMemberApi,
  setTeamLeader as setTeamLeaderApi,
} from '../api';

/**
 * Service for team management operations
 */
class TeamService extends BaseApiService {
  constructor() {
    super('/api/v1/teams');
  }
  
  /**
   * Get all teams
   */
  async getTeams(): Promise<TeamInfo[]> {
    return getTeamsApi();
  }
  
  /**
   * Get team by ID
   */
  async getTeamById(teamId: number): Promise<TeamInfo> {
    return getTeamByIdApi(teamId);
  }
  
  /**
   * Create a new team
   */
  async createTeam(data: TeamCreateData): Promise<TeamInfo> {
    return createTeamApi(data);
  }
  
  /**
   * Update a team
   */
  async updateTeam(teamId: number, data: TeamUpdateData): Promise<TeamInfo> {
    return updateTeamApi(teamId, data);
  }
  
  /**
   * Delete a team
   */
  async deleteTeam(teamId: number): Promise<void> {
    return deleteTeamApi(teamId);
  }
  
  /**
   * Get team members
   */
  async getTeamMembers(teamId: number): Promise<TeamMemberResponse[]> {
    return getTeamMembersApi(teamId);
  }
  
  /**
   * Add member to team
   */
  async addTeamMember(teamId: number, employeeId: number): Promise<void> {
    return addTeamMemberApi(teamId, employeeId);
  }
  
  /**
   * Remove member from team
   */
  async removeTeamMember(teamId: number, employeeId: number): Promise<void> {
    return removeTeamMemberApi(teamId, employeeId);
  }
  
  /**
   * Set team leader
   */
  async setTeamLeader(teamId: number, employeeId: number): Promise<TeamInfo> {
    return setTeamLeaderApi(teamId, employeeId);
  }
  
  /**
   * Get teams with member count (convenience method)
   * This would require backend support or additional API calls to get member counts
   */
  async getTeamsWithMemberCount(): Promise<TeamInfo[]> {
    const teams = await getTeamsApi();
    return teams;
  }
}

export const teamService = new TeamService(); 
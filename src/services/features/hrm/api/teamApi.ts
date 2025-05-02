import apiClient from '../../../core/axios';
import { AxiosRequestConfig } from 'axios';

export interface TeamInfo {
  id: number;
  name: string;
  description?: string;
  leader?: {
    id: number;
    name: string;
  };
  members?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamCreateData {
  name: string;
  description?: string;
  leaderId?: number;
}

export interface TeamUpdateData extends Partial<TeamCreateData> {}

export interface TeamMemberResponse {
  id: number;
  employeeCode: string;
  name: string;
  position: string;
  email: string;
  joinDate: string;
}

/**
 * Get all teams
 */
export const getTeams = async (config?: AxiosRequestConfig): Promise<TeamInfo[]> => {
  return apiClient.get('/api/v1/teams', config);
};

/**
 * Get team by ID
 */
export const getTeamById = async (teamId: number, config?: AxiosRequestConfig): Promise<TeamInfo> => {
  return apiClient.get(`/api/v1/teams/${teamId}`, config);
};

/**
 * Create a new team
 */
export const createTeam = async (data: TeamCreateData, config?: AxiosRequestConfig): Promise<TeamInfo> => {
  return apiClient.post('/api/v1/teams', data, config);
};

/**
 * Update a team
 */
export const updateTeam = async (teamId: number, data: TeamUpdateData, config?: AxiosRequestConfig): Promise<TeamInfo> => {
  return apiClient.put(`/api/v1/teams/${teamId}`, data, config);
};

/**
 * Delete a team
 */
export const deleteTeam = async (teamId: number, config?: AxiosRequestConfig): Promise<void> => {
  return apiClient.delete(`/api/v1/teams/${teamId}`, config);
};

/**
 * Get team members
 */
export const getTeamMembers = async (teamId: number, config?: AxiosRequestConfig): Promise<TeamMemberResponse[]> => {
  return apiClient.get(`/api/v1/teams/${teamId}/members`, config);
};

/**
 * Add member to team
 */
export const addTeamMember = async (teamId: number, employeeId: number, config?: AxiosRequestConfig): Promise<void> => {
  return apiClient.post(`/api/v1/teams/${teamId}/members`, { employeeId }, config);
};

/**
 * Remove member from team
 */
export const removeTeamMember = async (teamId: number, employeeId: number, config?: AxiosRequestConfig): Promise<void> => {
  return apiClient.delete(`/api/v1/teams/${teamId}/members/${employeeId}`, config);
};

/**
 * Set team leader
 */
export const setTeamLeader = async (teamId: number, employeeId: number, config?: AxiosRequestConfig): Promise<TeamInfo> => {
  return apiClient.put(`/api/v1/teams/${teamId}/leader`, { employeeId }, config);
}; 
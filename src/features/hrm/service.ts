/**
 * HRM Service Module
 * 
 * This module provides a higher-level interface for interacting with HRM data,
 * encapsulating API calls and adding business logic when needed.
 */

import { BaseApiService } from '../../services/core/baseApi';
import {
  // Employee Types
  EmployeeListParams,
  EmployeeResponse,
  EmployeeCreateData,
  EmployeeUpdateData,
  EmployeeStatusUpdateData,
  ImportEmployeesResponse,
  EmployeeProjectHistoryResponse,
  EmployeeDeleteResponse,
  EmployeeSuggestionsResponseWrapper,
  PaginatedEmployeeResponse,
  
  // Skill Types
  SkillCategoryResponse,
  SkillResponse,
  EmployeeSkillResponse,
  EmployeeSkillsResponse,
  EmployeeSkillsParams,
  EmployeeSkillCreateData,
  EmployeeSkillDeleteResponse,
  EmployeeSkillDetail,
  SkillLevel,
  
  // Team Types
  TeamInfo,
  TeamCreateData,
  TeamUpdateData,
  TeamMemberResponse,
  EmployeeSuggestParams
} from './types';

import {
  // Employee API
  getEmployees as getEmployeesApi,
  getEmployeeById as getEmployeeByIdApi,
  createEmployee as createEmployeeApi,
  updateEmployee as updateEmployeeApi,
  deleteEmployee as deleteEmployeeApi,
  uploadAvatar as uploadAvatarApi,
  getAvailableEmployees as getAvailableEmployeesApi,
  suggestEmployees as suggestEmployeesApi,
  importEmployees as importEmployeesApi,
  exportEmployees as exportEmployeesApi,
  updateEmployeeStatus as updateEmployeeStatusApi,
  getEmployeeProjectHistory as getEmployeeProjectHistoryApi,
  
  // Skill API
  getSkillCategories as getSkillCategoriesApi,
  createSkillCategory as createSkillCategoryApi,
  updateSkillCategory as updateSkillCategoryApi,
  deleteSkillCategory as deleteSkillCategoryApi,
  getSkills as getSkillsApi,
  createSkill as createSkillApi,
  updateSkill as updateSkillApi,
  deleteSkill as deleteSkillApi,
  getEmployeeSkills as getEmployeeSkillsApi,
  addOrUpdateEmployeeSkill as addOrUpdateEmployeeSkillApi,
  deleteEmployeeSkill as deleteEmployeeSkillApi,
  
  // Team API
  getTeams as getTeamsApi,
  getTeamById as getTeamByIdApi,
  createTeam as createTeamApi,
  updateTeam as updateTeamApi,
  deleteTeam as deleteTeamApi,
  getTeamMembers as getTeamMembersApi,
  addTeamMember as addTeamMemberApi,
  removeTeamMember as removeTeamMemberApi,
  setTeamLeader as setTeamLeaderApi
} from './api';

//-----------------------------------------------------------------------------
// Employee Service
//-----------------------------------------------------------------------------

class EmployeeService extends BaseApiService {
  constructor() {
    super('/api/v1/employees');
  }

  /**
   * Get employees with filtering and pagination
   */
  async getEmployees(params?: EmployeeListParams): Promise<PaginatedEmployeeResponse> {
    return getEmployeesApi(params);
  }

  /**
   * Get employee by ID
   */
  async getEmployeeById(id: string): Promise<EmployeeResponse> {
    return getEmployeeByIdApi(id);
  }

  /**
   * Create a new employee
   */
  async createEmployee(data: EmployeeCreateData): Promise<EmployeeResponse> {
    return createEmployeeApi(data);
  }

  /**
   * Update an employee
   */
  async updateEmployee(id: string, data: EmployeeUpdateData): Promise<EmployeeResponse> {
    return updateEmployeeApi(id, data);
  }

  /**
   * Delete an employee
   */
  async deleteEmployee(id: string): Promise<EmployeeDeleteResponse> {
    return deleteEmployeeApi(id);
  }

  /**
   * Upload employee avatar
   */
  async uploadAvatar(employeeId: string, file: File): Promise<{ avatarUrl: string }> {
    return uploadAvatarApi(employeeId, file);
  }

  /**
   * Get available employees for project assignment
   */
  async getAvailableEmployees(params?: {
    startDate: string;
    endDate?: string;
    skillIds?: string[];
    requiredUtilization?: number;
  }): Promise<EmployeeResponse[]> {
    return getAvailableEmployeesApi(params);
  }

  /**
   * Suggest employees for project based on skills and availability
   */
  async suggestEmployees(params: EmployeeSuggestParams): Promise<EmployeeSuggestionsResponseWrapper> {
    return suggestEmployeesApi(params);
  }

  /**
   * Import employees from CSV/Excel file
   */
  async importEmployees(file: File): Promise<ImportEmployeesResponse> {
    return importEmployeesApi(file);
  }

  /**
   * Export employees to CSV/Excel
   */
  async exportEmployees(params?: {
    format: 'csv' | 'excel';
    filters?: EmployeeListParams;
  }): Promise<Blob> {
    return exportEmployeesApi(params);
  }

  /**
   * Update employee status
   */
  async updateEmployeeStatus(
    employeeId: string,
    data: EmployeeStatusUpdateData
  ): Promise<EmployeeResponse> {
    return updateEmployeeStatusApi(employeeId, data);
  }

  /**
   * Get employee project history
   */
  async getEmployeeProjectHistory(
    employeeId: string,
    params?: {
      page?: number;
      limit?: number;
    }
  ): Promise<{
    data: EmployeeProjectHistoryResponse[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    return getEmployeeProjectHistoryApi(employeeId, params);
  }

  /**
   * Combined method to get all employee details including skills and project history
   * This is a business logic method that combines multiple API calls
   */
  async getEmployeeDetails(employeeId: string): Promise<{
    employee: EmployeeResponse;
    skills: EmployeeSkillDetail[];
    projectHistory: EmployeeProjectHistoryResponse[];
  }> {
    // Tạo instance SkillService để sử dụng
    const skillServiceInstance = new SkillService();

    const [employee, skills, projectHistoryResponse] = await Promise.all([
      this.getEmployeeById(employeeId),
      skillServiceInstance.getEmployeeSkills(employeeId),
      this.getEmployeeProjectHistory(employeeId, { limit: 100 }),
    ]);

    return {
      employee,
      skills,
      projectHistory: projectHistoryResponse.data,
    };
  }
}

//-----------------------------------------------------------------------------
// Skill Service
//-----------------------------------------------------------------------------

class SkillService extends BaseApiService {
  constructor() {
    super('/api/v1/skills');
  }

  /**
   * Get all skill categories
   */
  async getSkillCategories(params?: {
    page?: number;
    limit?: number;
  }): Promise<{
    content: SkillCategoryResponse[];
    pageable: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    return getSkillCategoriesApi(params);
  }

  /**
   * Create a skill category
   */
  async createSkillCategory(data: {
    name: string;
    description?: string;
  }): Promise<SkillCategoryResponse> {
    return createSkillCategoryApi(data);
  }

  /**
   * Update a skill category
   */
  async updateSkillCategory(
    categoryId: string,
    data: {
      name?: string;
      description?: string;
    }
  ): Promise<SkillCategoryResponse> {
    return updateSkillCategoryApi(categoryId, data);
  }

  /**
   * Delete a skill category
   */
  async deleteSkillCategory(categoryId: string): Promise<void> {
    return deleteSkillCategoryApi(categoryId);
  }

  /**
   * Get all skills or skills by category
   */
  async getSkills(params?: {
    categoryId?: string;
    page?: number;
    limit?: number;
    keyword?: string;
  }): Promise<{
    content: SkillResponse[];
    pageable: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    return getSkillsApi(params);
  }

  /**
   * Create a skill
   */
  async createSkill(data: {
    name: string;
    description?: string;
    categoryId: string;
  }): Promise<SkillResponse> {
    return createSkillApi(data);
  }

  /**
   * Update a skill
   */
  async updateSkill(
    skillId: string,
    data: {
      name?: string;
      description?: string;
      categoryId?: string;
    }
  ): Promise<SkillResponse> {
    return updateSkillApi(skillId, data);
  }

  /**
   * Delete a skill
   */
  async deleteSkill(skillId: string): Promise<void> {
    return deleteSkillApi(skillId);
  }

  /**
   * Get all skills for an employee
   */
  async getEmployeeSkills(
    employeeId: string,
    params?: Omit<EmployeeSkillsParams, 'employeeId'>
  ): Promise<EmployeeSkillDetail[]> {
    try {
      const response = await getEmployeeSkillsApi(employeeId, params);
      
      // Kiểm tra nếu response là kiểu mới
      if ('content' in response) {
        // Chuyển đổi từ kiểu mới sang kiểu cũ
        const convertedSkills: EmployeeSkillDetail[] = response.content.map(skill => ({
          id: skill.skillId,
          name: skill.skillName,
          category: {
            id: 0, // Không có id trong API mới, gán giá trị mặc định
            name: skill.skillCategoryName
          },
          level: this.convertSkillLevel(skill.selfAssessmentLevel),
          years: skill.yearsExperience,
          description: skill.selfComment || undefined,
          isVerified: !!skill.leaderAssessmentLevel,
          lastUpdated: skill.updatedAt
        }));
        
        return convertedSkills;
      }
      
      // Kiểu cũ
      if ('skills' in response) {
        return response.skills;
      }
      
      // Nếu không khớp với bất kỳ định dạng nào
      console.error('Unknown response format from getEmployeeSkills API', response);
      return [];
    } catch (error) {
      console.error('Error in getEmployeeSkills:', error);
      return [];
    }
  }

  /**
   * Convert skill level string to standardized SkillLevel type
   */
  private convertSkillLevel(level: string): SkillLevel {
    switch (level.toLowerCase()) {
      case 'beginner':
      case 'basic':
        return 'Basic';
      case 'intermediate':
        return 'Intermediate';
      case 'advanced':
        return 'Advanced';
      case 'expert':
        return 'Expert';
      default:
        return 'Basic'; // Default value
    }
  }

  /**
   * Add or update a skill for an employee
   */
  async addOrUpdateEmployeeSkill(
    employeeId: string,
    data: EmployeeSkillCreateData
  ): Promise<EmployeeSkillResponse> {
    return addOrUpdateEmployeeSkillApi(employeeId, data);
  }

  /**
   * Delete an employee skill
   */
  async deleteEmployeeSkill(
    employeeId: string,
    skillId: string
  ): Promise<EmployeeSkillDeleteResponse> {
    return deleteEmployeeSkillApi(employeeId, skillId);
  }

  /**
   * Get skill matrix (all skills and categories in a structured format)
   * This is a business logic method that combines and transforms API data
   */
  async getSkillMatrix(): Promise<{
    categories: (SkillCategoryResponse & { skills: SkillResponse[] })[];
  }> {
    const [categoriesResponse, skillsResponse] = await Promise.all([
      this.getSkillCategories({ limit: 100 }),
      this.getSkills({ limit: 1000 }),
    ]);

    const categories = categoriesResponse.content.map(category => ({
      ...category,
      skills: skillsResponse.content.filter(skill => skill.category.id === category.id),
    }));

    return { categories };
  }
}

//-----------------------------------------------------------------------------
// Team Service
//-----------------------------------------------------------------------------

class TeamService extends BaseApiService {
  constructor() {
    super('/api/v1/teams');
  }

  /**
   * Get all teams
   */
  async getTeams(params?: {
    page?: number;
    limit?: number;
    keyword?: string;
  }): Promise<{
    content: TeamInfo[];
    pageable: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    return getTeamsApi(params);
  }

  /**
   * Get team by ID
   */
  async getTeamById(id: string): Promise<TeamInfo> {
    return getTeamByIdApi(id);
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
  async updateTeam(id: string, data: TeamUpdateData): Promise<TeamInfo> {
    return updateTeamApi(id, data);
  }

  /**
   * Delete a team
   */
  async deleteTeam(id: string): Promise<void> {
    return deleteTeamApi(id);
  }

  /**
   * Get team members
   */
  async getTeamMembers(
    teamId: string,
    params?: {
      page?: number;
      limit?: number;
    }
  ): Promise<{
    data: TeamMemberResponse[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    return getTeamMembersApi(teamId, params);
  }

  /**
   * Add a member to a team
   */
  async addTeamMember(
    teamId: string,
    data: {
      employeeId: string;
      isLeader?: boolean;
    }
  ): Promise<TeamMemberResponse> {
    return addTeamMemberApi(teamId, data);
  }

  /**
   * Remove a member from a team
   */
  async removeTeamMember(
    teamId: string,
    employeeId: string
  ): Promise<void> {
    return removeTeamMemberApi(teamId, employeeId);
  }

  /**
   * Set team leader
   */
  async setTeamLeader(
    teamId: string,
    employeeId: string
  ): Promise<TeamInfo> {
    return setTeamLeaderApi(teamId, { employeeId });
  }

  /**
   * Get team details including members and leader
   * This is a business logic method that combines multiple API calls
   */
  async getTeamDetails(teamId: string): Promise<{
    team: TeamInfo;
    members: TeamMemberResponse[];
    leader?: TeamMemberResponse;
  }> {
    const [team, membersResponse] = await Promise.all([
      this.getTeamById(teamId),
      this.getTeamMembers(teamId, { limit: 100 }),
    ]);

    const members = membersResponse.data;
    const leader = members.find(member => member.isLeader);

    return {
      team,
      members,
      leader,
    };
  }
}

// Create and export service instances
export const employeeService = new EmployeeService();
export const skillService = new SkillService();
export const teamService = new TeamService();

// Export default combined HRM service
export default {
  employees: employeeService,
  skills: skillService,
  teams: teamService,
}; 
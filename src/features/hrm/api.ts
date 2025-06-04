/**
 * HRM API Module
 * 
 * This module serves as an adapter layer between the application and the REST API.
 * It provides functions for direct API communication with the HRM endpoints.
 * Each function implements a specific API call and handles the response formatting.
 */

import apiClient from '../../services/core/axios';
import { AxiosRequestConfig } from 'axios';
import {
  // Employee types
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
  
  // Skill types
  SkillCategoryResponse,
  SkillResponse,
  EmployeeSkillResponse,
  EmployeeSkillsResponse,
  EmployeeSkillsParams,
  EmployeeSkillCreateData,
  EmployeeSkillDeleteResponse,
  NewPaginatedEmployeeSkillsResponse,
  
  // Team types
  TeamInfo,
  TeamCreateData,
  TeamUpdateData,
  TeamMemberResponse,
  
  // Suggestion types
  EmployeeSuggestParams
} from './types';

//-----------------------------------------------------------------------------
// Employee API Functions
//-----------------------------------------------------------------------------

/**
 * Get employees with filtering and pagination
 */
export const getEmployees = async (params?: EmployeeListParams, config?: AxiosRequestConfig): Promise<PaginatedEmployeeResponse> => {
  return apiClient.get('/api/v1/employees', {
    ...config,
    params
  });
};

/**
 * Get employee by ID
 */
export const getEmployeeById = async (id: string, config?: AxiosRequestConfig): Promise<EmployeeResponse> => {
  return apiClient.get(`/api/v1/employees/${id}`, config);
};

/**
 * Get employee by ID (alias for getEmployeeById for compatibility)
 */
export const getEmployee = async (id: number, config?: AxiosRequestConfig): Promise<EmployeeResponse> => {
  return getEmployeeById(id.toString(), config);
};

/**
 * Create a new employee
 */
export const createEmployee = async (data: EmployeeCreateData, config?: AxiosRequestConfig): Promise<EmployeeResponse> => {
  return apiClient.post('/api/v1/employees', data, config);
};

/**
 * Update an employee
 * Accepts either a string or number ID, and partial data for update
 */
export const updateEmployee = async (
  id: string | number, 
  data: EmployeeUpdateData | Partial<EmployeeCreateData>, 
  config?: AxiosRequestConfig
): Promise<EmployeeResponse> => {
  const idString = typeof id === 'number' ? id.toString() : id;
  return apiClient.put(`/api/v1/employees/${idString}`, data, config);
};

/**
 * Delete an employee
 */
export const deleteEmployee = async (id: string, config?: AxiosRequestConfig): Promise<EmployeeDeleteResponse> => {
  return apiClient.delete(`/api/v1/employees/${id}`, config);
};

/**
 * Upload employee avatar
 */
export const uploadAvatar = async (employeeId: string, file: File, config?: AxiosRequestConfig): Promise<{ avatarUrl: string }> => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  const axiosConfig: AxiosRequestConfig = {
    ...config,
    headers: {
      ...config?.headers,
      'Content-Type': 'multipart/form-data'
    }
  };
  
  return apiClient.post(`/api/v1/employees/${employeeId}/avatar`, formData, axiosConfig);
};

/**
 * Get available employees for project assignment
 */
export const getAvailableEmployees = async (params?: {
  startDate: string;
  endDate?: string;
  skillIds?: string[];
  requiredUtilization?: number;
}, config?: AxiosRequestConfig): Promise<EmployeeResponse[]> => {
  return apiClient.get('/api/v1/employees/available', {
    ...config,
    params
  });
};

/**
 * Suggest employees for project based on skills and availability
 */
export const suggestEmployees = async (
  params: EmployeeSuggestParams, 
  config?: AxiosRequestConfig
): Promise<EmployeeSuggestionsResponseWrapper> => {
  return apiClient.get('/api/v1/employees/search/suggest', {
    ...config,
    params
  });
};

/**
 * Import employees from CSV/Excel file
 */
export const importEmployees = async (file: File, config?: AxiosRequestConfig): Promise<ImportEmployeesResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const axiosConfig: AxiosRequestConfig = {
    ...config,
    headers: {
      ...config?.headers,
      'Content-Type': 'multipart/form-data'
    }
  };
  
  return apiClient.post('/api/v1/employees/import', formData, axiosConfig);
};

/**
 * Export employees to CSV/Excel
 */
export const exportEmployees = async (params?: {
  format: 'csv' | 'excel';
  filters?: EmployeeListParams;
}, config?: AxiosRequestConfig): Promise<Blob> => {
  return apiClient.get('/api/v1/employees/export', {
    ...config,
    params,
    responseType: 'blob'
  });
};

/**
 * Update employee status
 */
export const updateEmployeeStatus = async (
  employeeId: string,
  data: EmployeeStatusUpdateData,
  config?: AxiosRequestConfig
): Promise<EmployeeResponse> => {
  return apiClient.put(`/api/v1/employees/${employeeId}/status`, data, config);
};

/**
 * Get employee project history
 */
export const getEmployeeProjectHistory = async (
  employeeId: string,
  params?: {
    page?: number;
    limit?: number;
  },
  config?: AxiosRequestConfig
): Promise<{
  data: EmployeeProjectHistoryResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> => {
  return apiClient.get(`/api/v1/employees/${employeeId}/projects`, {
    ...config,
    params
  });
};

//-----------------------------------------------------------------------------
// Skill API Functions
//-----------------------------------------------------------------------------

/**
 * Get all skill categories
 */
export const getSkillCategories = async (params?: {
  page?: number;
  limit?: number;
}, config?: AxiosRequestConfig): Promise<{
  content: SkillCategoryResponse[];
  pageable: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> => {
  return apiClient.get('/api/v1/skill-categories', {
    ...config,
    params
  });
};

/**
 * Create a skill category
 */
export const createSkillCategory = async (data: {
  name: string;
  description?: string;
}, config?: AxiosRequestConfig): Promise<SkillCategoryResponse> => {
  return apiClient.post('/api/v1/skill-categories', data, config);
};

/**
 * Update a skill category
 */
export const updateSkillCategory = async (
  categoryId: string,
  data: {
    name?: string;
    description?: string;
  },
  config?: AxiosRequestConfig
): Promise<SkillCategoryResponse> => {
  return apiClient.put(`/api/v1/skill-categories/${categoryId}`, data, config);
};

/**
 * Delete a skill category
 */
export const deleteSkillCategory = async (categoryId: string, config?: AxiosRequestConfig): Promise<void> => {
  return apiClient.delete(`/api/v1/skill-categories/${categoryId}`, config);
};

/**
 * Get all skills or skills by category
 */
export const getSkills = async (params?: {
  categoryId?: number | string;
  page?: number;
  limit?: number;
  keyword?: string;
}, config?: AxiosRequestConfig): Promise<{
  content: SkillResponse[];
  pageable: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> => {
  // Ensure categoryId is a string if provided
  const finalParams = params ? {
    ...params,
    categoryId: params.categoryId !== undefined ? params.categoryId.toString() : undefined
  } : undefined;
  
  return apiClient.get('/api/v1/skills', {
    ...config,
    params: finalParams
  });
};

/**
 * Create a skill
 */
export const createSkill = async (data: {
  name: string;
  description?: string;
  categoryId: string;
}, config?: AxiosRequestConfig): Promise<SkillResponse> => {
  return apiClient.post('/api/v1/skills', data, config);
};

/**
 * Update a skill
 */
export const updateSkill = async (
  skillId: string,
  data: {
    name?: string;
    description?: string;
    categoryId?: string;
  },
  config?: AxiosRequestConfig
): Promise<SkillResponse> => {
  return apiClient.put(`/api/v1/skills/${skillId}`, data, config);
};

/**
 * Delete a skill
 */
export const deleteSkill = async (skillId: string, config?: AxiosRequestConfig): Promise<void> => {
  return apiClient.delete(`/api/v1/skills/${skillId}`, config);
};

/**
 * Get all skills for an employee
 */
export const getEmployeeSkills = async (
  employeeId: string,
  params?: Omit<EmployeeSkillsParams, 'employeeId'>,
  config?: AxiosRequestConfig
): Promise<NewPaginatedEmployeeSkillsResponse | EmployeeSkillsResponse> => {
  const response = await apiClient.get(`/api/v1/employees/${employeeId}/skills`, {
    ...config,
    params
  });
  
  // Chuyển đổi response.data thành kiểu phù hợp
  if (response.data && 'content' in response.data) {
    // Đây là cấu trúc mới
    return response.data as NewPaginatedEmployeeSkillsResponse;
  }
  
  // Đây là cấu trúc cũ
  return response.data as EmployeeSkillsResponse;
};

/**
 * Add or update a skill for an employee
 */
export const addOrUpdateEmployeeSkill = async (
  employeeId: string,
  data: EmployeeSkillCreateData,
  config?: AxiosRequestConfig
): Promise<EmployeeSkillResponse> => {
  return apiClient.post(`/api/v1/employees/${employeeId}/skills`, data, config);
};

/**
 * Delete a skill from an employee's profile
 */
export const deleteEmployeeSkill = async (
  employeeId: string,
  skillId: string,
  config?: AxiosRequestConfig
): Promise<EmployeeSkillDeleteResponse> => {
  return apiClient.delete(`/api/v1/employees/${employeeId}/skills/${skillId}`, config);
};

//-----------------------------------------------------------------------------
// Team API Functions
//-----------------------------------------------------------------------------

/**
 * Get all teams
 */
export const getTeams = async (params?: {
  page?: number;
  limit?: number;
  keyword?: string;
}, config?: AxiosRequestConfig): Promise<{
  content: TeamInfo[];
  pageable: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> => {
  return apiClient.get('/api/v1/teams', {
    ...config,
    params
  });
};

/**
 * Get team by ID
 */
export const getTeamById = async (id: string, config?: AxiosRequestConfig): Promise<TeamInfo> => {
  return apiClient.get(`/api/v1/teams/${id}`, config);
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
export const updateTeam = async (id: string, data: TeamUpdateData, config?: AxiosRequestConfig): Promise<TeamInfo> => {
  return apiClient.put(`/api/v1/teams/${id}`, data, config);
};

/**
 * Delete a team
 */
export const deleteTeam = async (id: string, config?: AxiosRequestConfig): Promise<void> => {
  return apiClient.delete(`/api/v1/teams/${id}`, config);
};

/**
 * Get team members
 */
export const getTeamMembers = async (
  teamId: string,
  params?: {
    page?: number;
    limit?: number;
  },
  config?: AxiosRequestConfig
): Promise<{
  data: TeamMemberResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> => {
  return apiClient.get(`/api/v1/teams/${teamId}/members`, {
    ...config,
    params
  });
};

/**
 * Add a member to a team
 */
export const addTeamMember = async (
  teamId: string,
  data: {
    employeeId: string;
    isLeader?: boolean;
  },
  config?: AxiosRequestConfig
): Promise<TeamMemberResponse> => {
  return apiClient.post(`/api/v1/teams/${teamId}/members`, data, config);
};

/**
 * Remove a member from a team
 */
export const removeTeamMember = async (
  teamId: string,
  employeeId: string,
  config?: AxiosRequestConfig
): Promise<void> => {
  return apiClient.delete(`/api/v1/teams/${teamId}/members/${employeeId}`, config);
};

/**
 * Set team leader
 */
export const setTeamLeader = async (
  teamId: string,
  data: {
    employeeId: string;
  },
  config?: AxiosRequestConfig
): Promise<TeamInfo> => {
  return apiClient.put(`/api/v1/teams/${teamId}/leader`, data, config);
}; 
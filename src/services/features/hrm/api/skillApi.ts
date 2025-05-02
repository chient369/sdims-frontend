import apiClient from '../../../core/axios';
import { AxiosRequestConfig } from 'axios';

export interface SkillCategoryResponse {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SkillResponse {
  id: number;
  name: string;
  category: {
    id: number;
    name: string;
  };
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeSkillResponse {
  employeeId: number;
  employeeCode: string;
  name: string;
  position: string;
  skills: Array<{
    id: number;
    name: string;
    category: {
      id: number;
      name: string;
    };
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    years: number;
    description?: string;
    isVerified: boolean;
    verifiedBy?: {
      id: number;
      name: string;
    };
    lastUpdated: string;
  }>;
}

export interface EmployeeSkillCreateData {
  skillId: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  years: number;
  description?: string;
}

/**
 * Get skill categories
 */
export const getSkillCategories = async (config?: AxiosRequestConfig): Promise<SkillCategoryResponse[]> => {
  return apiClient.get('/api/v1/skill-categories', config);
};

/**
 * Create skill category (admin only)
 */
export const createSkillCategory = async (data: { name: string; description?: string }, config?: AxiosRequestConfig): Promise<SkillCategoryResponse> => {
  return apiClient.post('/api/v1/admin/skill-categories', data, config);
};

/**
 * Update skill category (admin only)
 */
export const updateSkillCategory = async (id: number, data: { name: string; description?: string }, config?: AxiosRequestConfig): Promise<SkillCategoryResponse> => {
  return apiClient.put(`/api/v1/admin/skill-categories/${id}`, data, config);
};

/**
 * Delete skill category (admin only)
 */
export const deleteSkillCategory = async (id: number, config?: AxiosRequestConfig): Promise<void> => {
  return apiClient.delete(`/api/v1/admin/skill-categories/${id}`, config);
};

/**
 * Get skills
 */
export const getSkills = async (params?: { categoryId?: number; keyword?: string }, config?: AxiosRequestConfig): Promise<SkillResponse[]> => {
  return apiClient.get('/api/v1/skills', {
    ...config,
    params
  });
};

/**
 * Create skill (admin only)
 */
export const createSkill = async (data: { name: string; categoryId: number; description?: string }, config?: AxiosRequestConfig): Promise<SkillResponse> => {
  return apiClient.post('/api/v1/admin/skills', data, config);
};

/**
 * Update skill (admin only)
 */
export const updateSkill = async (id: number, data: { name: string; categoryId: number; description?: string }, config?: AxiosRequestConfig): Promise<SkillResponse> => {
  return apiClient.put(`/api/v1/admin/skills/${id}`, data, config);
};

/**
 * Delete skill (admin only)
 */
export const deleteSkill = async (id: number, config?: AxiosRequestConfig): Promise<void> => {
  return apiClient.delete(`/api/v1/admin/skills/${id}`, config);
};

/**
 * Get employee skills
 */
export const getEmployeeSkills = async (
  employeeId: number, 
  params?: { categoryId?: number; keyword?: string; sortBy?: string; sortDir?: 'asc' | 'desc' },
  config?: AxiosRequestConfig
): Promise<EmployeeSkillResponse> => {
  return apiClient.get(`/api/v1/employees/${employeeId}/skills`, {
    ...config,
    params
  });
};

/**
 * Add/update employee skills
 */
export const updateEmployeeSkills = async (
  employeeId: number,
  data: { skills: EmployeeSkillCreateData[] },
  config?: AxiosRequestConfig
): Promise<EmployeeSkillResponse> => {
  return apiClient.post(`/api/v1/employees/${employeeId}/skills`, data, config);
};

/**
 * Delete employee skill
 */
export const deleteEmployeeSkill = async (
  employeeId: number,
  skillId: number,
  config?: AxiosRequestConfig
): Promise<void> => {
  return apiClient.delete(`/api/v1/employees/${employeeId}/skills/${skillId}`, config);
}; 
import { BaseApiService } from '../../../core/baseApi';
import {
  SkillCategoryResponse,
  SkillResponse,
  EmployeeSkillResponse,
  EmployeeSkillCreateData,
  getSkillCategories as getSkillCategoriesApi,
  createSkillCategory as createSkillCategoryApi,
  updateSkillCategory as updateSkillCategoryApi,
  deleteSkillCategory as deleteSkillCategoryApi,
  getSkills as getSkillsApi,
  createSkill as createSkillApi,
  updateSkill as updateSkillApi,
  deleteSkill as deleteSkillApi,
  getEmployeeSkills as getEmployeeSkillsApi,
  updateEmployeeSkills as updateEmployeeSkillsApi,
  deleteEmployeeSkill as deleteEmployeeSkillApi,
} from '../api';

/**
 * Service for skill management operations
 */
class SkillService extends BaseApiService {
  constructor() {
    super('/api/v1/skills');
  }
  
  /**
   * Get all skills
   */
  async getSkills(params?: { categoryId?: number; keyword?: string }): Promise<SkillResponse[]> {
    return getSkillsApi(params);
  }
  
  /**
   * Create a new skill (admin only)
   */
  async createSkill(data: { name: string; categoryId: number; description?: string }): Promise<SkillResponse> {
    return createSkillApi(data);
  }
  
  /**
   * Update a skill (admin only)
   */
  async updateSkill(id: number, data: { name: string; categoryId: number; description?: string }): Promise<SkillResponse> {
    return updateSkillApi(id, data);
  }
  
  /**
   * Delete a skill (admin only)
   */
  async deleteSkill(id: number): Promise<void> {
    return deleteSkillApi(id);
  }
  
  /**
   * Get all skill categories
   */
  async getSkillCategories(): Promise<SkillCategoryResponse[]> {
    return getSkillCategoriesApi();
  }
  
  /**
   * Create a new skill category (admin only)
   */
  async createSkillCategory(data: { name: string; description?: string }): Promise<SkillCategoryResponse> {
    return createSkillCategoryApi(data);
  }
  
  /**
   * Update a skill category (admin only)
   */
  async updateSkillCategory(id: number, data: { name: string; description?: string }): Promise<SkillCategoryResponse> {
    return updateSkillCategoryApi(id, data);
  }
  
  /**
   * Delete a skill category (admin only)
   */
  async deleteSkillCategory(id: number): Promise<void> {
    return deleteSkillCategoryApi(id);
  }
  
  /**
   * Get employee skills
   */
  async getEmployeeSkills(
    employeeId: number,
    params?: { categoryId?: number; keyword?: string; sortBy?: string; sortDir?: 'asc' | 'desc' }
  ): Promise<EmployeeSkillResponse> {
    return getEmployeeSkillsApi(employeeId, params);
  }
  
  /**
   * Update employee skills
   */
  async updateEmployeeSkills(
    employeeId: number,
    data: { skills: EmployeeSkillCreateData[] }
  ): Promise<EmployeeSkillResponse> {
    return updateEmployeeSkillsApi(employeeId, data);
  }
  
  /**
   * Delete employee skill
   */
  async deleteEmployeeSkill(
    employeeId: number,
    skillId: number
  ): Promise<void> {
    return deleteEmployeeSkillApi(employeeId, skillId);
  }
  
  /**
   * Get skills by category (convenience method)
   */
  async getSkillsByCategory(categoryId: number): Promise<SkillResponse[]> {
    return getSkillsApi({ categoryId });
  }
  
  /**
   * Search skills by keyword (convenience method)
   */
  async searchSkills(keyword: string): Promise<SkillResponse[]> {
    return getSkillsApi({ keyword });
  }
}

export const skillService = new SkillService(); 
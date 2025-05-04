/**
 * Types Module for HRM Feature
 * 
 * This module contains all type definitions for the HRM feature.
 * Types are organized by domain (employees, skills, teams) and used throughout the feature.
 */

//-----------------------------------------------------------------------------
// Employee Types
//-----------------------------------------------------------------------------

/**
 * Parameters for listing employees
 */
export interface EmployeeListParams {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: 'active' | 'inactive' | 'on_leave';
  skillIds?: string[];
  teamId?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

/**
 * Employee data structure
 */
export interface EmployeeResponse {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  position?: string;
  department?: string;
  hireDate: string;
  status: 'active' | 'inactive' | 'on_leave';
  role?: string;
  avatarUrl?: string;
  team?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Data for creating a new employee
 */
export interface EmployeeCreateData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  position?: string;
  department?: string;
  hireDate: string;
  status: 'active' | 'inactive' | 'on_leave';
  teamId?: string;
  role?: string;
}

/**
 * Data for updating an employee
 */
export interface EmployeeUpdateData extends Partial<EmployeeCreateData> {}

/**
 * Data for updating an employee's status
 */
export interface EmployeeStatusUpdateData {
  status: 'active' | 'inactive' | 'on_leave';
  reason?: string;
}

/**
 * Response for employee import operation
 */
export interface ImportEmployeesResponse {
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  failures?: {
    rowNumber: number;
    errors: string[];
  }[];
}

/**
 * Employee project history data
 */
export interface EmployeeProjectHistoryResponse {
  id: string;
  projectId: string;
  projectName: string;
  startDate: string;
  endDate?: string;
  role: string;
  utilization: number; // percentage 0-100
  performanceRating?: number; // 1-5
  feedback?: string;
}

//-----------------------------------------------------------------------------
// Skill Types
//-----------------------------------------------------------------------------

/**
 * Skill category data structure
 */
export interface SkillCategoryResponse {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Skill data structure
 */
export interface SkillResponse {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  categoryName: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Employee skill data structure
 */
export interface EmployeeSkillResponse {
  id: string;
  employeeId: string;
  skillId: string;
  skillName: string;
  skillCategoryId: string;
  skillCategoryName: string;
  proficiencyLevel: 1 | 2 | 3 | 4 | 5;
  yearsOfExperience?: number;
  certifications?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Data for creating/updating employee skills
 */
export interface EmployeeSkillCreateData {
  skillId: string;
  proficiencyLevel: 1 | 2 | 3 | 4 | 5;
  yearsOfExperience?: number;
  certifications?: string[];
  notes?: string;
}

//-----------------------------------------------------------------------------
// Team Types
//-----------------------------------------------------------------------------

/**
 * Team data structure
 */
export interface TeamInfo {
  id: string;
  name: string;
  description?: string;
  leaderId?: string;
  leaderName?: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Data for creating a new team
 */
export interface TeamCreateData {
  name: string;
  description?: string;
  leaderId?: string;
}

/**
 * Data for updating a team
 */
export interface TeamUpdateData extends Partial<TeamCreateData> {}

/**
 * Team member data structure
 */
export interface TeamMemberResponse {
  id: string;
  employeeId: string;
  teamId: string;
  firstName: string;
  lastName: string;
  email: string;
  position?: string;
  avatarUrl?: string;
  isLeader: boolean;
  joinedAt: string;
} 
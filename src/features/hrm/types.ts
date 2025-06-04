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
 * Parameters for listing employees from API-HRM-001
 */
export interface EmployeeListParams {
  page?: number;
  size?: number;
  keyword?: string;
  status?: 'Allocated' | 'Available' | 'EndingSoon' | 'OnLeave' | 'Resigned' | 'PartiallyAllocated';
  skillIds?: number[];
  teamId?: number;
  position?: string;
  minExperience?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  marginStatus?: 'Red' | 'Yellow' | 'Green';
}

/**
 * Pagination information from API-HRM-001
 */
export interface PageableResponse {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  sort: string;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Paginated employee response
 */
export interface PaginatedEmployeeResponse {
  status: string;
  code: number;
  data: {
    content: NewEmployeeApiResponse[];
    pageable: PageableResponse;
  };
}

/**
 * Employee data structure based on API-HRM-001/002/004
 */
export interface EmployeeResponse {
  id: number;
  employeeCode: string;
  name: string;
  email: string;
  position: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  joinDate?: string;
  team: {
    id: number;
    name: string;
  };
  status: 'Allocated' | 'Available' | 'EndingSoon' | 'OnLeave' | 'Resigned' | 'PartiallyAllocated';
  currentProject?: string;
  utilization: number;
  endDate?: string;
  skills?: EmployeeSkillBrief[];
  marginStatus?: 'Red' | 'Yellow' | 'Green';
  emergencyContact?: {
    name: string;
    phone: string;
    relation?: string;
  };
  avatar?: string;
  userId?: number | null;
  note?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  department?: string;
  hireDate?: string;
  role?: string;
  avatarUrl?: string;
  allocations?: EmployeeAllocation[];
  evaluations?: EmployeeEvaluation[];
}

/**
 * Employee allocation (project assignment) data
 */
export interface EmployeeAllocation {
  id: number;
  project: {
    id: number;
    name: string;
    evaluation?: {
      rating: number; // 1-5
      feedback?: string;
      evaluator?: string;
      evaluationDate?: string;
    };
  };
  contractId?: number;
  contractCode?: string;
  startDate: string;
  endDate?: string;
  allocation: number; // percentage
  position: string;
  role?: string;
  billingRate?: number;
  status: 'Active' | 'Completed' | 'Upcoming';
}

/**
 * Employee evaluation information from API-HRM-003
 */
export interface EmployeeEvaluation {
  id: number;
  period: string;
  performanceScore: number;
  evaluator: string;
  evaluationDate: string;
  summary: string;
}

/**
 * Employee delete response structure, matching API-HRM-005 documentation
 */
export interface EmployeeDeleteResponse {
  id: string;
  employeeCode: string;
  name: string;
  deletedAt: string;
  deletedBy: string;
}

/**
 * Matching skill for employee suggestions
 */
export interface MatchingSkill {
  id: string;
  name: string;
  level: string;
  years: number;
  required: boolean;
}

/**
 * Missing skill for employee suggestions
 */
export interface MissingSkill {
  id: string;
  name: string;
  required: boolean;
}

/**
 * Employee suggestion response structure, matching API-HRM-006 documentation
 */
export interface EmployeeSuggestionResponse {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  position: string;
  team: {
    id: string;
    name: string;
  };
  status: string;
  endDate?: string;
  matchingScore: number;
  matchingSkills: MatchingSkill[];
  missingSkills: MissingSkill[];
}

/**
 * Employee suggestion response wrapper
 */
export interface EmployeeSuggestionsResponseWrapper {
  suggestions: EmployeeSuggestionResponse[];
}

/**
 * Data for creating a new employee based on API-HRM-002.md
 */
export interface EmployeeCreateData {
  employeeCode: string;
  firstName: string;
  lastName: string;
  companyEmail: string;
  position: string | null;
  teamId?: number;
  phoneNumber?: string | null;
  address?: string | null;
  birthDate?: string | null;
  hireDate?: string | null;
  emergencyContact?: string | null;
  currentStatus: string | null;
  profilePictureUrl?: string | null;
  userId?: number | null;
  internalAccount?: string | null;
  reportingLeaderId?: number | null;
}

/**
 * Data for updating an employee
 */
export interface EmployeeUpdateData extends Partial<EmployeeCreateData> {
  currentProject?: string;
  utilization?: number;
  endDate?: string;
}

/**
 * Data for updating an employee's status
 */
export interface EmployeeStatusUpdateData {
  status: 'Allocated' | 'Available' | 'EndingSoon' | 'OnLeave' | 'Resigned' | 'PartiallyAllocated';
  reason?: string;
  allocations?: {
    id?: number;
    projectId?: number;
    projectName: string;
    startDate: string;
    endDate?: string;
    allocation: number; // tỷ lệ phân bổ (%)
    position?: string;
  }[];
  resignationDate?: string; // Cho status 'Resigned'
  leaveStartDate?: string;  // Cho status 'OnLeave'
  leaveEndDate?: string;    // Cho status 'OnLeave'
}

/**
 * Data structure for updating employee status and creating a status log,
 * matching POST /employee-status-logs/employees/{employeeId}/status
 * and also PUT /employees/{id}/status from hrm-api.yaml
 */
export interface StatusUpdateRequest {
  status: string; // e.g., 'Available', 'Allocated', 'On Leave', 'Resigned'
  projectName?: string | null;
  clientName?: string | null;
  startDate?: string | null; // Format: date (YYYY-MM-DD) - For project allocation or leave
  expectedEndDate?: string | null; // Format: date (YYYY-MM-DD) - For project allocation, leave, or resignation
  allocationPercentage?: number | null; // 0-100 for project allocation
  isBillable?: boolean | null; // For project allocation
  contractId?: number | null;
  note?: string | null;
}

/**
 * Response for employee import operation
 */
export interface ImportEmployeesResponse {
  total: number;
  success: number;
  failed: number;
  created: number;
  updated: number;
  skipped: number;
  errors?: {
    row: number;
    employeeCode: string;
    errors: {
      field: string;
      message: string;
    }[];
  }[];
  created_employees?: {
    id: number;
    employeeCode: string;
    name: string;
  }[];
}

/**
 * Employee project history data - should align with ProjectHistoryDto from API
 */
export interface EmployeeProjectHistoryResponse {
  id: number;
  employeeId?: number;
  employeeName?: string;
  projectName: string;
  clientName?: string;
  role?: string;
  startDate: string;
  endDate?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * New Employee response structure from API
 */
export interface NewEmployeeApiResponse {
  id: number;
  userId: number | null;
  employeeCode: string;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  hireDate: string;
  companyEmail: string;
  internalAccount: string;
  address: string | null;
  phoneNumber: string | null;
  emergencyContact: string | null;
  position: string;
  team: {
    id: number;
    name: string;
  };
  reportingLeaderId: number | null;
  reportingLeaderName: string | null;
  currentStatus: string;
  statusUpdatedAt: string;
  profilePictureUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Paginated employee response with new API structure
 */
export interface NewPaginatedEmployeeResponse {
  data: {
    content: NewEmployeeApiResponse[];
    pageable: PageableResponse;
  };
}

//-----------------------------------------------------------------------------
// Skill Types
//-----------------------------------------------------------------------------

/**
 * Skill category data structure from API-HRM-009/010/011
 */
export interface SkillCategoryResponse {
  id: number;
  name: string;
  description?: string;
  active: boolean;
  skillCount?: number; // Returned in list response
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

/**
 * Data for creating a skill category (API-HRM-010)
 */
export interface SkillCategoryCreateData {
  name: string;
  description?: string;
  active?: boolean;
  sortOrder?: number;
}

/**
 * Data for updating a skill category (API-HRM-011)
 */
export interface SkillCategoryUpdateData {
  name?: string;
  description?: string;
  active?: boolean;
  sortOrder?: number;
}

/**
 * Skill data structure from API-HRM-013
 */
export interface SkillResponse {
  id: number;
  name: string;
  description?: string;
  category: {
    id: number;
    name: string;
  };
  active: boolean;
  popularity?: number;
  employeeCount?: number;
  levels?: SkillLevelDefinition[];
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

/**
 * Skill level definition from API-HRM-014
 */
export interface SkillLevelDefinition {
  id: number;
  name: string;
  description?: string;
  sortOrder: number;
  delete?: boolean; // Used in update requests API-HRM-015
}

/**
 * Data for creating a skill (API-HRM-014)
 */
export interface SkillCreateData {
  name: string;
  description?: string;
  categoryId: number;
  active?: boolean;
  levels?: {
    name: string;
    description?: string;
    sortOrder?: number;
  }[];
}

/**
 * Data for updating a skill (API-HRM-015)
 */
export interface SkillUpdateData {
  name?: string;
  description?: string;
  categoryId?: number;
  active?: boolean;
  levels?: {
    id?: number;
    name: string;
    description?: string;
    sortOrder?: number;
    delete?: boolean;
  }[];
}

/**
 * Parameters for listing skills from API-HRM-013
 */
export interface SkillListParams {
  keyword?: string;
  categoryId?: number | string;
  active?: boolean;
  page?: number;
  size?: number;
  sortBy?: 'id' | 'name' | 'category' | 'popularity';
  sortDir?: 'asc' | 'desc';
}

/**
 * Parameters for getting employee skills from API-HRM-017
 */
export interface EmployeeSkillsParams {
  employeeId: number | string;
  categoryId?: number | string;
  keyword?: string;
  sortBy?: 'skill' | 'level' | 'years' | 'lastUpdated';
  sortDir?: 'asc' | 'desc';
}

/**
 * Response for getting employee skills list from API-HRM-017
 */
export interface EmployeeSkillsResponse {
  employeeId: number;
  employeeCode: string;
  name: string;
  position: string;
  skills: EmployeeSkillDetail[];
}

/**
 * Employee skill level
 */
export type SkillLevel = 'Basic' | 'Intermediate' | 'Advanced' | 'Expert';

/**
 * Detailed employee skill structure from API-HRM-017
 */
export interface EmployeeSkillDetail {
  id: number;
  skillId: number;
  name: string;
  category: {
    id: number;
    name: string;
  };
  level: SkillLevel;
  years: number;
  description?: string;
  isVerified: boolean;
  verifiedBy?: {
    id: number;
    name: string;
  };
  lastUpdated?: string;
  leaderAssessmentLevel?: SkillLevel | null;
  leaderComment?: string | null;
}

/**
 * Employee skill data structure from API-HRM-018
 */
export interface EmployeeSkillResponse {
  employeeId: number;
  employeeCode: string;
  name: string;
  employeeSkillId: number;
  skill: {
    id: number;
    name: string;
    category: {
      id: number;
      name: string;
    }
  };
  level: SkillLevel;
  years: number;
  description?: string;
  certifications?: string[];
  notes?: string;
  isVerified?: boolean;
  verifiedBy?: {
    id: number;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Simplified skill data for employee list responses
 */
export interface EmployeeSkillBrief {
  id: number;
  name: string;
  level: string;
  years: number;
}

/**
 * Data for creating/updating employee skills based on API-HRM-018
 * This should align with EmployeeSkillRequest from hrm-api.yaml for self-assessment fields.
 */
export interface EmployeeSkillCreateData {
  skillId: number;
  selfAssessmentLevel: string | null;
  yearsExperience: number | null;
  selfComment?: string | null;
  leaderAssessmentLevel?: string | null;
  leaderComment?: string | null;
}

/**
 * Response for employee skill delete operation (API-HRM-019)
 */
export interface EmployeeSkillDeleteResponse {
  employeeId: number;
  employeeCode: string;
  name: string;
  deletedSkill: {
    id: number;
    name: string;
    category: {
      id: number;
      name: string;
    }
  }
}

//-----------------------------------------------------------------------------
// Team Types
//-----------------------------------------------------------------------------

/**
 * Team data structure
 */
export interface TeamInfo {
  id: number | string;
  name: string;
  description?: string;
  leaderId?: number;
  leaderName?: string;
  memberCount: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Data for creating a new team
 */
export interface TeamCreateData {
  name: string;
  description?: string;
  leaderId?: number;
}

/**
 * Data for updating a team
 */
export interface TeamUpdateData extends Partial<TeamCreateData> {}

/**
 * Team member data structure
 */
export interface TeamMemberResponse {
  id: number;
  employeeId: number;
  teamId: number;
  firstName: string;
  lastName: string;
  email: string;
  position?: string;
  avatarUrl?: string;
  isLeader: boolean;
  joinedAt: string;
}

/**
 * Parameters for suggesting employees by skills from API-HRM-006
 */
export interface EmployeeSuggestParams {
  skills: (number | string)[];
  minExperience?: number;
  minLevel?: 'Basic' | 'Intermediate' | 'Advanced';
  status?: 'Allocated' | 'Available' | 'EndingSoon' | 'OnLeave' | 'Resigned' | 'PartiallyAllocated';
  limit?: number;
  teamId?: number | string;
  strict?: boolean;
}

/**
 * New Employee Skill response structure from API
 */
export interface NewEmployeeSkillResponse {
  id: number;
  employeeId: number;
  employeeName: string | null;
  skillId: number;
  skillName: string;
  skillCategoryName: string;
  yearsExperience: number;
  selfAssessmentLevel: string;
  leaderAssessmentLevel: string | null;
  selfComment: string | null;
  leaderComment: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * New Paginated Employee Skills response from API
 */
export interface NewPaginatedEmployeeSkillsResponse {
  content: NewEmployeeSkillResponse[];
  pageable: {
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  empty: boolean;
} 
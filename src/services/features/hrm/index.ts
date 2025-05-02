// Export API functions
export * from './api';

// Export Services
export * from './services';

// Export Types (these are also exported via './api' but we keep for backwards compatibility)
export type {
  // Employee types
  EmployeeCreateData,
  EmployeeUpdateData,
  EmployeeListParams,
  EmployeeResponse,
  EmployeeStatusUpdateData,
  ImportEmployeesResponse,
  EmployeeProjectHistoryResponse,
  
  // Skill types
  SkillCategoryResponse,
  SkillResponse,
  EmployeeSkillResponse,
  EmployeeSkillCreateData,
  
  // Team types
  TeamInfo,
  TeamCreateData,
  TeamUpdateData,
  TeamMemberResponse,
} from './api';
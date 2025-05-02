// Employee API
export {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  uploadAvatar,
  getAvailableEmployees,
  suggestEmployees,
  importEmployees,
  exportEmployees,
  updateEmployeeStatus,
  getEmployeeProjectHistory,
} from './employeeApi';

export type {
  EmployeeCreateData,
  EmployeeUpdateData,
  EmployeeListParams,
  EmployeeResponse,
  EmployeeStatusUpdateData,
  ImportEmployeesResponse,
  EmployeeProjectHistoryResponse,
} from './employeeApi';

// Skill API
export {
  getSkillCategories,
  createSkillCategory,
  updateSkillCategory,
  deleteSkillCategory,
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  getEmployeeSkills,
  updateEmployeeSkills,
  deleteEmployeeSkill,
} from './skillApi';

export type {
  SkillCategoryResponse,
  SkillResponse,
  EmployeeSkillResponse,
  EmployeeSkillCreateData,
} from './skillApi';

// Team API
export {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  getTeamMembers,
  addTeamMember,
  removeTeamMember,
  setTeamLeader,
} from './teamApi';

export type {
  TeamInfo,
  TeamCreateData,
  TeamUpdateData,
  TeamMemberResponse,
} from './teamApi'; 
/**
 * Custom hooks for accessing HRM services
 * 
 * This file provides Singleton hooks that return service instances
 * for use throughout the application. Prefer using these hooks over
 * direct service imports to ensure consistent access patterns.
 */

import { useMemo } from 'react';
import { employeeService, skillService, teamService } from '../service';

/**
 * Hook to access the employee service
 * 
 * @returns The employee service instance with all employee-related operations
 */
export const useEmployeeService = () => {
  return useMemo(() => employeeService, []);
};

/**
 * Hook to access the skill service
 * 
 * @returns The skill service instance with all skill-related operations
 */
export const useSkillService = () => {
  return useMemo(() => skillService, []);
};

/**
 * Hook to access the team service
 * 
 * @returns The team service instance with all team-related operations
 */
export const useTeamService = () => {
  return useMemo(() => teamService, []);
};

// Default export with all hooks
export default {
  useEmployeeService,
  useSkillService,
  useTeamService
}; 
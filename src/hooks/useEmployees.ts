import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  EmployeeListParams, 
  EmployeeCreateData, 
  EmployeeUpdateData,
  EmployeeSkillCreateData
} from '../features/hrm/types';
import {employeeService, teamService, skillService} from '../features/hrm/service';

// Hook for fetching employees with optional filtering and pagination
export function useEmployees(params?: EmployeeListParams) {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: () => employeeService.getEmployees(params)
  });
}

// Hook for fetching a single employee by ID
export function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => (id ? employeeService.getEmployeeById(id) : Promise.reject('No ID provided')),
    enabled: !!id // Only run the query if we have an ID
  });
}

// Hook for creating a new employee
export function useCreateEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: EmployeeCreateData) => employeeService.createEmployee(data),
    onSuccess: () => {
      // Invalidate the employees query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    }
  });
}

// Hook for updating an employee
export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EmployeeUpdateData }) => 
      employeeService.updateEmployee(id.toString(), data),
    onSuccess: (_, variables) => {
      // Invalidate both the list and the specific employee query
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', variables.id] });
    }
  });
}

// Hook for deleting an employee
export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => employeeService.deleteEmployee(id),
    onSuccess: () => {
      // Invalidate the employees query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    }
  });
}

// Hook for uploading an employee avatar
export function useUploadAvatar() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ employeeId, file }: { employeeId: string; file: File }) => 
      employeeService.uploadAvatar(employeeId, file),
    onSuccess: (_, variables) => {
      // Invalidate the specific employee query
      queryClient.invalidateQueries({ queryKey: ['employee', variables.employeeId] });
    }
  });
}

// Hook for fetching teams
export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: () => teamService.getTeams()
  });
}

// Hook for fetching a single team
export function useTeam(id: string | undefined) {
  return useQuery({
    queryKey: ['team', id],
    queryFn: () => (id ? teamService.getTeamById(id) : Promise.reject('No ID provided')),
    enabled: !!id
  });
}

// Hook for fetching skills
export function useSkills() {
  return useQuery({
    queryKey: ['skills'],
    queryFn: () => skillService.getSkills()
  });
}

// Hook for fetching employee skills
export function useEmployeeSkills(employeeId: string | undefined) {
  return useQuery({
    queryKey: ['employee-skills', employeeId],
    queryFn: () => (employeeId ? skillService.getEmployeeSkills(employeeId) : Promise.reject('No ID provided')),
    enabled: !!employeeId
  });
}

// Hook for updating employee skills
export function useUpdateEmployeeSkills() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ employeeId, data }: { employeeId: string; data: EmployeeSkillCreateData[] }) => 
      skillService.updateEmployeeSkills(employeeId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employee-skills', variables.employeeId] });
      queryClient.invalidateQueries({ queryKey: ['employee', variables.employeeId] });
    }
  });
} 
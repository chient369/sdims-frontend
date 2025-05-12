/**
 * Central export point for all custom hooks
 * 
 * This file exports all custom hooks from the application,
 * allowing for simpler imports throughout the codebase.
 */

// Authentication hooks
export { default as useAuth } from './useAuth';

// Navigation hooks
export { useNavigate, useParams, useLocation } from 'react-router-dom';

// HRM hooks
export * from './useEmployees';
export { useEmployeeService, useSkillService, useTeamService } from '../features/hrm/hooks/useServices';

// Opportunities hooks
export * from './useOpportunities';

// Other hooks
export * from './usePermissions';
export * from './useClickOutside'; 
export * from './useEscapeKey';
export * from './useModalState';
export { useToast } from './useToast'; 
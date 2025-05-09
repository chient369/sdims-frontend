/**
 * Export all HRM components for easier imports
 * 
 * This index file allows importing components with shorter paths:
 * import { EmployeeForm } from 'features/hrm/components';
 */

// Export from EmployeeForm
export { EmployeeForm } from './EmployeeForm';

// Export any other components
export { default as Tabs } from './Tabs';
export type { TabItem } from './Tabs'; 
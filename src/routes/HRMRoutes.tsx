import { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

// Lazy loaded components
const EmployeeList = lazy(() => import('../features/hrm/EmployeeList'));
const EmployeeDetail = lazy(() => import('../features/hrm/EmployeeDetail'));
const EmployeeForm = lazy(() => import('../features/hrm/EmployeeForm'));
const SkillsManagement = lazy(() => import('../features/hrm/SkillsManagement'));

const HRMRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/hrm/employees" replace />} />
      <Route 
        path="employees" 
        element={<PrivateRoute component={EmployeeList} requiredPermissions={['view_employees']} />} 
      />
      <Route 
        path="employees/:id" 
        element={<PrivateRoute component={EmployeeDetail} requiredPermissions={['view_employees']} />} 
      />
      <Route 
        path="employees/new" 
        element={<PrivateRoute component={EmployeeForm} requiredPermissions={['manage_employees']} />} 
      />
      <Route 
        path="employees/:id/edit" 
        element={<PrivateRoute component={EmployeeForm} requiredPermissions={['manage_employees']} />} 
      />
      <Route 
        path="skills" 
        element={<PrivateRoute component={SkillsManagement} requiredPermissions={['manage_skills']} />} 
      />
      <Route path="*" element={<Navigate to="/hrm/employees" replace />} />
    </Routes>
  );
};

export default HRMRoutes; 
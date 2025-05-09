import { lazy } from 'react';
import { PrivateRoute } from '../auth/routes';

// Lazy loaded components
const EmployeeList = lazy(() => import('./pages/EmployeeList'));
const EmployeeDetail = lazy(() => import('./pages/EmployeeDetail'));
const EmployeeFormPage = lazy(() => import('./pages/EmployeeForm'));
const SkillsManagement = lazy(() => import('./pages/SkillsManagement'));

// Define the HRM routes
export const HRMRoutes = [
  // Danh sách nhân viên
  {
    path: "/hrm/employees",
    element: (
      <PrivateRoute>
        <EmployeeList />
      </PrivateRoute>
    )
  },
  // Tạo mới nhân viên
  {
    path: "/hrm/employees/create",
    element: (
      <PrivateRoute>
        <EmployeeFormPage />
      </PrivateRoute>
    )
  },
  // Chỉnh sửa thông tin nhân viên
  {
    path: "/hrm/employees/:id/edit",
    element: (
      <PrivateRoute>
        <EmployeeFormPage />
      </PrivateRoute>
    )
  },
  // Chi tiết nhân viên
  {
    path: "/hrm/employees/:id",
    element: (
      <PrivateRoute>
        <EmployeeDetail />
      </PrivateRoute>
    )
  },
  // Quản lý Skills
  {
    path: "/hrm/skills",
    element: (
      <PrivateRoute requiredPermissions={['skill-category:read']}>
        <SkillsManagement />
      </PrivateRoute>
    )
  },
  // Root redirect to employee list
  {
    path: "/hrm",
    element: (
      <PrivateRoute>
        <EmployeeList />
      </PrivateRoute>
    )
  }
]; 

import { lazy } from 'react';
import { PrivateRoute } from '../auth/routes';

// Lazy loaded components
const EmployeeList = lazy(() => import('./pages/EmployeeList'));
const EmployeeDetail = lazy(() => import('./pages/EmployeeDetail'));
const EmployeeFormPage = lazy(() => import('./pages/EmployeeForm'));
const SkillsManagement = lazy(() => import('./pages/SkillsManagement'));

// Define the HRM routes
export const HRMRoutes = [
  {
    element: <PrivateRoute />,
    children: [
      // Danh sách nhân viên
      {
        path: "/hrm/employees",
        element: <EmployeeList />
      },
      // Tạo mới nhân viên
      {
        path: "/hrm/employees/create",
        element: <EmployeeFormPage />
      },
      // Chỉnh sửa thông tin nhân viên
      {
        path: "/hrm/employees/:id/edit",
        element: <EmployeeFormPage />
      },
      // Chi tiết nhân viên
      {
        path: "/hrm/employees/:id",
        element: <EmployeeDetail />
      },
      // Root redirect to employee list
      {
        path: "/hrm",
        element: <EmployeeList />
      }
    ]
  },
  // Quản lý Skills - cần quyền riêng nên tạo route riêng
  {
    element: <PrivateRoute requiredPermissions={['skill-category:read']} />,
    children: [
      {
        path: "/hrm/skills",
        element: <SkillsManagement />
      }
    ]
  }
]; 

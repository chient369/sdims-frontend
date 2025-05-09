import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EmployeeForm } from '../../components/EmployeeForm';
import { useAuth } from '../../../../hooks/useAuth';
import { hasPermission } from '../../../../utils/permissions';

/**
 * Employee form page component
 * 
 * @returns {JSX.Element} The employee form page
 */
const EmployeeFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, permissions = [] } = useAuth();
  
  const employeeId = id ? parseInt(id) : undefined;
  const mode = employeeId ? 'edit' : 'create';
  
  // Debug auth
  useEffect(() => {
    console.log('[EmployeeFormPage] Auth debug:');
    console.log('- User:', user);
    console.log('- Permissions:', permissions);
    console.log('- Create permission:', hasPermission('employee:create', permissions));
    console.log('- Update permission:', hasPermission('employee:update:all', permissions));
  }, [user, permissions]);
  
  // Check if user has permission to access this page
  const hasAccess = mode === 'create' 
    ? hasPermission('employee:create', permissions) 
    : hasPermission('employee:update:all', permissions);
  
  if (!hasAccess) {
    return (
      <div className="py-8 px-4 text-center">
        <h2 className="text-xl font-semibold text-red-600">Không có quyền truy cập</h2>
        <p className="mt-2 text-gray-600">Bạn không có quyền để thực hiện thao tác này.</p>
        <button
          onClick={() => navigate('/hrm/employees')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Quay lại
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <EmployeeForm mode={mode} employeeId={employeeId} />
      </div>
    </div>
  );
};

export default EmployeeFormPage; 
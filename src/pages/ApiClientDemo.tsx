import React, { useState } from 'react';
import { useEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee } from '../hooks/useEmployees';
import { EmployeeCreateData, EmployeeUpdateData } from '../services/api/employeeService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';

const ApiClientDemo: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [limit] = useState(5);
  
  // Query employees
  const { data: employeesData, isLoading, isError, error } = useEmployees({
    page,
    limit,
    search: search || undefined,
    sortBy: 'fullName',
    sortDirection: 'asc'
  });
  
  // Mutations
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();
  
  // New employee form state
  const [newEmployee, setNewEmployee] = useState<EmployeeCreateData>({
    employeeCode: '',
    name: '',
    email: '',
    status: 'Allocated'
  });
  
  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEmployee(prev => ({ ...prev, [name]: value }));
  };
  
  // Submit new employee
  const handleCreateEmployee = () => {
    createEmployee.mutate(newEmployee, {
      onSuccess: () => {
        // Reset form
        setNewEmployee({
          employeeCode: '',
          name: '',
          email: '',
          status: 'Allocated'
        });
      }
    });
  };
  
  // Update employee status
  const handleUpdateStatus = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'Allocated' ? 'Available' : 'Allocated';
    
    const updateData: EmployeeUpdateData = {
      status: newStatus as 'Allocated' | 'Available' | 'OnLeave' | 'Ending Soon' | 'Resigned'
    };
    
    updateEmployee.mutate({ id, data: updateData });
  };
  
  // Delete employee
  const handleDeleteEmployee = (id: number) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      deleteEmployee.mutate(id);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">API Client Demo</h1>
      
      {/* Create Employee Form */}
      <Card className="mb-8">
        <Card.Header>
          <h2 className="text-xl font-semibold">Create New Employee</h2>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Employee Code</label>
              <Input
                name="employeeCode"
                value={newEmployee.employeeCode}
                onChange={handleInputChange}
                placeholder="EMP001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <Input
                name="name"
                value={newEmployee.name}
                onChange={handleInputChange}
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                name="email"
                type="email"
                value={newEmployee.email}
                onChange={handleInputChange}
                placeholder="john.doe@example.com"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <Button 
              onClick={handleCreateEmployee}
              disabled={createEmployee.isPending || !newEmployee.employeeCode || !newEmployee.name || !newEmployee.email}
            >
              {createEmployee.isPending ? 'Creating...' : 'Create Employee'}
            </Button>
            
            {createEmployee.isSuccess && (
              <span className="ml-2 text-green-600">Employee created successfully!</span>
            )}
            
            {createEmployee.isError && (
              <span className="ml-2 text-red-600">Error creating employee</span>
            )}
          </div>
        </Card.Content>
      </Card>
      
      {/* Search and Filter */}
      <div className="mb-4 flex space-x-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search employees..."
          className="max-w-md"
        />
        <Button onClick={() => setPage(1)} variant="secondary">Search</Button>
      </div>
      
      {/* Employee List */}
      <Card>
        <Card.Header>
          <h2 className="text-xl font-semibold">Employee List</h2>
        </Card.Header>
        <Card.Content>
          {isLoading ? (
            <div className="text-center py-4">Loading employees...</div>
          ) : isError ? (
            <div className="text-center py-4 text-red-600">
              Error loading employees: {error instanceof Error ? error.message : 'Unknown error'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {employeesData?.content.map((employee) => (
                      <tr key={employee.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{employee.employeeCode}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{employee.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{employee.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Badge
                            variant={employee.status === 'Allocated' ? 'success' : 
                                   employee.status === 'Available' ? 'error' : 'warning'}
                          >
                            {employee.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="mr-2"
                            onClick={() => handleUpdateStatus(employee.id, employee.status)}
                          >
                            Toggle Status
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDeleteEmployee(employee.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                    
                    {employeesData?.content.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                          No employees found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="flex justify-between items-center mt-4">
                <div>
                  Showing {employeesData?.content.length} of {employeesData?.pageable.totalElements} employees
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage(prev => prev + 1)}
                    disabled={page >= (employeesData?.pageable.totalPages || 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card.Content>
      </Card>
    </div>
  );
};

export default ApiClientDemo; 
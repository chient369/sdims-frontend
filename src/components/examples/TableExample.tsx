import React, { useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Table } from '../table/Table';
import { ActionCell, DateCell, StatusCell, BooleanCell } from '../table/cellRenderers';
import { Button } from '../ui/Button';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joinDate: string;
  isActive: boolean;
}

const sampleData: Employee[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Developer',
    status: 'active',
    joinDate: '2023-01-15',
    isActive: true,
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'Designer',
    status: 'bench',
    joinDate: '2023-03-22',
    isActive: true,
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    role: 'Project Manager',
    status: 'active',
    joinDate: '2022-11-05',
    isActive: true,
  },
  {
    id: '4',
    name: 'Sarah Williams',
    email: 'sarah.williams@example.com',
    role: 'Developer',
    status: 'leave',
    joinDate: '2023-02-18',
    isActive: false,
  },
  {
    id: '5',
    name: 'David Lee',
    email: 'david.lee@example.com',
    role: 'Tester',
    status: 'resigned',
    joinDate: '2022-08-30',
    isActive: false,
  },
];

export function EmployeeList() {
  const [data, setData] = useState<Employee[]>(sampleData);
  const [isLoading, setIsLoading] = useState(false);
  
  const columnHelper = createColumnHelper<Employee>();
  
  const columns = [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('role', {
      header: 'Role',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => (
        <StatusCell 
          value={info.getValue()} 
          mapping={{
            active: { label: 'Active', color: 'green' },
            bench: { label: 'On Bench', color: 'blue' },
            leave: { label: 'On Leave', color: 'yellow' },
            resigned: { label: 'Resigned', color: 'red' },
          }}
        />
      ),
    }),
    columnHelper.accessor('isActive', {
      header: 'Active',
      cell: info => <BooleanCell value={info.getValue()} />,
    }),
    columnHelper.accessor('joinDate', {
      header: 'Join Date',
      cell: info => <DateCell value={info.getValue()} />,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: info => (
        <ActionCell
          row={info.row.original}
          onView={() => handleView(info.row.original)}
          onEdit={() => handleEdit(info.row.original)}
          onDelete={() => handleDelete(info.row.original)}
        />
      ),
    }),
  ];
  
  const handleView = (employee: Employee) => {
    console.log('View employee:', employee);
    // Implement view logic
  };
  
  const handleEdit = (employee: Employee) => {
    console.log('Edit employee:', employee);
    // Implement edit logic
  };
  
  const handleDelete = (employee: Employee) => {
    console.log('Delete employee:', employee);
    setData(prev => prev.filter(item => item.id !== employee.id));
  };
  
  const handleSimulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Employee List</h2>
      
      <div className="mb-4">
        <Button 
          onClick={handleSimulateLoading} 
          variant="outline" 
          className="mr-2"
        >
          Simulate Loading
        </Button>
      </div>
      
      <Table
        data={data}
        columns={columns}
        isLoading={isLoading}
        enableRowSelection
        bulkActions={
          <>
            <Button variant="outline" size="sm">Export</Button>
            <Button variant="danger" size="sm">Delete Selected</Button>
          </>
        }
        toolbarContent={
          <div className="w-full flex justify-between items-center">
            <input
              type="text"
              placeholder="Search employees..."
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            <Button>Add Employee</Button>
          </div>
        }
        onRowClick={row => handleView(row)}
      />
    </div>
  );
} 
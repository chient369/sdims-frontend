# Table Component Documentation

This documentation explains how to use the Table component system for the SDIMS application.

## Table Components

The table system consists of the following components:

- `Table` - The main table component
- `TablePagination` - Handles pagination (used internally by Table)
- `TableToolbar` - Displays toolbar with bulk actions and custom content (used internally by Table)
- `cellRenderers` - Set of utility components for rendering different types of cells

## Basic Usage

```tsx
import { Table } from '../components/table';
import { createColumnHelper } from '@tanstack/react-table';

interface User {
  id: string;
  name: string;
  email: string;
}

// Sample data
const data: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
];

// Create column helper
const columnHelper = createColumnHelper<User>();

// Define columns
const columns = [
  columnHelper.accessor('name', {
    header: 'Name',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    cell: info => info.getValue(),
  }),
];

// Use in your component
function UserList() {
  return <Table data={data} columns={columns} />;
}
```

## Features

### Sorting

Sorting is enabled by default. You can disable it with the `enableSorting` prop.

```tsx
<Table 
  data={data} 
  columns={columns} 
  enableSorting={false} 
/>
```

### Pagination

Pagination is enabled by default. You can disable it with the `enablePagination` prop.

```tsx
<Table 
  data={data} 
  columns={columns} 
  enablePagination={false} 
/>
```

### Row Selection

Row selection is disabled by default. Enable it with the `enableRowSelection` prop.

```tsx
<Table 
  data={data} 
  columns={columns} 
  enableRowSelection 
/>
```

### Loading State

Show a loading spinner with the `isLoading` prop.

```tsx
<Table 
  data={data} 
  columns={columns} 
  isLoading={isLoading} 
/>
```

### Bulk Actions

Add bulk actions that appear when rows are selected.

```tsx
<Table 
  data={data} 
  columns={columns} 
  enableRowSelection
  bulkActions={
    <>
      <Button variant="outline" size="sm">Export</Button>
      <Button variant="danger" size="sm">Delete</Button>
    </>
  }
/>
```

### Custom Toolbar

Add a custom toolbar above the table.

```tsx
<Table 
  data={data} 
  columns={columns} 
  toolbarContent={
    <div className="w-full flex justify-between items-center">
      <input
        type="text"
        placeholder="Search..."
        className="px-3 py-2 border border-gray-300 rounded-md"
      />
      <Button>Add New</Button>
    </div>
  }
/>
```

### Row Click

Handle row clicks with the `onRowClick` prop.

```tsx
<Table 
  data={data} 
  columns={columns} 
  onRowClick={row => handleRowClick(row)}
/>
```

## Cell Renderers

The table system provides several cell renderers for common data types:

### Action Cell

Shows a dropdown menu with actions.

```tsx
import { ActionCell } from '../components/table/cellRenderers';

// In your columns definition
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
```

### Date Cell

Formats dates consistently.

```tsx
import { DateCell } from '../components/table/cellRenderers';

// In your columns definition
columnHelper.accessor('createdAt', {
  header: 'Created At',
  cell: info => <DateCell value={info.getValue()} />,
}),
```

### Status Cell

Shows a status badge with color coding.

```tsx
import { StatusCell } from '../components/table/cellRenderers';

// In your columns definition
columnHelper.accessor('status', {
  header: 'Status',
  cell: info => (
    <StatusCell 
      value={info.getValue()} 
      mapping={{
        active: { label: 'Active', variant: 'success' },
        inactive: { label: 'Inactive', variant: 'error' },
        pending: { label: 'Pending', variant: 'warning' },
      }}
    />
  ),
}),
```

### Boolean Cell

Shows a visual indicator for boolean values.

```tsx
import { BooleanCell } from '../components/table/cellRenderers';

// In your columns definition
columnHelper.accessor('isActive', {
  header: 'Active',
  cell: info => <BooleanCell value={info.getValue()} />,
}),
```

## Advanced Usage

See the `TableExample.tsx` file in the examples directory for a complete example of using the Table component with all its features. 
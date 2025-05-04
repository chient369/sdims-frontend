import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { HiDotsVertical, HiPencil, HiTrash, HiEye } from 'react-icons/hi';
import { Button } from '../ui/Button';
import { Menu, Transition } from '@headlessui/react';
import { format } from 'date-fns';
import { Badge } from '../ui/Badge';

// Action cell with dropdown menu
export function ActionCell<TData>({
  row,
  onView,
  onEdit,
  onDelete,
}: {
  row: TData;
  onView?: (row: TData) => void;
  onEdit?: (row: TData) => void;
  onDelete?: (row: TData) => void;
}) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button as={React.Fragment}>
        <Button
          variant="ghost"
          size="sm"
          className="p-1"
        >
          <HiDotsVertical className="h-5 w-5" />
        </Button>
      </Menu.Button>
      <Transition
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {onView && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => onView(row)}
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                  >
                    <HiEye className="mr-3 h-5 w-5 text-gray-400" />
                    View Details
                  </button>
                )}
              </Menu.Item>
            )}
            {onEdit && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => onEdit(row)}
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                  >
                    <HiPencil className="mr-3 h-5 w-5 text-gray-400" />
                    Edit
                  </button>
                )}
              </Menu.Item>
            )}
            {onDelete && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => onDelete(row)}
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } flex w-full items-center px-4 py-2 text-sm text-red-600`}
                  >
                    <HiTrash className="mr-3 h-5 w-5 text-red-400" />
                    Delete
                  </button>
                )}
              </Menu.Item>
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

// Date cell renderer
export function DateCell({ value }: { value: Date | string | null | undefined }) {
  if (!value) return <span className="text-gray-400">-</span>;
  
  const date = typeof value === 'string' ? new Date(value) : value;
  return <span>{format(date, 'dd/MM/yyyy')}</span>;
}

// Status cell with badge
export function StatusCell({
  value,
  mapping = {},
}: {
  value: string;
  mapping?: Record<string, { label: string; variant?: string; color?: string }>;
}) {
  const status = mapping[value] || { label: value, variant: 'default' };
  
  // Map color string to variant if provided
  const variantMap: Record<string, string> = {
    'green': 'success',
    'red': 'error',
    'blue': 'info',
    'yellow': 'warning',
    'gray': 'secondary',
  };
  
  let variant = status.variant;
  
  // If color is provided instead of variant, try to map it
  if (!variant && status.color && variantMap[status.color]) {
    variant = variantMap[status.color];
  }
  
  return (
    <Badge variant={variant as any}>
      {status.label}
    </Badge>
  );
}

// Boolean cell with icon
export function BooleanCell({ value }: { value: boolean }) {
  return value ? (
    <div className="flex justify-center">
      <div className="h-5 w-5 rounded-full bg-success-100 flex items-center justify-center">
        <svg className="h-3.5 w-3.5 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>
  ) : (
    <div className="flex justify-center">
      <div className="h-5 w-5 rounded-full bg-error-100 flex items-center justify-center">
        <svg className="h-3.5 w-3.5 text-error-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    </div>
  );
} 
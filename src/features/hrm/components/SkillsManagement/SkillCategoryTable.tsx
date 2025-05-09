import React, { useState } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Table } from '../../../../components/table/Table';
import { Button } from '../../../../components/ui/Button';
import { ConfirmationDialog } from '../../../../components/modals/ConfirmationDialog';
import { useSkillService } from '../../hooks';
import { SkillCategoryResponse } from '../../types';

interface SkillCategoryTableProps {
  categories: SkillCategoryResponse[];
  isLoading: boolean;
  onEditCategory: (category: SkillCategoryResponse) => void;
  onRefresh: () => void;
}

/**
 * Component to display a table of skill categories with actions
 */
export const SkillCategoryTable: React.FC<SkillCategoryTableProps> = ({
  categories,
  isLoading,
  onEditCategory,
  onRefresh
}) => {
  const skillService = useSkillService();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<SkillCategoryResponse | null>(null);

  const handleDeleteClick = (category: SkillCategoryResponse) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    
    try {
      await skillService.deleteSkillCategory(categoryToDelete.id.toString());
      onRefresh();
    } catch (error) {
      console.error('Error deleting category:', error);
      // Xử lý lỗi (có thể show toast notification)
    } finally {
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const columns = [
    {
      accessorKey: 'id',
      header: 'ID',
      size: 80,
    },
    {
      accessorKey: 'name',
      header: 'Tên loại kỹ năng',
      size: 250,
    },
    {
      accessorKey: 'description',
      header: 'Mô tả',
      cell: ({ row }: any) => row.original.description || '-',
      size: 350,
    },
    {
      accessorKey: 'skillCount',
      header: 'Số lượng kỹ năng',
      size: 150,
    },
    {
      id: 'actions',
      header: 'Hành động',
      cell: ({ row }: any) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditCategory(row.original)}
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            Sửa
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700"
            onClick={() => handleDeleteClick(row.original)}
          >
            <TrashIcon className="h-4 w-4 mr-1" />
            Xóa
          </Button>
        </div>
      ),
      size: 180,
    },
  ];

  return (
    <>
      <Table
        data={categories}
        columns={columns}
        isLoading={isLoading}
      />
      
      {/* Dialog xác nhận xóa */}
      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xóa loại kỹ năng"
        message={
          <>
            Bạn có chắc chắn muốn xóa loại kỹ năng "{categoryToDelete?.name}"?
            {categoryToDelete?.skillCount && categoryToDelete.skillCount > 0 && (
              <div className="text-red-600 mt-2">
                <strong>Cảnh báo:</strong> Loại kỹ năng này hiện có {categoryToDelete.skillCount} kỹ năng. 
                Xóa sẽ ảnh hưởng đến các kỹ năng này.
              </div>
            )}
          </>
        }
        confirmLabel="Xóa"
        confirmVariant="danger"
      />
    </>
  );
}; 
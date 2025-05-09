import React, { useState } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Table } from '../../../../components/table/Table';
import { Button } from '../../../../components/ui/Button';
import { ConfirmationDialog } from '../../../../components/modals/ConfirmationDialog';
import { useSkillService } from '../../hooks';
import { SkillResponse, SkillCategoryResponse } from '../../types';

interface SkillTableProps {
  skills: SkillResponse[];
  isLoading: boolean;
  selectedCategoryId?: number | null;
  onEditSkill: (skill: SkillResponse) => void;
  onRefresh: () => void;
}

/**
 * Component to display a table of skills with actions
 */
export const SkillTable: React.FC<SkillTableProps> = ({
  skills,
  isLoading,
  selectedCategoryId,
  onEditSkill,
  onRefresh
}) => {
  const skillService = useSkillService();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<SkillResponse | null>(null);

  const handleDeleteClick = (skill: SkillResponse) => {
    setSkillToDelete(skill);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!skillToDelete) return;
    
    try {
      await skillService.deleteSkill(skillToDelete.id.toString());
      onRefresh();
    } catch (error) {
      console.error('Error deleting skill:', error);
      // Xử lý lỗi (có thể show toast notification)
    } finally {
      setDeleteDialogOpen(false);
      setSkillToDelete(null);
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
      header: 'Tên kỹ năng',
      size: 200,
    },
    {
      accessorKey: 'category.name',
      header: 'Loại kỹ năng',
      size: 200,
    },
    {
      accessorKey: 'description',
      header: 'Mô tả',
      cell: ({ row }: any) => row.original.description || '-',
      size: 350,
    },
    {
      accessorKey: 'employeeCount',
      header: 'Số nhân viên',
      size: 120,
      cell: ({ row }: any) => row.original.employeeCount || 0,
    },
    {
      id: 'actions',
      header: 'Hành động',
      cell: ({ row }: any) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditSkill(row.original)}
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
        data={skills}
        columns={columns}
        isLoading={isLoading}
      />
      
      {/* Dialog xác nhận xóa */}
      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xóa kỹ năng"
        message={
          <>
            Bạn có chắc chắn muốn xóa kỹ năng "{skillToDelete?.name}"?
            {skillToDelete?.employeeCount && skillToDelete.employeeCount > 0 && (
              <div className="text-red-600 mt-2">
                <strong>Cảnh báo:</strong> Kỹ năng này hiện được sử dụng bởi {skillToDelete.employeeCount} nhân viên. 
                Xóa sẽ ảnh hưởng đến hồ sơ của các nhân viên này.
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
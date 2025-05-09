import React, { useState, useEffect } from 'react';
import { Modal } from '../../../../components/modals/Modal';
import { ModalHeader } from '../../../../components/modals/ModalHeader';
import { ModalBody } from '../../../../components/modals/ModalBody';
import { ModalFooter } from '../../../../components/modals/ModalFooter';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { useSkillService } from '../../hooks';
import { SkillResponse, SkillCreateData, SkillUpdateData, SkillCategoryResponse } from '../../types';

interface SkillFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  skill?: SkillResponse;
  categories: SkillCategoryResponse[];
}

/**
 * Form component for creating or updating a skill
 */
export const SkillForm: React.FC<SkillFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  skill,
  categories
}) => {
  const skillService = useSkillService();
  const isEditMode = !!skill;
  
  const [formData, setFormData] = useState<SkillCreateData | SkillUpdateData>({
    name: '',
    description: '',
    categoryId: categories.length ? categories[0].id : 0
  });
  
  const [errors, setErrors] = useState({
    name: '',
    categoryId: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or skill changes
  useEffect(() => {
    if (isOpen) {
      if (skill) {
        setFormData({
          name: skill.name,
          description: skill.description || '',
          categoryId: skill.category.id
        });
      } else {
        setFormData({
          name: '',
          description: '',
          categoryId: categories.length ? categories[0].id : 0
        });
      }
      setErrors({ name: '', categoryId: '' });
    }
  }, [isOpen, skill, categories]);

  const validateForm = (): boolean => {
    const newErrors = {
      name: formData.name ? formData.name.trim() ? '' : 'Tên kỹ năng không được để trống' : 'Tên kỹ năng không được để trống',
      categoryId: formData.categoryId ? '' : 'Vui lòng chọn loại kỹ năng'
    };
    
    setErrors(newErrors);
    return !newErrors.name && !newErrors.categoryId;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'categoryId' ? Number(value) : value
    }));
    
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      if (isEditMode && skill) {
        await skillService.updateSkill(skill.id.toString(), {
          ...formData as SkillUpdateData,
          categoryId: formData.categoryId?.toString()
        });
      } else {
        await skillService.createSkill({
          ...formData as SkillCreateData,
          categoryId: formData.categoryId ? formData.categoryId.toString() : ""
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving skill:', error);
      // Xử lý lỗi (có thể sử dụng toast notification)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader>
        {isEditMode ? 'Cập nhật kỹ năng' : 'Thêm kỹ năng mới'}
      </ModalHeader>
      
      <ModalBody>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Tên kỹ năng <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              placeholder="Nhập tên kỹ năng"
              error={errors.name}
            />
          </div>
          
          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
              Loại kỹ năng <span className="text-red-500">*</span>
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              placeholder="Nhập mô tả (không bắt buộc)"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
        </div>
      </ModalBody>
      
      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          Hủy
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Thêm mới')}
        </Button>
      </ModalFooter>
    </Modal>
  );
}; 
import React, { useState, useEffect } from 'react';
import { Modal } from '../../../../components/modals/Modal';
import { ModalHeader } from '../../../../components/modals/ModalHeader';
import { ModalBody } from '../../../../components/modals/ModalBody';
import { ModalFooter } from '../../../../components/modals/ModalFooter';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { useSkillService } from '../../hooks';
import { SkillCategoryResponse, SkillCategoryCreateData, SkillCategoryUpdateData } from '../../types';

interface SkillCategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category?: SkillCategoryResponse;
}

/**
 * Form component for creating or updating a skill category
 */
export const SkillCategoryForm: React.FC<SkillCategoryFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  category
}) => {
  const skillService = useSkillService();
  const isEditMode = !!category;
  
  const [formData, setFormData] = useState<SkillCategoryCreateData | SkillCategoryUpdateData>({
    name: '',
    description: ''
  });
  
  const [errors, setErrors] = useState({
    name: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or category changes
  useEffect(() => {
    if (isOpen) {
      if (category) {
        setFormData({
          name: category.name,
          description: category.description || ''
        });
      } else {
        setFormData({
          name: '',
          description: ''
        });
      }
      setErrors({ name: '' });
    }
  }, [isOpen, category]);

  const validateForm = (): boolean => {
    const newErrors = {
      name: formData.name?.trim() ? '' : 'Tên loại kỹ năng không được để trống'
    };
    
    setErrors(newErrors);
    return !newErrors.name;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      if (isEditMode && category) {
        await skillService.updateSkillCategory(category.id.toString(), formData as SkillCategoryUpdateData);
      } else {
        await skillService.createSkillCategory(formData as SkillCategoryCreateData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving category:', error);
      // Xử lý lỗi (có thể sử dụng toast notification)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader>
        {isEditMode ? 'Cập nhật loại kỹ năng' : 'Thêm loại kỹ năng mới'}
      </ModalHeader>
      
      <ModalBody>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Tên loại kỹ năng <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              placeholder="Nhập tên loại kỹ năng"
              error={errors.name}
            />
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
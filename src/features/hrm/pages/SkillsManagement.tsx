import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PlusIcon } from '@heroicons/react/24/outline';
import Tabs from '../components/Tabs';
import { Button } from '../../../components/ui/Button';
import { useSkillService } from '../hooks';
import { SkillCategoryTable } from '../components/SkillsManagement/SkillCategoryTable';
import { SkillTable } from '../components/SkillsManagement/SkillTable';
import { SkillCategoryForm } from '../components/SkillsManagement/SkillCategoryForm';
import { SkillForm } from '../components/SkillsManagement/SkillForm';
import { SkillResponse, SkillCategoryResponse } from '../types';

/**
 * Skills Management Page
 * 
 * Quản lý danh mục các loại kỹ năng và kỹ năng cụ thể
 */
const SkillsManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const skillService = useSkillService();
  
  // Tab state
  const [activeTab, setActiveTab] = useState(0);
  const [activeTabId, setActiveTabId] = useState('categories');
  
  // Form modals state
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [isSkillFormOpen, setIsSkillFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SkillCategoryResponse | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillResponse | null>(null);
  
  // Filter state for skills tab
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  
  // Fetch categories
  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    refetch: refetchCategories
  } = useQuery({
    queryKey: ['skillCategories'],
    queryFn: async () => {
      const response = await skillService.getSkillCategories();
      return response;
    }
  });
  
  // Update selectedCategoryId when categories are loaded
  useEffect(() => {
    if (categoriesData?.content?.length && selectedCategoryId === null) {
      setSelectedCategoryId(categoriesData.content[0].id);
    }
  }, [categoriesData, selectedCategoryId]);
  
  // Fetch skills (optionally filtered by category)
  const {
    data: skillsData,
    isLoading: isSkillsLoading,
    refetch: refetchSkills
  } = useQuery({
    queryKey: ['skills', selectedCategoryId],
    queryFn: async () => {
      return await skillService.getSkills({
        categoryId: selectedCategoryId ? selectedCategoryId.toString() : undefined
      });
    },
    enabled: activeTabId === 'skills' // Only fetch skills when on Skills tab
  });
  
  // Handler for add/edit category
  const handleAddEditCategory = (category?: SkillCategoryResponse) => {
    setSelectedCategory(category || null);
    setIsCategoryFormOpen(true);
  };
  
  // Handler for add/edit skill
  const handleAddEditSkill = (skill?: SkillResponse) => {
    setSelectedSkill(skill || null);
    setIsSkillFormOpen(true);
  };
  
  // Handler for refresh data
  const handleRefreshData = () => {
    if (activeTab === 0) {
      refetchCategories();
    } else {
      refetchSkills();
    }
  };
  
  // Handler for category form success
  const handleCategoryFormSuccess = () => {
    refetchCategories();
    queryClient.invalidateQueries({ queryKey: ['skills'] }); // Also invalidate skills as they depend on categories
  };
  
  // Handler for skill form success
  const handleSkillFormSuccess = () => {
    refetchSkills();
  };
  
  // Render category filter dropdown (for Skills tab)
  const renderCategoryFilter = () => (
    <div className="mb-4">
      <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
        Lọc theo loại kỹ năng
      </label>
      <select
        id="category-filter"
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
        value={selectedCategoryId || ''}
        onChange={(e) => setSelectedCategoryId(e.target.value ? Number(e.target.value) : null)}
      >
        <option value="">Tất cả loại kỹ năng</option>
        {categoriesData?.content?.map((category: SkillCategoryResponse) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  );
  
  // Tabs configuration
  const tabItems = [
    { 
      id: 'categories',
      label: 'Loại Kỹ năng', 
      content: (
        <SkillCategoryTable
          categories={categoriesData?.content || []}
          isLoading={isCategoriesLoading}
          onEditCategory={handleAddEditCategory}
          onRefresh={handleRefreshData}
        />
      )
    },
    { 
      id: 'skills',
      label: 'Chi tiết Kỹ năng', 
      content: (
        <>
          {renderCategoryFilter()}
          <SkillTable
            skills={skillsData?.content || []}
            isLoading={isSkillsLoading}
            selectedCategoryId={selectedCategoryId}
            onEditSkill={handleAddEditSkill}
            onRefresh={handleRefreshData}
          />
        </>
      ) 
    }
  ];
  
  // Handler for tab change
  const handleTabChange = (tabId: string) => {
    setActiveTabId(tabId);
    setActiveTab(tabId === 'categories' ? 0 : 1);
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Danh mục Kỹ năng</h1>
        <Button
          onClick={() => {
            if (activeTabId === 'categories') {
              handleAddEditCategory();
            } else {
              handleAddEditSkill();
            }
          }}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          {activeTabId === 'categories' ? 'Thêm Loại Kỹ năng' : 'Thêm Kỹ năng'}
        </Button>
      </div>
      
      <Tabs
        items={tabItems}
        defaultActiveTab="categories"
        className="mt-6"
        onChange={handleTabChange}
      />
      
      <div className="mt-6">
        {/* Nội dung đã được chuyển vào tabItems */}
      </div>
      
      {/* Category Form Modal */}
      <SkillCategoryForm
        isOpen={isCategoryFormOpen}
        onClose={() => setIsCategoryFormOpen(false)}
        onSuccess={handleCategoryFormSuccess}
        category={selectedCategory || undefined}
      />
      
      {/* Skill Form Modal */}
      <SkillForm
        isOpen={isSkillFormOpen}
        onClose={() => setIsSkillFormOpen(false)}
        onSuccess={handleSkillFormSuccess}
        skill={selectedSkill || undefined}
        categories={categoriesData?.content || []}
      />
    </div>
  );
};

export default SkillsManagement; 
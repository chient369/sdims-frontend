import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SkillCategoryResponse, SkillResponse, SkillLevel } from '../../../types';
import { useSkillService } from '../../../hooks/useServices';
import { ConfirmationDialog } from '../../../../../components/modals/ConfirmationDialog';

interface ExtendedEmployeeSkillData {
  skillId: number;
  level: SkillLevel;
  years: number;
  leaderAssessment?: SkillLevel;
  skillName?: string;
  categoryId?: number;
  categoryName?: string;
  id?: number;
}

interface SkillsSectionProps {
  isEditable: boolean;
  skills: ExtendedEmployeeSkillData[];
  onSkillsChange: (updatedSkills: ExtendedEmployeeSkillData[]) => void;
  userRole?: string | string[];
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ 
  isEditable, 
  skills, 
  onSkillsChange,
  userRole 
}) => {
  const skillService = useSkillService();
  const [expanded, setExpanded] = useState(true);
  const [categories, setCategories] = useState<SkillCategoryResponse[]>([]);
  const [availableSkills, setAvailableSkills] = useState<SkillResponse[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
  const [skillToDelete, setSkillToDelete] = useState<number | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  // Determine what the user can edit based on role
  const canAddSkills = isEditable || userRole == 'Employee';
  const canAssessSkills = isEditable || userRole == 'Leader';
  
  // Fetch skill categories
  const { data: categoriesData } = useQuery({
    queryKey: ['skillCategories'],
    queryFn: async () => {
      const response = await skillService.getSkillCategories();
      return response.content;
    }
  });
  
  // Update categories when data is fetched
  useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData);
      if (categoriesData.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(categoriesData[0].id);
      }
    }
  }, [categoriesData, selectedCategoryId]);
  
  // Fetch skills for selected category
  const { data: skillsData } = useQuery({
    queryKey: ['skills', selectedCategoryId],
    queryFn: async () => {
      if (!selectedCategoryId) return { content: [] };
      const response = await skillService.getSkills({ 
        categoryId: selectedCategoryId.toString() 
      });
      return response;
    },
    enabled: !!selectedCategoryId
  });
  
  // Update available skills when data is fetched
  useEffect(() => {
    if (skillsData?.content) {
      setAvailableSkills(skillsData.content);
      setSelectedSkillId(null); // Reset selected skill when category changes
    }
  }, [skillsData]);
  
  // Lọc ra các skills chưa được thêm
  const getAvailableSkillsForSelection = () => {
    const existingSkillIds = skills.map(s => s.skillId);
    return availableSkills.filter(s => !existingSkillIds.includes(s.id));
  };
  
  // Add a new skill to the employee's skill list
  const handleAddSkill = () => {
    if (!selectedCategoryId || !selectedSkillId) return;
    
    const skillToAdd = availableSkills.find(s => s.id === selectedSkillId);
    
    if (skillToAdd) {
      const newSkill: ExtendedEmployeeSkillData = {
        skillId: skillToAdd.id,
        skillName: skillToAdd.name,
        categoryId: skillToAdd.category.id,
        categoryName: skillToAdd.category.name,
        level: 'Basic',
        years: 0
      };
      
      onSkillsChange([...skills, newSkill]);
      setSelectedSkillId(null); // Reset selected skill after adding
    }
  };
  
  // Show confirmation dialog before removing a skill
  const confirmRemoveSkill = (skillId: number) => {
    setSkillToDelete(skillId);
    setShowDeleteConfirmation(true);
  };
  
  // Remove a skill from the employee's skill list
  const handleRemoveSkill = () => {
    if (skillToDelete !== null) {
      onSkillsChange(skills.filter(s => s.skillId !== skillToDelete));
      setSkillToDelete(null);
      setShowDeleteConfirmation(false);
    }
  };
  
  // Cancel skill deletion
  const cancelRemoveSkill = () => {
    setSkillToDelete(null);
    setShowDeleteConfirmation(false);
  };
  
  // Update a skill's properties
  const handleSkillChange = (skillId: number, field: string, value: any) => {
    onSkillsChange(
      skills.map(skill => 
        skill.skillId === skillId ? { ...skill, [field]: value } : skill
      )
    );
  };
  
  // Group skills by category for display
  const skillsByCategory: Record<string, ExtendedEmployeeSkillData[]> = {};
  
  skills.forEach(skill => {
    const categoryName = skill.categoryName || 
      categories.find(c => c.id === skill.categoryId)?.name || 
      'Uncategorized';
    
    if (!skillsByCategory[categoryName]) {
      skillsByCategory[categoryName] = [];
    }
    
    skillsByCategory[categoryName].push(skill);
  });
  
  return (
    <div className="mb-8 border border-gray-200 rounded-md overflow-hidden">
      <div 
        className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <h2 className="text-lg font-medium text-gray-900">Quản lý Skills & Kinh nghiệm</h2>
        <button type="button" className="text-gray-400 hover:text-gray-500">
          {expanded ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
      </div>
      
      {expanded && (
        <div className="px-4 py-5 bg-white sm:p-6">
          {/* Add Skill */}
          {canAddSkills && (
            <div className="mb-6">
              <div className="flex flex-col gap-4 md:flex-row mb-2">
                <div className="md:flex-1">
                  <label htmlFor="categorySelect" className="block text-sm font-medium text-gray-700 mb-1">
                    Loại Skill
                  </label>
                  <select
                    id="categorySelect"
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={selectedCategoryId?.toString() || ''}
                    onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                  >
                    <option value="">-- Chọn loại skill --</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="md:flex-1">
                  <label htmlFor="skillSelect" className="block text-sm font-medium text-gray-700 mb-1">
                    Tên Skill
                  </label>
                  <select
                    id="skillSelect"
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={selectedSkillId?.toString() || ''}
                    onChange={(e) => setSelectedSkillId(Number(e.target.value))}
                    disabled={!selectedCategoryId || getAvailableSkillsForSelection().length === 0}
                  >
                    <option value="">-- Chọn skill --</option>
                    {getAvailableSkillsForSelection().map(skill => (
                      <option key={skill.id} value={skill.id}>
                        {skill.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-end">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleAddSkill}
                    disabled={!selectedCategoryId || !selectedSkillId}
                  >
                    Thêm Skill
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Skills List */}
          <div>
            {Object.entries(skillsByCategory).length > 0 ? (
              Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                <div key={category} className="mb-6">
                  <h3 className="text-md font-medium text-gray-900 mb-3">{category}</h3>
                  <table className="min-w-full divide-y divide-gray-200 border">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                          Tên Skill
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Số năm kinh nghiệm
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tự đánh giá
                        </th>
                        {canAssessSkills && (
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Leader đánh giá
                          </th>
                        )}
                        {canAddSkills && (
                          <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                            Xóa
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {categorySkills.map((skill, index) => (
                        <tr key={skill.skillId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">
                            {availableSkills.find(s => s.id === skill.skillId)?.name || skill.skillName || `Skill #${skill.skillId}`}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              min="0"
                              max="50"
                              className={`block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                                !canAddSkills ? 'bg-gray-100' : ''
                              }`}
                              value={skill.years}
                              onChange={(e) => handleSkillChange(skill.skillId, 'years', parseInt(e.target.value) || 0)}
                              disabled={!canAddSkills}
                            />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <select
                              className={`block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                                !canAddSkills ? 'bg-gray-100' : ''
                              }`}
                              value={skill.level}
                              onChange={(e) => handleSkillChange(skill.skillId, 'level', e.target.value as SkillLevel)}
                              disabled={!canAddSkills}
                            >
                              <option value="Basic">Basic</option>
                              <option value="Intermediate">Intermediate</option>
                              <option value="Advanced">Advanced</option>
                              <option value="Expert">Expert</option>
                            </select>
                          </td>
                          {canAssessSkills && (
                            <td className="px-4 py-4 whitespace-nowrap">
                              <select
                                className={`block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                                  !canAssessSkills ? 'bg-gray-100' : ''
                                }`}
                                value={skill.leaderAssessment || ''}
                                onChange={(e) => handleSkillChange(skill.skillId, 'leaderAssessment', e.target.value as SkillLevel)}
                                disabled={!canAssessSkills}
                              >
                                <option value="">Chưa đánh giá</option>
                                <option value="Basic">Basic</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                                <option value="Expert">Expert</option>
                              </select>
                            </td>
                          )}
                          {canAddSkills && (
                            <td className="px-4 py-4 whitespace-nowrap text-center">
                              <button
                                type="button"
                                className="inline-flex items-center px-2 py-1 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                onClick={() => confirmRemoveSkill(skill.skillId)}
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span className="ml-1">Xóa</span>
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                Chưa có skill nào được thêm. Sử dụng nút "Thêm Skill" để bắt đầu.
              </div>
            )}
          </div>
          
          {/* Delete Confirmation Dialog */}
          <ConfirmationDialog
            isOpen={showDeleteConfirmation}
            onClose={cancelRemoveSkill}
            onConfirm={handleRemoveSkill}
            title="Xác nhận xóa skill"
            message="Bạn có chắc chắn muốn xóa skill này không? Hành động này không thể hoàn tác."
            confirmLabel="Xóa"
            cancelLabel="Hủy"
            confirmVariant="danger"
          />
        </div>
      )}
    </div>
  );
};

export default SkillsSection; 
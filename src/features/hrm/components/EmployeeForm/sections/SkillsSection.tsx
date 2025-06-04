import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SkillCategoryResponse, SkillResponse, SkillLevel } from '../../../types';
import { useSkillService } from '../../../hooks/useServices';
import { ConfirmationDialog } from '../../../../../components/modals/ConfirmationDialog';

interface ExtendedEmployeeSkillData {
  employeeSkillId?: number; // ID of the EmployeeSkillDto (link table record)
  skillId: number;         // ID of the actual Skill (from SkillDto)
  skillName?: string;       // For display purposes
  categoryId?: number;      // ID of the skill category
  categoryName?: string;    // For display purposes
  level: SkillLevel;       // Self-assessed level
  years: number;
  selfComment?: string;     // Self-assessed comment
  leaderAssessment?: SkillLevel | null; // Leader-assessed level, allows null
  leaderComment?: string | null;      // Leader-assessed comment, allows null
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
  
  console.log('[SkillsSection] Props received - isEditable:', isEditable, 'userRole:', userRole);

  const canEditSelfAssessment = isEditable;

  let rolesArray: string[] = [];
  if (userRole) {
    if (Array.isArray(userRole)) {
      rolesArray = userRole.map(r => String(r).toLowerCase());
    } else if (typeof userRole === 'string') {
      rolesArray = [userRole.toLowerCase()];
    }
  }
  const canEditLeaderAssessment = isEditable && (rolesArray.includes('leader') || rolesArray.includes('admin'));
  const canModifySkillList = isEditable;

  console.log('[SkillsSection] Permissions calculated - canEditSelfAssessment:', canEditSelfAssessment, 'canEditLeaderAssessment:', canEditLeaderAssessment, 'canModifySkillList:', canModifySkillList);
  
  // Fetch skill categories
  const { data: categoriesData } = useQuery({
    queryKey: ['skillCategories'],
    queryFn: async () => {
      const response = await skillService.getSkillCategories(); 
      // Log shows response is directly an array: SkillCategoryResponse[]
      // Declared type of skillService.getSkillCategories() is Promise<{ content: SkillCategoryResponse[], pageable: ... }>

      // Check if response is directly an array (actual runtime behavior from log)
      if (Array.isArray(response)) {
        return response;
      } 
      // Fallback to check for the declared structure (response.content)
      else if (response && typeof response === 'object' && 'content' in response && Array.isArray(response.content)) {
        return response.content;
      }

      console.warn('[SkillsSection] Skill categories data is not in a recognized format:', response);
      return []; // Return empty array to prevent error
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
    
    const skillToAdd = availableSkills.find(s => s.id === selectedSkillId) as any; // Cast to any to access potential flat properties
    
    if (skillToAdd) {
      let categoryIdToAdd: number | undefined;
      let categoryNameToAdd: string | undefined;

      // Prioritize direct properties if they exist (based on console log observations)
      if (typeof skillToAdd.categoryId === 'number' && typeof skillToAdd.categoryName === 'string') {
        categoryIdToAdd = skillToAdd.categoryId;
        categoryNameToAdd = skillToAdd.categoryName;
      } 
      // Fallback to nested structure (as per SkillResponse type definition)
      else if (skillToAdd.category && typeof skillToAdd.category.id === 'number' && typeof skillToAdd.category.name === 'string') {
        categoryIdToAdd = skillToAdd.category.id;
        categoryNameToAdd = skillToAdd.category.name;
      }

      if (categoryIdToAdd === undefined || categoryNameToAdd === undefined) {
        console.error('[SkillsSection] Error: Skill to add does not have complete category information. Skill object from availableSkills:', JSON.stringify(skillToAdd));
        alert('Lỗi: Skill được chọn không có đủ thông tin về danh mục. Vui lòng kiểm tra lại cấu trúc dữ liệu skill từ API.');
        return; 
      }

      const newSkill: ExtendedEmployeeSkillData = {
        skillId: skillToAdd.id,
        skillName: skillToAdd.name,
        categoryId: categoryIdToAdd,
        categoryName: categoryNameToAdd,
        level: 'Basic', 
        years: 0        
      };
      
      onSkillsChange([...skills, newSkill]);
      setSelectedSkillId(null); 
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
  
  const inputBaseClasses = "p-2 border rounded-md shadow-sm sm:text-sm";
  const enabledInputClasses = "bg-white text-gray-900 focus:ring-indigo-500 focus:border-indigo-500";
  const disabledInputClasses = "bg-gray-100 cursor-not-allowed text-gray-500";

  return (
    <div className="mb-8 border border-gray-200 rounded-md overflow-hidden shadow-sm">
      <div 
        className="bg-slate-50 px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors duration-150"
        onClick={() => setExpanded(!expanded)}
      >
        <h2 className="text-lg font-medium text-gray-700">Quản lý Skills & Kinh nghiệm</h2>
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
          {canModifySkillList && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex flex-col gap-4 md:flex-row mb-2 items-end">
                <div className="md:flex-1">
                  <label htmlFor="categorySelect" className="block text-sm font-medium text-gray-700 mb-1">
                    Loại Skill
                  </label>
                  <select
                    id="categorySelect"
                    className={`${inputBaseClasses} w-full ${enabledInputClasses}`}
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
                    className={`${inputBaseClasses} w-full ${enabledInputClasses}`}
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
                    disabled={!selectedCategoryId || !selectedSkillId || !canModifySkillList}
                  >
                    Thêm Skill
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div>
            {Object.entries(skillsByCategory).length > 0 ? (
              Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                <div key={category} className="mb-6">
                  <h3 className="text-base font-semibold text-gray-800 mb-3 tracking-wide pb-1 border-b border-gray-200">{category}</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Tên Skill</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Số năm KN</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Tự đánh giá</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Bình luận cá nhân</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Leader đánh giá</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Nhận xét Leader</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {categorySkills.map(skill => (
                          <tr key={skill.skillId} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{skill.skillName}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              <input 
                                type="number" min="0" step="0.5" value={skill.years}
                                disabled={!canEditSelfAssessment} 
                                onChange={(e) => handleSkillChange(skill.skillId, 'years', parseFloat(e.target.value))}
                                className={`${inputBaseClasses} w-24 ${!canEditSelfAssessment ? disabledInputClasses : enabledInputClasses}`}
                              />
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              <select value={skill.level}
                                disabled={!canEditSelfAssessment}
                                onChange={(e) => handleSkillChange(skill.skillId, 'level', e.target.value)}
                                className={`${inputBaseClasses} w-full ${!canEditSelfAssessment ? disabledInputClasses : enabledInputClasses}`}
                              >
                                <option value="Basic">Basic</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                                <option value="Expert">Expert</option>
                              </select>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              <textarea value={skill.selfComment || ''}
                                disabled={!canEditSelfAssessment}
                                onChange={(e) => handleSkillChange(skill.skillId, 'selfComment', e.target.value)}
                                className={`${inputBaseClasses} w-full ${!canEditSelfAssessment ? disabledInputClasses : enabledInputClasses}`}
                                rows={2}
                              />
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              <select value={skill.leaderAssessment || ''}
                                disabled={!canEditLeaderAssessment}
                                onChange={(e) => handleSkillChange(skill.skillId, 'leaderAssessment', e.target.value || null)}
                                className={`${inputBaseClasses} w-full ${!canEditLeaderAssessment ? disabledInputClasses : enabledInputClasses}`}
                              >
                                <option value="">-- Chưa đánh giá --</option>
                                <option value="Basic">Basic</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                                <option value="Expert">Expert</option>
                              </select>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              <textarea value={skill.leaderComment || ''}
                                disabled={!canEditLeaderAssessment}
                                onChange={(e) => handleSkillChange(skill.skillId, 'leaderComment', e.target.value)}
                                className={`${inputBaseClasses} w-full ${!canEditLeaderAssessment ? disabledInputClasses : enabledInputClasses}`}
                                rows={2}
                              />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                              {canModifySkillList && (
                                <button 
                                  type="button"
                                  onClick={() => confirmRemoveSkill(skill.skillId)} 
                                  className="text-red-500 hover:text-red-700 font-medium p-1 rounded hover:bg-red-100 transition-colors duration-150"
                                >
                                  Xóa
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                Chưa có skill nào được thêm. Sử dụng các trường chọn ở trên và nút "Thêm Skill" để bắt đầu.
              </div>
            )}
          </div>
          
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
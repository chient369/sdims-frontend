/**
 * Employee Detail Page (MH-HRM-02)
 * Displays comprehensive information about an employee with tabs for different sections
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PermissionGuard from '../../../components/ui/PermissionGuard';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Spinner } from '../../../components/ui/Spinner';
import { Tabs, TabItem } from '../components';
import { 
  EmployeeResponse, 
  EmployeeProjectHistoryResponse,
  NewEmployeeApiResponse,
  NewEmployeeSkillResponse
} from '../types';
import { useEmployeeService, useSkillService } from '../hooks';
import { ArrowLeft, Edit } from 'react-feather';
import useAuth from '../../../hooks/useAuth';
import { hasPermission } from '../../../utils/permissions';
import { useQuery } from '@tanstack/react-query';

// Status badge color mapping
const statusColorMap: Record<string, string> = {
  'Available': 'bg-green-100 text-green-800',
  'Allocated': 'bg-blue-100 text-blue-800',
  'PartiallyAllocated': 'bg-purple-100 text-purple-800',
  'EndingSoon': 'bg-amber-100 text-amber-800',
  'Unavailable': 'bg-red-100 text-red-800',
  'OnLeave': 'bg-orange-100 text-orange-800'
};

// Margin status color mapping
const marginStatusColorMap: Record<string, string> = {
  'Red': 'bg-red-100 text-red-800',
  'Yellow': 'bg-yellow-100 text-yellow-800',
  'Green': 'bg-green-100 text-green-800',
};

/**
 * Employee Detail Page Component
 * 
 * @returns {JSX.Element} The employee detail page
 */
const EmployeeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const employeeService = useEmployeeService();
  const skillService = useSkillService();
  const { user, permissions } = useAuth();
  
  const [employee, setEmployee] = useState<NewEmployeeApiResponse | null>(null);
  const [skills, setSkills] = useState<NewEmployeeSkillResponse[]>([]);
  const [projectHistory, setProjectHistory] = useState<EmployeeProjectHistoryResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [contractAllocations, setContractAllocations] = useState<any[]>([]);
  
  // Fetch employee data
  const { data: employeeData, isLoading, error: employeeError } = useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      if (!id) throw new Error('Employee ID is required');
      return fetchEmployeeData();
    },
    enabled: !!id,
  });
  
  // Fetch project history
  const { data: projectHistoryData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['employee-project-history', id],
    queryFn: async () => {
      if (!id) throw new Error('Employee ID is required');
      const response = await employeeService.getEmployeeProjectHistory(id);
      return response.data;
    },
    enabled: !!id,
  });
  
  // Update local state when data is fetched
  useEffect(() => {
    if (employeeData) {
      setEmployee(employeeData);
    }
  }, [employeeData]);
  
  useEffect(() => {
    if (projectHistoryData) {
      setProjectHistory(projectHistoryData);
    }
  }, [projectHistoryData]);
  
  // Fetch employee data
  const fetchEmployeeData = async () => {
    if (!id) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch employee details
      const employeeData = await employeeService.getEmployeeById(id);
      setEmployee(employeeData);
      
      // Fetch employee skills
      const skillsData = await skillService.getEmployeeSkills(id);
      setSkills(skillsData);
      
      // Fetch project history
      const historyResponse = await employeeService.getEmployeeProjectHistory(id);
      setProjectHistory(historyResponse.data || []);
    } catch (err) {
      console.error('Error fetching employee data:', err);
      setError('Không thể tải thông tin nhân viên. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Kiểm tra xem có employee và user khi có dữ liệu
  useEffect(() => {
  }, [employee, user, permissions]);
  
  const handleBackClick = () => {
    navigate('/hrm/employees');
  };
  
  const handleEditClick = () => {
    if (id) {
      navigate(`/hrm/employees/${id}/edit`);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 text-red-800 p-4 rounded-md">
        <p>{error}</p>
        <Button variant="secondary" className="mt-2" onClick={handleBackClick}>
          Quay lại
        </Button>
      </div>
    );
  }
  
  if (!employee) {
    return (
      <div className="bg-amber-50 text-amber-800 p-4 rounded-md">
        <p>Không tìm thấy nhân viên với mã: {id}</p>
        <Button variant="secondary" className="mt-2" onClick={handleBackClick}>
          Quay lại
        </Button>
      </div>
    );
  }
  
  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    const category = skill.skillCategoryName || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, NewEmployeeSkillResponse[]>);
  
  // Prepare tab content
  const tabs: TabItem[] = [
    {
      id: 'info',
      label: 'Thông tin cơ bản',
      content: (
        <div className="py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4">Thông tin cá nhân</h3>
                <div className="space-y-4">
                  <div className="flex border-b border-gray-200 py-3">
                    <div className="w-1/2 text-gray-500">Họ và tên đầy đủ</div>
                    <div className="w-1/2 font-medium">{`${employee.firstName || ''} ${employee.lastName || ''}`.trim()}</div>
                  </div>
                  <div className="flex border-b border-gray-200 py-3">
                    <div className="w-1/2 text-gray-500">Ngày sinh</div>
                    <div className="w-1/2 font-medium">{employee.birthDate ? new Date(employee.birthDate).toLocaleDateString() : 'N/A'}</div>
                  </div>
                  <div className="flex border-b border-gray-200 py-3">
                    <div className="w-1/2 text-gray-500">Giới tính</div>
                    <div className="w-1/2 font-medium">Nam</div>
                  </div>
                  <div className="flex py-3">
                    <div className="w-1/2 text-gray-500">Số CMND/CCCD</div>
                    <div className="w-1/2 font-medium">012345678901</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4">Địa chỉ</h3>
                <p>{employee.address || 'N/A'}</p>
              </div>
            </div>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4">Thông tin liên hệ</h3>
                <div className="space-y-4">
                  <div className="flex border-b border-gray-200 py-3">
                    <div className="w-1/2 text-gray-500">Email cá nhân</div>
                    <div className="w-1/2 font-medium">nguyenvana@gmail.com</div>
                  </div>
                  <div className="flex border-b border-gray-200 py-3">
                    <div className="w-1/2 text-gray-500">Số điện thoại</div>
                    <div className="w-1/2 font-medium">{employee.phoneNumber || 'N/A'}</div>
                  </div>
                  <div className="flex py-3">
                    <div className="w-1/2 text-gray-500">Người liên hệ khẩn cấp</div>
                    <div className="w-1/2 font-medium">
                      {employee.emergencyContact || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4">Thông tin bổ sung</h3>
                <div className="space-y-4">
                  <div className="flex border-b border-gray-200 py-3">
                    <div className="w-1/2 text-gray-500">Trình độ học vấn</div>
                    <div className="w-1/2 font-medium">Đại học - Kỹ sư CNTT</div>
                  </div>
                  <div className="flex border-b border-gray-200 py-3">
                    <div className="w-1/2 text-gray-500">Trường</div>
                    <div className="w-1/2 font-medium">Đại học Bách Khoa TP.HCM</div>
                  </div>
                  <div className="flex border-b border-gray-200 py-3">
                    <div className="w-1/2 text-gray-500">Năm tốt nghiệp</div>
                    <div className="w-1/2 font-medium">2015</div>
                  </div>
                  <div className="flex py-3">
                    <div className="w-1/2 text-gray-500">Số năm kinh nghiệm</div>
                    <div className="w-1/2 font-medium">8 năm</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'skills',
      label: 'Kỹ năng chuyên môn',
      content: (
        <div className="py-6">
          {Object.keys(skillsByCategory).length > 0 ? (
            <div className="space-y-8">
              {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                <div key={category} className="border border-gray-200 rounded-lg mb-6">
                  <h3 className="text-base font-medium text-gray-700 p-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                    {category}
                  </h3>
                  <div className="p-4">
                    <table className="min-w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">TÊN KỸ NĂNG</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">SỐ NĂM KN</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">TỰ ĐÁNH GIÁ</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">LEADER ĐÁNH GIÁ</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">THAO TÁC</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {categorySkills.map(skill => (
                          <tr key={skill.id} className="hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <div className="font-medium text-gray-900">{skill.skillName}</div>
                              {skill.selfComment && (
                                <div className="text-sm text-gray-500 mt-1 italic">"{skill.selfComment}"</div>
                              )}
                            </td>
                            <td className="py-4 px-4 text-center text-gray-700">{skill.yearsExperience} năm</td>
                            <td className="py-4 px-4">
                              <div className="flex justify-center">
                                {Array.from({ length: 5 }).map((_, index) => (
                                  <svg 
                                    key={index} 
                                    className={`w-5 h-5 ${index < (skill.selfAssessmentLevel === 'Expert' || skill.selfAssessmentLevel === 'Advanced' ? 4 : skill.selfAssessmentLevel === 'Intermediate' ? 3 : 2) ? 'text-yellow-400' : 'text-gray-300'}`} 
                                    fill="currentColor" 
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                                <span className="ml-1 text-xs text-gray-500">
                                  {skill.selfAssessmentLevel === 'Expert' || skill.selfAssessmentLevel === 'Advanced' ? '4/5' : skill.selfAssessmentLevel === 'Intermediate' ? '3/5' : '2/5'}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex justify-center">
                                {Array.from({ length: 5 }).map((_, index) => (
                                  <svg 
                                    key={index} 
                                    className={`w-5 h-5 ${index < (skill.selfAssessmentLevel === 'Expert' || skill.selfAssessmentLevel === 'Advanced' ? 4 : skill.selfAssessmentLevel === 'Intermediate' ? 3 : 2) ? 'text-yellow-400' : 'text-gray-300'}`} 
                                    fill="currentColor" 
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                                <span className="ml-1 text-xs text-gray-500">
                                  {skill.selfAssessmentLevel === 'Expert' || skill.selfAssessmentLevel === 'Advanced' ? '4/5' : skill.selfAssessmentLevel === 'Intermediate' ? '3/5' : '2/5'}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <PermissionGuard requiredPermission="employee-skill:update:all">
                                <button 
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                  onClick={() => navigate(`/hrm/employees/${id}/skills/${skill.id}/edit`)}
                                >
                                  Chỉnh sửa
                                </button>
                              </PermissionGuard>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
              <div className="flex justify-end mt-4">
                <PermissionGuard requiredPermission="employee-skill:create:all">
                  <Button 
                    variant="default"
                    onClick={() => navigate(`/hrm/employees/${id}/skills/add`)}
                  >
                    Thêm kỹ năng
                  </Button>
                </PermissionGuard>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 border border-gray-200 rounded-lg">
              <p className="text-gray-500 mb-4">Không có thông tin kỹ năng</p>
              <PermissionGuard requiredPermission="employee-skill:create:all">
                <Button 
                  variant="default"
                  onClick={() => navigate(`/hrm/employees/${id}/skills/add`)}
                >
                  Thêm kỹ năng
                </Button>
              </PermissionGuard>
            </div>
          )}
          
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Chứng chỉ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {employee.id === 1 && (
                <>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-md text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">AWS Certified Solutions Architect</h4>
                        <p className="text-gray-500 text-sm">Amazon Web Services</p>
                        <p className="text-gray-500 text-sm mt-1">Ngày cấp: 15/03/2024</p>
                      </div>
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-red-100 rounded-md text-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Oracle Certified Professional</h4>
                        <p className="text-gray-500 text-sm">Oracle Corporation</p>
                        <p className="text-gray-500 text-sm mt-1">Ngày cấp: 20/06/2023</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
              <PermissionGuard requiredPermission="employee-skill:create:all">
                <div className="flex justify-end mt-4 md:col-span-2">
                  <Button 
                    variant="default"
                    onClick={() => navigate(`/hrm/employees/${id}/certificates/add`)}
                  >
                    Thêm chứng chỉ
                  </Button>
                </div>
              </PermissionGuard>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'projects',
      label: 'Lịch sử dự án',
      content: (
        <div className="py-6">
          {projectHistoryData && projectHistoryData.length > 0 ? (
            <div className="relative border-l-2 border-blue-500 ml-6 space-y-10 py-2">
              {projectHistoryData
                .sort((a, b) => new Date(b.endDate || '').getTime() - new Date(a.endDate || '').getTime())
                .map(project => (
                <div key={project.id} className="relative ml-6">
                  {/* Timeline marker */}
                  <div className="absolute -left-10 mt-1.5 w-4 h-4 rounded-full bg-blue-500 border-4 border-white"></div>
                  
                  <div className="p-4">
                    <div className="mb-4">
                      <h3 className="font-bold text-lg text-gray-800">{project.projectName}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{new Date(project.startDate).toLocaleDateString('vi-VN')}</span>
                        <span>→</span>
                        <span>{project.endDate ? new Date(project.endDate).toLocaleDateString('vi-VN') : 'Hiện tại'}</span>
                        <Badge className="ml-2 bg-green-100 text-green-800">Hoàn thành</Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Vai trò</p>
                        <p className="font-medium">{project.role}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phân bổ</p>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">N/A</span>
                          <div className="w-24 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full" 
                              style={{ width: `0%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      {false && (
                        <>
                          <div>
                            <p className="text-sm text-gray-500">Đánh giá</p>
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, index) => (
                                <svg 
                                  key={index} 
                                  className={`w-4 h-4 ${index < 0 ? 'text-yellow-400' : 'text-gray-300'}`} 
                                  fill="currentColor" 
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          
                          {false && (
                            <div>
                              <p className="text-sm text-gray-500">Feedback</p>
                              <p className="text-sm italic">N/A</p>
                            </div>
                          )}
                        </>
                      )}
                      
                      {project.endDate && (
                        <div>
                          <p className="text-sm text-gray-500">Thời gian hoàn thành</p>
                          <p className="font-medium">
                            {Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))} ngày
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">Không có lịch sử dự án đã hoàn thành</p>
              <div className="mt-4">
                <Button variant="outline" onClick={() => navigate(`/hrm/employees/${id}/allocations`)}>
                  Xem phân bổ hiện tại
                </Button>
              </div>
            </div>
          )}
          
          {projectHistory.length > 0 && (!projectHistoryData || projectHistoryData.length === 0) && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">Có dữ liệu lịch sử dự án cũ</h4>
                  <p className="text-sm text-blue-600">
                    Tìm thấy {projectHistory.length} dự án trong hệ thống cũ. Hệ thống đang trong quá trình cập nhật dữ liệu sang định dạng mới.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'status',
      label: 'Trạng thái & phân bổ',
      content: (
        <div className="py-6">
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4">Trạng thái hiện tại</h3>
            <div className="flex flex-col items-center py-6">
              <Badge
                className={`text-base px-4 py-1.5 ${statusColorMap[employee.currentStatus] || 'bg-gray-100 text-gray-800'}`}
              >
                {employee.currentStatus === 'PartiallyAllocated' ? 'Đang phân bổ một phần' : employee.currentStatus}
              </Badge>
              
              {(employee.currentStatus === 'Allocated' || employee.currentStatus === 'PartiallyAllocated' || employee.currentStatus === 'EndingSoon') && 
                projectHistory && projectHistory.length > 0 && (
                <div className="mt-6 w-full max-w-2xl mx-auto">
                  <h4 className="text-md font-semibold text-gray-700 mb-3 text-center">Thông tin phân bổ hiện tại</h4>
                  <div className="space-y-3">
                    {projectHistory.filter(ph => !ph.endDate || new Date(ph.endDate) >= new Date()).slice(0, 2).map((ph, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                        <div className="font-medium text-gray-800">{ph.projectName}</div>
                        <div className="text-sm text-gray-600">Vai trò: {ph.role || 'N/A'}</div>
                        <div className="text-sm text-gray-600">
                          Thời gian: {new Date(ph.startDate).toLocaleDateString('vi-VN')} - {ph.endDate ? new Date(ph.endDate).toLocaleDateString('vi-VN') : 'Hiện tại'}
                        </div>
                        {false && (
                           <div className="text-sm text-gray-500">Phân bổ: N/A</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <PermissionGuard requiredPermission="employee-status:update:all">
                <Button 
                  className="mt-6" 
                  onClick={() => navigate(`/hrm/employees/${id}/status/edit`)}
                >
                  Cập nhật trạng thái
                </Button>
              </PermissionGuard>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'work-history',
      label: 'Lịch sử công việc',
      content: (
        <div className="py-6">
          {projectHistory.length > 0 ? (
            <div className="space-y-6">
              {projectHistory.map((historyItem) => (
                <div key={historyItem.id} className="bg-white p-4 shadow rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-semibold text-blue-600">{historyItem.projectName}</h4>
                      <p className="text-sm text-gray-500">Khách hàng: {historyItem.clientName || 'N/A'}</p>
                    </div>
                    <Badge color="primary" className="text-xs">
                      {new Date(historyItem.startDate).toLocaleDateString('vi-VN')} -
                      {historyItem.endDate ? new Date(historyItem.endDate).toLocaleDateString('vi-VN') : 'Hiện tại'}
                    </Badge>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm"><span className="font-medium text-gray-600">Vai trò:</span> {historyItem.role || 'N/A'}</p>
                    {false && (
                      <p className="text-sm"><span className="font-medium text-gray-600">Mức độ tham gia:</span> N/A</p>
                    )}
                    {historyItem.description && <p className="text-sm mt-1"><span className="font-medium text-gray-600">Mô tả:</span> {historyItem.description}</p>}
                    {false && (
                       <p className="text-sm"><span className="font-medium text-gray-600">Đánh giá:</span> N/A</p>
                    )}
                    {false && <p className="text-sm mt-1"><span className="font-medium text-gray-600">Feedback:</span> N/A</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Chưa có lịch sử công việc.</p>
          )}
        </div>
      )
    }
  ];
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Back button */}
      <div className="mb-4">
        <button 
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
          onClick={handleBackClick}
        >
          <ArrowLeft size={16} className="mr-1" />
          <span>Quay lại</span>
        </button>
      </div>
      
      {/* Header */}
      <div className="bg-white rounded-lg shadow mb-6 relative">
        <div className="p-6">
          {/* Edit button in top-right corner */}
          <div className="absolute top-4 right-4">
            {employee && user && (
              <>
                {/* Hiển thị nút Edit khi có quyền */}
                {(hasPermission('employee:update:all', permissions) || 
                  hasPermission('employee:update:team', permissions) || 
                  (hasPermission('employee:update:own', permissions) && 
                   user.id === employee.id.toString())) && (
                  <Button
                    variant="secondary"
                    className="flex items-center"
                    onClick={handleEditClick}
                    data-test-id="edit-employee-button"
                  >
                    <Edit size={16} className="mr-1" />
                    Sửa
                  </Button>
                )}
              </>
            )}
          </div>
          
          {/* Avatar and info section */}
          <div className="flex flex-col md:flex-row gap-8 mb-6">
            {/* Avatar section */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-5xl font-bold">
                {(employee.firstName || '?').charAt(0)}
              </div>
              <div className="text-sm text-gray-500 text-center mt-2">Mã NV: {employee.employeeCode}</div>
              <div className="mt-2">
                <Badge className={`${statusColorMap[employee.currentStatus] || 'bg-gray-100 text-gray-800'}`}>
                  {employee.currentStatus} 
                </Badge>
              </div>
            </div>
            
            {/* Name and info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{`${employee.firstName || ''} ${employee.lastName || ''}`.trim()}</h1>
              
              {/* Information grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 mt-4">
                <div>
                  <div className="text-gray-500 text-sm">Vị trí công việc</div>
                  <div className="font-medium mt-1">{employee.position}</div>
                </div>
                
                <div>
                  <div className="text-gray-500 text-sm">Team</div>
                  <div className="font-medium mt-1">{employee.team?.name}</div>
                </div>
                
                <div>
                  <div className="text-gray-500 text-sm">Leader trực tiếp</div>
                  <div className="font-medium mt-1">Trần Văn B</div>
                </div>
                
                <div>
                  <div className="text-gray-500 text-sm">Email công ty</div>
                  <div className="font-medium mt-1">{employee.companyEmail}</div>
                </div>
                
                <div>
                  <div className="text-gray-500 text-sm">Ngày vào công ty</div>
                  <div className="font-medium mt-1">{employee.hireDate ? new Date(employee.hireDate).toLocaleDateString('vi-VN') : 'N/A'}</div>
                </div>
                
                <div>
                  <div className="text-gray-500 text-sm">Số điện thoại</div>
                  <div className="font-medium mt-1">{employee.phoneNumber || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white rounded-md">
        <Tabs items={tabs} />
      </div>
    </div>
  );
};

export default EmployeeDetail; 
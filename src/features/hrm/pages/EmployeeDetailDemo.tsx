/**
 * Demo page for testing the Employee Detail page
 * Contains mock data for testing without API calls
 */

import React from 'react';
import { EmployeeResponse, EmployeeSkillDetail, EmployeeProjectHistoryResponse } from '../types';
import PermissionGuard from '../../../components/ui/PermissionGuard';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Tabs, TabItem } from '../components';
import { ArrowLeft, Edit } from 'react-feather';

// Mock employee data
const mockEmployee: EmployeeResponse = {
  id: 1,
  employeeCode: 'EMP001',
  name: 'Nguyen Van A',
  email: 'nguyenvana@example.com',
  position: 'Senior Developer',
  phone: '0912345678',
  address: 'Ha Noi, Viet Nam',
  birthDate: '1990-01-01',
  joinDate: '2020-01-01',
  team: {
    id: 1,
    name: 'Frontend Team'
  },
  status: 'PartiallyAllocated',
  currentProject: 'SDIMS Project',
  utilization: 80,
  endDate: '2023-12-31',
  emergencyContact: {
    name: 'Nguyen Van B',
    phone: '0987654321',
    relation: 'Family'
  },
  avatar: undefined,
  userId: 1,
  note: 'Experienced React developer with good communication skills',
  allocations: [
    {
      id: 1,
      project: {
        id: 103,
        name: 'SDIMS Project'
      },
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      allocation: 80,
      position: 'Senior Developer',
      status: 'Active'
    },
    {
      id: 2,
      project: {
        id: 104,
        name: 'Banking App'
      },
      startDate: '2023-05-15',
      endDate: '2023-10-15',
      allocation: 20,
      position: 'Frontend Consultant',
      status: 'Active'
    },
    {
      id: 3,
      project: {
        id: 105,
        name: 'E-commerce Platform V2'
      },
      startDate: '2024-01-01',
      endDate: '2024-06-30',
      allocation: 40,
      position: 'React Developer',
      status: 'Upcoming'
    }
  ]
};

// Mock skills data
const mockSkills: EmployeeSkillDetail[] = [
  {
    id: 1,
    name: 'JavaScript',
    category: {
      id: 1,
      name: 'Programming Languages'
    },
    level: 'Advanced',
    years: 5,
    description: 'ES6+, TypeScript',
    isVerified: true,
    verifiedBy: {
      id: 2,
      name: 'Team Leader'
    },
    lastUpdated: '2023-01-15T10:30:00Z'
  },
  {
    id: 2,
    name: 'React',
    category: {
      id: 2,
      name: 'Frameworks'
    },
    level: 'Advanced',
    years: 4,
    description: 'Redux, Context API',
    isVerified: true,
    verifiedBy: {
      id: 2,
      name: 'Team Leader'
    },
    lastUpdated: '2023-01-15T10:30:00Z'
  },
  {
    id: 3,
    name: 'Node.js',
    category: {
      id: 2,
      name: 'Frameworks'
    },
    level: 'Intermediate',
    years: 3,
    description: 'Express, NestJS',
    isVerified: true,
    verifiedBy: {
      id: 2,
      name: 'Team Leader'
    },
    lastUpdated: '2023-01-15T10:30:00Z'
  },
  {
    id: 4,
    name: 'MySQL',
    category: {
      id: 3,
      name: 'Databases'
    },
    level: 'Intermediate',
    years: 4,
    isVerified: false,
    lastUpdated: '2023-01-15T10:30:00Z'
  }
];

// Mock project history
const mockProjectHistory: EmployeeProjectHistoryResponse[] = [
  {
    id: 1,
    projectId: 101,
    projectName: 'E-commerce Platform',
    startDate: '2020-01-15',
    endDate: '2021-06-30',
    role: 'Frontend Developer',
    utilization: 100,
    performanceRating: 5,
    feedback: 'Excellent work on implementing complex UI components'
  },
  {
    id: 2,
    projectId: 102,
    projectName: 'CRM System',
    startDate: '2021-07-15',
    endDate: '2022-12-31',
    role: 'Senior Developer',
    utilization: 80,
    performanceRating: 4,
    feedback: undefined
  },
  {
    id: 3,
    projectId: 103,
    projectName: 'SDIMS Project',
    startDate: '2023-01-01',
    endDate: undefined,
    role: 'Senior Developer',
    utilization: 80,
    performanceRating: undefined,
    feedback: undefined
  }
];

// Status badge color mapping
const statusColorMap: Record<string, string> = {
  'Available': 'bg-green-100 text-green-800',
  'Allocated': 'bg-blue-100 text-blue-800',
  'PartiallyAllocated': 'bg-purple-100 text-purple-800',
  'EndingSoon': 'bg-amber-100 text-amber-800',
  'Unavailable': 'bg-red-100 text-red-800',
  'OnLeave': 'bg-orange-100 text-orange-800'
};

/**
 * Demo component for Employee Detail
 */
const EmployeeDetailDemo: React.FC = () => {
  const employee = mockEmployee;
  const skills = mockSkills;
  const projectHistory = mockProjectHistory;
  
  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    const category = skill.category.name;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, EmployeeSkillDetail[]>);

  // Demo navigation functions
  const handleBack = () => {
    alert('Back button clicked - would navigate back');
  };
  
  const handleEdit = () => {
    alert('Edit button clicked - would navigate to edit page');
  };

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
                    <div className="w-1/2 font-medium">{employee.name}</div>
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
                    <div className="w-1/2 font-medium">{employee.phone || 'N/A'}</div>
                  </div>
                  <div className="flex border-b border-gray-200 py-3">
                    <div className="w-1/2 text-gray-500">Người liên hệ khẩn cấp</div>
                    <div className="w-1/2 font-medium">
                      {employee.emergencyContact?.name || 'N/A'} 
                      {employee.emergencyContact?.relation ? ` (${employee.emergencyContact.relation})` : ''}
                    </div>
                  </div>
                  <div className="flex py-3">
                    <div className="w-1/2 text-gray-500">SĐT liên hệ khẩn cấp</div>
                    <div className="w-1/2 font-medium">{employee.emergencyContact?.phone || 'N/A'}</div>
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
                              <div className="font-medium text-gray-900">{skill.name}</div>
                              {skill.description && (
                                <div className="text-sm text-gray-500 mt-1">{skill.description}</div>
                              )}
                            </td>
                            <td className="py-4 px-4 text-center text-gray-700">{skill.years}</td>
                            <td className="py-4 px-4">
                              <div className="flex justify-center">
                                {Array.from({ length: 5 }).map((_, index) => (
                                  <svg 
                                    key={index} 
                                    className={`w-5 h-5 ${index < (skill.level === 'Advanced' ? 4 : skill.level === 'Intermediate' ? 3 : 2) ? 'text-yellow-400' : 'text-gray-300'}`} 
                                    fill="currentColor" 
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                                <span className="ml-1 text-xs text-gray-500">{skill.level === 'Advanced' ? '4/5' : skill.level === 'Intermediate' ? '3/5' : '2/5'}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex justify-center">
                                {Array.from({ length: 5 }).map((_, index) => (
                                  <svg 
                                    key={index} 
                                    className={`w-5 h-5 ${index < (skill.level === 'Advanced' ? 4 : skill.level === 'Intermediate' ? 3 : 2) ? 'text-yellow-400' : 'text-gray-300'}`} 
                                    fill="currentColor" 
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                                <span className="ml-1 text-xs text-gray-500">{skill.level === 'Advanced' ? '4/5' : skill.level === 'Intermediate' ? '3/5' : '2/5'}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <PermissionGuard requiredPermission="employee-skill:update:all">
                                <button 
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                  onClick={() => alert('Would navigate to edit skill page')}
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
                    className="mt-2" 
                    variant="default"
                    onClick={() => alert('Would navigate to add skills page')}
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
                  onClick={() => alert('Would navigate to add skills page')}
                >
                  Thêm kỹ năng
                </Button>
              </PermissionGuard>
            </div>
          )}
          
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Chứng chỉ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <PermissionGuard requiredPermission="employee-skill:create:all">
                <div className="flex justify-end mt-4 md:col-span-2">
                  <Button 
                    variant="secondary"
                    onClick={() => alert('Would navigate to add certificate page')}
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
          {projectHistory.length > 0 ? (
            <div className="relative border-l-2 border-blue-500 ml-6 space-y-10 py-2">
              {projectHistory.map(project => (
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
                          <span className="font-medium">{project.utilization}%</span>
                          <div className="w-24 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full" 
                              style={{ width: `${project.utilization}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      {project.performanceRating && (
                        <div>
                          <p className="text-sm text-gray-500">Đánh giá</p>
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <svg 
                                key={index} 
                                className={`w-4 h-4 ${index < project.performanceRating! ? 'text-yellow-400' : 'text-gray-300'}`} 
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      )}
                      {project.feedback && (
                        <div>
                          <p className="text-sm text-gray-500">Feedback</p>
                          <p className="text-sm italic">{project.feedback}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4">
              <p className="text-gray-500">Không có lịch sử dự án</p>
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
                className={`text-base px-4 py-1.5 ${statusColorMap[employee.status] || 'bg-gray-100 text-gray-800'}`}
              >
                {employee.status === 'PartiallyAllocated' ? 'Đang phân bổ một phần' : employee.status}
              </Badge>
              
              {/* Hiển thị thông tin phân bổ dự án */}
              {(employee.status === 'Allocated' || employee.status === 'PartiallyAllocated' || employee.status === 'EndingSoon') && 
                employee.allocations && employee.allocations.length > 0 && (
                <div className="mt-6 w-full max-w-3xl mx-auto">
                  <h4 className="font-medium text-gray-900 mb-4 text-center">Phân bổ dự án hiện tại</h4>
                  
                  <div className="space-y-4">
                    {employee.allocations
                      .filter(allocation => allocation.status === 'Active')
                      .map(allocation => (
                      <div key={allocation.id} className="p-5 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h5 className="text-lg font-semibold text-gray-900">{allocation.project.name}</h5>
                            <p className="text-sm text-gray-600">Vai trò: {allocation.position}</p>
                          </div>
                          <Badge className={allocation.allocation >= 50 ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
                            {allocation.allocation}% phân bổ
                          </Badge>
                        </div>
                        
                        <div className="mb-4">
                          <div className="text-sm text-gray-600 mb-1">Thời gian tham gia</div>
                          <div className="flex items-center gap-2 text-sm">
                            <span>{new Date(allocation.startDate).toLocaleDateString('vi-VN')}</span>
                            <span>→</span>
                            <span>{allocation.endDate ? new Date(allocation.endDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}</span>
                            {allocation.endDate && (
                              <span className="text-sm text-gray-500">
                                (còn {Math.ceil((new Date(allocation.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} ngày)
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="mb-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">Tỷ lệ phân bổ</span>
                            <span className="text-sm font-medium">{allocation.allocation}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${allocation.allocation >= 50 ? 'bg-blue-600' : 'bg-purple-600'}`}
                              style={{ width: `${allocation.allocation}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Hiển thị tổng phân bổ */}
                  {employee.allocations.filter(a => a.status === 'Active').length > 0 && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Tổng phân bổ hiện tại:</span>
                        <span className="font-bold text-lg">
                          {employee.allocations
                            .filter(a => a.status === 'Active')
                            .reduce((sum, curr) => sum + curr.allocation, 0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-indigo-600 h-3 rounded-full" 
                          style={{ 
                            width: `${Math.min(
                              employee.allocations
                                .filter(a => a.status === 'Active')
                                .reduce((sum, curr) => sum + curr.allocation, 0), 
                              100
                            )}%` 
                          }}
                        ></div>
                      </div>
                      {employee.allocations
                        .filter(a => a.status === 'Active')
                        .reduce((sum, curr) => sum + curr.allocation, 0) > 100 && (
                        <p className="text-sm text-red-600 mt-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="inline h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Phân bổ vượt quá 100%
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Hiển thị dự án sắp tới */}
              {employee.allocations && employee.allocations.some(a => a.status === 'Upcoming') && (
                <div className="mt-8 w-full max-w-3xl mx-auto">
                  <h4 className="font-medium text-gray-900 mb-4 text-center">Dự án sắp tới</h4>
                  
                  <div className="space-y-4">
                    {employee.allocations
                      .filter(allocation => allocation.status === 'Upcoming')
                      .map(allocation => (
                      <div key={allocation.id} className="p-5 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h5 className="text-lg font-semibold text-gray-900">{allocation.project.name}</h5>
                            <p className="text-sm text-gray-600">Vai trò: {allocation.position}</p>
                          </div>
                          <Badge className="bg-indigo-100 text-indigo-800">
                            {allocation.allocation}% phân bổ dự kiến
                          </Badge>
                        </div>
                        
                        <div className="mb-4">
                          <div className="text-sm text-gray-600 mb-1">Thời gian dự kiến</div>
                          <div className="flex items-center gap-2 text-sm">
                            <span>{new Date(allocation.startDate).toLocaleDateString('vi-VN')}</span>
                            <span>→</span>
                            <span>{allocation.endDate ? new Date(allocation.endDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}</span>
                            {allocation.startDate && (
                              <span className="text-sm text-indigo-600 font-medium">
                                (còn {Math.ceil((new Date(allocation.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} ngày nữa)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <PermissionGuard requiredPermission="employee-status:update:all">
                <Button 
                  className="mt-6" 
                  onClick={() => alert('Would navigate to status edit page')}
                >
                  Cập nhật trạng thái
                </Button>
              </PermissionGuard>
            </div>
          </div>
        </div>
      )
    }
  ];
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-blue-50 p-3 rounded-md mb-4 text-blue-800 font-medium text-center">
        Demo mode: Using mock data to showcase UI
      </div>
      
      {/* Back button */}
      <div className="mb-4">
        <button 
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
          onClick={handleBack}
        >
          <ArrowLeft size={16} className="mr-1" />
          <span>Quay lại</span>
        </button>
      </div>
      
      {/* Header */}
      <div className="bg-white rounded-lg shadow mb-6 relative">
        <div className="p-6">
          {/* Avatar and info section */}
          <div className="flex flex-col md:flex-row gap-8 mb-6">
            {/* Avatar section */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-5xl font-bold">
                {employee.name.charAt(0)}
              </div>
              <div className="text-sm text-gray-500 text-center mt-2">Mã NV: {employee.employeeCode}</div>
              <div className="mt-2">
                <Badge className={`${statusColorMap[employee.status] || 'bg-gray-100 text-gray-800'}`}>
                  {employee.status}
                </Badge>
              </div>
            </div>
            
            {/* Name and info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
              
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
                  <div className="font-medium mt-1">{employee.email}</div>
                </div>
                
                <div>
                  <div className="text-gray-500 text-sm">Ngày vào công ty</div>
                  <div className="font-medium mt-1">{employee.joinDate ? new Date(employee.joinDate).toLocaleDateString('vi-VN') : '01/01/2020'}</div>
                </div>
                
                <div>
                  <div className="text-gray-500 text-sm">Số điện thoại</div>
                  <div className="font-medium mt-1">{employee.phone}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Edit button */}
        <div className="absolute top-4 right-4">
          <Button 
            className="flex items-center gap-1"
            onClick={handleEdit}
          >
            <Edit size={16} />
            <span>Sửa</span>
          </Button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white rounded-md">
        <Tabs items={tabs} />
      </div>
    </div>
  );
};

export default EmployeeDetailDemo; 
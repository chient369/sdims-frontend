import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { employeeService, skillService, teamService } from '../service';
import { 
  EmployeeListParams, 
  EmployeeResponse, 
  SkillResponse, 
  TeamInfo, 
  SkillCategoryResponse,
  NewEmployeeApiResponse,
  NewPaginatedEmployeeResponse
} from '../types';
import { Table } from '../../../components/table/Table';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Tooltip } from '../../../components/ui/Tooltip';
import { Alert } from '../../../components/ui/Alert';
import PermissionGuard from '../../../components/ui/PermissionGuard';
import { useAuth } from '../../../hooks/useAuth';
import { 
  FiChevronDown, 
  FiChevronUp, 
  FiDownload, 
  FiPlus, 
  FiRefreshCw, 
  FiSearch,
  FiSettings, 
  FiX,
  FiEye,
  FiEdit,
  FiAlertCircle
} from 'react-icons/fi';

// Define status types to match API values
type EmployeeStatus = 'Allocated' | 'Available' | 'EndingSoon' | 'OnLeave' | 'Resigned' | 'PartiallyAllocated' | undefined;

/**
 * Employee List Page
 * Displays a list of employees with pagination and search/filter options
 * @returns {JSX.Element} The rendered employee list page
 */
const EmployeeList: React.FC = () => {
  const { hasPermission, user } = useAuth();
  
  // State for data loading
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for column toggler
  const [isColumnTogglerOpen, setIsColumnTogglerOpen] = useState(false);
  
  // State for employee data
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  
  // State for filter options
  const [teams, setTeams] = useState<TeamInfo[]>([]);
  const [skills, setSkills] = useState<SkillResponse[]>([]);
  const [skillCategories, setSkillCategories] = useState<SkillCategoryResponse[]>([]);
  
  // State for pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  
  // State for filters
  const [search, setSearch] = useState('');
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);

  // Custom type for extended filters that includes position and date ranges
  interface ExtendedFilters extends Partial<EmployeeListParams> {
    position?: string;
    hireDateFrom?: string;
    hireDateTo?: string;
    status?: EmployeeStatus;
  }
  
  // Use the extended type for filters
  const [extendedFilters, setExtendedFilters] = useState<ExtendedFilters>({
    teamId: '',
    status: undefined,
    skillIds: [],
    position: '',
    sortBy: '',
    sortDir: 'asc'
  });
  
  // State for column visibility
  const [columnVisibility, setColumnVisibility] = useState({
    employee: true,
    position: true,
    team: true,
    status: true,
    skills: true,
    currentProject: true,
    hireDate: true,
    actions: true
  });

  // Get stored column visibility from localStorage on component mount
  useEffect(() => {
    const storedVisibility = localStorage.getItem('employeeListColumnVisibility');
    if (storedVisibility) {
      try {
        setColumnVisibility(JSON.parse(storedVisibility));
      } catch (e) {
        console.error('Error parsing stored column visibility:', e);
      }
    }
  }, []);

  // Save column visibility to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('employeeListColumnVisibility', JSON.stringify(columnVisibility));
  }, [columnVisibility]);
  
  // Load initial data and filter options
  useEffect(() => {
    loadEmployees();
    loadFilterOptions();
    
    // Load stored filters from localStorage
    const storedFilters = localStorage.getItem('employeeListFilters');
    if (storedFilters) {
      try {
        const parsedFilters = JSON.parse(storedFilters);
        setSearch(parsedFilters.search || '');
        setExtendedFilters(prevFilters => ({
          ...prevFilters,
          ...parsedFilters.extendedFilters
        }));
      } catch (e) {
        console.error('Error parsing stored filters:', e);
      }
    }
  }, []);
  
  // Reload when pagination changes
  useEffect(() => {
    loadEmployees();
  }, [pagination.page, pagination.limit]);
  
  // Save filters to localStorage when they change
  useEffect(() => {
    const filtersToStore = {
      search,
      extendedFilters
    };
    localStorage.setItem('employeeListFilters', JSON.stringify(filtersToStore));
  }, [search, extendedFilters]);
  
  /**
   * Load filter options for dropdowns
   */
  const loadFilterOptions = async () => {
    try {
      // Load skills and categories
      if (typeof skillService.getSkills === 'function') {
        try {
          const skillData = await skillService.getSkills({ limit: 100 });
          if (skillData && skillData.content) {
            setSkills(skillData.content);
          } else {
            console.error('Received empty skills data from API');
            setSkills([]);
          }
        } catch (error) {
          console.error('Error loading skills:', error);
          setSkills([]);
          setError('Không thể tải danh sách kỹ năng. Vui lòng thử lại sau.');
        }
      }
      
      if (typeof skillService.getSkillCategories === 'function') {
        try {
          const categoryData = await skillService.getSkillCategories({ limit: 100 });
          if (categoryData) {
            setSkillCategories(categoryData.content || []);
          } else {
            console.error('Received empty skill categories data from API');
            setSkillCategories([]);
          }
        } catch (error) {
          console.error('Error loading skill categories:', error);
          setSkillCategories([]);
          setError('Không thể tải danh sách loại kỹ năng. Vui lòng thử lại sau.');
        }
      }
      
      // Load team data
      if (typeof teamService.getTeams === 'function') {
        try {
          const teamData = await teamService.getTeams({ limit: 100 });
          if (teamData) {
            setTeams(teamData.content || []);
          } else {
            console.error('Received empty team data from API');
            setTeams([]);
          }
        } catch (error) {
          console.error('Error loading teams:', error);
          setTeams([]);
          setError('Không thể tải danh sách nhóm. Vui lòng thử lại sau.');
        }
      }
    } catch (error) {
      console.error('Error in loadFilterOptions:', error);
      // Ensure all arrays are set to empty arrays in case of error
      setSkills([]);
      setSkillCategories([]);
      setTeams([]);
      setError('Đã xảy ra lỗi khi tải dữ liệu bộ lọc. Vui lòng thử lại sau.');
    }
  };

  /**
   * Load employees with current filters and pagination
   */
  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Extract valid filters for the API
      const apiFilters: Partial<EmployeeListParams> = {
        page: pagination.page,
        limit: pagination.limit,
        keyword: search || undefined,
        teamId: extendedFilters.teamId || undefined,
        status: extendedFilters.status,
        skillIds: extendedFilters.skillIds?.length ? extendedFilters.skillIds.map(Number) : undefined,
        position: extendedFilters.position || undefined,
        sortBy: extendedFilters.sortBy,
        sortDir: extendedFilters.sortDir
      };
      
      // Filter by team if user is a team leader
      if (user?.role === 'Leader' && !hasPermission('employee:read:all')) {
        // User can only see their team members
        apiFilters.teamId = user.teamId;
      }
      
      const response = await employeeService.getEmployees(apiFilters);
      
      // Kiểm tra xem dữ liệu có cấu trúc mới hay không
      if (response && 'data' in response && response.data && Array.isArray(response.data.content)) {
        // Đây là cấu trúc mới
        // Chuyển đổi cấu trúc data mới sang cấu trúc hiển thị
        const convertedEmployees = response.data.content.map((emp: any) => {
          // Ánh xạ từ cấu trúc API mới sang cấu trúc hiển thị
          return {
            id: emp.id,
            employeeCode: emp.employeeCode,
            name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
            email: emp.companyEmail || '',
            position: emp.position || '',
            phone: emp.phoneNumber || '',
            address: emp.address || '',
            team: emp.team,
            status: convertStatus(emp.currentStatus),
            avatarUrl: emp.profilePictureUrl,
            hireDate: emp.hireDate || '',
            // Các trường bắt buộc trong EmployeeResponse
            utilization: 0
          } as EmployeeResponse;
        });
        
        setEmployees(convertedEmployees);
      setPagination(prev => ({
        ...prev,
          total: response.data.pageable.totalElements || 0,
          totalPages: response.data.pageable.totalPages || 0
      }));
      } else {
        // Xử lý cấu trúc dữ liệu khác nếu có
        const data = response as any;
        if (data && Array.isArray(data.content)) {
          setEmployees(data.content);
          setPagination(prev => ({
            ...prev,
            total: data.pageable?.totalElements || 0,
            totalPages: data.pageable?.totalPages || 0
          }));
        } else {
          // Không có dữ liệu hoặc cấu trúc không xác định
          setEmployees([]);
          setError('Định dạng dữ liệu không đúng. Vui lòng liên hệ quản trị viên.');
        }
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      setError('Đã xảy ra lỗi khi tải danh sách nhân viên. Vui lòng thử lại sau.');
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Convert API status to UI status
   */
  const convertStatus = (status: string): 'Allocated' | 'Available' | 'EndingSoon' | 'OnLeave' | 'Resigned' | 'PartiallyAllocated' => {
    switch (status) {
      case 'Active': return 'Allocated';
      case 'Available': return 'Available';
      case 'OnLeave': return 'OnLeave';
      case 'EndingSoon': return 'EndingSoon';
      case 'Resigned': return 'Resigned';
      default: return 'Available'; // Giá trị mặc định an toàn
    }
  };
  
  /**
   * Handle applying filters
   */
  const handleApplyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    loadEmployees();
  };
  
  /**
   * Handle clearing all filters
   */
  const handleClearFilters = () => {
    setSearch('');
    setExtendedFilters({
      teamId: '',
      status: undefined,
      skillIds: [],
      position: '',
      sortBy: '',
      sortDir: 'asc'
    });
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    loadEmployees();
  };
  
  /**
   * Handle quick status filter selection
   */
  const handleQuickStatusFilter = (statusValue: string | null) => {
    // Map UI status values to API status values
    let apiStatus: EmployeeStatus;
    
    switch (statusValue) {
      case 'bench':
        apiStatus = 'Available';
        break;
      case 'ending_soon':
        apiStatus = 'EndingSoon';
        break;
      case 'active':
        apiStatus = 'Allocated';
        break;
      default:
        apiStatus = undefined;
    }
    
    setExtendedFilters(prev => ({ 
      ...prev, 
      status: apiStatus 
    }));
    
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    setTimeout(loadEmployees, 0);
  };
  
  /**
   * Handle exporting employee data
   */
  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      setIsExporting(true);
      
      const blob = await employeeService.exportEmployees({
        format,
        filters: {
          keyword: search || undefined,
          teamId: extendedFilters.teamId || undefined,
          status: extendedFilters.status,
          skillIds: extendedFilters.skillIds
        }
      });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `employees_export.${format === 'csv' ? 'csv' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting employees:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  /**
   * Map API status to UI status badge
   */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Allocated': 
        return <Badge color="success">Đang làm dự án</Badge>;
      case 'Available': 
        return <Badge color="danger">Bench</Badge>;
      case 'OnLeave': 
        return <Badge color="warning">Nghỉ phép</Badge>;
      case 'EndingSoon':
        return <Badge color="warning">Sắp hết dự án</Badge>;
      case 'Resigned':
        return <Badge color="default">Đã nghỉ việc</Badge>;
      default:
        return <Badge color="default">{status}</Badge>;
    }
  };
  
  /**
   * Toggle column visibility
   */
  const toggleColumnVisibility = (columnId: keyof typeof columnVisibility) => {
    setColumnVisibility(prev => ({
      ...prev,
      [columnId]: !prev[columnId]
    }));
  };
  
  // Table columns definition
  const columns = [
    {
      id: 'employee',
      header: 'Nhân viên',
      accessorKey: 'name',
      cell: ({ row }: any) => {
        const employee = row.original;
        return (
          <div className="flex items-center space-x-3">
            {employee.avatarUrl ? (
              <img
                src={employee.avatarUrl}
                alt={employee.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-medium">
                {employee.name.charAt(0)}
              </div>
            )}
            <div>
              <div className="font-medium text-secondary-900">
                {employee.name}
              </div>
              <div className="text-sm text-secondary-500">
                {employee.employeeCode || 'N/A'}
              </div>
              <div className="text-xs text-secondary-400">
                {employee.email}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      id: 'position',
      header: 'Vị trí công việc',
      accessorKey: 'position',
      cell: ({ getValue }: any) => getValue() || 'N/A'
    },
    {
      id: 'team',
      header: 'Team/Bộ phận',
      accessorFn: (row: EmployeeResponse) => row.team?.name,
      cell: ({ row }: any) => row.original.team?.name || 'Chưa phân công'
    },
    {
      id: 'status',
      header: 'Trạng thái',
      accessorKey: 'status',
      cell: ({ getValue, row }: any) => {
        const status = getValue();
        const employee = row.original;
        const statusDisplay = getStatusBadge(status);
        
        // Add end date for "EndingSoon" status
        if (status === 'EndingSoon' && employee.projectEndDate) {
          return (
            <Tooltip 
              content={`Dự kiến kết thúc: ${new Date(employee.projectEndDate).toLocaleDateString('vi-VN')}`}
            >
              {statusDisplay}
            </Tooltip>
          );
        }
        
        return statusDisplay;
      }
    },
    {
      id: 'skills',
      header: 'Skills chính',
      accessorFn: (row: EmployeeResponse) => row.skills,
      cell: ({ getValue, row }: any) => {
        const skills = getValue() || [];
        
        // If no skills
        if (!skills.length) return <span className="text-gray-400 text-sm">Chưa có skills</span>;
        
        // Display max 3 skills with all skills in tooltip
        const displaySkills = skills.slice(0, 3);
        const hasMoreSkills = skills.length > 3;
        
        return (
          <div className="flex flex-wrap gap-1">
            {displaySkills.map((skill: any, index: number) => (
              <Badge key={index} color="info" className="text-xs">{skill.name}</Badge>
            ))}
            
            {hasMoreSkills && (
              <Tooltip 
                content={
                  <div className="max-w-xs">
                    <div className="font-medium mb-1">Tất cả skills:</div>
                    <div className="flex flex-wrap gap-1">
                      {skills.map((skill: any, index: number) => (
                        <Badge key={index} color="info" className="text-xs">{skill.name}</Badge>
                      ))}
                    </div>
                  </div>
                }
              >
                <span className="text-primary-600 text-xs cursor-pointer">+{skills.length - 3} skills</span>
              </Tooltip>
            )}
          </div>
        );
      }
    },
    {
      id: 'currentProject',
      header: 'Dự án hiện tại',
      accessorFn: (row: EmployeeResponse) => row.currentProject,
      cell: ({ getValue, row }: any) => {
        const project = getValue();
        const employee = row.original;
        
        if (!project) {
          if (employee.status === 'Available') {
            return <span className="text-gray-400 text-sm">Không có dự án</span>;
          }
          return <span className="text-gray-400 text-sm">N/A</span>;
        }
        
        // Kiểm tra xem project có phải là object hay string
        const projectName = typeof project === 'object' ? project.name : project;
        
        // If we have project details
        return (
          <Tooltip 
            content={
              <div className="max-w-xs">
                <div className="font-medium">{projectName}</div>
                {typeof project === 'object' && (
                  <>
                <div className="text-sm">Khách hàng: {project.client || 'N/A'}</div>
                <div className="text-sm">Vai trò: {employee.projectRole || 'N/A'}</div>
                {employee.projectStartDate && (
                  <div className="text-sm">
                    Từ: {new Date(employee.projectStartDate).toLocaleDateString('vi-VN')}
                  </div>
                    )}
                  </>
                )}
              </div>
            }
          >
            <span className="text-secondary-700">{projectName}</span>
          </Tooltip>
        );
      }
    },
    {
      id: 'hireDate',
      header: 'Ngày vào công ty',
      accessorKey: 'hireDate',
      cell: ({ getValue }: any) => {
        const date = new Date(getValue());
        return date.toLocaleDateString('vi-VN');
      }
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }: any) => {
        const employee = row.original;
        return (
          <div className="flex justify-end space-x-2">
            <Tooltip content="Xem chi tiết">
              <Link 
                to={`/hrm/employees/${employee.id}`}
                className="text-primary-600 hover:text-primary-800 p-1"
              >
                <FiEye size={16} />
              </Link>
            </Tooltip>
            
            {/* Only show edit button if user has permission */}
            <PermissionGuard 
              requiredPermission={['employee:update:all', 'employee:update:team', 'employee:update:own']}
              requireAll={false}
            >
              <Tooltip content="Chỉnh sửa">
                <Link 
                  to={`/hrm/employees/${employee.id}/edit`}
                  className="text-secondary-600 hover:text-secondary-800 p-1"
                >
                  <FiEdit size={16} />
                </Link>
              </Tooltip>
            </PermissionGuard>
          </div>
        );
      }
    }
  ].filter(column => columnVisibility[column.id as keyof typeof columnVisibility]);
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Quản lý Nhân sự</h1>
        
        <div className="flex space-x-2">
          {/* Add Employee button - only visible with permission */}
          <PermissionGuard requiredPermission="employee:create">
            <Link to="/hrm/employees/create">
              <Button className="flex items-center">
                <FiPlus size={16} className="mr-1" />
                Thêm mới
              </Button>
            </Link>
          </PermissionGuard>
          
          {/* Export button - only visible with permission */}
          <PermissionGuard
            requiredPermission="employee:export"
          >
            <div className="relative">
              <Button 
                color="secondary"
                className="flex items-center"
                onClick={() => setIsExporting(!isExporting)}
                disabled={isExporting}
              >
                <FiDownload size={16} className="mr-1" />
                Export
                <FiChevronDown size={16} className="ml-1" />
              </Button>
              
              {isExporting && (
                <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-32">
                  <div className="py-1">
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => handleExport('excel')}
                    >
                      Excel
                    </button>
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => handleExport('csv')}
                    >
                      CSV
                    </button>
                  </div>
                </div>
              )}
            </div>
          </PermissionGuard>
          
          {/* Column toggler button */}
          <div className="relative">
            <Button
              variant="outline"
              className="flex items-center"
              onClick={() => setIsColumnTogglerOpen(!isColumnTogglerOpen)}
            >
              <FiSettings size={16} className="mr-1" />
              Hiển thị cột
            </Button>
            
            {isColumnTogglerOpen && (
              <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-52">
                <div className="py-2 px-3">
                  <div className="text-sm font-medium text-gray-700 mb-2">Chọn cột hiển thị</div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="column-employee"
                        checked={columnVisibility.employee}
                        onChange={() => toggleColumnVisibility('employee')}
                        className="mr-2"
                      />
                      <label htmlFor="column-employee" className="text-sm">Nhân viên</label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="column-position"
                        checked={columnVisibility.position}
                        onChange={() => toggleColumnVisibility('position')}
                        className="mr-2"
                      />
                      <label htmlFor="column-position" className="text-sm">Vị trí công việc</label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="column-team"
                        checked={columnVisibility.team}
                        onChange={() => toggleColumnVisibility('team')}
                        className="mr-2"
                      />
                      <label htmlFor="column-team" className="text-sm">Team/Bộ phận</label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="column-status"
                        checked={columnVisibility.status}
                        onChange={() => toggleColumnVisibility('status')}
                        className="mr-2"
                      />
                      <label htmlFor="column-status" className="text-sm">Trạng thái</label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="column-skills"
                        checked={columnVisibility.skills}
                        onChange={() => toggleColumnVisibility('skills')}
                        className="mr-2"
                      />
                      <label htmlFor="column-skills" className="text-sm">Skills chính</label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="column-currentProject"
                        checked={columnVisibility.currentProject}
                        onChange={() => toggleColumnVisibility('currentProject')}
                        className="mr-2"
                      />
                      <label htmlFor="column-currentProject" className="text-sm">Dự án hiện tại</label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="column-hireDate"
                        checked={columnVisibility.hireDate}
                        onChange={() => toggleColumnVisibility('hireDate')}
                        className="mr-2"
                      />
                      <label htmlFor="column-hireDate" className="text-sm">Ngày vào công ty</label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="column-actions"
                        checked={columnVisibility.actions}
                        onChange={() => toggleColumnVisibility('actions')}
                        className="mr-2"
                      />
                      <label htmlFor="column-actions" className="text-sm">Thao tác</label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Filter Section */}
      <Card className="mb-6">
        <div className="p-4">
          {/* Basic Search */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Tìm kiếm theo Mã NV, Họ tên, Email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2"
              />
              <FiSearch className="absolute left-3 top-2.5 text-secondary-400" size={16} />
            </div>
            
            <Button 
              color="secondary" 
              onClick={handleApplyFilters}
              className="flex items-center"
            >
              <FiSearch size={16} className="mr-1" />
              Tìm kiếm / Lọc
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleClearFilters}
              className="flex items-center"
            >
              <FiRefreshCw size={16} className="mr-1" />
              Xóa bộ lọc
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={() => setAdvancedFiltersOpen(!advancedFiltersOpen)}
              className="flex items-center"
            >
              {advancedFiltersOpen ? (
                <>
                  <FiChevronUp size={16} className="mr-1" />
                  Thu gọn
                </>
              ) : (
                <>
                  <FiChevronDown size={16} className="mr-1" />
                  Lọc nâng cao
                </>
              )}
            </Button>
          </div>
          
          {/* Quick Status Filters */}
          <div className="flex space-x-2 mb-2">
            <button
              className={`px-3 py-1 rounded-full text-sm ${
                !extendedFilters.status ? 'bg-secondary-100 text-secondary-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => handleQuickStatusFilter(null)}
            >
              Tất cả
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm ${
                extendedFilters.status === 'Available' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => handleQuickStatusFilter('bench')}
            >
              Bench
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm ${
                // Since 'ending_soon' is mapped to 'EndingSoon', we need a different way to track when
                // the ending_soon filter is active. This is just a UI workaround.
                // In a real app, we'd track this with a separate state variable or query param
                extendedFilters.status === 'Available' && localStorage.getItem('lastStatusFilter') === 'EndingSoon'
                  ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => {
                localStorage.setItem('lastStatusFilter', 'EndingSoon');
                handleQuickStatusFilter('ending_soon');
              }}
            >
              Sắp hết dự án
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm ${
                extendedFilters.status === 'Allocated' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => {
                localStorage.setItem('lastStatusFilter', 'Allocated');
                handleQuickStatusFilter('active');
              }}
            >
              Đang làm dự án
            </button>
          </div>
          
          {/* Advanced Filters */}
          {advancedFiltersOpen && (
            <div className="mt-4 border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Team/Bộ phận
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={extendedFilters.teamId || ''}
                    onChange={(e) => setExtendedFilters(prev => ({ ...prev, teamId: e.target.value }))}
                  >
                    <option value="">Tất cả bộ phận</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id.toString()}>{team.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Vị trí công việc
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={extendedFilters.position || ''}
                    onChange={(e) => setExtendedFilters(prev => ({ ...prev, position: e.target.value }))}
                  >
                    <option value="">Tất cả vị trí</option>
                    <option value="Developer">Developer</option>
                    <option value="Tester">Tester</option>
                    <option value="BA">Business Analyst</option>
                    <option value="PM">Project Manager</option>
                    <option value="Leader">Team Leader</option>
                    <option value="DevOps">DevOps Engineer</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={extendedFilters.status || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Convert empty string to undefined
                      const statusValue = value === '' ? undefined : value as EmployeeStatus;
                      setExtendedFilters(prev => ({ ...prev, status: statusValue }));
                    }}
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="Allocated">Đang làm dự án</option>
                    <option value="Available">Bench</option>
                    <option value="OnLeave">Nghỉ phép</option>
                    <option value="EndingSoon">Sắp hết dự án</option>
                    <option value="Resigned">Đã nghỉ việc</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Kỹ năng
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    multiple
                    value={extendedFilters.skillIds as string[] || []}
                    onChange={(e) => {
                      const selectedOptions = Array.from(
                        e.target.selectedOptions,
                        option => option.value
                      );
                      setExtendedFilters(prev => ({ ...prev, skillIds: selectedOptions }));
                    }}
                  >
                    {skillCategories && skillCategories.length > 0 ? 
                      skillCategories.map(category => (
                        <optgroup key={category.id} label={category.name}>
                          {skills && skills.length > 0 ? 
                            skills
                              .filter(skill => skill.category.id === category.id)
                              .map(skill => (
                                <option key={skill.id} value={skill.id.toString()}>
                                  {skill.name}
                                </option>
                              ))
                            : 
                            <option disabled>Không có kỹ năng trong danh mục này</option>
                          }
                        </optgroup>
                      ))
                      :
                      <option disabled>Không có danh mục kỹ năng</option>
                    }
                  </select>
                  <div className="text-xs text-secondary-500 mt-1">
                    Giữ Ctrl để chọn nhiều kỹ năng
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={handleClearFilters}>
                  <FiX size={16} className="mr-1" />
                  Xóa bộ lọc
                </Button>
                <Button color="primary" onClick={handleApplyFilters}>
                  <FiSearch size={16} className="mr-1" />
                  Áp dụng
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
      
      {/* Error message */}
      {error && (
        <Alert 
          variant="error"
          className="mb-6"
          title="Lỗi"
        >
          <div className="flex justify-between">
            <div>{error}</div>
            <button 
              onClick={() => setError(null)}
              className="text-error-600 hover:text-error-800"
            >
              <FiX size={16} />
            </button>
          </div>
        </Alert>
      )}
      
      {/* Employee Table */}
      {isLoading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : employees.length > 0 ? (
        <Table
          data={employees}
          columns={columns}
          isLoading={false}
          enableSorting={true}
          enablePagination={false}
          enableRowSelection={false}
          onRowClick={(row) => window.location.href = `/hrm/employees/${row.id}`}
        />
      ) : (
        <Card className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <FiAlertCircle size={48} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-secondary-900 mb-2">Không tìm thấy kết quả</h3>
          <p className="text-secondary-600 mb-6">
            Không tìm thấy nhân viên nào phù hợp với các tiêu chí tìm kiếm hiện tại.
          </p>
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="mx-2"
            >
              <FiRefreshCw size={16} className="mr-2" />
              Xóa bộ lọc
            </Button>
            <Button
              color="primary"
              onClick={() => loadEmployees()}
              className="mx-2"
            >
              <FiRefreshCw size={16} className="mr-2" />
              Tải lại
            </Button>
          </div>
        </Card>
      )}
      
      {/* Custom Pagination */}
      {!isLoading && pagination.total > 0 && (
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mt-4 gap-4">
          <div className="text-sm text-secondary-500">
            Hiển thị {(pagination.page - 1) * pagination.limit + 1} đến {
              Math.min(pagination.page * pagination.limit, pagination.total)
            } của {pagination.total} nhân viên
          </div>
          <div className="flex items-center gap-6 justify-center">
            <div className="flex items-center gap-2">
              <span className="text-sm">Rows/Pages:</span>
              <div className="relative">
                <select
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-primary-500 appearance-none pr-6 [&::-ms-expand]:hidden"
                  style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}
                  value={pagination.limit}
                  onChange={(e) => {
                    const newLimit = Number(e.target.value);
                    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
                  }}
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                {/* Icon mũi tên */}
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                className={`px-3 py-1 rounded ${
                  pagination.page === 1 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-white border border-gray-300 text-secondary-700 hover:bg-gray-50'
                }`}
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </button>
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageToShow;
                if (pagination.totalPages <= 5) pageToShow = i + 1;
                else if (pagination.page <= 3) pageToShow = i + 1;
                else if (pagination.page >= pagination.totalPages - 2) pageToShow = pagination.totalPages - 4 + i;
                else pageToShow = pagination.page - 2 + i;
                return (
                  <button
                    key={pageToShow}
                    className={`w-8 h-8 flex items-center justify-center rounded font-semibold ${
                      pagination.page === pageToShow
                        ? 'bg-primary-600 text-white'
                        : 'bg-white border border-gray-300 text-secondary-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setPagination(prev => ({ ...prev, page: pageToShow }))}
                  >
                    {pageToShow}
                  </button>
                );
              })}
              <button
                className={`px-3 py-1 rounded ${
                  pagination.page === pagination.totalPages 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-white border border-gray-300 text-secondary-700 hover:bg-gray-50'
                }`}
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList; 
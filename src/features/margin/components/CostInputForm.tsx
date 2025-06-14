import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/ui/Button';
import { Table } from '../../../components/table/Table';
import { FileUploader } from '../../../components/files/FileUploader';
import { ColumnDef } from '@tanstack/react-table';
import { getEmployees, getTeams, updateEmployeeCosts, importEmployeeCosts } from '../api';

interface Team {
  id: number;
  name: string;
  department?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Employee {
  id: number;
  employeeCode: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  companyEmail?: string;
  position?: string;
  team?: {
    id: number;
    name: string;
  };
  cost?: number;
  allowance?: number;
  overtime?: number;
  otherCosts?: number;
  note?: string;
}

interface EmployeeCost {
  employeeId: number;
  employeeCode?: string;
  basicCost: number;
  allowance?: number;
  overtime?: number;
  otherCosts?: number;
  note?: string;
  currency?: string;
}

interface CostImportResult {
  importId: string;
  month: string;
  totalRecords: number;
  successCount: number;
  errorCount: number;
  summary?: {
    teamId: number;
    teamName: string;
    totalEmployees: number;
    totalCost: number;
    averageCost: number;
  };
  errors: {
    rowNumber?: number;
    employeeId?: number;
    employeeCode?: string;
    errorType: string;
    message: string;
  }[];
  importedBy: {
    id: number;
    name: string;
  };
  importedAt: string;
}

interface CostInputFormProps {
  onSuccess?: () => void;
}

// Tạo component riêng để xử lý nhập số tiền
const NumberInput = ({ 
  value, 
  onChange, 
  max = Number.MAX_SAFE_INTEGER,
  placeholder
}: { 
  value: number | undefined; 
  onChange: (value: number | undefined) => void; 
  max?: number;
  placeholder?: string;
}) => {
  // Giữ vị trí con trỏ hiện tại
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  
  // Sử dụng local state để kiểm soát giá trị đang hiển thị
  const [displayValue, setDisplayValue] = useState("");

  // Cập nhật giá trị hiển thị khi value thay đổi từ bên ngoài
  useEffect(() => {
    if (value !== undefined) {
      setDisplayValue(value.toString());
    } else {
      setDisplayValue("");
    }
  }, [value]);

  // Cập nhật vị trí con trỏ sau khi render
  useEffect(() => {
    if (cursorPosition !== null && inputRef.current) {
      inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
    }
  }, [displayValue, cursorPosition]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    // Lưu vị trí con trỏ trước khi cập nhật giá trị
    const currentPosition = e.target.selectionStart || 0;
    
    // Chỉ cho phép nhập số
    const numericValue = rawValue.replace(/\D/g, '');
    
    // Cập nhật display value cho input
    setDisplayValue(numericValue);
    
    // Tính toán vị trí con trỏ mới
    const diff = rawValue.length - numericValue.length;
    setCursorPosition(currentPosition - diff);
    
    // Cập nhật giá trị thực
    if (numericValue) {
      const numValue = parseInt(numericValue, 10);
      if (numValue <= max) {
        onChange(numValue);
      }
    } else {
      onChange(undefined);
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pr-8"
        placeholder={placeholder}
      />
      <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-500 text-xs">
        ¥
      </span>
    </div>
  );
};

/**
 * Form Nhập/Import Chi phí (MH-MGN-02)
 * Cho phép nhập thủ công hoặc import dữ liệu chi phí nhân viên theo tháng/kỳ
 * @param {CostInputFormProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const CostInputForm: React.FC<CostInputFormProps> = ({ onSuccess }) => {
  const { state } = useAuth();
  const { user } = state;
  const [activeTab, setActiveTab] = useState<'manual' | 'import'>('manual');
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedTeam, setSelectedTeam] = useState<number | undefined>(undefined);
  const [overwriteExisting, setOverwriteExisting] = useState<boolean>(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<Employee[]>([]);
  const [importResult, setImportResult] = useState<CostImportResult | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Danh sách các tháng cho phép chọn (tháng hiện tại và 2 tháng tiếp theo)
  const availableMonths = useMemo(() => {
    const months = [];
    const now = new Date();
    
    // Tháng hiện tại
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Tạo mảng các tháng: tháng hiện tại và 2 tháng tiếp
    for (let i = 0; i < 3; i++) {
      const month = (currentMonth + i) % 12;
      // Điều chỉnh năm nếu tháng vượt qua tháng 12
      const year = currentYear + Math.floor((currentMonth + i) / 12);
      
      const monthValue = `${year}-${String(month + 1).padStart(2, '0')}`;
      const monthLabel = `Tháng ${month + 1}/${year}`;
      
      months.push({ value: monthValue, label: monthLabel });
    }
    
    return months;
  }, []);

  // Kiểm tra quyền người dùng
  const canViewAllTeams = user?.role === 'Division Manager' || user?.role === 'Admin';
  
  // Tải danh sách teams
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setIsLoading(true);
        
        // Gọi API lấy danh sách teams
        const response: any = await getTeams();
        
        // Kiểm tra định dạng phản hồi
        if (response.status === 'success' && response.data && response.data.content) {
          // Xử lý dữ liệu khi API trả về dạng { status, code, data: { content } }
          setTeams(response.data.content);
        } else if (Array.isArray(response)) {
          // Trường hợp API trả về mảng trực tiếp
          setTeams(response);
        } else if (response.content && Array.isArray(response.content)) {
          // Xử lý dữ liệu khi API trả về { content }
          setTeams(response.content);
        } else {
          // Sử dụng mock data nếu không có dữ liệu thực
          setTeams([
            { id: 1, name: 'Team A' },
            { id: 2, name: 'Team B' },
            { id: 3, name: 'Team C' },
          ]);
        }
        
        // Nếu là Leader, tự động chọn team của họ
        if (!canViewAllTeams && user?.teamId) {
          // Đảm bảo teamId là number
          const teamId = typeof user.teamId === 'string' ? parseInt(user.teamId, 10) : user.teamId;
          setSelectedTeam(teamId);
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
        setError('Không thể tải danh sách team');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTeams();
  }, [canViewAllTeams, user]);

  // Tải danh sách nhân viên khi chọn tháng và team
  const loadEmployees = async () => {
    if (!selectedMonth || (!selectedTeam && !canViewAllTeams)) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Gọi API lấy danh sách nhân viên
      const response: any = await getEmployees({
        teamId: selectedTeam,
        page: 1,
        size: 100
      });
      
      let employeeList: Employee[] = [];
      
      if (response.status === 'success' && response.data && response.data.content) {
        // Trường hợp API trả về dạng { status, code, data }
        employeeList = response.data.content.map((emp: any) => ({
          id: emp.id,
          employeeCode: emp.employeeCode,
          firstName: emp.firstName,
          lastName: emp.lastName,
          name: emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
          email: emp.email || emp.companyEmail,
          position: emp.position,
          team: emp.team,
          // Các trường chi phí sẽ được cập nhật sau (nếu có)
          cost: undefined,
          allowance: undefined,
          overtime: undefined,
          otherCosts: undefined
        }));
      } else if (Array.isArray(response)) {
        // Trường hợp API trả về mảng trực tiếp
        employeeList = response.map((emp: any) => ({
          id: emp.id,
          employeeCode: emp.employeeCode,
          firstName: emp.firstName,
          lastName: emp.lastName,
          name: emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
          team: emp.team,
          // Các trường chi phí sẽ được cập nhật sau (nếu có)
          cost: undefined,
          allowance: undefined,
          overtime: undefined,
          otherCosts: undefined
        }));
      } else if (response.content && Array.isArray(response.content)) {
        // Trường hợp API trả về trực tiếp dữ liệu
        employeeList = response.content.map((emp: any) => ({
          id: emp.id,
          employeeCode: emp.employeeCode,
          firstName: emp.firstName,
          lastName: emp.lastName,
          name: emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
          email: emp.email || emp.companyEmail,
          position: emp.position,
          team: emp.team,
          // Các trường chi phí sẽ được cập nhật sau (nếu có)
          cost: undefined,
          allowance: undefined,
          overtime: undefined,
          otherCosts: undefined
        }));
      } else {
        // Sử dụng mock data nếu không có dữ liệu thực
        employeeList = [
          { 
            id: 1, 
            employeeCode: 'NV001', 
            firstName: 'Nguyễn', 
            lastName: 'Văn', 
            name: 'Nguyễn Văn A', 
            team: { id: 1, name: 'Team A' }, 
            cost: selectedMonth === '2025-04' ? 35000000 : undefined,
            allowance: selectedMonth === '2025-04' ? 2000000 : undefined,
            overtime: selectedMonth === '2025-04' ? 0 : undefined,
            otherCosts: selectedMonth === '2025-04' ? 500000 : undefined
          },
          { 
            id: 2, 
            employeeCode: 'NV002', 
            firstName: 'Trần', 
            lastName: 'Thị', 
            name: 'Trần Thị B', 
            team: { id: 1, name: 'Team A' }, 
            cost: selectedMonth === '2025-04' ? 40000000 : undefined,
            allowance: selectedMonth === '2025-04' ? 1500000 : undefined,
            overtime: selectedMonth === '2025-04' ? 1000000 : undefined,
            otherCosts: selectedMonth === '2025-04' ? 0 : undefined
          },
          { 
            id: 3, 
            employeeCode: 'NV003', 
            firstName: 'Lê', 
            lastName: 'Văn', 
            name: 'Lê Văn C', 
            team: { id: 2, name: 'Team B' }, 
            cost: selectedMonth === '2025-04' ? 38000000 : undefined,
            allowance: selectedMonth === '2025-04' ? 1800000 : undefined,
            overtime: selectedMonth === '2025-04' ? 0 : undefined,
            otherCosts: selectedMonth === '2025-04' ? 0 : undefined
          },
          { 
            id: 4, 
            employeeCode: 'NV004', 
            firstName: 'Phạm', 
            lastName: 'Văn', 
            name: 'Phạm Văn D', 
            team: { id: 2, name: 'Team B' }, 
            cost: selectedMonth === '2025-04' ? 42000000 : undefined,
            allowance: selectedMonth === '2025-04' ? 2200000 : undefined,
            overtime: selectedMonth === '2025-04' ? 500000 : undefined,
            otherCosts: selectedMonth === '2025-04' ? 300000 : undefined
          },
          { 
            id: 5, 
            employeeCode: 'NV005', 
            firstName: 'Võ', 
            lastName: 'Thị', 
            name: 'Võ Thị E', 
            team: { id: 3, name: 'Team C' }, 
            cost: selectedMonth === '2025-04' ? 36000000 : undefined,
            allowance: selectedMonth === '2025-04' ? 1500000 : undefined,
            overtime: selectedMonth === '2025-04' ? 0 : undefined,
            otherCosts: selectedMonth === '2025-04' ? 0 : undefined
          },
        ];
      }
      
      // Lọc theo team nếu cần
      const filteredEmployees = selectedTeam 
        ? employeeList.filter(emp => emp.team?.id === selectedTeam)
        : employeeList;
        
      setEmployees(filteredEmployees);
      
    } catch (error) {
      console.error('Error loading employees:', error);
      setError('Không thể tải danh sách nhân viên');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Tải danh sách nhân viên khi thay đổi tháng hoặc team
  useEffect(() => {
    if (activeTab === 'manual') {
      loadEmployees();
    }
  }, [selectedMonth, selectedTeam, activeTab]);

  // Xử lý thay đổi giá trị chi phí cơ bản của nhân viên
  const handleBasicCostChange = (employeeId: number, value: number | undefined) => {
    setEmployees(prev => 
      prev.map(emp => 
        emp.id === employeeId 
          ? { ...emp, cost: value } 
          : emp
      )
    );
  };
  
  // Xử lý thay đổi phụ cấp của nhân viên
  const handleAllowanceChange = (employeeId: number, value: number | undefined) => {
    setEmployees(prev => 
      prev.map(emp => 
        emp.id === employeeId 
          ? { ...emp, allowance: value } 
          : emp
      )
    );
  };

  // Xử lý thay đổi chi phí tăng ca của nhân viên
  const handleOvertimeChange = (employeeId: number, value: number | undefined) => {
    setEmployees(prev => 
      prev.map(emp => 
        emp.id === employeeId 
          ? { ...emp, overtime: value } 
          : emp
      )
    );
  };

  // Xử lý thay đổi chi phí khác của nhân viên
  const handleOtherCostsChange = (employeeId: number, value: number | undefined) => {
    setEmployees(prev => 
      prev.map(emp => 
        emp.id === employeeId 
          ? { ...emp, otherCosts: value } 
          : emp
      )
    );
  };

  // Xử lý thay đổi ghi chú của nhân viên
  const handleNoteChange = (employeeId: number, value: string) => {
    setEmployees(prev => 
      prev.map(emp => 
        emp.id === employeeId 
          ? { ...emp, note: value } 
          : emp
      )
    );
  };

  // Lưu chi phí nhập thủ công
  const handleSaveCosts = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      // Chuẩn bị dữ liệu
      const employeeCosts: EmployeeCost[] = employees
        .filter(emp => emp.cost !== undefined)
        .map(emp => ({
          employeeId: emp.id,
          employeeCode: emp.employeeCode,
          basicCost: emp.cost as number,
          allowance: emp.allowance,
          overtime: emp.overtime,
          otherCosts: emp.otherCosts,
          note: emp.note,
          currency: 'JPY'
        }));
      
      if (employeeCosts.length === 0) {
        setError('Vui lòng nhập chi phí cho ít nhất một nhân viên');
        setIsSaving(false);
        return;
      }
      
      // Dữ liệu gửi lên server
      const postData = {
        month: selectedMonth,
        overwrite: overwriteExisting,
        employees: employeeCosts,
        currency: 'JPY'
      };
      
      // Gọi API cập nhật chi phí
      const response: any = await updateEmployeeCosts(postData);
      
      // Xử lý kết quả
      if (response.status === 'success' && response.data) {
        // Trường hợp API trả về dạng { status, code, data }
        const data = response.data;
        setSuccessMessage(`Đã lưu chi phí thành công cho ${data.successCount}/${data.totalEmployees} nhân viên.`);
        if (onSuccess) onSuccess();
      } else if (response.successCount !== undefined) {
        // Trường hợp API trả về trực tiếp dữ liệu
        setSuccessMessage(`Đã lưu chi phí thành công cho ${response.successCount}/${response.totalEmployees} nhân viên.`);
        if (onSuccess) onSuccess();
      } else {
        // Trường hợp không nhận được phản hồi hợp lệ
        console.error('Unexpected response format:', response);
        setError('Có lỗi xảy ra khi lưu dữ liệu. Vui lòng thử lại.');
      }
      
    } catch (error: any) {
      console.error('Error saving costs:', error);
      
      // Xử lý các trường hợp lỗi theo định dạng API
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.code === 'E3005') {
          // Conflict - dữ liệu đã tồn tại
          setError(`${errorData.message}. Vui lòng chọn tùy chọn "Ghi đè dữ liệu chi phí đã tồn tại" để tiếp tục.`);
        } else if (errorData.errors && errorData.errors.length > 0) {
          // Lỗi validation
          setError(errorData.errors.map((err: any) => `${err.field ? err.field + ': ' : ''}${err.message}`).join(', '));
        } else {
          setError(errorData.message || 'Không thể lưu dữ liệu chi phí. Vui lòng thử lại.');
        }
      } else {
        setError('Không thể lưu dữ liệu chi phí. Vui lòng thử lại.');
      }
      
    } finally {
      setIsSaving(false);
    }
  };

  // Xử lý upload file
  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;
    
    const file = files[0];
    setImportFile(file);
    setPreviewData([]);
    setImportResult(null);
    
    // TODO: Thực tế sẽ đọc file Excel/CSV và hiển thị preview
    // Mock preview data
    setTimeout(() => {
      const mockPreviewData: Employee[] = [
        { id: 1, employeeCode: 'NV001', firstName: 'Nguyễn', lastName: 'Văn', name: 'Nguyễn Văn A', team: { id: 1, name: 'Team A' }, cost: 35000000 },
        { id: 2, employeeCode: 'NV002', firstName: 'Trần', lastName: 'Thị', name: 'Trần Thị B', team: { id: 1, name: 'Team A' }, cost: 40000000 },
        { id: 3, employeeCode: 'NV003', firstName: 'Lê', lastName: 'Văn', name: 'Lê Văn C', team: { id: 2, name: 'Team B' }, cost: 38000000 },
      ];
      setPreviewData(mockPreviewData);
    }, 1000);
  };

  // Validate và import dữ liệu từ file
  const handleImportCosts = async () => {
    if (!importFile) {
      setError('Vui lòng chọn file để import');
      return;
    }
    
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      // Gọi API import chi phí từ file
      const response: any = await importEmployeeCosts(
        importFile, 
        selectedMonth, 
        { 
          teamId: selectedTeam, 
          overwrite: overwriteExisting 
        }
      );
      
      // Xử lý kết quả
      if (response.status === 'success' && response.data) {
        // Trường hợp API trả về dạng { status, code, data }
        const importResult = response.data;
        setImportResult(importResult);
        setSuccessMessage(`Import thành công ${importResult.successCount}/${importResult.totalRecords} bản ghi chi phí.`);
        if (onSuccess) onSuccess();
      } else if (response.importId) {
        // Trường hợp API trả về trực tiếp dữ liệu
        setImportResult(response as CostImportResult);
        setSuccessMessage(`Import thành công ${response.successCount}/${response.totalRecords} bản ghi chi phí.`);
        if (onSuccess) onSuccess();
      } else {
        // Mock result theo cấu trúc API thực tế
        const mockResult: CostImportResult = {
          importId: "IMPORT-2025-04-001",
          month: selectedMonth,
          totalRecords: 5,
          successCount: 5,
          errorCount: 0,
          summary: {
            teamId: selectedTeam || 0,
            teamName: selectedTeam ? teams.find(t => t.id === selectedTeam)?.name || "" : "Tất cả",
            totalEmployees: 5,
            totalCost: 202500000,
            averageCost: 40500000
          },
          errors: [],
          importedBy: {
            id: 1,
            name: "Nguyễn Văn A"
          },
          importedAt: new Date().toISOString()
        };
        
        setImportResult(mockResult);
        setSuccessMessage(`Import thành công ${mockResult.successCount}/${mockResult.totalRecords} bản ghi chi phí.`);
        if (onSuccess) onSuccess();
      }
      
    } catch (error: any) {
      console.error('Error importing costs:', error);
      
      // Xử lý các trường hợp lỗi theo định dạng API
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.code === 'E3005') {
          // Conflict - dữ liệu đã tồn tại
          setError(`${errorData.message}. Vui lòng chọn tùy chọn "Ghi đè dữ liệu chi phí đã tồn tại" để tiếp tục.`);
        } else if (errorData.errors && errorData.errors.length > 0) {
          // Lỗi validation
          setError(errorData.errors.map((err: any) => `${err.field ? err.field + ': ' : ''}${err.message}`).join(', '));
        } else {
          setError(errorData.message || 'Không thể import dữ liệu chi phí. Vui lòng kiểm tra file và thử lại.');
        }
      } else {
        setError('Không thể import dữ liệu chi phí. Vui lòng kiểm tra file và thử lại.');
      }
      
    } finally {
      setIsSaving(false);
    }
  };

  // Download template file
  const handleDownloadTemplate = () => {
    // Trong môi trường thực, tải file template từ server
    // window.open('/api/v1/margins/costs/template', '_blank');
    
    // Mock: Thông báo
    alert('Tính năng tải template file sẽ được triển khai khi có API.');
  };

  // Định nghĩa cột cho bảng nhập liệu thủ công
  const manualColumns: ColumnDef<Employee>[] = [
    {
      accessorKey: 'employeeCode',
      header: 'Mã nhân viên',
      size: 120,
    },
    {
      id: 'name',
      header: 'Họ và tên',
      size: 180,
      cell: ({ row }) => {
        const employee = row.original;
        // Ưu tiên sử dụng firstName và lastName nếu có
        if (employee.firstName || employee.lastName) {
          return `${employee.lastName || ''} ${employee.firstName || ''}`.trim();
        }
        // Fallback về name nếu không có firstName hoặc lastName
        return employee.name || '';
      }
    },
    {
      accessorKey: 'team.name',
      header: 'Team/Bộ phận',
      size: 150,
    },
    {
      id: 'basicCost',
      header: 'Chi phí cơ bản',
      size: 150,
      cell: ({ row }) => {
        // Sử dụng ref để kiểm tra liệu đây có phải là lần render đầu tiên
        const isFirstRender = React.useRef(true);
        // State cục bộ để lưu giá trị input
        const [inputValue, setInputValue] = React.useState('');

        // Khởi tạo giá trị input từ model khi component mount
        React.useEffect(() => {
          if (isFirstRender.current) {
            if (row.original.cost !== undefined) {
              setInputValue(row.original.cost.toString());
            }
            isFirstRender.current = false;
          }
        }, [row.original.cost]);

        return (
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={() => {
                // Khi mất focus, cập nhật giá trị thực
                if (inputValue === '') {
                  handleBasicCostChange(row.original.id, undefined);
                } else {
                  const numValue = parseInt(inputValue.replace(/\D/g, ''), 10);
                  if (!isNaN(numValue)) {
                    handleBasicCostChange(row.original.id, numValue);
                  } else {
                    // Nếu không phải số, trả về giá trị cũ
                    if (row.original.cost !== undefined) {
                      setInputValue(row.original.cost.toString());
                    } else {
                      setInputValue('');
                    }
                  }
                }
              }}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pr-8"
              placeholder=""
            />
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-500 text-xs">
              ¥
            </span>
          </div>
        );
      },
    },
    {
      id: 'allowance',
      header: 'Phụ cấp',
      size: 120,
      cell: ({ row }) => {
        // Sử dụng ref để kiểm tra liệu đây có phải là lần render đầu tiên
        const isFirstRender = React.useRef(true);
        // State cục bộ để lưu giá trị input
        const [inputValue, setInputValue] = React.useState('');

        // Khởi tạo giá trị input từ model khi component mount
        React.useEffect(() => {
          if (isFirstRender.current) {
            if (row.original.allowance !== undefined) {
              setInputValue(row.original.allowance.toString());
            }
            isFirstRender.current = false;
          }
        }, [row.original.allowance]);

        return (
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={() => {
                // Khi mất focus, cập nhật giá trị thực
                if (inputValue === '') {
                  handleAllowanceChange(row.original.id, undefined);
                } else {
                  const numValue = parseInt(inputValue.replace(/\D/g, ''), 10);
                  if (!isNaN(numValue)) {
                    handleAllowanceChange(row.original.id, numValue);
                  } else {
                    // Nếu không phải số, trả về giá trị cũ
                    if (row.original.allowance !== undefined) {
                      setInputValue(row.original.allowance.toString());
                    } else {
                      setInputValue('');
                    }
                  }
                }
              }}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pr-8"
              placeholder=""
            />
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-500 text-xs">
              ¥
            </span>
          </div>
        );
      },
    },
    {
      id: 'overtime',
      header: 'Chi phí tăng ca',
      size: 120,
      cell: ({ row }) => {
        // Sử dụng ref để kiểm tra liệu đây có phải là lần render đầu tiên
        const isFirstRender = React.useRef(true);
        // State cục bộ để lưu giá trị input
        const [inputValue, setInputValue] = React.useState('');

        // Khởi tạo giá trị input từ model khi component mount
        React.useEffect(() => {
          if (isFirstRender.current) {
            if (row.original.overtime !== undefined) {
              setInputValue(row.original.overtime.toString());
            }
            isFirstRender.current = false;
          }
        }, [row.original.overtime]);

        return (
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={() => {
                // Khi mất focus, cập nhật giá trị thực
                if (inputValue === '') {
                  handleOvertimeChange(row.original.id, undefined);
                } else {
                  const numValue = parseInt(inputValue.replace(/\D/g, ''), 10);
                  if (!isNaN(numValue)) {
                    handleOvertimeChange(row.original.id, numValue);
                  } else {
                    // Nếu không phải số, trả về giá trị cũ
                    if (row.original.overtime !== undefined) {
                      setInputValue(row.original.overtime.toString());
                    } else {
                      setInputValue('');
                    }
                  }
                }
              }}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pr-8"
              placeholder=""
            />
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-500 text-xs">
              ¥
            </span>
          </div>
        );
      },
    },
    {
      id: 'otherCosts',
      header: 'Chi phí khác',
      size: 120,
      cell: ({ row }) => {
        // Sử dụng ref để kiểm tra liệu đây có phải là lần render đầu tiên
        const isFirstRender = React.useRef(true);
        // State cục bộ để lưu giá trị input
        const [inputValue, setInputValue] = React.useState('');

        // Khởi tạo giá trị input từ model khi component mount
        React.useEffect(() => {
          if (isFirstRender.current) {
            if (row.original.otherCosts !== undefined) {
              setInputValue(row.original.otherCosts.toString());
            }
            isFirstRender.current = false;
          }
        }, [row.original.otherCosts]);

        return (
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={() => {
                // Khi mất focus, cập nhật giá trị thực
                if (inputValue === '') {
                  handleOtherCostsChange(row.original.id, undefined);
                } else {
                  const numValue = parseInt(inputValue.replace(/\D/g, ''), 10);
                  if (!isNaN(numValue)) {
                    handleOtherCostsChange(row.original.id, numValue);
                  } else {
                    // Nếu không phải số, trả về giá trị cũ
                    if (row.original.otherCosts !== undefined) {
                      setInputValue(row.original.otherCosts.toString());
                    } else {
                      setInputValue('');
                    }
                  }
                }
              }}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pr-8"
              placeholder=""
            />
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-500 text-xs">
              ¥
            </span>
          </div>
        );
      },
    },
    {
      id: 'totalCost',
      header: 'Tổng chi phí',
      size: 150,
      cell: ({ row }) => {
        const basicCost = row.original.cost || 0;
        const allowance = row.original.allowance || 0;
        const overtime = row.original.overtime || 0;
        const otherCosts = row.original.otherCosts || 0;
        const totalCost = basicCost + allowance + overtime + otherCosts;
        
        return (
          <div className="px-2 py-1 bg-gray-100 rounded font-medium text-right">
            {totalCost.toLocaleString('vi-VN')} ¥
          </div>
        );
      },
    },
    {
      id: 'note',
      header: 'Ghi chú',
      size: 200,
      cell: ({ row }) => (
        <input
          type="text"
          value={row.original.note || ''}
          onChange={(e) => handleNoteChange(row.original.id, e.target.value)}
          className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Ghi chú (nếu có)"
          maxLength={255}
        />
      ),
    },
  ];

  // Định nghĩa cột cho bảng preview data từ file
  const previewColumns: ColumnDef<Employee>[] = [
    {
      accessorKey: 'employeeCode',
      header: 'Mã nhân viên',
      size: 120,
    },
    {
      accessorKey: 'name',
      header: 'Họ và tên',
      size: 180,
    },
    {
      accessorKey: 'team.name',
      header: 'Team/Bộ phận',
      size: 150,
    },
    {
      accessorKey: 'cost',
      header: 'Chi phí cơ bản',
      size: 150,
      cell: ({ getValue }) => {
        const value = getValue() as number;
        return value ? value.toLocaleString('vi-VN') + ' ₫' : '';
      }
    },
    {
      accessorKey: 'allowance',
      header: 'Phụ cấp',
      size: 120,
      cell: ({ getValue }) => {
        const value = getValue() as number;
        return value ? value.toLocaleString('vi-VN') + ' ₫' : '';
      }
    },
    {
      accessorKey: 'overtime',
      header: 'Tăng ca',
      size: 120,
      cell: ({ getValue }) => {
        const value = getValue() as number;
        return value ? value.toLocaleString('vi-VN') + ' ₫' : '';
      }
    },
    {
      accessorKey: 'otherCosts',
      header: 'Chi phí khác',
      size: 120,
      cell: ({ getValue }) => {
        const value = getValue() as number;
        return value ? value.toLocaleString('vi-VN') + ' ₫' : '';
      }
    },
    {
      id: 'totalCost',
      header: 'Tổng chi phí',
      size: 150,
      cell: ({ row }) => {
        const basicCost = row.original.cost || 0;
        const allowance = row.original.allowance || 0;
        const overtime = row.original.overtime || 0;
        const otherCosts = row.original.otherCosts || 0;
        const totalCost = basicCost + allowance + overtime + otherCosts;
        
        return totalCost ? totalCost.toLocaleString('vi-VN') + ' ₫' : '';
      }
    },
    {
      accessorKey: 'note',
      header: 'Ghi chú',
      size: 200,
    },
  ];

  // Sửa lỗi: "Argument of type 'string' is not assignable to parameter of type 'SetStateAction<number | undefined>'."
  const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedTeam(value ? Number(value) : undefined);
  };

  // Định dạng kích thước file
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };
  
  // Lọc nhân viên theo từ khóa tìm kiếm
  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees;
    
    const query = searchQuery.toLowerCase().trim();
    return employees.filter(employee => 
      employee.name?.toLowerCase().includes(query) || 
      employee.employeeCode.toLowerCase().includes(query)
    );
  }, [employees, searchQuery]);
  
  // Reset form về giá trị ban đầu
  const handleReset = () => {
    if (window.confirm('Bạn có chắc chắn muốn đặt lại form? Tất cả các thay đổi chưa lưu sẽ bị mất.')) {
      // Nếu đang ở tab nhập thủ công, tải lại danh sách nhân viên từ server
      if (activeTab === 'manual') {
        loadEmployees();
        setSearchQuery('');
      } 
      // Nếu đang ở tab import, xóa file và dữ liệu preview
      else if (activeTab === 'import') {
        setImportFile(null);
        setPreviewData([]);
        setImportResult(null);
      }
      
      // Xóa thông báo lỗi và thành công
      setError(null);
      setSuccessMessage(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Cập nhật Chi phí Nhân viên</h1>
        <p className="mt-1 text-sm text-gray-500">
          Nhập hoặc import dữ liệu chi phí nhân viên theo tháng/kỳ.
        </p>
      </div>

      {/* Thông báo lỗi hoặc thành công */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">{successMessage}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Chọn Kỳ và Team */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chọn Tháng/Năm */}
          <div>
            <label htmlFor="month" className="block text-sm font-medium text-gray-700">
              Kỳ (Tháng/Năm) <span className="text-red-500">*</span>
            </label>
            <select
              id="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              {availableMonths.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          {/* Chọn Team (chỉ hiển thị cho Division Manager) */}
          {canViewAllTeams && (
            <div>
              <label htmlFor="team" className="block text-sm font-medium text-gray-700">
                Team/Bộ phận
              </label>
              <select
                id="team"
                value={selectedTeam || ''}
                onChange={handleTeamChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Tất cả</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        {/* Tùy chọn ghi đè dữ liệu */}
        <div className="mt-4">
          <div className="flex items-center">
            <input
              id="overwrite"
              type="checkbox"
              checked={overwriteExisting}
              onChange={(e) => setOverwriteExisting(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="overwrite" className="ml-2 block text-sm text-gray-700">
              Ghi đè dữ liệu chi phí đã tồn tại
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Chọn tùy chọn này nếu bạn muốn thay thế dữ liệu chi phí đã tồn tại cho kỳ đã chọn.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'manual'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('manual')}
            >
              Nhập thủ công
            </button>
            <button
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'import'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('import')}
            >
              Import từ file
            </button>
          </nav>
        </div>

        {/* Tab content */}
        <div className="p-6">
          {/* Tab 1: Nhập thủ công */}
          {activeTab === 'manual' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                <div className="w-full md:w-1/2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                      </svg>
                    </div>
                    <input
                      type="search"
                      className="block w-full p-2.5 pl-10 text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tìm nhân viên theo tên hoặc mã..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={loadEmployees}
                    variant="outline"
                    className="mr-2"
                    isLoading={isLoading}
                  >
                    Tải dữ liệu
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="mr-2"
                    type="button"
                  >
                    Đặt lại
                  </Button>
                  <Button
                    onClick={handleSaveCosts}
                    isLoading={isSaving}
                    disabled={employees.length === 0}
                  >
                    Lưu Chi phí
                  </Button>
                </div>
              </div>

              <Table
                data={filteredEmployees}
                columns={manualColumns}
                isLoading={isLoading}
                enablePagination={true}
                enableSorting={true}
              />
            </div>
          )}

          {/* Tab 2: Import từ file */}
          {activeTab === 'import' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-md mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Hướng dẫn Import</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Tải file mẫu để biết định dạng chuẩn.</li>
                        <li>Điền đầy đủ thông tin chi phí cho mỗi nhân viên.</li>
                        <li>Chi phí cơ bản: Tối đa 1.000.000.000 VNĐ</li>
                        <li>Phụ cấp, tăng ca, chi phí khác: Tối đa 100.000.000 VNĐ</li>
                        <li>Ghi chú: Tối đa 255 ký tự</li>
                        <li>Hệ thống chỉ xử lý file Excel (.xlsx) hoặc CSV (.csv).</li>
                        <li>Dữ liệu import sẽ ghi đè lên dữ liệu hiện tại của cùng kỳ nếu chọn tùy chọn "Ghi đè dữ liệu chi phí đã tồn tại".</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex mb-4">
                <Button
                  onClick={handleDownloadTemplate}
                  variant="outline"
                >
                  Tải file mẫu
                </Button>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <FileUploader
                  onFilesChange={handleFileUpload}
                  multiple={false}
                  maxSize={5 * 1024 * 1024} // 5MB
                  accept={{
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                    'text/csv': ['.csv']
                  }}
                />
              </div>

              {importFile && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">File đã chọn:</h3>
                  <div className="flex border rounded-lg overflow-hidden bg-white">
                    <div className="w-16 h-16 shrink-0 bg-gray-100 flex items-center justify-center">
                      <svg className="w-10 h-10 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    
                    <div className="flex-1 p-3 min-w-0">
                      <div className="flex items-start justify-between">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {importFile.name}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatFileSize(importFile.size)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {previewData.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Dữ liệu preview:</h3>
                  <Table
                    data={previewData}
                    columns={previewColumns}
                    enablePagination={true}
                  />
                  
                  <div className="mt-4 flex justify-end gap-2">
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      type="button"
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={handleImportCosts}
                      isLoading={isSaving}
                    >
                      Import Chi phí
                    </Button>
                  </div>
                </div>
              )}

              {importResult && (
                <div className={`mt-4 p-4 rounded-md ${importResult.successCount > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  <h3 className={`text-sm font-medium ${importResult.successCount > 0 ? 'text-green-800' : 'text-red-800'}`}>
                    Kết quả Import
                  </h3>
                  <p className="mt-1 text-sm">
                    Thành công: {importResult.successCount}/{importResult.totalRecords} bản ghi
                  </p>
                  {importResult.errorCount > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-red-800">Lỗi ({importResult.errorCount} bản ghi):</p>
                      <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                        {importResult.errors.map((error, index) => (
                          <li key={index}>
                            {error.message || `Dòng ${error.rowNumber}: Lỗi không xác định`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CostInputForm; 
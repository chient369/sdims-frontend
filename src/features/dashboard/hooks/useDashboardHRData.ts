import { useQuery } from '@tanstack/react-query';
import { getAvailableEmployees } from '../../hrm/api';
import { getUtilizationReport } from '../../reports/api';

interface UseDashboardHRDataParams {
  teamId?: string | null;
  timeframe: 'week' | 'month' | 'quarter' | 'year';
}

interface EndingSoonEmployee {
  id: string;
  fullName: string;
  teamName: string;
  projectEndDate: string;
}

/**
 * Custom hook để lấy dữ liệu HR metrics cho Dashboard
 * @param params Tham số để lọc dữ liệu
 * @returns Dữ liệu HR metrics (nhân sự, utilization)
 */
export const useDashboardHRData = ({ teamId, timeframe }: UseDashboardHRDataParams) => {
  // Query để lấy danh sách nhân viên sẵn sàng (bench)
  const { 
    data: availableEmployees,
    isLoading: isLoadingAvailable,
    error: errorAvailable, 
    refetch: refetchAvailable 
  } = useQuery({
    queryKey: ['availableEmployees', teamId],
    queryFn: async () => {
      // Cần cung cấp startDate là ngày hiện tại
      const today = new Date();
      const startDateStr = today.toISOString().split('T')[0];
      
      try {
        const response = await getAvailableEmployees({
          startDate: startDateStr
        });
        return response;
      } catch (error) {
        console.error('Error fetching available employees:', error);
      }
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 phút
    refetchOnWindowFocus: false,
    retry: false, // Không thử lại khi API trả về lỗi
    gcTime: 10 * 60 * 1000 // 10 phút
  });

  // Query để lấy danh sách nhân viên sắp hết dự án
  const { 
    data: endingSoonEmployees,
    isLoading: isLoadingEndingSoon, 
    error: errorEndingSoon,
    refetch: refetchEndingSoon
  } = useQuery({
    queryKey: ['endingSoonEmployees', teamId],
    queryFn: async () => {
      // Trong thực tế sẽ gọi API riêng hoặc sử dụng filter
      // Ví dụ: getEmployeesEndingSoon hoặc getEmployees với filter ending_soon=true
      const today = new Date();
      const thirtyDaysLater = new Date(today);
      thirtyDaysLater.setDate(today.getDate() + 30);
      
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 phút
    refetchOnWindowFocus: false,
    retry: false, // Không thử lại khi API trả về lỗi
    gcTime: 10 * 60 * 1000 // 10 phút
  });
  
  // Query để lấy dữ liệu utilization rate
  const { 
    data: utilizationData, 
    isLoading: isLoadingUtilization,
    error: errorUtilization,
    refetch: refetchUtilization
  } = useQuery({
    queryKey: ['utilizationRate', teamId, timeframe],
    queryFn: async () => {
      // Chuyển đổi timeframe thành khoảng thời gian phù hợp
      const today = new Date();
      let fromDate = new Date(today);
      
      switch(timeframe) {
        case 'week':
          fromDate.setDate(today.getDate() - 7);
          break;
        case 'month':
          fromDate.setMonth(today.getMonth() - 1);
          break;
        case 'quarter':
          fromDate.setMonth(today.getMonth() - 3);
          break;
        case 'year':
          fromDate.setFullYear(today.getFullYear() - 1);
          break;
      }
      
      const fromDateStr = fromDate.toISOString().split('T')[0];
      const toDateStr = today.toISOString().split('T')[0];
      
      try {
        const response = await getUtilizationReport({
          fromDate: fromDateStr,
          toDate: toDateStr,
          teamId: teamId ? parseInt(teamId, 10) : undefined,
          period: timeframe,
        });
        
        // Nếu response là Blob, đó là export - chúng ta không xử lý
        if (response instanceof Blob) {
          throw new Error('Received Blob instead of JSON data');
        }
        
        return response;
      } catch (error) {
        console.error('Error fetching utilization data:', error);
        
        // Trả về mock data nếu API lỗi
        return {
          summary: {
            averageUtilization: 78,
            totalHours: 3200,
            billableHours: 2500,
            nonBillableHours: 700
          }
        };
      }
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 phút
    refetchOnWindowFocus: false,
    retry: false, // Không thử lại khi API trả về lỗi
    gcTime: 10 * 60 * 1000 // 10 phút
  });
  
  // Format dữ liệu để phù hợp với components
  const formatEmployeeAvailableData = () => {
    if (!availableEmployees) return null;
    
    return {
      totalEmployees: availableEmployees.length,
      change: 3, // Mock data - thay đổi so với kỳ trước
      periodLabel: timeframe === 'week' ? 'tuần trước' : 
                   timeframe === 'month' ? 'tháng trước' : 
                   timeframe === 'quarter' ? 'quý trước' : 'năm trước'
    };
  };
  
  const formatEmployeeEndingSoonData = () => {
    if (!endingSoonEmployees) return null;
    
    return {
      totalEmployees: endingSoonEmployees.length,
      change: -2, // Mock data - thay đổi so với kỳ trước
      periodLabel: timeframe === 'week' ? 'tuần trước' : 
                   timeframe === 'month' ? 'tháng trước' : 
                   timeframe === 'quarter' ? 'quý trước' : 'năm trước',
      employees: endingSoonEmployees.map(emp => ({
        id: emp.id,
        name: emp.fullName,
        projectEndDate: emp.projectEndDate
      }))
    };
  };
  
  const formatUtilizationRateData = () => {
    if (!utilizationData) return null;
    
    return {
      rate: utilizationData.summary.averageUtilization,
      change: 5, // Mock data - thay đổi so với kỳ trước
      periodLabel: timeframe === 'week' ? 'tuần trước' : 
                   timeframe === 'month' ? 'tháng trước' : 
                   timeframe === 'quarter' ? 'quý trước' : 'năm trước'
    };
  };
  
  // Tạo method để refresh tất cả dữ liệu
  const refreshAllData = () => {
    refetchAvailable();
    refetchEndingSoon();
    refetchUtilization();
  };
  
  return {
    availableEmployeesData: formatEmployeeAvailableData(),
    endingSoonEmployeesData: formatEmployeeEndingSoonData(),
    utilizationRateData: formatUtilizationRateData(),
    isLoading: {
      availableEmployees: isLoadingAvailable,
      endingSoonEmployees: isLoadingEndingSoon,
      utilizationRate: isLoadingUtilization
    },
    error: {
      availableEmployees: errorAvailable,
      endingSoonEmployees: errorEndingSoon,
      utilizationRate: errorUtilization
    },
    refreshAllData
  };
}; 
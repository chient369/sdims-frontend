# Human Resource Management Module

## Tổng quan

Module HRM (Human Resource Management) quản lý nhân sự và cấu trúc tổ chức của dự án. Module này bao gồm các chức năng:

- Quản lý thông tin nhân viên
- Quản lý kỹ năng và đánh giá năng lực
- Quản lý đội nhóm (teams)
- Phân công nhân sự cho dự án

## Cài đặt

Module HRM là một phần của frontend SDIMS. Không cần cài đặt riêng.

## Cách sử dụng

### Service Layer

HRM module sử dụng mô hình 3 lớp cho API:

1. **API Layer** (`api.ts`): Giao tiếp HTTP trực tiếp với backend
2. **Service Layer** (`service.ts`): Business logic và xử lý dữ liệu
3. **Hook Layer** (`hooks/useServices.ts`): Custom React hooks để truy cập services

```tsx
// Import services thông qua hooks
import { useEmployeeService } from '../hooks/useServices';

// Trong component
const MyComponent = () => {
  const employeeService = useEmployeeService();
  
  // Sử dụng với React Query
  const { data, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeService.getEmployees()
  });
  
  // ...
}
```

### Components

Module cung cấp các components dùng chung:

- `EmployeeForm`: Form thêm/sửa thông tin nhân viên
- `Tabs`: Component tab navigation

```tsx
import { EmployeeForm } from '../components';

const CreateEmployeePage = () => {
  return <EmployeeForm mode="create" />;
};
```

## Tham khảo API

Xem các API endpoints được sử dụng trong `Document/api_list.md`.

## Contributing

Xem hướng dẫn đóng góp trong file [CONTRIBUTING.md](./CONTRIBUTING.md). 
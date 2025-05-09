# Hướng dẫn đóng góp cho module HRM

## Cấu trúc thư mục

```
src/features/hrm/
├── api.ts                    # API calls trực tiếp
├── service.ts                # Business logic layer
├── types.ts                  # Type definitions
├── hooks/
│   └── useServices.ts        # Custom hooks cho services
├── components/               # Shared components
│   ├── EmployeeForm/         # Employee form components
│   │   ├── index.ts          # Export điểm vào
│   │   ├── EmployeeForm.tsx  # Main form component
│   │   └── sections/         # Form sections
│   └── Tabs.tsx              # Tabs component
└── pages/                    # Page components
    └── EmployeeForm/         # Employee form page
        └── EmployeeFormPage.tsx
```

## Quy tắc Phát triển

1. **Sử dụng Service Pattern**
   
   Không gọi API trực tiếp từ components mà luôn sử dụng service layer thông qua custom hooks:

   ```tsx
   // ❌ Không làm thế này
   import { getEmployees } from '../../api';
   
   // ✅ Làm thế này
   import { useEmployeeService } from '../../hooks/useServices';
   const employeeService = useEmployeeService();
   ```

2. **Cấu trúc Components**

   - Tách các thành phần lớn thành các components nhỏ hơn
   - Sử dụng folder cho components phức tạp
   - Luôn export qua file index.ts

3. **TypeScript**

   - Định nghĩa interface/type cho tất cả props
   - Sử dụng các type từ `types.ts`
   - Không sử dụng `any` type

4. **React Query**

   - Sử dụng `@tanstack/react-query` cho tất cả data fetching
   - Cấu trúc queries đúng chuẩn:

   ```tsx
   const { data, isLoading } = useQuery({
     queryKey: ['employees', filters],
     queryFn: () => employeeService.getEmployees(filters),
     enabled: !!filters
   });
   ```

5. **Testing**
   
   - Viết unit tests cho tất cả service functions
   - Viết component tests cho UI logic

## Development Workflow

1. **Tạo Feature Branch**
   ```bash
   git checkout -b feature/hrm-[feature-name]
   ```

2. **Implement Service Layer trước**
   - Thêm vào `types.ts`
   - Triển khai API methods trong `api.ts`
   - Thêm service logic trong `service.ts`
   - Cập nhật/thêm custom hooks trong `hooks/useServices.ts`

3. **Implement UI Components**
   - Tạo/cập nhật components
   - Sử dụng service hooks
   - Thêm vào exports trong `index.ts`

4. **Tạo Pull Request**
   - Followup code review guidelines
   - Đảm bảo không có lint errors
   - Đảm bảo tests pass 
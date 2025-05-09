# Dashboard Module

## Giới thiệu

Module Dashboard cung cấp trang tổng quan cho hệ thống SDIMS, hiển thị các chỉ số quan trọng từ nhiều module khác nhau như Nhân sự, Dự án, Doanh thu, và Cơ hội kinh doanh.

## Cấu trúc thư mục

```
dashboard/
├── api/               # API calls
├── components/        # UI components
│   ├── widgets/       # Các widget hiển thị trong dashboard
│   └── ...
├── hooks/             # Custom hooks
├── types.ts           # Type definitions
├── Dashboard.tsx      # Main dashboard component
├── routes.tsx         # Route definitions
└── README.md          # Documentation
```

## Các Widget có sẵn

1. **EmployeeAvailableWidget**: Hiển thị số lượng nhân sự đang sẵn sàng nhận dự án mới
2. **EmployeeEndingSoonWidget**: Hiển thị số lượng nhân sự sắp kết thúc dự án
3. **UtilizationRateWidget**: Hiển thị tỷ lệ sử dụng nguồn lực
4. **MarginDistributionWidget**: Hiển thị phân bố margin của nhân sự
5. **OpportunityWidget**: Hiển thị các cơ hội kinh doanh (mới, cần theo dõi)
6. **SalesFunnelWidget**: Hiển thị phễu bán hàng
7. **RevenueWidget**: Hiển thị doanh thu so với KPI
8. **DebtWidget**: Hiển thị công nợ quá hạn

## RBAC - Kiểm soát truy cập dựa trên vai trò

### Tổng quan

Dashboard module sử dụng hệ thống RBAC (Role-Based Access Control) để kiểm soát việc hiển thị các widget dựa trên quyền của người dùng. Mỗi widget yêu cầu một tập hợp quyền cụ thể và chỉ hiển thị khi người dùng có ít nhất một trong các quyền đó.

### Các quyền liên quan

Các quyền được sử dụng trong Dashboard:

| Widget | Quyền yêu cầu |
| ------ | -------------- |
| EmployeeAvailableWidget & EmployeeEndingSoonWidget | `employee-status:read:all`, `employee-status:read:team`, `employee-status:read:own` |
| UtilizationRateWidget | `utilization:read:all`, `utilization:read:team` |
| MarginDistributionWidget | `margin:read:all`, `margin:read:team`, `margin-summary:read:all`, `margin-summary:read:team` |
| OpportunityWidget | `opportunity:read:all`, `opportunity:read:own`, `opportunity:read:assigned` |
| SalesFunnelWidget | `opportunity:read:all`, `opportunity:read:own`, `opportunity:read:assigned` |
| RevenueWidget | `revenue-report:read:all`, `revenue-report:read:team`, `revenue-report:read:own` |
| DebtWidget | `debt-report:read:all`, `debt-report:read:own`, `payment-alert:read:all`, `payment-alert:read:own` |

Ngoài ra, quyền `dashboard:read:all` cho phép truy cập tất cả các widget.

### Quyền theo vai trò mặc định

- **Admin & Division Manager**: Có quyền truy cập tất cả widget (`dashboard:read:all`)
- **Leader**: Có quyền truy cập các widget liên quan đến team (`dashboard:read:team`)
- **Sales**: Có quyền truy cập các widget liên quan đến dữ liệu cá nhân (`dashboard:read:own`)

### Cách triển khai

1. **useDashboardPermissions Hook**:
   Hook này cung cấp các hàm kiểm tra quyền cho từng loại widget.

   ```typescript
   import { useDashboardPermissions } from './hooks';
   
   const { 
     canViewEmployeeWidgets,
     canViewUtilizationWidget,
     canViewMarginWidget,
     // ...
   } = useDashboardPermissions();
   
   // Sử dụng để kiểm tra quyền
   if (canViewEmployeeWidgets()) {
     // Hiển thị widget
   }
   ```

2. **WidgetFallback Component**:
   Khi người dùng không có quyền xem một widget, một fallback UI sẽ được hiển thị để báo cho người dùng biết.

3. **Render Có Điều kiện**:
   Mỗi widget được bọc trong một kiểm tra quyền sử dụng hook `useDashboardPermissions`.

## Thêm Widget Mới

Khi thêm widget mới vào Dashboard, hãy làm theo các bước sau để đảm bảo tuân thủ RBAC:

1. Xác định quyền cần thiết để xem widget
2. Thêm hàm kiểm tra quyền mới trong `useDashboardPermissions.ts`
3. Triển khai widget với điều kiện kiểm tra quyền trong `Dashboard.tsx`

Ví dụ:

```typescript
// 1. Thêm kiểm tra quyền trong hooks/useDashboardPermissions.ts
const canViewNewWidget = () => {
  return hasAnyPermission([
    'new-feature:read:all',
    'new-feature:read:team',
    'dashboard:read:all'
  ]);
};

// 2. Thêm vào Dashboard.tsx
{canViewNewWidget() ? (
  <NewWidget
    data={data}
    loading={loading}
  />
) : (
  <WidgetFallback title="Tiêu đề Widget Mới" />
)}
```

## Các vấn đề cần lưu ý

1. **Test kỹ lưỡng**: Đảm bảo kiểm tra với nhiều vai trò khác nhau để xác minh rằng các widget hiển thị đúng.
2. **Hiệu suất**: Hook `useDashboardPermissions` cache kết quả kiểm tra để tránh tính toán lại không cần thiết.
3. **UX**: Luôn cung cấp feedback cho người dùng khi họ không có quyền xem một widget.
4. **Bảo mật phía server**: RBAC phía máy khách chỉ dùng để hiển thị UI, luôn thực hiện kiểm tra quyền bổ sung ở phía server khi truy xuất dữ liệu. 
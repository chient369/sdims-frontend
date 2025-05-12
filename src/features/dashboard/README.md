# Dashboard Module

## Tổng quan
Dashboard là màn hình chính của hệ thống SDIMS, hiển thị tổng quan các KPI, metrics và thông tin quan trọng từ các module khác trong một giao diện thống nhất. Dashboard cung cấp cái nhìn tổng quan về tình trạng nhân sự, margin, cơ hội kinh doanh và doanh thu, đồng thời là điểm điều hướng chính đến các module chức năng khác.

## Tính năng chính
- Hiển thị các widget thông tin tổng quan từ nhiều module
- Hỗ trợ filter theo khoảng thời gian (tuần/tháng/quý/năm)
- Hỗ trợ filter theo team/bộ phận
- Hiển thị/ẩn widget theo quyền hạn của người dùng (RBAC)
- Lưu trạng thái filter vào localStorage

## Cấu trúc thư mục
```
/src/features/dashboard/
├── api.ts               # API functions
├── components/          # UI components
│   ├── index.ts         # Export các components
│   ├── widgets/         # Các widget components
│   │   ├── EmployeeStatusWidget.tsx
│   │   ├── UtilizationRateWidget.tsx
│   │   ├── ... (other widgets)
│   ├── TeamFilter.tsx   # Component filter theo team
│   ├── TimeRangeFilter.tsx # Component filter theo thời gian
│   └── DashboardAlert.tsx  # Component hiển thị cảnh báo
├── hooks/               # Custom hooks
│   ├── index.ts         # Export các hooks
│   └── useDashboardPermissions.ts # Hook quản lý quyền
├── types.ts             # Type definitions
├── Dashboard.tsx        # Main Dashboard component
└── README.md            # Documentation
```

## Hướng dẫn sử dụng
### Cách thêm widget mới
1. Tạo file widget mới trong `components/widgets/`
2. Export widget từ `components/widgets/index.ts`
3. Thêm widget vào Dashboard.tsx
4. Định nghĩa quyền truy cập widget trong `hooks/useDashboardPermissions.ts`

### Trình tự khởi tạo Dashboard

1. Dashboard.tsx khởi tạo state và load dữ liệu từ API
2. Dữ liệu được lấy từ hai nguồn:
   - getDashboardSummary API: Dữ liệu tổng hợp cho dashboard
   - API chuyên biệt cho từng loại widget (HR, Margin, Opportunities...)
3. Các widget được render có điều kiện dựa trên quyền của người dùng
4. Widget không có quyền sẽ hiển thị giao diện WidgetFallback thay thế

## RBAC (Role-Based Access Control)

### Cách triển khai RBAC cho Dashboard

RBAC được triển khai thông qua hook `useDashboardPermissions` để kiểm soát việc hiển thị/ẩn widget dựa trên quyền của người dùng. Mỗi widget có một phương thức kiểm tra quyền riêng.

### Các quyền cho từng widget:

1. **HR Widgets** (EmployeeAvailableWidget, EmployeeEndingSoonWidget):
   - `employee-status:read:all`: Admin, Trưởng bộ phận
   - `employee-status:read:team`: Team Leader
   - `employee-status:read:own`: Nhân viên (chỉ xem thông tin của mình)

2. **Utilization Rate Widget**:
   - `utilization:read:all`: Admin, Trưởng bộ phận
   - `utilization:read:team`: Team Leader

3. **Margin Distribution Widget**:
   - `margin:read:all`: Admin, Trưởng bộ phận
   - `margin:read:team`: Team Leader

4. **Opportunity Widgets**:
   - `opportunity:read:all`: Admin, Trưởng bộ phận
   - `opportunity:read:own`: Sales
   - `opportunity:read:assigned`: Team Leader, Nhân viên được gán

5. **Revenue Widget**:
   - `revenue-report:read:all`: Admin, Trưởng bộ phận
   - `revenue-report:read:team`: Team Leader
   - `revenue-report:read:own`: Sales

6. **Debt Widget**:
   - `debt-report:read:all`: Admin, Trưởng bộ phận
   - `debt-report:read:own`: Sales, Kế toán
   - `payment-alert:read:assigned`: Người được gán thanh toán

7. **Sales Funnel Widget**:
   - `opportunity:read:all`: Admin, Trưởng bộ phận
   - `opportunity:read:own`: Sales
   - `opportunity:read:assigned`: Team Leader, Nhân viên được gán

### Special Permission:
- `dashboard:read:all`: Quyền xem tất cả dashboard, ghi đè lên tất cả quyền khác

## HR Metrics Widgets

Ba widget HR metrics đã được triển khai:

### 1. EmployeeAvailableWidget
- Hiển thị số lượng nhân viên đang ở trạng thái Available/Bench
- Hỗ trợ hiển thị sự thay đổi so với kỳ trước (tăng/giảm)
- Có link để chuyển đến danh sách nhân viên với filter đã được áp dụng

### 2. EmployeeEndingSoonWidget
- Hiển thị danh sách nhân viên sắp hết dự án (trong 30 ngày tới)
- Mỗi item hiển thị tên nhân viên, ngày kết thúc dự án, số ngày còn lại
- Màu sắc khác nhau để thể hiện mức độ khẩn cấp
- Click vào tên nhân viên để xem chi tiết
- Button "Xem tất cả" để chuyển đến trang danh sách nhân viên với filter thích hợp

### 3. UtilizationRateWidget
- Hiển thị % Utilization Rate trung bình
- Sử dụng Gauge chart để hiển thị trực quan
- Hiển thị sự thay đổi so với kỳ trước
- Hỗ trợ filter theo team/bộ phận

## API Integration

Các widget đã được tích hợp với các API:

- `GET /api/v1/employees/available`: Lấy danh sách nhân viên sẵn sàng
- `GET /api/v1/reports/utilization`: Lấy dữ liệu tỷ lệ sử dụng nguồn lực
- Mock data được sử dụng cho danh sách nhân viên sắp hết dự án (trong thực tế sẽ sử dụng API thực)

## Cách mở rộng
1. **Thêm widget mới**: Tạo component mới, export, thêm vào Dashboard.tsx
2. **Thêm quyền mới**: Cập nhật `useDashboardPermissions.ts` với quyền mới
3. **Thêm API mới**: Thêm hàm API trong `api.ts` và sử dụng trong Dashboard.tsx 
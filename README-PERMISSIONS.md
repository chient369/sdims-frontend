# Phân quyền trong Module Margin

## Phân quyền được sử dụng

Module Margin sử dụng các quyền sau theo định nghĩa trong tài liệu `permissions_definition.md`:

| Mã quyền | Mô tả | Vai trò |
|----------|-------|---------|
| `margin:read:all` | Xem margin của tất cả nhân viên | Division Manager |
| `margin:read:team` | Xem margin của nhân viên trong team | Leader |
| `margin:read:own` | Xem margin của chính mình | Employee |
| `margin-summary:read:all` | Xem tổng hợp margin toàn bộ | Division Manager |
| `margin-summary:read:team` | Xem tổng hợp margin team | Leader |
| `margin:export` | Xuất dữ liệu margin | Division Manager, Leader (tùy cấu hình) |

## Cách triển khai phân quyền

### Routes

```tsx
// Trang Dashboard - Cần quyền xem tổng hợp
<PrivateRoute requiredPermissions={['margin-summary:read:all']}>
  <MarginDashboard />
</PrivateRoute>

// Trang danh sách - Cần một trong ba quyền để xem margin
<PrivateRoute requiredPermissions={['margin:read:all', 'margin:read:team', 'margin:read:own']} requireAll={false}>
  <MarginList />
</PrivateRoute>
```

### Xác định phạm vi truy cập

Trong components MarginList và MarginFilters, chúng ta xác định phạm vi truy cập dựa trên quyền:

```tsx
const accessScope = useMemo(() => {
  // Nếu người dùng có quyền margin:read:all, họ có thể xem tất cả
  if (hasPermission('margin:read:all')) {
    return 'all';
  }
  
  // Nếu người dùng có quyền margin:read:team, họ chỉ xem được team của mình
  if (hasPermission('margin:read:team')) {
    return 'team';
  }
  
  // Mặc định chỉ xem được dữ liệu của bản thân (margin:read:own)
  return 'own';
}, [hasPermission]);
```

### Giới hạn dữ liệu hiển thị

Dựa vào accessScope, chúng ta giới hạn dữ liệu người dùng được xem:

1. **All (margin:read:all)**: Xem tất cả dữ liệu, không giới hạn bởi employeeId hay teamId
2. **Team (margin:read:team)**: Chỉ xem dữ liệu của team mình (filter by teamId)
3. **Own (margin:read:own)**: Chỉ xem dữ liệu của bản thân (filter by employeeId)

### Giới hạn các hành động

Các tính năng được bảo vệ bằng PermissionGuard:

```tsx
// Nút xuất dữ liệu - Chỉ hiển thị nếu có quyền margin:export
<PermissionGuard requiredPermission="margin:export">
  <Button onClick={handleExport}>Xuất dữ liệu</Button>
</PermissionGuard>
```

### Điều chỉnh UI dựa trên quyền

Tiêu đề và các phần tổng hợp thay đổi theo quyền:

```tsx
<span className="font-medium">
  {accessScope === 'own' ? 'Dữ liệu margin cá nhân' : 
   accessScope === 'team' ? `Dữ liệu margin team ${userTeamName}` : 
   'Dữ liệu margin toàn bộ nhân viên'} {summary?.periodLabel || ''}
</span>

{/* Phần tổng hợp - Chỉ hiển thị với quyền all hoặc team */}
{summary && !loading && (accessScope === 'all' || accessScope === 'team') && (
  <MarginSummarySection summary={summary} />
)}
```

## Flow phân quyền

1. **Xác thực quyền truy cập trang**: Khi truy cập vào trang Margin, `PrivateRoute` sẽ kiểm tra xem người dùng có ít nhất một trong các quyền: `margin:read:all`, `margin:read:team`, hoặc `margin:read:own` không. Nếu không có, người dùng sẽ được chuyển hướng tới trang Unauthorized.

2. **Xác định phạm vi truy cập**: Dựa trên các quyền, phạm vi truy cập (all/team/own) được xác định bằng `accessScope`.

3. **Thiết lập bộ lọc ban đầu**: Dựa vào phạm vi quyền, bộ lọc ban đầu sẽ được thiết lập:
   - Phạm vi `own`: Chỉ xem dữ liệu của chính mình (employeeId = user.id)
   - Phạm vi `team`: Chỉ xem dữ liệu của team mình (teamId = user.teams[0].id)
   - Phạm vi `all`: Không giới hạn, xem tất cả dữ liệu

4. **Giới hạn khả năng lọc**: Người dùng không thể thay đổi bộ lọc ngoài phạm vi quyền của mình:
   - Phạm vi `own`: Không thể thay đổi employeeId hoặc lọc theo team
   - Phạm vi `team`: Không thể thay đổi teamId nhưng có thể lọc theo nhân viên trong team
   - Phạm vi `all`: Có thể lọc theo bất kỳ tiêu chí nào

5. **API Call với phạm vi phù hợp**: Khi gọi API, các tham số giới hạn (employeeId, teamId) sẽ được áp dụng dựa trên phạm vi quyền.

6. **Hiển thị UI phù hợp**: Tiêu đề, phần tổng hợp và các tùy chọn UI khác sẽ được điều chỉnh phù hợp với phạm vi quyền. 
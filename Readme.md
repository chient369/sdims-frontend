# SDIMS Frontend

This is the frontend application for the SDIMS (System Development Management Service). Built with React, TypeScript, and Vite.

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd sdims-frontend
```

2. Install dependencies

```bash
npm install
```

3. Setup environment variables

Create a `.env` file based on the `.env.example` file.

```bash
cp .env.example .env
```

4. Run the application

```bash
npm run dev
```

## Project Structure

```
src/
  assets/           # Static assets (images, fonts, etc.)
  components/       # Shared components
    ui/             # Base UI components (Button, Input, Alert, Badge, etc.)
    layout/         # Layout components
    forms/          # Form-related components
    table/          # Table-related components
    modals/         # Modal-related components
    navigation/     # Navigation components
    notifications/  # Notification components
    files/          # File handling components
    charts/         # Chart and data visualization components
    auth/           # Authentication specific components
    examples/       # Example components for reference
  features/         # Feature-based modules
    auth/           # Authentication related
    dashboard/      # Dashboard related
    hrm/            # Human Resource Management
    margin/         # Margin Management
    contracts/      # Contract Management
    opportunities/  # Opportunity Management
    admin/          # Admin features
    reports/        # Reporting features
    errors/         # Error handling features
  hooks/            # Custom hooks
    useAuth.ts
    useClickOutside.ts
    useEmployees.ts
    useEscapeKey.ts
    useModalState.ts
    useOpportunities.ts
    usePermissions.tsx
  context/          # React context definitions
  services/         # API services
    core/           # Core service utilities
      axios.ts      # Axios instance and interceptors
      baseApi.ts    # Base API service class
      queryClient.ts# React Query configuration
      utils.ts      # API utility functions
    mock/           # Mock data services
  utils/            # Utility functions
  types/            # TypeScript type definitions
  config/           # Application configuration
  routes/           # Routing definitions
  store/            # State management (likely Zustand)
  providers/        # Provider components
  pages/            # Top-level pages
  tests/            # Test utilities and fixtures
```

## UI Components

The application includes the following UI components in `src/components/ui/`:

```
Alert.tsx          # Notification and alert components
Badge.tsx          # Badge indicators
Button.tsx         # Button components with various styles
Card.tsx           # Card container components
ErrorBoundary.tsx  # Error handling component
Input.tsx          # Form input components
LoadingFallback.tsx# Loading indicator component
Logo.tsx           # Application logo component
PermissionGuard.tsx# Permission-based access control
Progress.tsx       # Progress indicator
ResourceGuard.tsx  # Resource-based access control
Spinner.tsx        # Loading spinner
ThemeToggle.tsx    # Theme switching component
Typography.tsx     # Text styling components
```

## Feature Architecture

Each feature module in the `features` directory follows a consistent architecture pattern:

```
features/[feature]/
  types.ts          # Type definitions for the feature
  api.ts            # Direct API endpoints with proper TypeScript typing
  service.ts        # Business logic built on top of API layer
  routes.tsx        # Route configurations with lazy loading
  index.ts          # Public exports
  pages/            # Page components
    index.tsx       # Default page for the feature
    [...].tsx       # Other pages
  components/       # Feature-specific components
```

### Current Features

The application currently includes the following features:

- **auth/** - User authentication and authorization
- **admin/** - Administrative functionality
- **dashboard/** - Main dashboard and analytics
- **hrm/** - Human Resource Management
- **contracts/** - Contract Management
- **margin/** - Margin Management
- **opportunities/** - Opportunity Management
- **reports/** - Reporting and analytics
- **errors/** - Error handling and display

### Feature Structure Details

#### 1. `types.ts`

Contains all type definitions for the feature, organized by domain:

```typescript
// User domain types
export interface User { ... }
export type UserStatus = 'Active' | 'Inactive';
export interface UserListParams { ... }

// Other domain types
export interface OtherEntity { ... }
```

#### 2. `api.ts`

Direct API communication layer with TypeScript typing:

```typescript
import apiClient from '../../services/core/axios';
import { User, UserListParams } from './types';

export const getUsers = async (params?: UserListParams): Promise<{
  content: User[];
  pageable: { ... };
}> => {
  return apiClient.get('/api/users', { params });
};

export const getUserById = async (id: number): Promise<User> => {
  return apiClient.get(`/api/users/${id}`);
};
```

#### 3. `service.ts`

Business logic layer, providing a higher-level interface:

```typescript
import { BaseApiService } from '../../services/core/baseApi';
import { User, UserListParams } from './types';
import { getUsers as getUsersApi, getUserById as getUserByIdApi } from './api';

class UserService extends BaseApiService {
  constructor() {
    super('/api/users');
  }

  async getUsers(params?: UserListParams): Promise<{
    content: User[];
    pageable: { ... };
  }> {
    return getUsersApi(params);
  }

  async getUserById(id: number): Promise<User> {
    return getUserByIdApi(id);
  }

  // Additional business logic methods
  async getActiveUsersCount(): Promise<number> {
    const response = await this.getUsers({ status: 'Active', page: 1, size: 1 });
    return response.pageable.totalElements;
  }
}

export const userService = new UserService();
```

#### 4. `routes.tsx`

Route configurations with lazy-loaded components:

```typescript
import { lazy } from 'react';
import { PrivateRoute } from '../auth/routes';

const FeatureDashboard = lazy(() => import('./pages/FeatureDashboard'));
const EntityDetail = lazy(() => import('./pages/EntityDetail'));

export const FeatureRoutes = [
  {
    path: "/feature",
    element: (
      <PrivateRoute requiredPermissions={['feature.access']}>
        <FeatureDashboard />
      </PrivateRoute>
    )
  },
  {
    path: "/feature/:id",
    element: (
      <PrivateRoute requiredPermissions={['feature.view']}>
        <EntityDetail />
      </PrivateRoute>
    )
  }
];
```

## Custom Hooks

The application includes several custom hooks for common functionality:

- **useAuth.ts** - Authentication functionality
- **useClickOutside.ts** - Detect clicks outside an element
- **useEmployees.ts** - Employee data management
- **useEscapeKey.ts** - Handle escape key presses
- **useModalState.ts** - Manage modal state
- **useOpportunities.ts** - Opportunity data management
- **usePermissions.tsx** - Permission and access control

## Implementing New Features

When implementing a new feature, follow these steps:

1. **Create Feature Structure**
   - Create a new directory in `src/features/`
   - Set up the core files: `types.ts`, `api.ts`, `service.ts`, `routes.tsx`, and `index.ts`
   - Create `pages/` and `components/` directories

2. **Define Types**
   - Start with comprehensive type definitions in `types.ts`
   - Organize types by domain/entity
   - Include request/response types, enums, and interfaces

3. **Implement API Layer**
   - Create API functions in `api.ts` with proper typing
   - Use the core axios client from `services/core/axios`
   - Include detailed type annotations for parameters and return values

4. **Build Service Layer**
   - Create service classes in `service.ts` extending BaseApiService
   - Implement business logic on top of the API layer
   - Export singleton service instances

5. **Configure Routes**
   - Define routes in `routes.tsx` using lazy loading
   - Implement proper permission checks with PrivateRoute
   - Connect to main application router

6. **Create Page Components**
   - Build page components in the `pages/` directory
   - Use the service layer for data access

7. **Create Reusable Components**
   - Create feature-specific components in the `components/` directory

8. **Export from Index**
   - Export all necessary types, services, and routes from `index.ts`

## Best Practices

1. **Naming Conventions**
   - Use `PascalCase` for component names (e.g., `UserForm`)
   - Use `camelCase` for functions, variables, and hooks (e.g., `getUserById`)
   - Use descriptive names that reflect purpose

2. **Documentation**
   - Use JSDoc for components and functions:
     ```typescript
     /**
      * Component explanation.
      * @param {Type} paramName - The explanation of the parameter.
      * @returns {JSX.Element} The rendered component.
      */
     ```

3. **Architecture Principles**
   - Maintain separation of concerns (types, API, services, UI)
   - Follow the DRY principle (Don't Repeat Yourself)
   - Apply SOLID principles
   - Keep components focused on a single responsibility

4. **Testing**
   - Write unit tests for services and components
   - Follow the AAA pattern (Arrange, Act, Assert)
   - Mock external dependencies

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## Technologies

- **Framework**: React
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **State Management**: Zustand
- **Routing**: React Router
- **Date Handling**: date-fns
- **Validation**: Zod
- **Testing**: Vitest, React Testing Library

## Quy ước sử dụng Service trong dự án

### Cấu trúc Chuẩn

Dự án SDIMS sử dụng mô hình kiến trúc nhiều lớp để tương tác với API. Quy ước này giúp đảm bảo tính nhất quán và dễ bảo trì trong toàn bộ codebase.

```
src/
├── features/                # Modules theo tính năng
│   └── [feature]/
│       ├── api.ts           # API calls trực tiếp 
│       ├── service.ts       # Business logic layer
│       ├── hooks/
│       │   └── useServices.ts # Custom hooks cho services
│       └── components/      # React components
└── services/
    └── core/                # Core API services
        ├── axios.ts         # Axios instance & interceptors
        └── baseApi.ts       # Base API service class
```

### Quy tắc Chuẩn hóa

1. **Không sử dụng API trực tiếp từ components**
   - ❌ `import { getEmployees } from '../../api'`
   - ✅ `import { useEmployeeService } from '../../hooks/useServices'`

2. **Sử dụng custom hooks để truy cập services**
   ```jsx
   const MyComponent = () => {
     const employeeService = useEmployeeService();
     
     // Sử dụng service
     const { data } = useQuery({
       queryKey: ['employees'],
       queryFn: () => employeeService.getEmployees()
     });
     
     // ...
   }
   ```

3. **Chuẩn hóa tất cả imports qua index files**
   ```jsx
   // Thay vì
   import { useEmployeeService } from '../../hooks/useServices';
   
   // Sử dụng
   import { useEmployeeService } from 'hooks';
   ```

### Lợi ích

1. **Tách biệt Concerns**
   - Components chỉ quan tâm về UI/UX
   - Services xử lý business logic
   - API layer chỉ tập trung vào giao tiếp HTTP

2. **Dễ dàng Refactor và Test**
   - Mock services thay vì mock API calls
   - Thay đổi implementation của services mà không ảnh hưởng tới components

3. **Code nhất quán**
   - Dễ đọc hơn cho team members
   - Onboarding nhanh hơn cho developers mới

### Ví dụ Triển khai

Xem các file mẫu:
- `src/features/hrm/service.ts`
- `src/features/hrm/hooks/useServices.ts`
- `src/features/hrm/components/EmployeeForm/EmployeeForm.tsx`
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
    ui/             # Base UI components
    layout/         # Layout components
    forms/          # Form-related components
    tables/         # Table-related components
    modals/         # Modal-related components
  features/         # Feature-based modules
    auth/           # Authentication related
    dashboard/      # Dashboard related
    hrm/            # Human Resource Management
    margin/         # Margin Management
    contracts/      # Contract Management
    opportunities/  # Opportunity Management
    admin/          # Admin features
    reports/        # Reporting features
  hooks/            # Custom hooks
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
```

## Feature Architecture

Each feature module in the `features` directory now follows a consistent architecture pattern:

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
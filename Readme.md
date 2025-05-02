# SDIMS Frontend

This is the frontend application for the SDIMS (Internal Management System). Built with React, TypeScript, and Vite.

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
  hooks/            # Custom hooks
  context/          # React context definitions
  services/         # API services
    core/           # Core service utilities
      axios.ts      # Axios instance and interceptors
      baseApi.ts    # Base API service class
      queryClient.ts# React Query configuration
      utils.ts      # API utility functions
    features/       # Domain-specific API services
      auth/         # Authentication services
      hrm/          # Human Resource Management services
      contracts/    # Contract Management services
      opportunities/# Opportunity Management services
      margin/       # Margin Management services
      projects/     # Project Management services
      customers/    # Customer Management services
    mock/           # Mock data services
  utils/            # Utility functions
  types/            # TypeScript type definitions
  config/           # Application configuration
  routes/           # Routing definitions
```

## Service Structure

Each feature module in the `services/features` directory follows a consistent pattern:

```
services/features/[feature]/
  index.ts          # Public exports
  [feature]Api.ts   # Direct API endpoints
  [feature]Service.ts # Business logic built on BaseApiService
```

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

## Architecture and Best Practices

- **Component Structure**: Feature-based organization with shared components
- **State Management**: Combination of React Context and Zustand for global state
- **API Handling**: 
  - Domain-driven design for API services
  - Centralized core utilities with feature-specific implementations
  - Consistent service pattern with Api and Service layers
- **Authentication**: JWT-based with token management
- **Styling**: Utility-first with Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **Error Handling**: Centralized error handling through API interceptors
- **Testing**: Unit and integration tests with Vitest and React Testing Library
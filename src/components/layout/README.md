# Layout Components

This directory contains the layout components for the SDIMS application. These components provide the foundational structure for different pages and views in the application.

## Available Components

### `MainLayout`

A layout for authenticated pages with the following features:
- Responsive design for mobile, tablet, and desktop
- Collapsible sidebar with toggle functionality
- Fixed header with user profile and notifications
- Dynamic breadcrumb navigation
- Footer with copyright and links
- Error boundary for graceful error handling

#### Usage

```tsx
import { MainLayout } from '@/components/layout';
import { Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/hrm" element={<HumanResources />} />
        {/* More routes... */}
      </Route>
    </Routes>
  );
}
```

### `AuthLayout`

A layout for unauthenticated pages like login, register, and forgot password with the following features:
- Centered card-based design
- Responsive on all devices
- Gradient background
- Logo and branding
- Footer with copyright
- Error boundary for graceful error handling

#### Usage

```tsx
import { AuthLayout } from '@/components/layout';
import { Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>
    </Routes>
  );
}
```

### `ErrorBoundary`

A component that catches JavaScript errors anywhere in its child component tree and displays a fallback UI instead of crashing the whole app.

#### Usage

```tsx
import { ErrorBoundary } from '@/components/ui';

function MyComponent() {
  return (
    <ErrorBoundary>
      <SomeComponentThatMightError />
    </ErrorBoundary>
  );
}

// With custom fallback UI
function MyComponentWithCustomFallback() {
  return (
    <ErrorBoundary fallback={<p>Something went wrong</p>}>
      <SomeComponentThatMightError />
    </ErrorBoundary>
  );
}
```

## Supplementary Components

The following components are used by the layouts internally but can also be used separately:

- `Sidebar`: Collapsible sidebar with navigation menu
- `Header`: Application header with user menu and notifications
- `Breadcrumb`: Dynamic breadcrumb navigation based on current route
- `Footer`: Page footer with copyright and useful links

## Styling

All components use Tailwind CSS for styling. The color scheme is based on the design tokens defined in the Tailwind configuration:

- Primary colors: For buttons, links, and accents
- Secondary colors: For backgrounds, text, and borders

## Accessibility

- Components include proper ARIA attributes
- Interactive elements are keyboard navigable
- Color contrast follows WCAG guidelines 
import React from 'react';
import AppRouter from './routes';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { QueryProvider } from './services/core/queryClient';

/**
 * Main application component
 * @returns {JSX.Element} The rendered application
 */
const App: React.FC = () => {
  return (
    <QueryProvider>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <AppRouter />
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryProvider>
  );
};

export default App;
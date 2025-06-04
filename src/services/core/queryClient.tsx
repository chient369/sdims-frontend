import { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ApiError } from './axios';

// Create a client with default settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && 'status' in error && (error as ApiError).status >= 400 && (error as ApiError).status < 500) {
          return false;
        }
        
        // Không retry khi không thể đọc properties của undefined (thường là do response không như mong đợi)
        if (error instanceof TypeError && error.message.includes("Cannot read properties of undefined")) {
          console.error('API response data structure error:', error);
          return false;
        }
        
        // Retry up to 1 time for other errors
        return failureCount < 1;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000), // Max 5 seconds delay
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
  },
});

// Setup global error handler
queryClient.setDefaultOptions({
  queries: {
    onError: (error: unknown) => {
      console.error('Global Query Error:', error);
    },
  },
});

// Provider Component
interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}; 
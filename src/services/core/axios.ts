import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

// Types
export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage or other state management
    const token = sessionStorage.getItem('token');
    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config);
    }

    return config;
  },
  (error) => {
    // Handle request errors
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);
// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Handle new API response structure
    if (response.data && response.data.status === "success") {
      return response.data;
    }
    return response.data;
  },
  (error: AxiosError) => {
    // Handle mocked responses
    if (error.response?.status === 200) {
      return Promise.resolve(error.response.data);
    }
    
    // Handle errors
    if (error.response) {
      // The request was made and the server responded with an error status
      const status = error.response.status;

      // Handle authentication errors
      if (status === 401) {
        
        // Clear auth data
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');

       // Redirect to login (if not already there)
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }

      // Format error for consistent handling
      const apiError: ApiError = {
        status,
        message: extractErrorMessage(error.response.data) || 'An error occurred',
        errors: extractValidationErrors(error.response.data),
      };

      return Promise.reject(apiError);
    }

    if (error.request) {
      // The request was made but no response was received
      const apiError: ApiError = {
        status: 0,
        message: 'No response from server. Please check your internet connection.',
      };
      return Promise.reject(apiError);
    }

    // Something happened in setting up the request
    const apiError: ApiError = {
      status: 0,
      message: error.message || 'An unexpected error occurred',
    };
    return Promise.reject(apiError);
  }
);

// Utility functions for error handling
function extractErrorMessage(data: any): string {
  if (typeof data === 'string') return data;
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  return 'An unknown error occurred';
}

function extractValidationErrors(data: any): Record<string, string[]> | undefined {
  if (data?.errors && typeof data.errors === 'object') {
    return data.errors;
  }
  return undefined;
}

export default apiClient; 
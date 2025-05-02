import { AxiosRequestConfig } from 'axios';

/**
 * Builds query parameters for API requests
 * @param params Object containing parameters to send
 * @returns Cleaned object with non-empty parameters
 */
export function buildQueryParams(params: Record<string, any>): Record<string, any> {
  // Filter out undefined, null, and empty string values
  const filteredParams: Record<string, any> = {};
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      // Handle arrays
      if (Array.isArray(value) && value.length === 0) {
        return;
      }
      filteredParams[key] = value;
    }
  });
  
  return filteredParams;
}

/**
 * Creates an AbortController and returns both controller and signal
 * @param timeoutMs Optional timeout in milliseconds
 */
export function createAbortController(timeoutMs?: number): {
  controller: AbortController;
  signal: AbortSignal;
  abort: () => void;
  setTimeout: (ms: number) => void;
} {
  const controller = new AbortController();
  const { signal } = controller;
  let timeoutId: number | undefined;
  
  const abort = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    controller.abort();
  };
  
  const setTimeout = (ms: number) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = window.setTimeout(() => controller.abort(), ms);
  };
  
  if (timeoutMs) {
    setTimeout(timeoutMs);
  }
  
  return { controller, signal, abort, setTimeout };
}

/**
 * Creates Axios config for file uploads
 * @param file File to upload
 * @param fieldName Form field name for the file
 * @param additionalData Additional form data to include
 * @param onProgress Progress callback
 * @returns AxiosRequestConfig for file upload
 */
export function createFileUploadConfig(
  file: File,
  fieldName: string = 'file',
  additionalData?: Record<string, any>,
  onProgress?: (percentage: number) => void
): AxiosRequestConfig {
  const formData = new FormData();
  formData.append(fieldName, file);
  
  // Add any additional form data
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }
  
  return {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: onProgress
      ? (progressEvent) => {
          if (progressEvent.total) {
            const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentage);
          }
        }
      : undefined,
    data: formData,
  };
}

/**
 * Creates Axios config for multiple file uploads
 * @param files Array of files to upload
 * @param fieldName Form field name for the files
 * @param additionalData Additional form data to include
 * @param onProgress Progress callback
 * @returns AxiosRequestConfig for file upload
 */
export function createMultipleFileUploadConfig(
  files: File[],
  fieldName: string = 'files',
  additionalData?: Record<string, any>,
  onProgress?: (percentage: number) => void
): AxiosRequestConfig {
  const formData = new FormData();
  
  // Append each file with the same field name
  files.forEach((file) => {
    formData.append(fieldName, file);
  });
  
  // Add any additional form data
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }
  
  return {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: onProgress
      ? (progressEvent) => {
          if (progressEvent.total) {
            const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentage);
          }
        }
      : undefined,
    data: formData,
  };
}

/**
 * Extracts user-friendly error message from API error
 * @param error Error object from API
 * @returns User-friendly error message 
 */
export function getErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  
  if (error && typeof error === 'object') {
    // Check for our ApiError format
    if ('message' in error) return error.message;
    
    // Check for standard Error object
    if ('message' in Error.prototype && 'message' in error) return error.message;
    
    // Check for axios error format
    if ('response' in error && error.response?.data) {
      if (typeof error.response.data === 'string') return error.response.data;
      if (error.response.data?.message) return error.response.data.message;
      if (error.response.data?.error) return error.response.data.error;
    }
  }
  
  return 'An unexpected error occurred. Please try again later.';
} 
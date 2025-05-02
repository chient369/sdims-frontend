// Core exports
export { default as apiClient } from './core/axios';
export type { ApiError } from './core/axios';
export { BaseApiService } from './core/baseApi';
export { QueryProvider, queryClient } from './core/queryClient';

// Utility functions
export {
  buildQueryParams,
  createFileUploadConfig,
  createMultipleFileUploadConfig,
  createAbortController,
  getErrorMessage,
} from './core/utils';

// Feature module exports
export * from './features/auth';
export * from './features/hrm';
export * from './features/contracts';
export * from './features/opportunities';
export * from './features/margin';
export * from './features/admin';

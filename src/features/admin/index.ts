/**
 * Admin Feature Module
 * 
 * This is the main entry point for the admin feature.
 * It exports types, API functions, services, and routes.
 */

// Export all types
export * from './types';

// Export services
export { 
  userService,
  roleService,
  configService,
  systemLogService
} from './service';

// Export routes
export { AdminRoutes } from './routes'; 
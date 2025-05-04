/**
 * Reports Feature Module
 * 
 * This is the main entry point for the reports feature.
 * It exports types, API functions, services, and routes.
 */

// Export all types
export * from './types';

// Export services
export { 
  dashboardService,
  reportService
} from './service';

// Export routes
export { ReportsRoutes } from './routes'; 
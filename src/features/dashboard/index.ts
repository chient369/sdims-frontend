export { default as DashboardPage } from './Dashboard';
export * from './types'; 
export * from './routes';

import DashboardService from './service';
export const dashboardService = new DashboardService();

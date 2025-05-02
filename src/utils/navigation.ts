import { useNavigate } from 'react-router-dom';

// Define route paths for the entire application
export const routePaths = {
  home: '/',
  login: '/login',
  dashboard: '/dashboard',
  unauthorized: '/unauthorized',
  
  // HRM routes
  hrm: {
    base: '/hrm',
    employees: '/hrm/employees',
    employeeDetail: (id: string) => `/hrm/employees/${id}`,
    newEmployee: '/hrm/employees/new',
    editEmployee: (id: string) => `/hrm/employees/${id}/edit`,
    skills: '/hrm/skills',
  },
  
  // Margin routes
  margin: {
    base: '/margins',
    list: '/margins/list',
    costs: '/margins/costs',
    import: '/margins/import',
    charts: '/margins/charts',
  },
  
  // Contract routes
  contract: {
    base: '/contracts',
    list: '/contracts/list',
    detail: (id: string) => `/contracts/${id}`,
    new: '/contracts/new',
    edit: (id: string) => `/contracts/${id}/edit`,
    payments: '/contracts/payments',
    kpi: '/contracts/kpi',
  },
  
  // Opportunity routes
  opportunity: {
    base: '/opportunities',
    list: '/opportunities/list',
    detail: (id: string) => `/opportunities/${id}`,
    activities: (id: string) => `/opportunities/${id}/activities`,
    sync: '/opportunities/sync',
  },
};

// Custom hook for programmatic navigation
export const useAppNavigation = () => {
  const navigate = useNavigate();
  
  return {
    // General navigation
    goToHome: () => navigate(routePaths.home),
    goToDashboard: () => navigate(routePaths.dashboard),
    goToLogin: () => navigate(routePaths.login),
    goBack: () => navigate(-1),
    
    // HRM navigation
    goToEmployees: () => navigate(routePaths.hrm.employees),
    goToEmployeeDetail: (id: string) => navigate(routePaths.hrm.employeeDetail(id)),
    goToNewEmployee: () => navigate(routePaths.hrm.newEmployee),
    goToEditEmployee: (id: string) => navigate(routePaths.hrm.editEmployee(id)),
    goToSkills: () => navigate(routePaths.hrm.skills),
    
    // Margin navigation
    goToMarginList: () => navigate(routePaths.margin.list),
    goToCosts: () => navigate(routePaths.margin.costs),
    goToImportCosts: () => navigate(routePaths.margin.import),
    goToMarginCharts: () => navigate(routePaths.margin.charts),
    
    // Contract navigation
    goToContractList: () => navigate(routePaths.contract.list),
    goToContractDetail: (id: string) => navigate(routePaths.contract.detail(id)),
    goToNewContract: () => navigate(routePaths.contract.new),
    goToEditContract: (id: string) => navigate(routePaths.contract.edit(id)),
    goToPayments: () => navigate(routePaths.contract.payments),
    goToRevenueKPI: () => navigate(routePaths.contract.kpi),
    
    // Opportunity navigation
    goToOpportunityList: () => navigate(routePaths.opportunity.list),
    goToOpportunityDetail: (id: string) => navigate(routePaths.opportunity.detail(id)),
    goToOpportunityActivities: (id: string) => navigate(routePaths.opportunity.activities(id)),
    goToHubspotSync: () => navigate(routePaths.opportunity.sync),
  };
}; 
/**
 * Reports API Module
 * 
 * This module serves as an adapter layer between the application and the REST API.
 * It provides functions for direct API communication with the reports endpoints.
 * Each function implements a specific API call and handles the response formatting.
 */

import apiClient from '../../services/core/axios';
import { AxiosRequestConfig } from 'axios';

import {
  // Dashboard Types
  DashboardParams,
  DashboardSummaryResponse,
  
  // Employee Report Types
  EmployeeReportParams,
  EmployeeReportResponse,
  
  // Margin Report Types
  MarginReportParams,
  MarginReportResponse,
  
  // Opportunity Report Types
  OpportunityReportParams,
  OpportunityReportResponse,
  
  // Contract Report Types
  ContractReportParams,
  ContractReportResponse,
  
  // Payment Report Types
  PaymentReportParams,
  PaymentReportResponse,
  
  // KPI Report Types
  KpiReportParams,
  KpiReportResponse,
  
  // Utilization Report Types
  UtilizationReportParams,
  UtilizationReportResponse
} from './types';

/**
 * Get dashboard summary data
 */
export const getDashboardSummary = async (
  params?: DashboardParams,
  config?: AxiosRequestConfig
): Promise<DashboardSummaryResponse> => {
  return apiClient.get('/api/v1/dashboard/summary', {
    ...config,
    params,
  });
};

/**
 * Get employee report data
 */
export const getEmployeeReport = async (
  params?: EmployeeReportParams,
  config?: AxiosRequestConfig
): Promise<EmployeeReportResponse | Blob> => {
  // If export type is excel or csv, return a Blob instead of JSON
  if (params?.exportType && params.exportType !== 'json') {
    return apiClient.get('/api/v1/reports/employees', {
      ...config,
      params,
      responseType: 'blob'
    });
  }
  
  return apiClient.get('/api/v1/reports/employees', {
    ...config,
    params,
  });
};

/**
 * Get margin report data
 */
export const getMarginReport = async (
  params?: MarginReportParams,
  config?: AxiosRequestConfig
): Promise<MarginReportResponse | Blob> => {
  // If export type is excel or csv, return a Blob instead of JSON
  if (params?.exportType && params.exportType !== 'json') {
    return apiClient.get('/api/v1/reports/margins', {
      ...config,
      params,
      responseType: 'blob'
    });
  }
  
  return apiClient.get('/api/v1/reports/margins', {
    ...config,
    params,
  });
};

/**
 * Get opportunity report data
 */
export const getOpportunityReport = async (
  params?: OpportunityReportParams,
  config?: AxiosRequestConfig
): Promise<OpportunityReportResponse | Blob> => {
  // If export type is excel or csv, return a Blob instead of JSON
  if (params?.exportType && params.exportType !== 'json') {
    return apiClient.get('/api/v1/reports/opportunities', {
      ...config,
      params,
      responseType: 'blob'
    });
  }
  
  return apiClient.get('/api/v1/reports/opportunities', {
    ...config,
    params,
  });
};

/**
 * Get contract report data
 */
export const getContractReport = async (
  params?: ContractReportParams,
  config?: AxiosRequestConfig
): Promise<ContractReportResponse | Blob> => {
  // If export type is excel or csv, return a Blob instead of JSON
  if (params?.exportType && params.exportType !== 'json') {
    return apiClient.get('/api/v1/reports/contracts', {
      ...config,
      params,
      responseType: 'blob'
    });
  }
  
  return apiClient.get('/api/v1/reports/contracts', {
    ...config,
    params,
  });
};

/**
 * Get payment report data
 */
export const getPaymentReport = async (
  params?: PaymentReportParams,
  config?: AxiosRequestConfig
): Promise<PaymentReportResponse | Blob> => {
  // If export type is excel or csv, return a Blob instead of JSON
  if (params?.exportType && params.exportType !== 'json') {
    return apiClient.get('/api/v1/reports/payments', {
      ...config,
      params,
      responseType: 'blob'
    });
  }
  
  return apiClient.get('/api/v1/reports/payments', {
    ...config,
    params,
  });
};

/**
 * Get KPI progress report data
 */
export const getKpiProgressReport = async (
  params?: KpiReportParams,
  config?: AxiosRequestConfig
): Promise<KpiReportResponse | Blob> => {
  // If export type is excel or csv, return a Blob instead of JSON
  if (params?.exportType && params.exportType !== 'json') {
    return apiClient.get('/api/v1/reports/kpi-progress', {
      ...config,
      params,
      responseType: 'blob'
    });
  }
  
  return apiClient.get('/api/v1/reports/kpi-progress', {
    ...config,
    params,
  });
};

/**
 * Get utilization report data
 */
export const getUtilizationReport = async (
  params?: UtilizationReportParams,
  config?: AxiosRequestConfig
): Promise<UtilizationReportResponse | Blob> => {
  // If export type is excel or csv, return a Blob instead of JSON
  if (params?.exportType && params.exportType !== 'json') {
    return apiClient.get('/api/v1/reports/utilization', {
      ...config,
      params,
      responseType: 'blob'
    });
  }
  
  return apiClient.get('/api/v1/reports/utilization', {
    ...config,
    params,
  });
}; 
import apiClient from '../../../core/axios';
import { AxiosRequestConfig } from 'axios';

export interface SystemConfig {
  key: string;
  value: string | number | boolean | object;
  label: string;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'object';
  group: string;
  isSecured?: boolean;
  updatedAt?: string;
  updatedBy?: {
    id: number;
    username: string;
  };
}

export interface ConfigListParams {
  group?: string;
  keyword?: string;
}

export interface UpdateConfigRequest {
  value: string | number | boolean | object;
}

/**
 * Get all system configurations with optional filtering
 */
export const getConfigs = async (params?: ConfigListParams, config?: AxiosRequestConfig): Promise<{
  groups: {
    [key: string]: SystemConfig[];
  };
  configs: SystemConfig[];
}> => {
  return apiClient.get('/api/v1/admin/configs', {
    ...config,
    params,
  });
};

/**
 * Get a specific configuration by key
 */
export const getConfigByKey = async (configKey: string, config?: AxiosRequestConfig): Promise<SystemConfig> => {
  return apiClient.get(`/api/v1/admin/configs/${configKey}`, config);
};

/**
 * Update a configuration value
 */
export const updateConfig = async (configKey: string, data: UpdateConfigRequest, config?: AxiosRequestConfig): Promise<SystemConfig> => {
  return apiClient.put(`/api/v1/admin/configs/${configKey}`, data, config);
};

/**
 * Update multiple configurations at once
 */
export const updateMultipleConfigs = async (
  configs: { key: string; value: string | number | boolean | object }[],
  config?: AxiosRequestConfig
): Promise<{
  message: string;
  success: boolean;
  updated: SystemConfig[];
}> => {
  return apiClient.put('/api/v1/admin/configs/batch', { configs }, config);
}; 
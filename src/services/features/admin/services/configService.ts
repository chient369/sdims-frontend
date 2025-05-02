import { BaseApiService } from '../../../core/baseApi';
import {
  SystemConfig,
  ConfigListParams,
  UpdateConfigRequest,
  getConfigs as getConfigsApi,
  getConfigByKey as getConfigByKeyApi,
  updateConfig as updateConfigApi,
  updateMultipleConfigs as updateMultipleConfigsApi,
} from '../api';

/**
 * Service for system configuration operations
 */
class ConfigService extends BaseApiService {
  constructor() {
    super('/api/v1/admin/configs');
  }

  /**
   * Get all system configurations with optional filtering
   */
  async getConfigs(params?: ConfigListParams): Promise<{
    groups: {
      [key: string]: SystemConfig[];
    };
    configs: SystemConfig[];
  }> {
    return getConfigsApi(params);
  }

  /**
   * Get a specific configuration by key
   */
  async getConfigByKey(configKey: string): Promise<SystemConfig> {
    return getConfigByKeyApi(configKey);
  }

  /**
   * Update a configuration value
   */
  async updateConfig(configKey: string, data: UpdateConfigRequest): Promise<SystemConfig> {
    return updateConfigApi(configKey, data);
  }

  /**
   * Update multiple configurations at once
   */
  async updateMultipleConfigs(
    configs: { key: string; value: string | number | boolean | object }[]
  ): Promise<{
    message: string;
    success: boolean;
    updated: SystemConfig[];
  }> {
    return updateMultipleConfigsApi(configs);
  }

  /**
   * Get configurations for a specific group (convenience method)
   */
  async getConfigsByGroup(group: string): Promise<SystemConfig[]> {
    const response = await this.getConfigs({ group });
    return response.configs.filter(config => config.group === group);
  }

  /**
   * Get configuration value by key (convenience method)
   */
  async getConfigValue<T>(key: string): Promise<T> {
    try {
      const config = await this.getConfigByKey(key);
      return config.value as T;
    } catch (error) {
      console.error(`Error fetching config value for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get margin configuration thresholds (convenience method)
   */
  async getMarginThresholds(): Promise<{ Red: number; Yellow: number; Green: number }> {
    const configs = await this.getConfigsByGroup('margin');
    
    // Find threshold config values
    const redThreshold = configs.find(c => c.key === 'margin.threshold.red')?.value as number || 0;
    const yellowThreshold = configs.find(c => c.key === 'margin.threshold.yellow')?.value as number || 0;
    
    return {
      Red: redThreshold,
      Yellow: yellowThreshold,
      Green: yellowThreshold + 0.01 // Just above yellow threshold
    };
  }
}

export const configService = new ConfigService(); 
// Mock services for admin module
// These would be replaced with real API calls in production

/**
 * User service for managing users
 */
export const userService = {
  /**
   * Get count of active users
   * @returns {Promise<number>} Count of active users
   */
  getActiveUsersCount: async (): Promise<number> => {
    // Mock implementation
    return Promise.resolve(124);
  },
  
  /**
   * Get users with pagination
   * @param {Object} options - Pagination options
   * @returns {Promise<Object>} Paginated users result
   */
  getUsers: async (options: { page: number; size: number }): Promise<any> => {
    // Mock implementation
    return Promise.resolve({
      content: [
        { id: 1, username: 'admin', email: 'admin@example.com', role: 'Administrator' },
        { id: 2, username: 'manager', email: 'manager@example.com', role: 'Manager' },
        { id: 3, username: 'user', email: 'user@example.com', role: 'User' },
      ],
      pageable: {
        totalElements: 124,
        totalPages: 42,
        number: options.page,
        size: options.size
      }
    });
  }
};

/**
 * Role service for managing roles
 */
export const roleService = {
  /**
   * Get roles with pagination
   * @param {Object} options - Pagination options
   * @returns {Promise<Object>} Paginated roles result
   */
  getRoles: async (options: { page: number; size: number }): Promise<any> => {
    // Mock implementation
    return Promise.resolve({
      content: [
        { id: 1, name: 'Administrator', description: 'Full system access', permissions: 25 },
        { id: 2, name: 'Manager', description: 'Management level access', permissions: 15 },
        { id: 3, name: 'User', description: 'Standard user access', permissions: 8 },
      ],
      pageable: {
        totalElements: 6,
        totalPages: 2,
        number: options.page,
        size: options.size
      }
    });
  }
};

/**
 * System log service for managing system logs
 */
export const systemLogService = {
  /**
   * Get summary of logs
   * @returns {Promise<Object>} Log summary
   */
  getLogsSummary: async (): Promise<any> => {
    // Mock implementation
    return Promise.resolve({
      totalLogs: 1245,
      totalErrors: 12,
      totalWarnings: 38,
      totalInfo: 1095,
      totalDebug: 100
    });
  },
  
  /**
   * Get recent critical errors
   * @param {number} limit - Number of errors to return
   * @returns {Promise<Array>} Recent critical errors
   */
  getRecentCriticalErrors: async (limit: number): Promise<any[]> => {
    // Mock implementation
    return Promise.resolve([
      {
        id: 1,
        timestamp: '2025-05-15 10:22:14',
        level: 'error',
        module: 'database.service',
        message: 'Database connection failed',
        details: 'Connection timeout after 30s'
      },
      {
        id: 2,
        timestamp: '2025-05-15 11:30:45',
        level: 'error',
        module: 'file.service',
        message: 'File upload failed',
        details: 'File size exceeds maximum allowed size (15MB)'
      },
      {
        id: 3,
        timestamp: '2025-05-14 15:12:33',
        level: 'error',
        module: 'auth.service',
        message: 'Failed login attempts threshold exceeded',
        details: 'IP: 192.168.1.105 has been blocked for 30 minutes'
      }
    ].slice(0, limit));
  }
}; 
import { BaseApiService } from '../../../core/baseApi';
import {
  UserResponse,
  UserListParams,
  CreateUserRequest,
  UpdateUserRequest,
  ResetPasswordRequest,
  getUsers as getUsersApi,
  getUserById as getUserByIdApi,
  createUser as createUserApi,
  updateUser as updateUserApi,
  deleteUser as deleteUserApi,
  resetUserPassword as resetUserPasswordApi,
  lockUserAccount as lockUserAccountApi,
  unlockUserAccount as unlockUserAccountApi,
} from '../api';

/**
 * Service for user management operations
 */
class UserService extends BaseApiService {
  constructor() {
    super('/api/v1/admin/users');
  }

  /**
   * Get a list of system users with filtering and pagination
   */
  async getUsers(params?: UserListParams): Promise<{
    content: UserResponse[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      totalPages: number;
      totalElements: number;
      sort?: string;
    };
  }> {
    return getUsersApi(params);
  }

  /**
   * Get detailed information about a specific user
   */
  async getUserById(userId: number): Promise<UserResponse> {
    return getUserByIdApi(userId);
  }

  /**
   * Create a new user
   */
  async createUser(userData: CreateUserRequest): Promise<UserResponse> {
    return createUserApi(userData);
  }

  /**
   * Update an existing user
   */
  async updateUser(userId: number, userData: UpdateUserRequest): Promise<UserResponse> {
    return updateUserApi(userId, userData);
  }

  /**
   * Delete a user
   */
  async deleteUser(userId: number): Promise<void> {
    return deleteUserApi(userId);
  }

  /**
   * Reset a user's password
   */
  async resetUserPassword(userId: number, passwordData: ResetPasswordRequest): Promise<{
    message: string;
    success: boolean;
  }> {
    return resetUserPasswordApi(userId, passwordData);
  }

  /**
   * Lock a user account
   */
  async lockUserAccount(userId: number): Promise<{
    message: string;
    success: boolean;
  }> {
    return lockUserAccountApi(userId);
  }

  /**
   * Unlock a user account
   */
  async unlockUserAccount(userId: number): Promise<{
    message: string;
    success: boolean;
  }> {
    return unlockUserAccountApi(userId);
  }

  /**
   * Get active users count (convenience method)
   */
  async getActiveUsersCount(): Promise<number> {
    const response = await this.getUsers({
      status: 'Active',
      page: 1,
      size: 1
    });
    return response.pageable.totalElements;
  }
}

export const userService = new UserService(); 
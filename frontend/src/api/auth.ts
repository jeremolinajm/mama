import apiClient from './client';
import type { LoginRequest, LoginResponse } from '../types/domain';

/**
 * API module for authentication
 */

export const authApi = {
  /**
   * Admin login
   */
  login: async (request: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/api/auth/login', request);
    return response.data;
  },
};

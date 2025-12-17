import apiClient from './client';
import type { Category, CategoryType } from '../types/domain';

/**
 * API module for categories
 */

export const categoriasApi = {
  /**
   * Get all active categories
   */
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>('/api/public/categories');
    return response.data;
  },

  /**
   * Get categories by type (SERVICE or PRODUCT)
   */
  getByType: async (type: CategoryType): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>(`/api/public/categories/type/${type}`);
    return response.data;
  },
};

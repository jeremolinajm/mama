import apiClient from './client';
import type { Service } from '../types/domain';

/**
 * API module for services
 */

export const serviciosApi = {
  /**
   * Get all active services
   */
  getAll: async (): Promise<Service[]> => {
    const response = await apiClient.get<Service[]>('/api/public/services');
    return response.data;
  },

  /**
   * Get featured services
   */
  getFeatured: async (): Promise<Service[]> => {
    const response = await apiClient.get<Service[]>('/api/public/services/featured');
    return response.data;
  },

  /**
   * Get service by ID
   */
  getById: async (id: number): Promise<Service> => {
    const response = await apiClient.get<Service>(`/api/public/services/${id}`);
    return response.data;
  },

  /**
   * Get services by category
   */
  getByCategory: async (categoryId: number): Promise<Service[]> => {
    const response = await apiClient.get<Service[]>(`/api/public/services/category/${categoryId}`);
    return response.data;
  },
};

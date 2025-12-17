import apiClient from './client';
import type { Product } from '../types/domain';

/**
 * API module for products
 */

export const productosApi = {
  /**
   * Get all active products
   */
  getAll: async (): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>('/api/public/products');
    return response.data;
  },

  /**
   * Get featured products
   */
  getFeatured: async (): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>('/api/public/products/featured');
    return response.data;
  },

  /**
   * Get product by ID
   */
  getById: async (id: number): Promise<Product> => {
    const response = await apiClient.get<Product>(`/api/public/products/${id}`);
    return response.data;
  },

  /**
   * Get products by category
   */
  getByCategory: async (categoryId: number): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>(`/api/public/products/category/${categoryId}`);
    return response.data;
  },

  /**
   * Get trending products
   */
  getTrending: async (): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>('/api/public/products/trending');
    return response.data;
  },

  /**
   * Get offer products
   */
  getOffers: async (): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>('/api/public/products/offers');
    return response.data;
  },
};

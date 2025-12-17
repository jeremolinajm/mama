import apiClient from './client';
import type {
  Service,
  Product,
  Category,
  Booking,
  Order,
  ConfigEntry,
  BookingStatus,
  OrderStatus,
} from '../types/domain';

// Spring Page response type
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // current page number (0-indexed)
  first: boolean;
  last: boolean;
  empty: boolean;
}

/**
 * API module for admin operations
 * All endpoints require JWT authentication
 */

export const adminApi = {
  // ==================== SERVICES ====================
  services: {
    getAll: async (): Promise<Service[]> => {
      const response = await apiClient.get<Service[]>('/api/admin/services');
      return response.data;
    },

    getById: async (id: number): Promise<Service> => {
      const response = await apiClient.get<Service>(`/api/admin/services/${id}`);
      return response.data;
    },

    create: async (service: Partial<Service>): Promise<Service> => {
      const response = await apiClient.post<Service>('/api/admin/services', service);
      return response.data;
    },

    update: async (id: number, service: Partial<Service>): Promise<Service> => {
      const response = await apiClient.put<Service>(`/api/admin/services/${id}`, service);
      return response.data;
    },

    delete: async (id: number): Promise<void> => {
      await apiClient.delete(`/api/admin/services/${id}`);
    },

    toggleFeatured: async (id: number): Promise<Service> => {
      const response = await apiClient.patch<Service>(`/api/admin/services/${id}/featured`);
      return response.data;
    },
  },

  // ==================== PRODUCTS ====================
  products: {
    getAll: async (page: number = 0, size: number = 10): Promise<PageResponse<Product>> => {
      const response = await apiClient.get<PageResponse<Product>>(
        `/api/admin/products?page=${page}&size=${size}`
      );
      return response.data;
    },

    getById: async (id: number): Promise<Product> => {
      const response = await apiClient.get<Product>(`/api/admin/products/${id}`);
      return response.data;
    },

    create: async (product: Partial<Product>): Promise<Product> => {
      const response = await apiClient.post<Product>('/api/admin/products', product);
      return response.data;
    },

    update: async (id: number, product: Partial<Product>): Promise<Product> => {
      const response = await apiClient.put<Product>(`/api/admin/products/${id}`, product);
      return response.data;
    },

    delete: async (id: number): Promise<void> => {
      await apiClient.delete(`/api/admin/products/${id}`);
    },

    toggleFeatured: async (id: number): Promise<Product> => {
      const response = await apiClient.patch<Product>(`/api/admin/products/${id}/featured`);
      return response.data;
    },

    updateStock: async (id: number, stock: number): Promise<Product> => {
      const response = await apiClient.patch<Product>(`/api/admin/products/${id}/stock`, {
        stock,
      });
      return response.data;
    },
  },

  // ==================== CATEGORIES ====================
  categories: {
    getAll: async (): Promise<Category[]> => {
      const response = await apiClient.get<Category[]>('/api/admin/categories');
      return response.data;
    },

    create: async (category: Partial<Category>): Promise<Category> => {
      const response = await apiClient.post<Category>('/api/admin/categories', category);
      return response.data;
    },

    update: async (id: number, category: Partial<Category>): Promise<Category> => {
      const response = await apiClient.put<Category>(`/api/admin/categories/${id}`, category);
      return response.data;
    },

    delete: async (id: number): Promise<void> => {
      await apiClient.delete(`/api/admin/categories/${id}`);
    },
  },

  // ==================== BOOKINGS ====================
  bookings: {
    getAll: async (filters?: {
      startDate?: string;
      endDate?: string;
      status?: BookingStatus;
    }): Promise<Booking[]> => {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.status) params.append('status', filters.status);

      const response = await apiClient.get<Booking[]>(`/api/admin/bookings?${params.toString()}`);
      return response.data;
    },

    updateStatus: async (id: number, status: BookingStatus): Promise<Booking> => {
      const response = await apiClient.patch<Booking>(`/api/admin/bookings/${id}/status`, {
        status,
      });
      return response.data;
    },

    cancel: async (id: number): Promise<void> => {
      await apiClient.delete(`/api/admin/bookings/${id}`);
    },

    reschedule: async (
      id: number,
      newDate: string,
      newTime: string
    ): Promise<Booking> => {
      const response = await apiClient.patch<Booking>(
        `/api/admin/bookings/${id}/reschedule`,
        { bookingDate: newDate, bookingTime: newTime }
      );
      return response.data;
    },

    blockDay: async (date: string, reason?: string): Promise<Booking> => {
      const response = await apiClient.post<Booking>(
        '/api/admin/bookings/block-day',
        { date, reason: reason || 'Día bloqueado' }
      );
      return response.data;
    },

    unblockDay: async (date: string): Promise<void> => {
      await apiClient.delete(`/api/admin/bookings/unblock-day?date=${date}`);
    },
  },

  // ==================== ORDERS ====================
  orders: {
    getAll: async (page: number = 0, size: number = 10, filters?: {
      startDate?: string;
      endDate?: string;
      status?: OrderStatus;
    }): Promise<PageResponse<Order>> => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('size', size.toString());
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.status) params.append('status', filters.status);

      const response = await apiClient.get<PageResponse<Order>>(`/api/admin/orders?${params.toString()}`);
      return response.data;
    },

    updateStatus: async (id: number, status: OrderStatus): Promise<Order> => {
      const response = await apiClient.patch<Order>(`/api/admin/orders/${id}/status`, {
        status,
      });
      return response.data;
    },
  },

  // ==================== CONFIG ====================
  config: {
    getAll: async (): Promise<ConfigEntry[]> => {
      const response = await apiClient.get<ConfigEntry[]>('/api/admin/config');
      return response.data;
    },

    update: async (key: string, value: string): Promise<ConfigEntry> => {
      const response = await apiClient.put<ConfigEntry>(`/api/admin/config/${key}`, { value });
      return response.data;
    },
  },
};

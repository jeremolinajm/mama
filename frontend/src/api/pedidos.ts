import apiClient from './client';
import type {
  CreateOrderRequest,
  OrderResponse,
  PaymentPreferenceResponse,
} from '../types/domain';

/**
 * API module for orders (pedidos)
 */

export const pedidosApi = {
  /**
   * Create a new order
   */
  create: async (request: CreateOrderRequest): Promise<OrderResponse> => {
    const response = await apiClient.post<OrderResponse>('/api/public/orders', request);
    return response.data;
  },

  /**
   * Get order by order number
   */
  getByNumber: async (orderNumber: string): Promise<OrderResponse> => {
    const response = await apiClient.get<OrderResponse>(`/api/public/orders/${orderNumber}`);
    return response.data;
  },

  /**
   * Create Mercado Pago payment preference for an order
   */
  createPaymentPreference: async (orderId: number): Promise<PaymentPreferenceResponse> => {
    const response = await apiClient.post<PaymentPreferenceResponse>(
      `/api/public/payments/orders/${orderId}/preference`
    );
    return response.data;
  },
};

import apiClient from './client';
import type {
  CreateBookingRequest,
  BookingResponse,
  PaymentPreferenceResponse,
} from '../types/domain';

export const turnosApi = {
  // ... (mantén los métodos create, getByNumber, createPaymentPreference igual que antes)

  create: async (request: CreateBookingRequest): Promise<BookingResponse> => {
    const response = await apiClient.post<BookingResponse>('/api/public/bookings', request);
    return response.data;
  },

  getByNumber: async (bookingNumber: string): Promise<BookingResponse> => {
    const response = await apiClient.get<BookingResponse>(`/api/public/bookings/${bookingNumber}`);
    return response.data;
  },

  createPaymentPreference: async (bookingId: number): Promise<PaymentPreferenceResponse> => {
    const response = await apiClient.post<PaymentPreferenceResponse>(
      `/api/public/payments/bookings/${bookingId}/preference`
    );
    return response.data;
  },

  // NUEVO MÉTODO: Obtener disponibilidad real
  getAvailability: async (serviceId: number, date: string): Promise<string[]> => {
    // El backend espera: /api/public/availability?serviceId=X&date=YYYY-MM-DD
    const response = await apiClient.get<string[]>('/api/public/availability', {
      params: { serviceId, date }
    });
    return response.data; // Devuelve array de strings ["09:00", "09:30", ...]
  }
};
/**
 * TypeScript domain types matching backend DTOs
 * All content in Spanish as per requirements
 */

// ==================== ENUMS (as const objects for erasableSyntaxOnly) ====================

export const BookingStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  BLOCKED: 'BLOCKED',
} as const;

export type BookingStatus = typeof BookingStatus[keyof typeof BookingStatus];

export const PaymentStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  NOT_REQUIRED: 'NOT_REQUIRED',
} as const;

export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];

export const OrderStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  PREPARING: 'PREPARING',
  READY: 'READY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export const DeliveryType = {
  PICKUP: 'PICKUP',
  HOME_DELIVERY: 'HOME_DELIVERY',
} as const;

export type DeliveryType = typeof DeliveryType[keyof typeof DeliveryType];

export const CategoryType = {
  SERVICE: 'SERVICE',
  PRODUCT: 'PRODUCT',
} as const;

export type CategoryType = typeof CategoryType[keyof typeof CategoryType];

// ==================== CATALOG ====================

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  type: CategoryType;
  isActive: boolean;
  createdAt: string;
}

export interface Service {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  durationMinutes: number;
  price: number;
  categoryId: number | null;
  categoryName: string | null;
  isFeatured: boolean;
  isActive: boolean;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  price: number;
  stock: number;
  categoryId: number | null;
  categoryName: string | null;
  isFeatured: boolean;
  isOffer: boolean;
  isTrending: boolean;
  isActive: boolean;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// ==================== BOOKING ====================

export interface CustomerInfo {
  name: string;
  email: string;
  whatsapp: string;
  comments: string | null;
}

export interface TimeSlot {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
}

export interface Booking {
  id: number;
  bookingNumber: string;
  serviceId: number;
  serviceName?: string;
  customerName: string;
  customerEmail: string;
  customerWhatsApp: string;
  customerComments: string | null;
  
  bookingDate: string;
  bookingTime: string;

  durationMinutes: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  amount: number;
  mercadoPagoPreferenceId: string | null;
  mercadoPagoPaymentId: string | null;
  createdAt: string;
  updatedAt: string;
  confirmedAt: string | null;
  cancelledAt: string | null;
}

export interface CreateBookingRequest {
  serviceId: number;
  customerName: string;
  customerEmail: string;
  customerWhatsapp: string;
  customerComments: string | null;
  bookingDate: string; // YYYY-MM-DD
  bookingTime: string; // HH:mm
  durationMinutes: number;
  amount: number;
}

export interface BookingResponse {
  id: number;
  bookingNumber: string;
  serviceId: number;
  serviceName: string;
  customerInfo: CustomerInfo;
  timeSlot: TimeSlot;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  amount: number;
  mercadoPagoPreferenceId: string | null;
  createdAt: string;
}

// ==================== SALES / ORDERS ====================

export interface DeliveryInfo {
  deliveryType: DeliveryType;
  deliveryAddress: string | null;
  deliveryCity: string | null;
  deliveryProvince: string | null;
  deliveryPostalCode: string | null;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerInfo: CustomerInfo;
  deliveryInfo: DeliveryInfo;
  items: OrderItem[];
  subtotal: number;
  deliveryCost: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  mercadoPagoPreferenceId: string | null;
  mercadoPagoPaymentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderItemRequest {
  productId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  customerName: string;
  customerEmail: string;
  customerWhatsapp: string;
  customerComments: string | null;
  deliveryType: DeliveryType;
  deliveryAddress: string | null;
  deliveryCity: string | null;
  deliveryProvince: string | null;
  deliveryPostalCode: string | null;
  items: CreateOrderItemRequest[];
}

export interface OrderResponse {
  id: number;
  orderNumber: string;
  customerInfo: CustomerInfo;
  deliveryInfo: DeliveryInfo;
  items: OrderItem[];
  subtotal: number;
  deliveryCost: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  mercadoPagoPreferenceId: string | null;
  createdAt: string;
}

// ==================== PAYMENT ====================

export interface PaymentPreferenceResponse {
  preferenceId: string;
  initPoint: string;
}

// ==================== CART (Frontend only) ====================

export interface CartItem {
  product: Product;
  quantity: number;
}

// ==================== AUTH ====================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
}

// ==================== API RESPONSE ====================

export interface ApiResponse<T> {
  data: T;
  message: string | null;
  success: boolean;
}

export interface ErrorResponse {
  message: string;
  status: number;
  timestamp: string;
  details: string[] | null;
}

// ==================== CONFIG ====================

export interface ConfigEntry {
  key: string;
  value: string;
  description: string | null;
}

export interface DaySchedule {
  enabled: boolean;
  startTime: string; // "09:00"
  endTime: string;   // "18:00"
}

export interface WeeklySchedule {
  [key: string]: DaySchedule; // monday, tuesday, etc.
}
package com.flavia.dermobeauty.sales.domain;

/**
 * Domain enum representing the lifecycle status of an order.
 */
public enum OrderStatus {
    PENDING,    // Order created, payment not yet completed
    PAID,       // Payment completed
    PREPARING,  // Order being prepared
    READY,      // Order ready for pickup/delivery
    DELIVERED,  // Order delivered to customer
    CANCELLED   // Order cancelled
}

package com.flavia.dermobeauty.booking.domain;

/**
 * Domain enum representing the payment status of a booking.
 */
public enum PaymentStatus {
    PENDING,       // Payment not yet initiated or in progress
    PAID,          // Payment successfully completed
    FAILED,        // Payment failed
    REFUNDED,      // Payment was refunded
    NOT_REQUIRED   // No payment required (e.g., blocked time slots)
}

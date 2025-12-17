package com.flavia.dermobeauty.booking.domain;

/**
 * Domain enum representing the lifecycle status of a booking.
 */
public enum BookingStatus {
    PENDING,    // Initial state, payment not yet completed
    CONFIRMED,  // Payment completed, booking confirmed
    CANCELLED,  // Booking cancelled (by admin or customer)
    COMPLETED,  // Service was provided
    BLOCKED     // Time slot blocked by admin (holiday, personal day, etc.)
}

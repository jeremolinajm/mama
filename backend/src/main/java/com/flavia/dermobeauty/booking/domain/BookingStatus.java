package com.flavia.dermobeauty.booking.domain;

/**
 * Domain enum representing the lifecycle status of a booking.
 * Note: BLOCKED status was removed - use the separate Block entity for schedule blocks.
 */
public enum BookingStatus {
    PENDING,    // Initial state, payment not yet completed
    CONFIRMED,  // Payment completed, booking confirmed
    CANCELLED,  // Booking cancelled (by admin or customer)
    COMPLETED   // Service was provided
}

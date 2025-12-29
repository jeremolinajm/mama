package com.flavia.dermobeauty.booking.domain;

/**
 * Domain enum for booking history event types.
 * Used to categorize changes in the audit trail.
 */
public enum HistoryEventType {
    CREATED,           // Booking was created
    STATUS_CHANGED,    // Status changed (PENDING -> CONFIRMED, etc.)
    RESCHEDULED,       // Booking was rescheduled to a new time
    CUSTOMER_UPDATED,  // Customer info was updated (name, whatsapp, comments)
    PAYMENT_UPDATED    // Payment status was updated
}

package com.flavia.dermobeauty.booking.domain;

/**
 * Domain enum for who made a change in booking history.
 */
public enum HistoryActor {
    ADMIN,    // Change made by admin through admin panel
    SYSTEM,   // Change made by system (e.g., payment webhook)
    CUSTOMER  // Change made by customer through public interface
}

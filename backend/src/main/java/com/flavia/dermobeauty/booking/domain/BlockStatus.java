package com.flavia.dermobeauty.booking.domain;

/**
 * Domain enum representing the status of a schedule block.
 */
public enum BlockStatus {
    ACTIVE,     // Block is active and occupies the time slot
    CANCELLED   // Block was cancelled and no longer occupies time
}

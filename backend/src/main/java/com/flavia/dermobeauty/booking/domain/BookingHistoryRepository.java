package com.flavia.dermobeauty.booking.domain;

import java.util.List;

/**
 * Repository port for BookingHistory.
 * Append-only: only save and find operations, no delete.
 */
public interface BookingHistoryRepository {

    /**
     * Saves a history entry (always insert, never update).
     */
    BookingHistory save(BookingHistory history);

    /**
     * Finds all history entries for a booking, ordered by creation time (newest first).
     */
    List<BookingHistory> findByBookingId(Long bookingId);

    /**
     * Finds all history entries for a booking, ordered by creation time (oldest first).
     */
    List<BookingHistory> findByBookingIdOrderByCreatedAtAsc(Long bookingId);
}

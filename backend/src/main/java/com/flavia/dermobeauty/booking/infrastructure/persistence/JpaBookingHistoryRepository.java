package com.flavia.dermobeauty.booking.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for BookingHistoryEntity.
 */
@Repository
public interface JpaBookingHistoryRepository extends JpaRepository<BookingHistoryEntity, Long> {

    /**
     * Find all history entries for a booking, newest first.
     */
    List<BookingHistoryEntity> findByBookingIdOrderByCreatedAtDesc(Long bookingId);

    /**
     * Find all history entries for a booking, oldest first.
     */
    List<BookingHistoryEntity> findByBookingIdOrderByCreatedAtAsc(Long bookingId);
}

package com.flavia.dermobeauty.booking.infrastructure.persistence;

import com.flavia.dermobeauty.booking.domain.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for BookingEntity.
 * Infrastructure implementation detail.
 */
@Repository
public interface JpaBookingRepository extends JpaRepository<BookingEntity, Long> {

    Optional<BookingEntity> findByBookingNumber(String bookingNumber);

    Optional<BookingEntity> findByMercadoPagoPaymentId(String paymentId);

    List<BookingEntity> findByStatus(BookingStatus status);

    List<BookingEntity> findByBookingDateAndStatusNot(LocalDate bookingDate, BookingStatus status);

    // Un turno se solapa si: (StartA < EndB) y (StartB < EndA)
    // NOTA: No filtramos por serviceId porque hay un solo recurso (Flavia) que atiende todos los servicios
    @Query(value = """
           SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END
           FROM bookings b
           WHERE b.booking_date = :date
           AND b.status != 'CANCELLED'
           AND (
               b.booking_time < :endTime
               AND :startTime < (b.booking_time + (b.duration_minutes * interval '1 minute'))
           )
           """, nativeQuery = true)
    boolean existsOverlappingBooking(
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );

    /**
     * Find bookings in date range, excluding cancelled.
     */
    @Query("SELECT b FROM BookingEntity b WHERE b.startAt >= :from AND b.startAt <= :to AND b.status != 'CANCELLED' ORDER BY b.startAt")
    List<BookingEntity> findByDateRangeExcludingCancelled(
            @Param("from") OffsetDateTime from,
            @Param("to") OffsetDateTime to
    );

    /**
     * Find all bookings in date range, including cancelled.
     */
    @Query("SELECT b FROM BookingEntity b WHERE b.startAt >= :from AND b.startAt <= :to ORDER BY b.startAt")
    List<BookingEntity> findByDateRangeAll(
            @Param("from") OffsetDateTime from,
            @Param("to") OffsetDateTime to
    );
}
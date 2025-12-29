package com.flavia.dermobeauty.booking.application.service;

import com.flavia.dermobeauty.booking.domain.BookingHistory;
import com.flavia.dermobeauty.booking.domain.BookingHistoryRepository;
import com.flavia.dermobeauty.booking.domain.HistoryActor;
import com.flavia.dermobeauty.booking.domain.HistoryEventType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

/**
 * Service for recording booking history events.
 * Provides append-only audit trail for all booking changes.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BookingHistoryService {

    private final BookingHistoryRepository historyRepository;

    /**
     * Records a CREATED event when a booking is created.
     */
    public void recordCreated(Long bookingId, String bookingNumber, HistoryActor actor) {
        Map<String, Object> payload = Map.of(
                "bookingNumber", bookingNumber,
                "action", "Turno creado"
        );
        record(bookingId, HistoryEventType.CREATED, payload, actor);
    }

    /**
     * Records a STATUS_CHANGED event.
     */
    public void recordStatusChanged(Long bookingId, String oldStatus, String newStatus, HistoryActor actor) {
        Map<String, Object> payload = Map.of(
                "oldStatus", oldStatus,
                "newStatus", newStatus
        );
        record(bookingId, HistoryEventType.STATUS_CHANGED, payload, actor);
    }

    /**
     * Records a RESCHEDULED event.
     */
    public void recordRescheduled(Long bookingId, OffsetDateTime oldStartAt, OffsetDateTime newStartAt, HistoryActor actor) {
        Map<String, Object> payload = Map.of(
                "oldStartAt", oldStartAt.toString(),
                "newStartAt", newStartAt.toString()
        );
        record(bookingId, HistoryEventType.RESCHEDULED, payload, actor);
    }

    /**
     * Records a CUSTOMER_UPDATED event.
     */
    public void recordCustomerUpdated(Long bookingId, Map<String, Object> changes, HistoryActor actor) {
        record(bookingId, HistoryEventType.CUSTOMER_UPDATED, changes, actor);
    }

    /**
     * Records a PAYMENT_UPDATED event.
     */
    public void recordPaymentUpdated(Long bookingId, String oldPaymentStatus, String newPaymentStatus,
                                     String paymentId, HistoryActor actor) {
        Map<String, Object> payload = Map.of(
                "oldPaymentStatus", oldPaymentStatus,
                "newPaymentStatus", newPaymentStatus,
                "paymentId", paymentId != null ? paymentId : ""
        );
        record(bookingId, HistoryEventType.PAYMENT_UPDATED, payload, actor);
    }

    /**
     * Gets all history entries for a booking, ordered by createdAt ascending.
     */
    public List<BookingHistory> getHistoryForBooking(Long bookingId) {
        return historyRepository.findByBookingIdOrderByCreatedAtAsc(bookingId);
    }

    private void record(Long bookingId, HistoryEventType eventType, Map<String, Object> payload, HistoryActor actor) {
        BookingHistory history = BookingHistory.create(bookingId, eventType, actor, payload);
        historyRepository.save(history);
        log.debug("Recorded {} event for booking {}", eventType, bookingId);
    }
}

package com.flavia.dermobeauty.booking.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.Map;

/**
 * BookingHistory Entity.
 * Represents an audit trail entry for a booking change.
 * This is an append-only entity: records are never modified or deleted.
 */
@Getter
@AllArgsConstructor
@Builder
public class BookingHistory {

    private static final ZoneId ARGENTINA_ZONE = ZoneId.of("America/Argentina/Buenos_Aires");

    private Long id;
    private Long bookingId;
    private HistoryEventType eventType;
    private HistoryActor actor;
    private Map<String, Object> payload;  // JSON payload as Map
    private OffsetDateTime createdAt;

    /**
     * Factory method to create a new history entry.
     */
    public static BookingHistory create(Long bookingId, HistoryEventType eventType, HistoryActor actor, Map<String, Object> payload) {
        if (bookingId == null) {
            throw new IllegalArgumentException("Booking ID cannot be null");
        }
        if (eventType == null) {
            throw new IllegalArgumentException("Event type cannot be null");
        }
        if (actor == null) {
            throw new IllegalArgumentException("Actor cannot be null");
        }

        return BookingHistory.builder()
                .bookingId(bookingId)
                .eventType(eventType)
                .actor(actor)
                .payload(payload)
                .createdAt(OffsetDateTime.now(ARGENTINA_ZONE))
                .build();
    }

    /**
     * Convenience factory for CREATED event.
     */
    public static BookingHistory created(Long bookingId, HistoryActor actor) {
        return create(bookingId, HistoryEventType.CREATED, actor, null);
    }

    /**
     * Convenience factory for STATUS_CHANGED event.
     */
    public static BookingHistory statusChanged(Long bookingId, HistoryActor actor, BookingStatus oldStatus, BookingStatus newStatus) {
        return create(bookingId, HistoryEventType.STATUS_CHANGED, actor, Map.of(
                "old_status", oldStatus.name(),
                "new_status", newStatus.name()
        ));
    }

    /**
     * Convenience factory for RESCHEDULED event.
     */
    public static BookingHistory rescheduled(Long bookingId, HistoryActor actor, OffsetDateTime oldStartAt, OffsetDateTime newStartAt) {
        return create(bookingId, HistoryEventType.RESCHEDULED, actor, Map.of(
                "old_start_at", oldStartAt.toString(),
                "new_start_at", newStartAt.toString()
        ));
    }

    /**
     * Convenience factory for CUSTOMER_UPDATED event.
     */
    public static BookingHistory customerUpdated(Long bookingId, HistoryActor actor, Map<String, Object> changes) {
        return create(bookingId, HistoryEventType.CUSTOMER_UPDATED, actor, changes);
    }

    /**
     * Convenience factory for PAYMENT_UPDATED event.
     */
    public static BookingHistory paymentUpdated(Long bookingId, HistoryActor actor, PaymentStatus oldStatus, PaymentStatus newStatus) {
        return create(bookingId, HistoryEventType.PAYMENT_UPDATED, actor, Map.of(
                "old_payment_status", oldStatus.name(),
                "new_payment_status", newStatus.name()
        ));
    }
}

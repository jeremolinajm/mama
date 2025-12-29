package com.flavia.dermobeauty.booking.infrastructure.mapper;

import com.flavia.dermobeauty.booking.domain.BookingHistory;
import com.flavia.dermobeauty.booking.infrastructure.persistence.BookingHistoryEntity;
import org.springframework.stereotype.Component;

/**
 * Mapper between BookingHistory domain entity and BookingHistoryEntity JPA entity.
 */
@Component
public class BookingHistoryMapper {

    /**
     * Converts a domain BookingHistory to a JPA BookingHistoryEntity.
     */
    public BookingHistoryEntity toEntity(BookingHistory history) {
        if (history == null) {
            return null;
        }

        return BookingHistoryEntity.builder()
                .id(history.getId())
                .bookingId(history.getBookingId())
                .eventType(history.getEventType())
                .actor(history.getActor())
                .payload(history.getPayload())
                .createdAt(history.getCreatedAt())
                .build();
    }

    /**
     * Converts a JPA BookingHistoryEntity to a domain BookingHistory.
     */
    public BookingHistory toDomain(BookingHistoryEntity entity) {
        if (entity == null) {
            return null;
        }

        return BookingHistory.builder()
                .id(entity.getId())
                .bookingId(entity.getBookingId())
                .eventType(entity.getEventType())
                .actor(entity.getActor())
                .payload(entity.getPayload())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}

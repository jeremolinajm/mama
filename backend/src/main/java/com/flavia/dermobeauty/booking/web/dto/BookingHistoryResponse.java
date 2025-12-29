package com.flavia.dermobeauty.booking.web.dto;

import com.flavia.dermobeauty.booking.domain.BookingHistory;
import com.flavia.dermobeauty.booking.domain.HistoryActor;
import com.flavia.dermobeauty.booking.domain.HistoryEventType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.Map;

/**
 * Response DTO for booking history entries.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingHistoryResponse {

    private Long id;
    private Long bookingId;
    private HistoryEventType eventType;
    private Map<String, Object> payload;
    private HistoryActor actor;
    private OffsetDateTime createdAt;

    public static BookingHistoryResponse fromDomain(BookingHistory history) {
        return BookingHistoryResponse.builder()
                .id(history.getId())
                .bookingId(history.getBookingId())
                .eventType(history.getEventType())
                .payload(history.getPayload())
                .actor(history.getActor())
                .createdAt(history.getCreatedAt())
                .build();
    }
}

package com.flavia.dermobeauty.booking.web.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.flavia.dermobeauty.booking.domain.Block;
import com.flavia.dermobeauty.booking.domain.Booking;
import com.flavia.dermobeauty.booking.domain.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * Unified calendar event response.
 * Discriminated union: type determines which fields are present.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CalendarEventResponse {

    public enum EventType {
        BOOKING,
        BLOCK
    }

    private EventType type;
    private Long id;
    private OffsetDateTime startAt;
    private OffsetDateTime endAt;
    private String status;

    // Booking-only fields
    private String bookingNumber;
    private String serviceName;
    private String customerName;
    private PaymentStatus paymentStatus;

    // Block-only fields
    private String blockNumber;
    private String reason;

    /**
     * Create CalendarEventResponse from Booking domain.
     */
    public static CalendarEventResponse fromBooking(Booking booking) {
        return CalendarEventResponse.builder()
                .type(EventType.BOOKING)
                .id(booking.getId())
                .startAt(booking.getStartAt())
                .endAt(booking.getEndAt())
                .status(booking.getStatus().name())
                .bookingNumber(booking.getBookingNumber())
                .serviceName(booking.getServiceName())
                .customerName(booking.getCustomerInfo().getName())
                .paymentStatus(booking.getPaymentStatus())
                .build();
    }

    /**
     * Create CalendarEventResponse from Block domain.
     */
    public static CalendarEventResponse fromBlock(Block block) {
        return CalendarEventResponse.builder()
                .type(EventType.BLOCK)
                .id(block.getId())
                .startAt(block.getStartAt())
                .endAt(block.getEndAt())
                .status(block.getStatus().name())
                .blockNumber(block.getBlockNumber())
                .reason(block.getReason())
                .build();
    }
}

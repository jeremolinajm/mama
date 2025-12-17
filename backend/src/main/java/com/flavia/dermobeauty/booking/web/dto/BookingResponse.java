package com.flavia.dermobeauty.booking.web.dto;

import com.flavia.dermobeauty.booking.domain.Booking;
import com.flavia.dermobeauty.booking.domain.BookingStatus;
import com.flavia.dermobeauty.booking.domain.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * DTO for booking response.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponse {

    private Long id;
    private String bookingNumber;
    private Long serviceId;
    private String customerName;
    private String customerEmail;
    private String customerWhatsapp;
    private String customerComments;
    private LocalDate bookingDate;
    private LocalTime bookingTime;
    private Integer durationMinutes;
    private BookingStatus status;
    private PaymentStatus paymentStatus;
    private String mercadoPagoPreferenceId;
    private BigDecimal amount;
    private LocalDateTime createdAt;
    private LocalDateTime confirmedAt;

    public static BookingResponse fromDomain(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .bookingNumber(booking.getBookingNumber())
                .serviceId(booking.getServiceId())
                .customerName(booking.getCustomerInfo().getName())
                .customerEmail(booking.getCustomerInfo().getEmail())
                .customerWhatsapp(booking.getCustomerInfo().getWhatsapp())
                .customerComments(booking.getCustomerInfo().getComments())
                .bookingDate(booking.getTimeSlot().getDate())
                .bookingTime(booking.getTimeSlot().getTime())
                .durationMinutes(booking.getDurationMinutes())
                .status(booking.getStatus())
                .paymentStatus(booking.getPaymentStatus())
                .mercadoPagoPreferenceId(booking.getMercadoPagoPreferenceId())
                .amount(booking.getAmount())
                .createdAt(booking.getCreatedAt())
                .confirmedAt(booking.getConfirmedAt())
                .build();
    }
}

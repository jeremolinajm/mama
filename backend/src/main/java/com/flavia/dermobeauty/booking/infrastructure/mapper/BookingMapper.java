package com.flavia.dermobeauty.booking.infrastructure.mapper;

import com.flavia.dermobeauty.booking.domain.Booking;
import com.flavia.dermobeauty.booking.domain.CustomerInfo;
import com.flavia.dermobeauty.booking.domain.TimeSlot;
import com.flavia.dermobeauty.booking.infrastructure.persistence.BookingEntity;
import org.springframework.stereotype.Component;

/**
 * Mapper between Booking domain model and BookingEntity JPA entity.
 * Handles conversion in both directions.
 */
@Component
public class BookingMapper {

    /**
     * Convert domain Booking to JPA BookingEntity.
     */
    public BookingEntity toEntity(Booking booking) {
        return BookingEntity.builder()
                .id(booking.getId())
                .bookingNumber(booking.getBookingNumber())
                .serviceId(booking.getServiceId())
                .serviceName(booking.getServiceName())
                .customerName(booking.getCustomerInfo().getName())
                .customerEmail(booking.getCustomerInfo().getEmail())
                .customerWhatsapp(booking.getCustomerInfo().getWhatsapp())
                .customerComments(booking.getCustomerInfo().getComments())
                .bookingDate(booking.getTimeSlot().getDate())
                .bookingTime(booking.getTimeSlot().getTime())
                .startAt(booking.getStartAt())
                .durationMinutes(booking.getDurationMinutes())
                .status(booking.getStatus())
                .paymentStatus(booking.getPaymentStatus())
                .mercadoPagoPreferenceId(booking.getMercadoPagoPreferenceId())
                .mercadoPagoPaymentId(booking.getMercadoPagoPaymentId())
                .amount(booking.getAmount())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .confirmedAt(booking.getConfirmedAt())
                .cancelledAt(booking.getCancelledAt())
                .build();
    }

    /**
     * Convert JPA BookingEntity to domain Booking.
     */
    public Booking toDomain(BookingEntity entity) {
        CustomerInfo customerInfo = new CustomerInfo(
                entity.getCustomerName(),
                entity.getCustomerEmail(),
                entity.getCustomerWhatsapp(),
                entity.getCustomerComments()
        );

        TimeSlot timeSlot = new TimeSlot(
                entity.getBookingDate(),
                entity.getBookingTime()
        );

        return Booking.builder()
                .id(entity.getId())
                .bookingNumber(entity.getBookingNumber())
                .serviceId(entity.getServiceId())
                .serviceName(entity.getServiceName())
                .customerInfo(customerInfo)
                .timeSlot(timeSlot)
                .startAt(entity.getStartAt())
                .durationMinutes(entity.getDurationMinutes())
                .status(entity.getStatus())
                .paymentStatus(entity.getPaymentStatus())
                .mercadoPagoPreferenceId(entity.getMercadoPagoPreferenceId())
                .mercadoPagoPaymentId(entity.getMercadoPagoPaymentId())
                .amount(entity.getAmount())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .confirmedAt(entity.getConfirmedAt())
                .cancelledAt(entity.getCancelledAt())
                .build();
    }
}

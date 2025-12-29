package com.flavia.dermobeauty.booking.domain;

import com.flavia.dermobeauty.shared.exception.DomainException;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;

/**
 * Booking Aggregate Root.
 * Represents a service booking/appointment with business rules enforcement.
 */
@Getter
@AllArgsConstructor
@Builder
public class Booking {

    private static final ZoneId ARGENTINA_ZONE = ZoneId.of("America/Argentina/Buenos_Aires");

    private Long id;
    private String bookingNumber;
    private Long serviceId;
    private String serviceName;  // Snapshot inmutable del nombre del servicio
    private CustomerInfo customerInfo;
    private TimeSlot timeSlot;  // Legacy - kept for compatibility
    private OffsetDateTime startAt;  // New datetime with timezone
    private Integer durationMinutes;
    private BookingStatus status;
    private PaymentStatus paymentStatus;
    private String mercadoPagoPreferenceId;
    private String mercadoPagoPaymentId;
    private BigDecimal amount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime confirmedAt;
    private LocalDateTime cancelledAt;

    /**
     * Computed end time based on startAt + durationMinutes.
     * This is NOT persisted in DB to avoid inconsistencies.
     */
    public OffsetDateTime getEndAt() {
        if (startAt == null || durationMinutes == null) {
            return null;
        }
        return startAt.plusMinutes(durationMinutes);
    }

    /**
     * Checks if this booking occupies time slots (used in collision detection).
     * Only PENDING and CONFIRMED bookings occupy time.
     */
    public boolean occupiesTime() {
        return status == BookingStatus.PENDING || status == BookingStatus.CONFIRMED;
    }

    /**
     * Confirms payment for this booking.
     * Business rule: can only confirm payment once, and only from PENDING status.
     *
     * @param paymentId Mercado Pago payment ID
     */
    public void confirmPayment(String paymentId) {
        if (this.paymentStatus == PaymentStatus.PAID) {
            throw new DomainException("Payment already confirmed for booking " + bookingNumber);
        }

        if (this.status == BookingStatus.CANCELLED) {
            throw new DomainException("Cannot confirm payment for cancelled booking " + bookingNumber);
        }

        if (paymentId == null || paymentId.isBlank()) {
            throw new IllegalArgumentException("Payment ID cannot be empty");
        }

        this.mercadoPagoPaymentId = paymentId;
        this.paymentStatus = PaymentStatus.PAID;
        this.status = BookingStatus.CONFIRMED;
        this.confirmedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Cancels this booking.
     * Business rule: cannot cancel already completed bookings, cannot cancel twice.
     */
    public void cancel() {
        if (this.status == BookingStatus.CANCELLED) {
            throw new DomainException("Booking " + bookingNumber + " is already cancelled");
        }

        if (this.status == BookingStatus.COMPLETED) {
            throw new DomainException("Cannot cancel completed booking " + bookingNumber);
        }

        this.status = BookingStatus.CANCELLED;
        this.cancelledAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Marks booking as completed (service was provided).
     * Business rule: can only complete confirmed bookings.
     */
    public void complete() {
        if (this.status != BookingStatus.CONFIRMED) {
            throw new DomainException("Can only complete confirmed bookings. Current status: " + status);
        }

        this.status = BookingStatus.COMPLETED;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Validates that the booking slot is available (business rule).
     *
     * @return true if slot is valid for booking
     */
    public boolean isSlotAvailable() {
        return timeSlot.isFuture() && status != BookingStatus.CANCELLED;
    }

    /**
     * Checks if this booking can be cancelled.
     */
    public boolean isCancellable() {
        return status != BookingStatus.CANCELLED && status != BookingStatus.COMPLETED;
    }

    /**
     * Reschedules this booking to a new date and time.
     * Business rule: cannot reschedule cancelled or completed bookings.
     *
     * @param newTimeSlot the new time slot (legacy)
     */
    public void reschedule(TimeSlot newTimeSlot) {
        if (this.status == BookingStatus.CANCELLED) {
            throw new DomainException("Cannot reschedule cancelled booking " + bookingNumber);
        }

        if (this.status == BookingStatus.COMPLETED) {
            throw new DomainException("Cannot reschedule completed booking " + bookingNumber);
        }

        if (newTimeSlot == null) {
            throw new IllegalArgumentException("New time slot cannot be null");
        }

        this.timeSlot = newTimeSlot;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Reschedules this booking to a new start time.
     * Business rule: cannot reschedule cancelled or completed bookings.
     * Start time must be aligned to 30-minute intervals.
     *
     * @param newStartAt the new start time
     */
    public void reschedule(OffsetDateTime newStartAt) {
        if (this.status == BookingStatus.CANCELLED) {
            throw new DomainException("Cannot reschedule cancelled booking " + bookingNumber);
        }

        if (this.status == BookingStatus.COMPLETED) {
            throw new DomainException("Cannot reschedule completed booking " + bookingNumber);
        }

        if (newStartAt == null) {
            throw new IllegalArgumentException("New start time cannot be null");
        }

        int minute = newStartAt.getMinute();
        if (minute != 0 && minute != 30) {
            throw new DomainException("Start time must be aligned to 30-minute intervals (:00 or :30)");
        }

        this.startAt = newStartAt;
        // Also update legacy timeSlot for compatibility
        if (this.timeSlot != null) {
            this.timeSlot = new TimeSlot(
                    newStartAt.toLocalDate(),
                    newStartAt.toLocalTime()
            );
        }
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Updates customer information.
     */
    public void updateCustomer(CustomerInfo newCustomerInfo) {
        if (newCustomerInfo == null) {
            throw new IllegalArgumentException("Customer info cannot be null");
        }
        this.customerInfo = newCustomerInfo;
        this.updatedAt = LocalDateTime.now();
    }
}

package com.flavia.dermobeauty.booking.domain;

import com.flavia.dermobeauty.shared.exception.DomainException;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Booking Aggregate Root.
 * Represents a service booking/appointment with business rules enforcement.
 */
@Getter
@AllArgsConstructor
@Builder
public class Booking {

    private Long id;
    private String bookingNumber;
    private Long serviceId;
    private CustomerInfo customerInfo;
    private TimeSlot timeSlot;
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
     * @param newDate the new booking date
     * @param newTime the new booking time
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
}

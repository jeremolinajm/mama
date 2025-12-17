package com.flavia.dermobeauty.booking.domain;

import lombok.Value;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Value Object representing a specific date and time slot for a booking.
 * Immutable to ensure consistency.
 */
@Value
public class TimeSlot {
    LocalDate date;
    LocalTime time;

    public TimeSlot(LocalDate date, LocalTime time) {
        if (date == null) {
            throw new IllegalArgumentException("Date cannot be null");
        }
        if (time == null) {
            throw new IllegalArgumentException("Time cannot be null");
        }
        if (date.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Cannot book appointments in the past");
        }

        this.date = date;
        this.time = time;
    }

    public LocalDateTime toDateTime() {
        return LocalDateTime.of(date, time);
    }

    public boolean isFuture() {
        return toDateTime().isAfter(LocalDateTime.now());
    }
}

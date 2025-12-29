package com.flavia.dermobeauty.booking.web.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * Request DTO for rescheduling a booking.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RescheduleBookingRequest {

    @NotNull(message = "La nueva hora de inicio es requerida")
    private OffsetDateTime newStartAt;
}

package com.flavia.dermobeauty.booking.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * Request DTO for creating a block.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateBlockRequest {

    @NotNull(message = "La hora de inicio es requerida")
    private OffsetDateTime startAt;

    @NotNull(message = "La hora de fin es requerida")
    private OffsetDateTime endAt;

    @NotBlank(message = "El motivo del bloqueo es requerido")
    private String reason;
}

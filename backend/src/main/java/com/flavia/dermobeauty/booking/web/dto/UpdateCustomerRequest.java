package com.flavia.dermobeauty.booking.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating customer information on a booking.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCustomerRequest {

    @NotBlank(message = "El nombre del cliente es requerido")
    private String name;

    @NotBlank(message = "El email es requerido")
    @Email(message = "El email no tiene un formato válido")
    private String email;

    @NotBlank(message = "El WhatsApp es requerido")
    private String whatsapp;

    private String comments;
}

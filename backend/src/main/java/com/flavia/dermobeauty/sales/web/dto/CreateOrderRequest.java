package com.flavia.dermobeauty.sales.web.dto;

import com.flavia.dermobeauty.sales.domain.DeliveryType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for creating a new order request.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {

    @NotBlank(message = "Customer name is required")
    private String customerName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String customerEmail;

    @NotBlank(message = "WhatsApp number is required")
    private String customerWhatsapp;

    @NotNull(message = "Delivery type is required")
    private DeliveryType deliveryType;

    private String deliveryAddress;
    private String deliveryCity;
    private String deliveryPostalCode;
    private String deliveryProvince;
    private String deliveryNotes;

    @NotEmpty(message = "Order must have at least one item")
    @Valid
    private List<OrderItemRequest> items;
}

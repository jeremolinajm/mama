package com.flavia.dermobeauty.sales.domain;

import lombok.Value;

/**
 * Value Object representing customer information for an order.
 * Immutable to ensure consistency.
 */
@Value
public class CustomerInfo {
    String name;
    String email;
    String whatsapp;

    public CustomerInfo(String name, String email, String whatsapp) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Customer name cannot be empty");
        }
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Customer email cannot be empty");
        }
        if (whatsapp == null || whatsapp.isBlank()) {
            throw new IllegalArgumentException("Customer whatsapp cannot be empty");
        }

        this.name = name;
        this.email = email;
        this.whatsapp = whatsapp;
    }
}

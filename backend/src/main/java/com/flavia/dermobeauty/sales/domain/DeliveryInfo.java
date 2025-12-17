package com.flavia.dermobeauty.sales.domain;

import lombok.Value;

/**
 * Value Object representing delivery information for an order.
 * Immutable to ensure consistency.
 */
@Value
public class DeliveryInfo {
    DeliveryType deliveryType;
    String address;
    String city;
    String postalCode;
    String province;
    String notes;

    public DeliveryInfo(DeliveryType deliveryType, String address, String city,
                        String postalCode, String province, String notes) {
        if (deliveryType == null) {
            throw new IllegalArgumentException("Delivery type cannot be null");
        }

        if (deliveryType == DeliveryType.HOME_DELIVERY) {
            if (address == null || address.isBlank()) {
                throw new IllegalArgumentException("Address is required for home delivery");
            }
            if (city == null || city.isBlank()) {
                throw new IllegalArgumentException("City is required for home delivery");
            }
        }

        this.deliveryType = deliveryType;
        this.address = address;
        this.city = city;
        this.postalCode = postalCode;
        this.province = province;
        this.notes = notes;
    }

    public boolean isHomeDelivery() {
        return deliveryType == DeliveryType.HOME_DELIVERY;
    }
}

package com.flavia.dermobeauty.sales.infrastructure.persistence;

import com.flavia.dermobeauty.booking.domain.PaymentStatus;
import com.flavia.dermobeauty.sales.domain.DeliveryType;
import com.flavia.dermobeauty.sales.domain.OrderStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * JPA entity for orders table.
 * Infrastructure layer representation of Order aggregate.
 */
@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class OrderEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name = "order_number", nullable = false, unique = true, length = 50)
    private String orderNumber;

    // Customer information
    @Column(name = "customer_name", nullable = false, length = 200)
    private String customerName;

    @Column(name = "customer_email", nullable = false, length = 200)
    private String customerEmail;

    @Column(name = "customer_whatsapp", nullable = false, length = 50)
    private String customerWhatsapp;

    // Delivery information
    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_type", nullable = false, length = 20)
    private DeliveryType deliveryType;

    @Column(name = "delivery_address_street", length = 300)
    private String deliveryAddress;

    @Column(name = "delivery_address_city", length = 100)
    private String deliveryCity;

    @Column(name = "delivery_address_postal_code", length = 20)
    private String deliveryPostalCode;

    @Column(name = "delivery_address_state", length = 100)
    private String deliveryProvince;

    @Column(name = "delivery_notes", columnDefinition = "TEXT")
    private String deliveryNotes;

    // Order items (OneToMany relationship)
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @ToString.Exclude
    private List<OrderItemEntity> items = new ArrayList<>();

    // Pricing
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "delivery_cost", nullable = false, precision = 10, scale = 2)
    private BigDecimal deliveryCost;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    // Status tracking
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status;

    // Payment information
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    private PaymentStatus paymentStatus;

    @Column(name = "mercadopago_preference_id", length = 200)
    private String mercadoPagoPreferenceId;

    @Column(name = "mercadopago_payment_id", length = 200)
    private String mercadoPagoPaymentId;

    // Timestamps
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Helper method to add item and maintain bidirectional relationship.
     */
    public void addItem(OrderItemEntity item) {
        items.add(item);
        item.setOrder(this);
    }
}

package com.flavia.dermobeauty.payment.controller;

import com.flavia.dermobeauty.booking.domain.Booking;
import com.flavia.dermobeauty.booking.domain.BookingRepository;
import com.flavia.dermobeauty.payment.dto.PaymentPreferenceResponse;
import com.flavia.dermobeauty.payment.service.MercadoPagoClient;
import com.flavia.dermobeauty.sales.domain.Order;
import com.flavia.dermobeauty.sales.domain.OrderRepository;
import com.flavia.dermobeauty.shared.exception.ResourceNotFoundException;
import com.flavia.dermobeauty.shared.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for payment preference creation.
 * Public endpoints to initiate payment for bookings and orders.
 */
@Slf4j
@RestController
@RequestMapping("/api/public/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final MercadoPagoClient mercadoPagoClient;
    private final BookingRepository bookingRepository;
    private final OrderRepository orderRepository;

    @PostMapping("/bookings/{bookingId}/preference")
    public ResponseEntity<ApiResponse<PaymentPreferenceResponse>> createBookingPreference(
            @PathVariable Long bookingId) {

        log.info("Creating payment preference for booking: {}", bookingId);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", bookingId));

        String preferenceId = mercadoPagoClient.createPreferenceForBooking(booking);

        // Update booking with preference ID
        Booking updatedBooking = Booking.builder()
                .id(booking.getId())
                .bookingNumber(booking.getBookingNumber())
                .serviceId(booking.getServiceId())
                .customerInfo(booking.getCustomerInfo())
                .timeSlot(booking.getTimeSlot())
                .durationMinutes(booking.getDurationMinutes())
                .status(booking.getStatus())
                .paymentStatus(booking.getPaymentStatus())
                .mercadoPagoPreferenceId(preferenceId)
                .mercadoPagoPaymentId(booking.getMercadoPagoPaymentId())
                .amount(booking.getAmount())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .confirmedAt(booking.getConfirmedAt())
                .cancelledAt(booking.getCancelledAt())
                .build();

        bookingRepository.save(updatedBooking);

        PaymentPreferenceResponse response = new PaymentPreferenceResponse(
                preferenceId,
                "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=" + preferenceId
        );

        return ResponseEntity.ok(ApiResponse.success(response, "Payment preference created"));
    }

    @PostMapping("/orders/{orderId}/preference")
    public ResponseEntity<ApiResponse<PaymentPreferenceResponse>> createOrderPreference(
            @PathVariable Long orderId) {

        log.info("Creating payment preference for order: {}", orderId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        String preferenceId = mercadoPagoClient.createPreferenceForOrder(order);

        // Update order with preference ID
        Order updatedOrder = Order.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .customerInfo(order.getCustomerInfo())
                .deliveryInfo(order.getDeliveryInfo())
                .items(order.getItems())
                .subtotal(order.getSubtotal())
                .deliveryCost(order.getDeliveryCost())
                .total(order.getTotal())
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .mercadoPagoPreferenceId(preferenceId)
                .mercadoPagoPaymentId(order.getMercadoPagoPaymentId())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();

        orderRepository.save(updatedOrder);

        PaymentPreferenceResponse response = new PaymentPreferenceResponse(
                preferenceId,
                "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=" + preferenceId
        );

        return ResponseEntity.ok(ApiResponse.success(response, "Payment preference created"));
    }
}

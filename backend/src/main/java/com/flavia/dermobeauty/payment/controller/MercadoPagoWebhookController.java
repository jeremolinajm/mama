package com.flavia.dermobeauty.payment.controller;

import com.flavia.dermobeauty.booking.application.usecase.ConfirmBookingPaymentUseCase;
import com.flavia.dermobeauty.booking.domain.Booking;
import com.flavia.dermobeauty.booking.domain.BookingRepository;
import com.flavia.dermobeauty.sales.application.usecase.ConfirmOrderPaymentUseCase;
import com.flavia.dermobeauty.sales.domain.Order;
import com.flavia.dermobeauty.sales.domain.OrderRepository;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.payment.Payment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Controller for Mercado Pago webhook notifications.
 * Handles payment status updates from Mercado Pago.
 *
 * SECURITY MEASURES IMPLEMENTED:
 * 1. Never trusts webhook payload directly
 * 2. Always verifies payment status via Mercado Pago API
 * 3. Validates payment amount matches booking/order
 * 4. Prevents duplicate payment processing (idempotency)
 * 5. Structured logging for security audit trail
 * 6. Validates external reference format
 *
 * CRITICAL: This endpoint must be publicly accessible (no authentication).
 * Mercado Pago sends IPN notifications here when payment status changes.
 */
@Slf4j
@RestController
@RequestMapping("/api/mp")
@RequiredArgsConstructor
public class MercadoPagoWebhookController {

    private final BookingRepository bookingRepository;
    private final OrderRepository orderRepository;
    private final ConfirmBookingPaymentUseCase confirmBookingPaymentUseCase;
    private final ConfirmOrderPaymentUseCase confirmOrderPaymentUseCase;
    private final PaymentClient paymentClient = new PaymentClient();

    @PostMapping("/webhook")
    public ResponseEntity<Void> handleWebhook(@RequestBody Map<String, Object> payload) {
        Long paymentId = null;
        String externalReference = null;

        try {
            // SECURITY: Log raw webhook received (audit trail)
            log.info("[WEBHOOK-RECEIVED] Payload type: {}, data: {}",
                    payload.get("type"),
                    payload.get("data"));

            // Step 1: Validate webhook payload structure
            String type = (String) payload.get("type");
            if (!"payment".equals(type)) {
                log.debug("[WEBHOOK-IGNORED] Non-payment notification type: {}", type);
                return ResponseEntity.ok().build();
            }

            Map<String, Object> data = (Map<String, Object>) payload.get("data");
            if (data == null) {
                log.warn("[WEBHOOK-REJECTED] Webhook data is null");
                return ResponseEntity.ok().build();
            }

            String paymentIdStr = (String) data.get("id");
            if (paymentIdStr == null) {
                log.warn("[WEBHOOK-REJECTED] Payment ID is null in webhook data");
                return ResponseEntity.ok().build();
            }

            // Step 2: Extract payment ID from webhook
            try {
                paymentId = Long.parseLong(paymentIdStr);
            } catch (NumberFormatException e) {
                log.error("[WEBHOOK-REJECTED] Invalid payment ID format: {}", paymentIdStr);
                return ResponseEntity.ok().build();
            }

            log.info("[WEBHOOK-PROCESSING] Payment ID: {}", paymentId);

            // CRITICAL SECURITY STEP 3: Verify payment directly with Mercado Pago API
            // NEVER trust the webhook payload alone - always verify with the source
            Payment payment;
            try {
                payment = paymentClient.get(paymentId);
                log.info("[MP-API-VERIFIED] Payment ID: {}, Status: {}, Amount: {}, External Ref: {}",
                        paymentId,
                        payment.getStatus(),
                        payment.getTransactionAmount(),
                        payment.getExternalReference());
            } catch (MPException | MPApiException e) {
                log.error("[MP-API-ERROR] Failed to verify payment {}: {}", paymentId, e.getMessage(), e);
                throw e;
            }

            // SECURITY VALIDATION 1: Only process approved payments
            if (!"approved".equals(payment.getStatus())) {
                log.warn("[PAYMENT-NOT-APPROVED] Payment {} has status '{}', expected 'approved'. Skipping.",
                        paymentId, payment.getStatus());
                return ResponseEntity.ok().build();
            }

            // SECURITY VALIDATION 2: Validate external reference exists and format
            externalReference = payment.getExternalReference();
            if (externalReference == null || externalReference.isBlank()) {
                log.error("[SECURITY-VIOLATION] Payment {} has no external reference", paymentId);
                return ResponseEntity.ok().build();
            }

            if (!externalReference.matches("^(BOOKING|ORDER)-[A-Z0-9]+$")) {
                log.error("[SECURITY-VIOLATION] Invalid external reference format: {}", externalReference);
                return ResponseEntity.ok().build();
            }

            // Step 4: Route to appropriate payment confirmation handler
            if (externalReference.startsWith("BOOKING-")) {
                confirmBookingPayment(payment, externalReference, String.valueOf(paymentId));
            } else if (externalReference.startsWith("ORDER-")) {
                confirmOrderPayment(payment, externalReference, String.valueOf(paymentId));
            } else {
                log.error("[SECURITY-VIOLATION] Unknown external reference prefix: {}", externalReference);
            }

            log.info("[WEBHOOK-SUCCESS] Payment {} processed successfully", paymentId);
            return ResponseEntity.ok().build();

        } catch (MPApiException e) {
            log.error("[MP-API-ERROR] Payment: {}, Ref: {}, Status: {}, Message: {}",
                    paymentId, externalReference, e.getStatusCode(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.OK).build(); // Always return 200 to MP
        } catch (MPException e) {
            log.error("[MP-ERROR] Payment: {}, Ref: {}, Message: {}",
                    paymentId, externalReference, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.OK).build();
        } catch (Exception e) {
            log.error("[WEBHOOK-ERROR] Payment: {}, Ref: {}, Unexpected error",
                    paymentId, externalReference, e);
            return ResponseEntity.status(HttpStatus.OK).build(); // Always return 200 to MP
        }
    }

    private void confirmBookingPayment(Payment payment, String externalReference, String paymentId) {
        String bookingNumber = null;
        try {
            bookingNumber = externalReference.replace("BOOKING-", "");
            log.info("[BOOKING-CONFIRMATION-START] Booking: {}, Payment: {}", bookingNumber, paymentId);

            // Create final variable for lambda expression
            final String finalBookingNumber = bookingNumber;

            // Find booking
            Booking booking = bookingRepository.findByBookingNumber(bookingNumber)
                    .orElseThrow(() -> {
                        log.error("[SECURITY-VIOLATION] Booking not found: {}", finalBookingNumber);
                        return new RuntimeException("Booking not found: " + finalBookingNumber);
                    });

            // SECURITY VALIDATION 3: Idempotency - Check if payment already processed
            if (booking.getMercadoPagoPaymentId() != null &&
                    booking.getMercadoPagoPaymentId().equals(paymentId)) {
                log.warn("[DUPLICATE-PAYMENT] Booking {} already has payment {} processed. Ignoring duplicate notification.",
                        bookingNumber, paymentId);
                return;
            }

            // SECURITY VALIDATION 4: Prevent different payment ID for same booking
            if (booking.getMercadoPagoPaymentId() != null &&
                    !booking.getMercadoPagoPaymentId().equals(paymentId)) {
                log.error("[SECURITY-VIOLATION] Booking {} already has different payment ID: {}. Rejecting new payment: {}",
                        bookingNumber, booking.getMercadoPagoPaymentId(), paymentId);
                throw new RuntimeException("Booking already has a different payment ID");
            }

            // SECURITY VALIDATION 5: Verify payment amount matches booking amount
            BigDecimal paymentAmount = payment.getTransactionAmount();
            BigDecimal bookingAmount = booking.getAmount();

            if (paymentAmount == null || paymentAmount.compareTo(bookingAmount) != 0) {
                log.error("[SECURITY-VIOLATION] Amount mismatch! Booking {}: expected {}, got {}",
                        bookingNumber, bookingAmount, paymentAmount);
                throw new RuntimeException("Payment amount does not match booking amount");
            }

            log.info("[AMOUNT-VERIFIED] Booking {}: {} ARS", bookingNumber, paymentAmount);

            // Update booking with payment ID
            Booking updatedBooking = Booking.builder()
                    .id(booking.getId())
                    .bookingNumber(booking.getBookingNumber())
                    .serviceId(booking.getServiceId())
                    .customerInfo(booking.getCustomerInfo())
                    .timeSlot(booking.getTimeSlot())
                    .durationMinutes(booking.getDurationMinutes())
                    .status(booking.getStatus())
                    .paymentStatus(booking.getPaymentStatus())
                    .mercadoPagoPreferenceId(booking.getMercadoPagoPreferenceId())
                    .mercadoPagoPaymentId(paymentId)
                    .amount(booking.getAmount())
                    .createdAt(booking.getCreatedAt())
                    .updatedAt(booking.getUpdatedAt())
                    .confirmedAt(booking.getConfirmedAt())
                    .cancelledAt(booking.getCancelledAt())
                    .build();

            bookingRepository.save(updatedBooking);
            log.info("[BOOKING-UPDATED] Booking {} updated with payment ID {}", bookingNumber, paymentId);

            // Confirm payment via use case (sends confirmation email, updates status)
            confirmBookingPaymentUseCase.execute(paymentId);
            log.info("[BOOKING-CONFIRMATION-SUCCESS] Booking {} payment confirmed successfully", bookingNumber);

        } catch (Exception e) {
            log.error("[BOOKING-CONFIRMATION-FAILED] Booking: {}, Payment: {}, Error: {}",
                    bookingNumber, paymentId, e.getMessage(), e);
            throw new RuntimeException("Error confirming booking payment", e);
        }
    }

    private void confirmOrderPayment(Payment payment, String externalReference, String paymentId) {
        String orderNumber = null;
        try {
            orderNumber = externalReference.replace("ORDER-", "");
            log.info("[ORDER-CONFIRMATION-START] Order: {}, Payment: {}", orderNumber, paymentId);

            // Create final variable for lambda expression
            final String finalOrderNumber = orderNumber;

            // Find order
            Order order = orderRepository.findByOrderNumber(orderNumber)
                    .orElseThrow(() -> {
                        log.error("[SECURITY-VIOLATION] Order not found: {}", finalOrderNumber);
                        return new RuntimeException("Order not found: " + finalOrderNumber);
                    });

            // SECURITY VALIDATION 3: Idempotency - Check if payment already processed
            if (order.getMercadoPagoPaymentId() != null &&
                    order.getMercadoPagoPaymentId().equals(paymentId)) {
                log.warn("[DUPLICATE-PAYMENT] Order {} already has payment {} processed. Ignoring duplicate notification.",
                        orderNumber, paymentId);
                return;
            }

            // SECURITY VALIDATION 4: Prevent different payment ID for same order
            if (order.getMercadoPagoPaymentId() != null &&
                    !order.getMercadoPagoPaymentId().equals(paymentId)) {
                log.error("[SECURITY-VIOLATION] Order {} already has different payment ID: {}. Rejecting new payment: {}",
                        orderNumber, order.getMercadoPagoPaymentId(), paymentId);
                throw new RuntimeException("Order already has a different payment ID");
            }

            // SECURITY VALIDATION 5: Verify payment amount matches order total
            BigDecimal paymentAmount = payment.getTransactionAmount();
            BigDecimal orderTotal = order.getTotal();

            if (paymentAmount == null || paymentAmount.compareTo(orderTotal) != 0) {
                log.error("[SECURITY-VIOLATION] Amount mismatch! Order {}: expected {}, got {}",
                        orderNumber, orderTotal, paymentAmount);
                throw new RuntimeException("Payment amount does not match order total");
            }

            log.info("[AMOUNT-VERIFIED] Order {}: {} ARS", orderNumber, paymentAmount);

            // Update order with payment ID
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
                    .mercadoPagoPreferenceId(order.getMercadoPagoPreferenceId())
                    .mercadoPagoPaymentId(paymentId)
                    .createdAt(order.getCreatedAt())
                    .updatedAt(order.getUpdatedAt())
                    .build();

            orderRepository.save(updatedOrder);
            log.info("[ORDER-UPDATED] Order {} updated with payment ID {}", orderNumber, paymentId);

            // Confirm payment via use case (decrements stock, sends email)
            confirmOrderPaymentUseCase.execute(paymentId);
            log.info("[ORDER-CONFIRMATION-SUCCESS] Order {} payment confirmed successfully", orderNumber);

        } catch (Exception e) {
            log.error("[ORDER-CONFIRMATION-FAILED] Order: {}, Payment: {}, Error: {}",
                    orderNumber, paymentId, e.getMessage(), e);
            throw new RuntimeException("Error confirming order payment", e);
        }
    }
}

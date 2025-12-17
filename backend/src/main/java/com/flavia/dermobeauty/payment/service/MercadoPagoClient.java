package com.flavia.dermobeauty.payment.service;

import com.flavia.dermobeauty.booking.domain.Booking;
import com.flavia.dermobeauty.sales.domain.Order;
import com.flavia.dermobeauty.shared.exception.PaymentException;
import com.mercadopago.client.common.IdentificationRequest;
import com.mercadopago.client.preference.*;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.preference.Preference;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Client for Mercado Pago API operations.
 * Creates payment preferences for bookings and orders.
 */
@Slf4j
@Service
public class MercadoPagoClient {

    private final String baseUrl;
    private final String apiUrl;
    private final PreferenceClient preferenceClient;

    public MercadoPagoClient(
            @Value("${mercadopago.base-url}") String baseUrl,
            @Value("${app.api-url}") String apiUrl) {
        this.baseUrl = baseUrl;
        this.apiUrl = apiUrl;
        this.preferenceClient = new PreferenceClient();
        log.info("MercadoPagoClient initialized with base URL: {}", baseUrl);
    }

    /**
     * Create payment preference for a booking.
     *
     * @param booking The booking to create payment for
     * @return Preference ID
     */
    public String createPreferenceForBooking(Booking booking) {
        try {
            log.info("Creating MP preference for booking: {}", booking.getBookingNumber());

            PreferenceItemRequest item = PreferenceItemRequest.builder()
                    .title("Reserva de Servicio - " + booking.getBookingNumber())
                    .description("Servicio profesional de dermocosmiatría")
                    .quantity(1)
                    .currencyId("ARS")
                    .unitPrice(booking.getAmount())
                    .build();

            PreferencePayerRequest payer = PreferencePayerRequest.builder()
                    .name(booking.getCustomerInfo().getName())
                    .email(booking.getCustomerInfo().getEmail())
                    .build();

            PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                    .success(baseUrl + "/reserva/exitosa")
                    .failure(baseUrl + "/reserva/fallida")
                    .pending(baseUrl + "/reserva/pendiente")
                    .build();

            PreferenceRequest request = PreferenceRequest.builder()
                    .items(List.of(item))
                    .payer(payer)
                    .backUrls(backUrls)
                    .autoReturn("approved")
                    .externalReference("BOOKING-" + booking.getBookingNumber())
                    .notificationUrl(baseUrl + "/api/mp/webhook")
                    .statementDescriptor("Flavia Dermobeauty")
                    .build();

            Preference preference = preferenceClient.create(request);
            log.info("Created MP preference for booking {}: {}", booking.getBookingNumber(), preference.getId());

            return preference.getId();

        } catch (MPApiException e) {
            log.error("MP API error creating preference for booking {}: {} - {}",
                    booking.getBookingNumber(), e.getStatusCode(), e.getMessage());
            throw new PaymentException("Error creating payment preference: " + e.getMessage(), e);
        } catch (MPException e) {
            log.error("MP error creating preference for booking {}: {}",
                    booking.getBookingNumber(), e.getMessage());
            throw new PaymentException("Error creating payment preference: " + e.getMessage(), e);
        }
    }

    /**
     * Create payment preference for an order.
     *
     * @param order The order to create payment for
     * @return Preference ID
     */
    public String createPreferenceForOrder(Order order) {
        try {
            log.info("Creating MP preference for order: {}", order.getOrderNumber());

            List<PreferenceItemRequest> items = new ArrayList<>();

            // Add product items
            order.getItems().forEach(orderItem -> {
                PreferenceItemRequest item = PreferenceItemRequest.builder()
                        .title(orderItem.getProductName())
                        .quantity(orderItem.getQuantity())
                        .currencyId("ARS")
                        .unitPrice(orderItem.getProductPrice())
                        .build();
                items.add(item);
            });

            // Add delivery cost as separate item if applicable
            if (order.getDeliveryCost().compareTo(BigDecimal.ZERO) > 0) {
                PreferenceItemRequest deliveryItem = PreferenceItemRequest.builder()
                        .title("Envío a domicilio")
                        .quantity(1)
                        .currencyId("ARS")
                        .unitPrice(order.getDeliveryCost())
                        .build();
                items.add(deliveryItem);
            }

            PreferencePayerRequest payer = PreferencePayerRequest.builder()
                    .name(order.getCustomerInfo().getName())
                    .email(order.getCustomerInfo().getEmail())
                    .build();

            PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                    .success(baseUrl + "/pedido/exitoso")
                    .failure(baseUrl + "/pedido/fallido")
                    .pending(baseUrl + "/pedido/pendiente")
                    .build();

            PreferenceRequest request = PreferenceRequest.builder()
                    .items(items)
                    .payer(payer)
                    .backUrls(backUrls)
                    .autoReturn("approved")
                    .externalReference("ORDER-" + order.getOrderNumber())
                    .notificationUrl(baseUrl + "/api/mp/webhook")
                    .statementDescriptor("Flavia Dermobeauty")
                    .build();

            Preference preference = preferenceClient.create(request);
            log.info("Created MP preference for order {}: {}", order.getOrderNumber(), preference.getId());

            return preference.getId();

        } catch (MPApiException e) {
            log.error("MP API error creating preference for order {}: {} - {}",
                    order.getOrderNumber(), e.getStatusCode(), e.getMessage());
            throw new PaymentException("Error creating payment preference: " + e.getMessage(), e);
        } catch (MPException e) {
            log.error("MP error creating preference for order {}: {}",
                    order.getOrderNumber(), e.getMessage());
            throw new PaymentException("Error creating payment preference: " + e.getMessage(), e);
        }
    }
}

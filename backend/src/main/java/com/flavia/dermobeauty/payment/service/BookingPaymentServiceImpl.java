package com.flavia.dermobeauty.payment.service;

import com.flavia.dermobeauty.booking.application.port.PaymentService;
import com.flavia.dermobeauty.booking.domain.Booking;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Implementation of PaymentService for booking module.
 * Delegates to MercadoPagoClient for preference creation.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BookingPaymentServiceImpl implements PaymentService {

    private final MercadoPagoClient mercadoPagoClient;

    @Override
    public String createBookingPreference(Booking booking) {
        return mercadoPagoClient.createPreferenceForBooking(booking);
    }
}

package com.flavia.dermobeauty.payment.service;

import com.flavia.dermobeauty.sales.application.port.PaymentService;
import com.flavia.dermobeauty.sales.domain.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Implementation of PaymentService for sales module.
 * Delegates to MercadoPagoClient for preference creation.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderPaymentServiceImpl implements PaymentService {

    private final MercadoPagoClient mercadoPagoClient;

    @Override
    public String createOrderPreference(Order order) {
        return mercadoPagoClient.createPreferenceForOrder(order);
    }
}

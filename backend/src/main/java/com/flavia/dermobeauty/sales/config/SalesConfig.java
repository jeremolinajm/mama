package com.flavia.dermobeauty.sales.config;

import com.flavia.dermobeauty.catalog.repository.ProductRepository;
import com.flavia.dermobeauty.sales.application.port.DeliveryCostCalculator;
import com.flavia.dermobeauty.sales.application.port.NotificationService;
import com.flavia.dermobeauty.sales.application.port.StockService;
import com.flavia.dermobeauty.sales.application.usecase.*;
import com.flavia.dermobeauty.sales.domain.OrderRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class for Sales module.
 * Wires use cases as Spring beans for dependency injection.
 */
@Configuration
public class SalesConfig {

    @Bean
    public CreateOrderUseCase createOrderUseCase(
            OrderRepository orderRepository,
            ProductRepository productRepository,
            StockService stockService,
            DeliveryCostCalculator deliveryCostCalculator) {
        return new CreateOrderUseCase(orderRepository, productRepository, stockService, deliveryCostCalculator);
    }

    @Bean
    public ConfirmOrderPaymentUseCase confirmOrderPaymentUseCase(
            OrderRepository orderRepository,
            StockService stockService,
            @Qualifier("orderNotificationService") NotificationService notificationService) {
        return new ConfirmOrderPaymentUseCase(orderRepository, stockService, notificationService);
    }

    @Bean
    public UpdateOrderStatusUseCase updateOrderStatusUseCase(OrderRepository orderRepository) {
        return new UpdateOrderStatusUseCase(orderRepository);
    }

    @Bean
    public ListOrdersUseCase listOrdersUseCase(OrderRepository orderRepository) {
        return new ListOrdersUseCase(orderRepository);
    }

    @Bean
    public GetOrderByNumberUseCase getOrderByNumberUseCase(OrderRepository orderRepository) {
        return new GetOrderByNumberUseCase(orderRepository);
    }
}

package com.flavia.dermobeauty.sales.web;

import com.flavia.dermobeauty.sales.application.usecase.CreateOrderUseCase;
import com.flavia.dermobeauty.sales.application.usecase.GetOrderByNumberUseCase;
import com.flavia.dermobeauty.sales.domain.Order;
import com.flavia.dermobeauty.sales.web.dto.CreateOrderRequest;
import com.flavia.dermobeauty.sales.web.dto.OrderItemRequest;
import com.flavia.dermobeauty.sales.web.dto.OrderResponse;
import com.flavia.dermobeauty.shared.web.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST controller for order operations.
 * Public endpoints for customers to create and check orders.
 */
@Slf4j
@RestController
@RequestMapping("/api/public/orders")
@RequiredArgsConstructor
public class OrderController {

    private final CreateOrderUseCase createOrderUseCase;
    private final GetOrderByNumberUseCase getOrderByNumberUseCase;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @Valid @RequestBody CreateOrderRequest request) {

        log.info("Creating order for customer: {}", request.getCustomerEmail());

        List<CreateOrderUseCase.OrderItemRequest> itemRequests = request.getItems().stream()
                .map(item -> new CreateOrderUseCase.OrderItemRequest(item.getProductId(), item.getQuantity()))
                .collect(Collectors.toList());

        Order order = createOrderUseCase.execute(
                request.getCustomerName(),
                request.getCustomerEmail(),
                request.getCustomerWhatsapp(),
                request.getDeliveryType(),
                request.getDeliveryAddress(),
                request.getDeliveryCity(),
                request.getDeliveryPostalCode(),
                request.getDeliveryProvince(),
                request.getDeliveryNotes(),
                itemRequests
        );

        OrderResponse response = OrderResponse.fromDomain(order);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Order created successfully"));
    }

    @GetMapping("/{orderNumber}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderByNumber(
            @PathVariable String orderNumber) {

        log.debug("Fetching order: {}", orderNumber);

        Order order = getOrderByNumberUseCase.execute(orderNumber);
        OrderResponse response = OrderResponse.fromDomain(order);

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}

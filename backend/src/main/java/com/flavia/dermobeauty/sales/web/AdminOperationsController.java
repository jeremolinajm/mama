package com.flavia.dermobeauty.sales.web;

import com.flavia.dermobeauty.booking.application.usecase.CancelBookingUseCase;
import com.flavia.dermobeauty.booking.application.usecase.ListBookingsUseCase;
import com.flavia.dermobeauty.booking.web.dto.BookingResponse;
import com.flavia.dermobeauty.sales.application.usecase.ListOrdersUseCase;
import com.flavia.dermobeauty.sales.application.usecase.UpdateOrderStatusUseCase;
import com.flavia.dermobeauty.sales.domain.Order;
import com.flavia.dermobeauty.sales.domain.OrderStatus;
import com.flavia.dermobeauty.sales.web.dto.OrderResponse;
import com.flavia.dermobeauty.shared.web.ApiResponse;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminOperationsController {

    private final ListBookingsUseCase listBookingsUseCase;
    private final CancelBookingUseCase cancelBookingUseCase;
    private final ListOrdersUseCase listOrdersUseCase;
    private final UpdateOrderStatusUseCase updateOrderStatusUseCase;

    // ==================== BOOKINGS ====================

    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookings() {
        List<BookingResponse> bookings = listBookingsUseCase.execute().stream()
                .map(BookingResponse::fromDomain)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }

    @DeleteMapping("/bookings/{id}")
    public ResponseEntity<ApiResponse<Void>> cancelBooking(@PathVariable Long id) {
        cancelBookingUseCase.execute(id);
        return ResponseEntity.ok(ApiResponse.success("Turno cancelado"));
    }

    // ==================== ORDERS ====================

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<OrderResponse> orders = listOrdersUseCase.executePaginated(pageable)
                .map(OrderResponse::fromDomain);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody UpdateStatusRequest request) {

        Order updated = updateOrderStatusUseCase.execute(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success(OrderResponse.fromDomain(updated)));
    }

    @Data
    public static class UpdateStatusRequest {
        private OrderStatus status;
    }
}
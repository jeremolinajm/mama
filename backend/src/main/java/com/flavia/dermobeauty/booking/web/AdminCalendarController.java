package com.flavia.dermobeauty.booking.web;

import com.flavia.dermobeauty.booking.application.service.BookingHistoryService;
import com.flavia.dermobeauty.booking.application.usecase.CancelBlockUseCase;
import com.flavia.dermobeauty.booking.application.usecase.CreateBlockUseCase;
import com.flavia.dermobeauty.booking.application.usecase.GetCalendarEventsUseCase;
import com.flavia.dermobeauty.booking.application.usecase.RescheduleBookingUseCase;
import com.flavia.dermobeauty.booking.application.usecase.UpdateBookingCustomerUseCase;
import com.flavia.dermobeauty.booking.domain.Block;
import com.flavia.dermobeauty.booking.domain.Booking;
import com.flavia.dermobeauty.booking.domain.BookingHistory;
import com.flavia.dermobeauty.booking.web.dto.BlockResponse;
import com.flavia.dermobeauty.booking.web.dto.BookingHistoryResponse;
import com.flavia.dermobeauty.booking.web.dto.BookingResponse;
import com.flavia.dermobeauty.booking.web.dto.CalendarEventResponse;
import com.flavia.dermobeauty.booking.web.dto.CreateBlockRequest;
import com.flavia.dermobeauty.booking.web.dto.RescheduleBookingRequest;
import com.flavia.dermobeauty.booking.web.dto.UpdateCustomerRequest;
import com.flavia.dermobeauty.shared.web.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Admin controller for calendar operations.
 * Provides unified view of bookings and blocks, plus management actions.
 */
@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminCalendarController {

    private final GetCalendarEventsUseCase getCalendarEventsUseCase;
    private final CreateBlockUseCase createBlockUseCase;
    private final CancelBlockUseCase cancelBlockUseCase;
    private final RescheduleBookingUseCase rescheduleBookingUseCase;
    private final UpdateBookingCustomerUseCase updateBookingCustomerUseCase;
    private final BookingHistoryService bookingHistoryService;

    // ==================== CALENDAR ====================

    /**
     * Get calendar events for a date range.
     *
     * @param from start date (required)
     * @param to end date (required, inclusive)
     * @param includeCancelled if true, includes cancelled events (default: false)
     * @return list of calendar events (bookings + blocks merged)
     */
    @GetMapping("/calendar")
    public ResponseEntity<ApiResponse<List<CalendarEventResponse>>> getCalendarEvents(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "false") boolean includeCancelled) {

        log.info("GET /api/admin/calendar from={} to={} includeCancelled={}", from, to, includeCancelled);

        List<CalendarEventResponse> events = getCalendarEventsUseCase.execute(from, to, includeCancelled);

        return ResponseEntity.ok(ApiResponse.success(events));
    }

    // ==================== BLOCKS ====================

    /**
     * Create a new block.
     *
     * @param request block creation request
     * @return the created block
     */
    @PostMapping("/blocks")
    public ResponseEntity<ApiResponse<BlockResponse>> createBlock(
            @Valid @RequestBody CreateBlockRequest request) {

        log.info("POST /api/admin/blocks startAt={} endAt={} reason={}",
                request.getStartAt(), request.getEndAt(), request.getReason());

        Block block = createBlockUseCase.execute(
                request.getStartAt(),
                request.getEndAt(),
                request.getReason()
        );

        BlockResponse response = BlockResponse.fromDomain(block);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Bloqueo creado exitosamente"));
    }

    /**
     * Cancel a block.
     *
     * @param id block ID
     * @return the cancelled block
     */
    @PatchMapping("/blocks/{id}/cancel")
    public ResponseEntity<ApiResponse<BlockResponse>> cancelBlock(@PathVariable Long id) {

        log.info("PATCH /api/admin/blocks/{}/cancel", id);

        Block block = cancelBlockUseCase.execute(id);

        BlockResponse response = BlockResponse.fromDomain(block);
        return ResponseEntity.ok(ApiResponse.success(response, "Bloqueo cancelado exitosamente"));
    }

    // ==================== BOOKINGS ====================

    /**
     * Reschedule a booking to a new time.
     *
     * @param id booking ID
     * @param request reschedule request with new start time
     * @return the rescheduled booking
     */
    @PatchMapping("/bookings/{id}/reschedule")
    public ResponseEntity<ApiResponse<BookingResponse>> rescheduleBooking(
            @PathVariable Long id,
            @Valid @RequestBody RescheduleBookingRequest request) {

        log.info("PATCH /api/admin/bookings/{}/reschedule newStartAt={}", id, request.getNewStartAt());

        Booking booking = rescheduleBookingUseCase.execute(id, request.getNewStartAt());

        BookingResponse response = BookingResponse.fromDomain(booking);
        return ResponseEntity.ok(ApiResponse.success(response, "Turno reprogramado exitosamente"));
    }

    /**
     * Update customer information on a booking.
     *
     * @param id booking ID
     * @param request customer info update request
     * @return the updated booking
     */
    @PatchMapping("/bookings/{id}/customer")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBookingCustomer(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCustomerRequest request) {

        log.info("PATCH /api/admin/bookings/{}/customer", id);

        Booking booking = updateBookingCustomerUseCase.execute(
                id,
                request.getName(),
                request.getEmail(),
                request.getWhatsapp(),
                request.getComments()
        );

        BookingResponse response = BookingResponse.fromDomain(booking);
        return ResponseEntity.ok(ApiResponse.success(response, "Información del cliente actualizada"));
    }

    /**
     * Get history for a booking.
     *
     * @param id booking ID
     * @return list of history entries ordered by createdAt ascending
     */
    @GetMapping("/bookings/{id}/history")
    public ResponseEntity<ApiResponse<List<BookingHistoryResponse>>> getBookingHistory(
            @PathVariable Long id) {

        log.info("GET /api/admin/bookings/{}/history", id);

        List<BookingHistory> history = bookingHistoryService.getHistoryForBooking(id);
        List<BookingHistoryResponse> response = history.stream()
                .map(BookingHistoryResponse::fromDomain)
                .toList();

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}

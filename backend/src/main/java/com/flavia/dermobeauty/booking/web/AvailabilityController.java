package com.flavia.dermobeauty.booking.web;

import com.flavia.dermobeauty.booking.application.usecase.GetAvailableSlotsUseCase;
import com.flavia.dermobeauty.shared.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/public/availability")
@RequiredArgsConstructor
public class AvailabilityController {

    private final GetAvailableSlotsUseCase getAvailableSlotsUseCase;

    @GetMapping
    public ResponseEntity<ApiResponse<List<LocalTime>>> getAvailability(
            @RequestParam Long serviceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<LocalTime> slots = getAvailableSlotsUseCase.execute(serviceId, date);
        return ResponseEntity.ok(ApiResponse.success(slots));
    }
}
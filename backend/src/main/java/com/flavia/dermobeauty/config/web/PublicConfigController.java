package com.flavia.dermobeauty.config.web;

import com.flavia.dermobeauty.config.domain.ConfigEntry;
import com.flavia.dermobeauty.config.repository.ConfigRepository;
import com.flavia.dermobeauty.shared.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Public controller for non-sensitive configuration.
 * Exposes schedule and other public settings.
 */
@RestController
@RequestMapping("/api/public/config")
@RequiredArgsConstructor
public class PublicConfigController {

    private final ConfigRepository configRepository;

    /**
     * Get the weekly schedule configuration.
     * Returns the schedule.weekly config value as JSON string.
     */
    @GetMapping("/schedule")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSchedule() {
        ConfigEntry scheduleConfig = configRepository.findByKey("schedule.weekly")
                .orElse(null);

        Map<String, Object> result = new HashMap<>();
        if (scheduleConfig != null) {
            result.put("schedule", scheduleConfig.getValue());
        } else {
            // Default fallback schedule
            result.put("schedule", getDefaultSchedule());
        }

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * Get free shipping threshold.
     */
    @GetMapping("/shipping")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getShippingConfig() {
        ConfigEntry freeThreshold = configRepository.findByKey("delivery.free_threshold")
                .orElse(null);

        Map<String, Object> result = new HashMap<>();
        result.put("freeShippingThreshold", freeThreshold != null ? freeThreshold.getValue() : "0");

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    private String getDefaultSchedule() {
        return """
            {
                "monday": {"enabled": true, "startTime": "09:00", "endTime": "19:00"},
                "tuesday": {"enabled": true, "startTime": "09:00", "endTime": "19:00"},
                "wednesday": {"enabled": true, "startTime": "09:00", "endTime": "19:00"},
                "thursday": {"enabled": true, "startTime": "09:00", "endTime": "19:00"},
                "friday": {"enabled": true, "startTime": "09:00", "endTime": "19:00"},
                "saturday": {"enabled": false, "startTime": "09:00", "endTime": "13:00"},
                "sunday": {"enabled": false, "startTime": "09:00", "endTime": "13:00"}
            }
            """;
    }
}

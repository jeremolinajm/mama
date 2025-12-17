package com.flavia.dermobeauty.booking.application.usecase;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.flavia.dermobeauty.booking.domain.Booking;
import com.flavia.dermobeauty.booking.domain.BookingRepository;
import com.flavia.dermobeauty.booking.domain.BookingStatus;
import com.flavia.dermobeauty.catalog.entity.ServiceEntity;
import com.flavia.dermobeauty.catalog.repository.ServiceRepository;
import com.flavia.dermobeauty.config.domain.ConfigEntry;
import com.flavia.dermobeauty.config.repository.ConfigRepository;
import com.flavia.dermobeauty.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

/**
 * Use Case: Get available time slots for a service on a specific date.
 *
 * Business hours are now database-driven via the "schedule.weekly" config entry.
 * Returns empty list if the requested day is marked as closed.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class GetAvailableSlotsUseCase {

    private final BookingRepository bookingRepository;
    private final ServiceRepository serviceRepository;
    private final ConfigRepository configRepository;
    private final ObjectMapper objectMapper;

    private static final int SLOT_INTERVAL_MINUTES = 30;
    private static final String SCHEDULE_CONFIG_KEY = "schedule.weekly";

    // Fallback values if config is missing or invalid
    private static final LocalTime FALLBACK_OPEN_TIME = LocalTime.of(9, 0);
    private static final LocalTime FALLBACK_CLOSE_TIME = LocalTime.of(19, 0);

    public List<LocalTime> execute(Long serviceId, LocalDate date) {
        log.debug("Calculating availability for service {} on {}", serviceId, date);

        // 1. Get service duration
        ServiceEntity service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service", serviceId));
        int durationMinutes = service.getDurationMinutes();

        // 2. Get business hours for the requested day
        BusinessHours businessHours = getBusinessHoursForDate(date);

        // 3. If the day is closed, return empty list
        if (!businessHours.isEnabled()) {
            log.info("Day {} is closed. No slots available.", date.getDayOfWeek());
            return Collections.emptyList();
        }

        // 4. Get existing bookings for the day
        List<Booking> existingBookings = bookingRepository.findByDate(date);

        // 5. Check if the day is blocked (blocked bookings prevent all other bookings)
        boolean isDayBlocked = existingBookings.stream()
                .anyMatch(b -> b.getStatus() == BookingStatus.BLOCKED);

        if (isDayBlocked) {
            log.info("Day {} is blocked. No slots available.", date);
            return Collections.emptyList();
        }

        // 6. Calculate available slots
        List<LocalTime> availableSlots = new ArrayList<>();
        LocalTime currentSlot = businessHours.getOpenTime();
        LocalTime closeTime = businessHours.getCloseTime();

        // Iterate while the service can fit before closing time
        while (canServiceFit(currentSlot, durationMinutes, closeTime)) {
            LocalTime endSlot = currentSlot.plusMinutes(durationMinutes);

            if (isSlotFree(currentSlot, endSlot, existingBookings)) {
                availableSlots.add(currentSlot);
            }

            // Advance by slot interval
            currentSlot = currentSlot.plusMinutes(SLOT_INTERVAL_MINUTES);
        }

        log.debug("Found {} available slots for {} on {}", availableSlots.size(), serviceId, date);
        return availableSlots;
    }

    /**
     * Fetches business hours from database config for the requested date.
     * Returns fallback hours if config is missing or invalid.
     */
    private BusinessHours getBusinessHoursForDate(LocalDate date) {
        try {
            // Get day of week (e.g., "monday", "tuesday")
            String dayKey = date.getDayOfWeek()
                    .getDisplayName(TextStyle.FULL, Locale.ENGLISH)
                    .toLowerCase();

            // Fetch schedule config from database
            ConfigEntry scheduleConfig = configRepository.findByKey(SCHEDULE_CONFIG_KEY)
                    .orElseThrow(() -> new RuntimeException("Schedule config not found"));

            // Parse JSON
            JsonNode scheduleJson = objectMapper.readTree(scheduleConfig.getValue());
            JsonNode dayConfig = scheduleJson.get(dayKey);

            if (dayConfig == null) {
                log.warn("No config found for day '{}', using fallback", dayKey);
                return new BusinessHours(true, FALLBACK_OPEN_TIME, FALLBACK_CLOSE_TIME);
            }

            // Extract day-specific configuration
            boolean enabled = dayConfig.get("enabled").asBoolean();

            if (!enabled) {
                return new BusinessHours(false, null, null);
            }

            String startTimeStr = dayConfig.get("startTime").asText();
            String endTimeStr = dayConfig.get("endTime").asText();

            LocalTime openTime = LocalTime.parse(startTimeStr);
            LocalTime closeTime = LocalTime.parse(endTimeStr);

            log.debug("Business hours for {}: {} - {}", dayKey, openTime, closeTime);
            return new BusinessHours(true, openTime, closeTime);

        } catch (Exception e) {
            log.error("Error parsing schedule config, using fallback hours", e);
            return new BusinessHours(true, FALLBACK_OPEN_TIME, FALLBACK_CLOSE_TIME);
        }
    }

    private boolean canServiceFit(LocalTime start, int duration, LocalTime closeTime) {
        // Validación segura de overflow de día
        if (start.plusMinutes(duration).isBefore(start)) return false; // Pasó medianoche
        return !start.plusMinutes(duration).isAfter(closeTime);
    }

    private boolean isSlotFree(LocalTime newStart, LocalTime newEnd, List<Booking> bookings) {
        for (Booking b : bookings) {
            LocalTime bStart = b.getTimeSlot().getTime();
            LocalTime bEnd = bStart.plusMinutes(b.getDurationMinutes());

            // Overlap logic: (StartA < EndB) AND (EndA > StartB)
            if (newStart.isBefore(bEnd) && newEnd.isAfter(bStart)) {
                return false; // Collision detected
            }
        }
        return true;
    }

    /**
     * Inner class to hold business hours for a specific day.
     */
    private static class BusinessHours {
        private final boolean enabled;
        private final LocalTime openTime;
        private final LocalTime closeTime;

        public BusinessHours(boolean enabled, LocalTime openTime, LocalTime closeTime) {
            this.enabled = enabled;
            this.openTime = openTime;
            this.closeTime = closeTime;
        }

        public boolean isEnabled() {
            return enabled;
        }

        public LocalTime getOpenTime() {
            return openTime;
        }

        public LocalTime getCloseTime() {
            return closeTime;
        }
    }
}
package com.flavia.dermobeauty.booking.application.usecase;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.flavia.dermobeauty.booking.domain.Block;
import com.flavia.dermobeauty.booking.domain.BlockRepository;
import com.flavia.dermobeauty.booking.domain.Booking;
import com.flavia.dermobeauty.booking.domain.BookingRepository;
import com.flavia.dermobeauty.catalog.entity.ServiceEntity;
import com.flavia.dermobeauty.catalog.repository.ServiceRepository;
import com.flavia.dermobeauty.config.domain.ConfigEntry;
import com.flavia.dermobeauty.config.repository.ConfigRepository;
import com.flavia.dermobeauty.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

/**
 * Use Case: Get available time slots for a service on a specific date.
 *
 * Business hours are database-driven via the "schedule.weekly" config entry.
 * Returns empty list if the requested day is marked as closed.
 *
 * Availability considers:
 * - Bookings with status IN (PENDING, CONFIRMED) occupy time
 * - Blocks with status ACTIVE occupy time
 * - CANCELLED/COMPLETED bookings and CANCELLED blocks do NOT occupy time
 * - Collisions are GLOBAL (single resource - Flavia), not per-service
 */
@SuppressWarnings("ClassCanBeRecord")
@Slf4j
@RequiredArgsConstructor
public class GetAvailableSlotsUseCase {

    private static final ZoneId ARGENTINA_ZONE = ZoneId.of("America/Argentina/Buenos_Aires");
    private static final int SLOT_INTERVAL_MINUTES = 30;
    private static final String SCHEDULE_CONFIG_KEY = "schedule.weekly";

    // Fallback values if config is missing or invalid
    private static final LocalTime FALLBACK_OPEN_TIME = LocalTime.of(9, 0);
    private static final LocalTime FALLBACK_CLOSE_TIME = LocalTime.of(19, 0);

    private final BookingRepository bookingRepository;
    private final BlockRepository blockRepository;
    private final ServiceRepository serviceRepository;
    private final ConfigRepository configRepository;
    private final ObjectMapper objectMapper;

    public List<LocalTime> execute(Long serviceId, LocalDate date) {
        log.debug("Calculating availability for service {} on {}", serviceId, date);

        // 1. Get service duration (for slot sizing)
        ServiceEntity service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service", serviceId));
        int durationMinutes = service.getDurationMinutes();

        // Validate duration is multiple of 30
        if (durationMinutes <= 0 || durationMinutes % 30 != 0) {
            log.warn("Service {} has invalid duration {}. Rounding to nearest 30.", serviceId, durationMinutes);
            durationMinutes = ((durationMinutes + 29) / 30) * 30;
        }

        // 2. Get business hours for the requested day
        BusinessHours businessHours = getBusinessHoursForDate(date);

        // 3. If the day is closed, return empty list
        if (!businessHours.isEnabled()) {
            log.info("Day {} is closed. No slots available.", date.getDayOfWeek());
            return Collections.emptyList();
        }

        // 4. Convert day boundaries to OffsetDateTime
        OffsetDateTime dayStart = date.atTime(businessHours.getOpenTime())
                .atZone(ARGENTINA_ZONE).toOffsetDateTime();
        OffsetDateTime dayEnd = date.atTime(businessHours.getCloseTime())
                .atZone(ARGENTINA_ZONE).toOffsetDateTime();

        // 5. Get all OCCUPYING bookings for the day (PENDING, CONFIRMED only)
        // Using date range query - includeCancelled=false excludes CANCELLED
        List<Booking> occupyingBookings = bookingRepository.findByDateRange(dayStart, dayEnd, false)
                .stream()
                .filter(Booking::occupiesTime) // PENDING or CONFIRMED
                .toList();

        // 6. Get all ACTIVE blocks for the day
        List<Block> activeBlocks = blockRepository.findActiveBlocksInRange(dayStart, dayEnd);

        // 7. Check if entire day is blocked
        if (isDayFullyBlocked(dayStart, dayEnd, activeBlocks)) {
            log.info("Day {} is fully blocked. No slots available.", date);
            return Collections.emptyList();
        }

        // 8. Calculate available slots
        List<LocalTime> availableSlots = new ArrayList<>();
        LocalTime currentSlot = businessHours.getOpenTime();
        LocalTime closeTime = businessHours.getCloseTime();

        while (canServiceFit(currentSlot, durationMinutes, closeTime)) {
            OffsetDateTime slotStart = date.atTime(currentSlot)
                    .atZone(ARGENTINA_ZONE).toOffsetDateTime();
            OffsetDateTime slotEnd = slotStart.plusMinutes(durationMinutes);

            if (isSlotFree(slotStart, slotEnd, occupyingBookings, activeBlocks)) {
                availableSlots.add(currentSlot);
            }

            currentSlot = currentSlot.plusMinutes(SLOT_INTERVAL_MINUTES);
        }

        log.debug("Found {} available slots for service {} on {}", availableSlots.size(), serviceId, date);
        return availableSlots;
    }

    /**
     * Fetches business hours from database config for the requested date.
     */
    private BusinessHours getBusinessHoursForDate(LocalDate date) {
        try {
            String dayKey = date.getDayOfWeek()
                    .getDisplayName(TextStyle.FULL, Locale.ENGLISH)
                    .toLowerCase();

            ConfigEntry scheduleConfig = configRepository.findByKey(SCHEDULE_CONFIG_KEY)
                    .orElseThrow(() -> new RuntimeException("Schedule config not found"));

            JsonNode scheduleJson = objectMapper.readTree(scheduleConfig.getValue());
            JsonNode dayConfig = scheduleJson.get(dayKey);

            if (dayConfig == null) {
                log.warn("No config found for day '{}', using fallback", dayKey);
                return new BusinessHours(true, FALLBACK_OPEN_TIME, FALLBACK_CLOSE_TIME);
            }

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
        LocalTime end = start.plusMinutes(duration);
        // Check for midnight overflow
        if (end.isBefore(start)) return false;
        return !end.isAfter(closeTime);
    }

    /**
     * Checks if a slot is free (no collisions with bookings or blocks).
     */
    private boolean isSlotFree(OffsetDateTime slotStart, OffsetDateTime slotEnd,
                               List<Booking> bookings, List<Block> blocks) {
        // Check collision with bookings
        for (Booking b : bookings) {
            OffsetDateTime bStart = b.getStartAt();
            OffsetDateTime bEnd = b.getEndAt();

            // Overlap: A.start < B.end AND A.end > B.start
            if (slotStart.isBefore(bEnd) && slotEnd.isAfter(bStart)) {
                return false;
            }
        }

        // Check collision with blocks
        for (Block bl : blocks) {
            OffsetDateTime blStart = bl.getStartAt();
            OffsetDateTime blEnd = bl.getEndAt();

            if (slotStart.isBefore(blEnd) && slotEnd.isAfter(blStart)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Checks if the entire business day is covered by a single block.
     */
    private boolean isDayFullyBlocked(OffsetDateTime dayStart, OffsetDateTime dayEnd, List<Block> blocks) {
        for (Block bl : blocks) {
            if (bl.getStartAt().compareTo(dayStart) <= 0 && bl.getEndAt().compareTo(dayEnd) >= 0) {
                return true;
            }
        }
        return false;
    }

    private static class BusinessHours {
        private final boolean enabled;
        private final LocalTime openTime;
        private final LocalTime closeTime;

        public BusinessHours(boolean enabled, LocalTime openTime, LocalTime closeTime) {
            this.enabled = enabled;
            this.openTime = openTime;
            this.closeTime = closeTime;
        }

        public boolean isEnabled() { return enabled; }
        public LocalTime getOpenTime() { return openTime; }
        public LocalTime getCloseTime() { return closeTime; }
    }
}

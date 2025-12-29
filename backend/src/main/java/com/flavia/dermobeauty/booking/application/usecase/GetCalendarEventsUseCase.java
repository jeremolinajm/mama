package com.flavia.dermobeauty.booking.application.usecase;

import com.flavia.dermobeauty.booking.domain.Block;
import com.flavia.dermobeauty.booking.domain.BlockRepository;
import com.flavia.dermobeauty.booking.domain.Booking;
import com.flavia.dermobeauty.booking.domain.BookingRepository;
import com.flavia.dermobeauty.booking.web.dto.CalendarEventResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Use case for fetching calendar events (bookings + blocks merged).
 * Returns a unified list of CalendarEventResponse sorted by start time.
 */
@SuppressWarnings("ClassCanBeRecord")
@Slf4j
@RequiredArgsConstructor
public class GetCalendarEventsUseCase {

    private static final ZoneId ARGENTINA_ZONE = ZoneId.of("America/Argentina/Buenos_Aires");

    private final BookingRepository bookingRepository;
    private final BlockRepository blockRepository;

    /**
     * Fetches calendar events for a date range.
     *
     * @param fromDate start date (interpreted in Argentina timezone)
     * @param toDate end date (interpreted in Argentina timezone, inclusive)
     * @param includeCancelled if true, includes cancelled events
     * @return list of calendar events sorted by start time
     */
    public List<CalendarEventResponse> execute(LocalDate fromDate, LocalDate toDate, boolean includeCancelled) {
        log.info("Fetching calendar events from {} to {} (includeCancelled={})",
                fromDate, toDate, includeCancelled);

        // Convert dates to OffsetDateTime in Argentina timezone
        OffsetDateTime from = fromDate.atStartOfDay(ARGENTINA_ZONE).toOffsetDateTime();
        OffsetDateTime to = toDate.atTime(LocalTime.MAX).atZone(ARGENTINA_ZONE).toOffsetDateTime();

        // Fetch bookings
        List<Booking> bookings = bookingRepository.findByDateRange(from, to, includeCancelled);
        log.debug("Found {} bookings in range", bookings.size());

        // Fetch blocks
        List<Block> blocks = blockRepository.findByDateRange(from, to, includeCancelled);
        log.debug("Found {} blocks in range", blocks.size());

        // Convert and merge
        List<CalendarEventResponse> events = new ArrayList<>();

        for (Booking booking : bookings) {
            events.add(CalendarEventResponse.fromBooking(booking));
        }

        for (Block block : blocks) {
            events.add(CalendarEventResponse.fromBlock(block));
        }

        // Sort by start time
        events.sort(Comparator.comparing(CalendarEventResponse::getStartAt));

        log.info("Returning {} total calendar events", events.size());
        return events;
    }
}

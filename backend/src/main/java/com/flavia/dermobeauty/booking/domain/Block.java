package com.flavia.dermobeauty.booking.domain;

import com.flavia.dermobeauty.shared.exception.DomainException;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.time.ZoneId;

/**
 * Block Aggregate Root.
 * Represents a schedule block (holiday, personal day, etc.).
 * Blocks occupy time slots and prevent bookings during that period.
 */
@Getter
@AllArgsConstructor
@Builder
public class Block {

    private static final ZoneId ARGENTINA_ZONE = ZoneId.of("America/Argentina/Buenos_Aires");

    private Long id;
    private String blockNumber;
    private String reason;
    private OffsetDateTime startAt;
    private OffsetDateTime endAt;
    private BlockStatus status;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private OffsetDateTime cancelledAt;

    /**
     * Factory method to create a new block.
     * Validates business rules at creation time.
     */
    public static Block create(String blockNumber, String reason, OffsetDateTime startAt, OffsetDateTime endAt) {
        validateTimeRange(startAt, endAt);
        validateAlignment(startAt, "startAt");
        validateAlignment(endAt, "endAt");

        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("Block reason cannot be empty");
        }

        OffsetDateTime now = OffsetDateTime.now(ARGENTINA_ZONE);

        return Block.builder()
                .blockNumber(blockNumber)
                .reason(reason.trim())
                .startAt(startAt)
                .endAt(endAt)
                .status(BlockStatus.ACTIVE)
                .createdAt(now)
                .updatedAt(now)
                .build();
    }

    /**
     * Cancels this block.
     * Cancelled blocks no longer occupy time slots.
     */
    public void cancel() {
        if (this.status == BlockStatus.CANCELLED) {
            throw new DomainException("Block " + blockNumber + " is already cancelled");
        }

        OffsetDateTime now = OffsetDateTime.now(ARGENTINA_ZONE);
        this.status = BlockStatus.CANCELLED;
        this.cancelledAt = now;
        this.updatedAt = now;
    }

    /**
     * Checks if this block occupies time slots (used in collision detection).
     */
    public boolean occupiesTime() {
        return status == BlockStatus.ACTIVE;
    }

    /**
     * Gets the duration of this block in minutes.
     */
    public long getDurationMinutes() {
        return java.time.Duration.between(startAt, endAt).toMinutes();
    }

    private static void validateTimeRange(OffsetDateTime startAt, OffsetDateTime endAt) {
        if (startAt == null || endAt == null) {
            throw new IllegalArgumentException("Start and end times cannot be null");
        }
        if (!endAt.isAfter(startAt)) {
            throw new DomainException("Block end time must be after start time");
        }
    }

    private static void validateAlignment(OffsetDateTime time, String fieldName) {
        int minute = time.getMinute();
        if (minute != 0 && minute != 30) {
            throw new DomainException(fieldName + " must be aligned to 30-minute intervals (:00 or :30)");
        }
    }
}

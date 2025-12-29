package com.flavia.dermobeauty.booking.application.usecase;

import com.flavia.dermobeauty.booking.domain.Block;
import com.flavia.dermobeauty.booking.domain.BlockRepository;
import com.flavia.dermobeauty.booking.domain.BookingRepository;
import com.flavia.dermobeauty.shared.exception.ConflictException;
import com.flavia.dermobeauty.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Use case for creating a new block (time slot reservation).
 * Validates alignment rules and checks for collisions with bookings and other blocks.
 */
@SuppressWarnings("ClassCanBeRecord")
@Slf4j
@RequiredArgsConstructor
public class CreateBlockUseCase {

    private final BlockRepository blockRepository;
    private final BookingRepository bookingRepository;

    /**
     * Creates a new block.
     *
     * @param startAt start time (must be aligned to 30-min intervals)
     * @param endAt end time (must be aligned to 30-min intervals, must be after startAt)
     * @param reason reason for the block (required)
     * @return the created block
     * @throws ValidationException if alignment or time rules are violated
     * @throws ConflictException if the time range conflicts with existing bookings or blocks
     */
    public Block execute(OffsetDateTime startAt, OffsetDateTime endAt, String reason) {
        log.info("Creating block from {} to {} with reason: {}", startAt, endAt, reason);

        // Validate alignment (30-min intervals)
        validateAlignment(startAt, "startAt");
        validateAlignment(endAt, "endAt");

        // Validate time range
        if (!startAt.isBefore(endAt)) {
            throw new ValidationException("La hora de inicio debe ser anterior a la hora de fin");
        }

        // Check for collisions with active blocks
        if (blockRepository.existsActiveBlockInRange(startAt, endAt)) {
            throw new ConflictException("Ya existe un bloqueo activo en ese rango de tiempo");
        }

        // Check for collisions with active bookings
        // Bookings that "occupy" are PENDING or CONFIRMED
        if (hasBookingCollision(startAt, endAt)) {
            throw new ConflictException("Existe un turno activo en ese rango de tiempo");
        }

        // Generate block number
        String blockNumber = generateBlockNumber();

        // Create block using factory method
        Block block = Block.create(blockNumber, reason, startAt, endAt);

        // Persist
        Block saved = blockRepository.save(block);
        log.info("Block created successfully: {}", saved.getBlockNumber());

        return saved;
    }

    private void validateAlignment(OffsetDateTime time, String fieldName) {
        int minute = time.getMinute();
        if (minute != 0 && minute != 30) {
            throw new ValidationException(
                    fieldName + " debe estar alineado a intervalos de 30 minutos (:00 o :30)"
            );
        }
    }

    private boolean hasBookingCollision(OffsetDateTime startAt, OffsetDateTime endAt) {
        // Query bookings in range (only those that occupy time: PENDING, CONFIRMED)
        return bookingRepository.findByDateRange(startAt, endAt, false).stream()
                .anyMatch(booking -> {
                    OffsetDateTime bookingStart = booking.getStartAt();
                    OffsetDateTime bookingEnd = booking.getEndAt();
                    // Collision: A.start < B.end AND B.start < A.end
                    return bookingStart.isBefore(endAt) && startAt.isBefore(bookingEnd);
                });
    }

    private String generateBlockNumber() {
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return "BLOCK-" + uuid;
    }
}

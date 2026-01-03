package com.flavia.dermobeauty.booking.application.usecase;

import com.flavia.dermobeauty.booking.domain.*;
import com.flavia.dermobeauty.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@SuppressWarnings("ClassCanBeRecord")
@Slf4j
@RequiredArgsConstructor
public class CreateBookingUseCase {

    private static final ZoneId ARGENTINA_ZONE = ZoneId.of("America/Argentina/Buenos_Aires");

    private final BookingRepository bookingRepository;
    private final BlockRepository blockRepository;

    public Booking execute(
            Long serviceId,
            String serviceName,
            String customerName,
            String customerEmail,
            String customerWhatsapp,
            String customerComments,
            LocalDate bookingDate,
            LocalTime bookingTime,
            Integer durationMinutes,
            BigDecimal amount) {

        log.info("Creating booking for service {} on {} at {}", serviceId, bookingDate, bookingTime);

        // Validar alineación a slots de 30 minutos
        if (bookingTime.getMinute() != 0 && bookingTime.getMinute() != 30) {
            throw new ValidationException("El horario debe ser en intervalos de 30 minutos (:00 o :30)");
        }

        if (durationMinutes <= 0 || durationMinutes % 30 != 0) {
            throw new ValidationException("La duración debe ser múltiplo de 30 minutos");
        }

        // Calcular hora de fin
        LocalTime bookingEndTime = bookingTime.plusMinutes(durationMinutes);

        // Calcular OffsetDateTime para verificar bloqueos
        OffsetDateTime slotStart = LocalDateTime.of(bookingDate, bookingTime)
                .atZone(ARGENTINA_ZONE).toOffsetDateTime();
        OffsetDateTime slotEnd = LocalDateTime.of(bookingDate, bookingEndTime)
                .atZone(ARGENTINA_ZONE).toOffsetDateTime();

        // Verificar que no hay bloqueos activos en ese horario
        List<Block> activeBlocks = blockRepository.findActiveBlocksInRange(slotStart, slotEnd);
        if (!activeBlocks.isEmpty()) {
            throw new ValidationException(
                    "El horario seleccionado (" + bookingTime + " - " + bookingEndTime + ") está bloqueado."
            );
        }

        // Validar disponibilidad (sin bookings solapados - verificación global)
        if (!bookingRepository.isTimeSlotAvailable(bookingDate, bookingTime, bookingEndTime)) {
            throw new ValidationException(
                    "El horario seleccionado (" + bookingTime + " - " + bookingEndTime + ") no está disponible."
            );
        }

        // Crear value objects
        CustomerInfo customerInfo = new CustomerInfo(
                customerName,
                customerEmail,
                customerWhatsapp,
                customerComments
        );

        TimeSlot timeSlot = new TimeSlot(bookingDate, bookingTime);

        // Crear startAt con timezone
        OffsetDateTime startAt = LocalDateTime.of(bookingDate, bookingTime)
                .atZone(ARGENTINA_ZONE)
                .toOffsetDateTime();

        // Crear booking aggregate
        Booking booking = Booking.builder()
                .bookingNumber(generateBookingNumber())
                .serviceId(serviceId)
                .serviceName(serviceName)
                .customerInfo(customerInfo)
                .timeSlot(timeSlot)
                .startAt(startAt)
                .durationMinutes(durationMinutes)
                .status(BookingStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .amount(amount)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // Persistir
        Booking saved = bookingRepository.save(booking);
        log.info("Booking created successfully: {}", saved.getBookingNumber());

        return saved;
    }

    /**
     * Generates a booking number using ULID-like format for uniqueness.
     * Format: BOOK-{first 8 chars of UUID}
     */
    private String generateBookingNumber() {
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return "BOOK-" + uuid;
    }
}
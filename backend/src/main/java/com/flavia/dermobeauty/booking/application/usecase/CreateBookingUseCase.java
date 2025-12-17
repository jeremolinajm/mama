package com.flavia.dermobeauty.booking.application.usecase;

import com.flavia.dermobeauty.booking.domain.*;
import com.flavia.dermobeauty.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor; // <--- IMPORTANTE
import lombok.extern.slf4j.Slf4j;     // <--- IMPORTANTE

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

@SuppressWarnings("ClassCanBeRecord")
@Slf4j // <--- Soluciona el error "Cannot resolve symbol 'log'"
@RequiredArgsConstructor // <--- Soluciona el error del "bookingRepository" no inicializado
public class CreateBookingUseCase {

    private final BookingRepository bookingRepository;

    public Booking execute(
            Long serviceId,
            String customerName,
            String customerEmail,
            String customerWhatsapp,
            String customerComments,
            LocalDate bookingDate,
            LocalTime bookingTime,
            Integer durationMinutes,
            BigDecimal amount) {

        log.info("Creating booking for service {} on {} at {}", serviceId, bookingDate, bookingTime);

        // Calcular hora de fin
        LocalTime bookingEndTime = bookingTime.plusMinutes(durationMinutes);

        // Validar disponibilidad real (rangos de tiempo)
        if (!bookingRepository.isTimeSlotAvailable(serviceId, bookingDate, bookingTime, bookingEndTime)) {
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

        // Crear booking aggregate
        Booking booking = Booking.builder()
                .bookingNumber(generateBookingNumber())
                .serviceId(serviceId)
                .customerInfo(customerInfo)
                .timeSlot(timeSlot)
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

    private String generateBookingNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
        return "BOOK-" + timestamp;
    }
}
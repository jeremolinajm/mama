package com.flavia.dermobeauty.booking.infrastructure.persistence;

import com.flavia.dermobeauty.booking.domain.Booking;
import com.flavia.dermobeauty.booking.domain.BookingRepository;
import com.flavia.dermobeauty.booking.domain.BookingStatus;
import com.flavia.dermobeauty.booking.infrastructure.mapper.BookingMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Adapter that implements the domain BookingRepository port using JPA.
 * Bridges between domain layer and infrastructure layer.
 */
@Component
@RequiredArgsConstructor
public class BookingRepositoryAdapter implements BookingRepository {

    private final JpaBookingRepository jpaRepository;
    private final BookingMapper mapper;

    @Override
    public Booking save(Booking booking) {
        BookingEntity entity = mapper.toEntity(booking);
        BookingEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<Booking> findById(Long id) {
        return jpaRepository.findById(id)
                .map(mapper::toDomain);
    }

    @Override
    public List<Booking> findByDate(LocalDate date) {
        // Buscamos por fecha y excluimos los CANCELLED
        return jpaRepository.findByBookingDateAndStatusNot(date, BookingStatus.CANCELLED)
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Booking> findByBookingNumber(String bookingNumber) {
        return jpaRepository.findByBookingNumber(bookingNumber)
                .map(mapper::toDomain);
    }

    @Override
    public Optional<Booking> findByMercadoPagoPaymentId(String paymentId) {
        return jpaRepository.findByMercadoPagoPaymentId(paymentId)
                .map(mapper::toDomain);
    }

    @Override
    public boolean isTimeSlotAvailable(Long serviceId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        return !jpaRepository.existsOverlappingBooking(serviceId, date, startTime, endTime);
    }

    @Override
    public List<Booking> findAll() {
        return jpaRepository.findAll()
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Booking> findByStatus(BookingStatus status) {
        return jpaRepository.findByStatus(status)
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
}

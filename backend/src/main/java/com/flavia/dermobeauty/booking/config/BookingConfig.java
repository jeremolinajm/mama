package com.flavia.dermobeauty.booking.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.flavia.dermobeauty.booking.application.port.NotificationService;
import com.flavia.dermobeauty.booking.application.usecase.*;
import com.flavia.dermobeauty.booking.domain.BookingRepository;
import com.flavia.dermobeauty.catalog.repository.ServiceRepository;
import com.flavia.dermobeauty.config.repository.ConfigRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class for Booking module.
 * Wires use cases as Spring beans for dependency injection.
 */
@Configuration
public class BookingConfig {

    @Bean
    public CreateBookingUseCase createBookingUseCase(BookingRepository bookingRepository) {
        return new CreateBookingUseCase(bookingRepository);
    }

    @Bean
    public ConfirmBookingPaymentUseCase confirmBookingPaymentUseCase(
            BookingRepository bookingRepository,
            NotificationService notificationService) {
        return new ConfirmBookingPaymentUseCase(bookingRepository, notificationService);
    }

    @Bean
    public ListBookingsUseCase listBookingsUseCase(BookingRepository bookingRepository) {
        return new ListBookingsUseCase(bookingRepository);
    }

    @Bean
    public CancelBookingUseCase cancelBookingUseCase(BookingRepository bookingRepository) {
        return new CancelBookingUseCase(bookingRepository);
    }

    @Bean
    public GetBookingByNumberUseCase getBookingByNumberUseCase(BookingRepository bookingRepository) {
        return new GetBookingByNumberUseCase(bookingRepository);
    }

    @Bean
    public GetAvailableSlotsUseCase getAvailableSlotsUseCase(
            BookingRepository bookingRepository,
            ServiceRepository serviceRepository,
            ConfigRepository configRepository,
            ObjectMapper objectMapper
    ) {
        return new GetAvailableSlotsUseCase(
                bookingRepository,
                serviceRepository,
                configRepository,
                objectMapper
        );
    }
}

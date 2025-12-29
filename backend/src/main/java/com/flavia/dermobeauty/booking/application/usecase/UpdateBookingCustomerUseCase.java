package com.flavia.dermobeauty.booking.application.usecase;

import com.flavia.dermobeauty.booking.domain.Booking;
import com.flavia.dermobeauty.booking.domain.BookingRepository;
import com.flavia.dermobeauty.booking.domain.CustomerInfo;
import com.flavia.dermobeauty.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Use case for updating customer information on a booking.
 */
@SuppressWarnings("ClassCanBeRecord")
@Slf4j
@RequiredArgsConstructor
public class UpdateBookingCustomerUseCase {

    private final BookingRepository bookingRepository;

    /**
     * Updates customer information on a booking.
     *
     * @param bookingId the ID of the booking
     * @param name customer name
     * @param email customer email
     * @param whatsapp customer WhatsApp number
     * @param comments optional comments
     * @return the updated booking
     * @throws ResourceNotFoundException if booking not found
     */
    public Booking execute(Long bookingId, String name, String email, String whatsapp, String comments) {
        log.info("Updating customer info for booking {}", bookingId);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", bookingId));

        CustomerInfo newCustomerInfo = new CustomerInfo(name, email, whatsapp, comments);
        booking.updateCustomer(newCustomerInfo);

        Booking saved = bookingRepository.save(booking);
        log.info("Customer info updated for booking {}", saved.getBookingNumber());

        return saved;
    }
}

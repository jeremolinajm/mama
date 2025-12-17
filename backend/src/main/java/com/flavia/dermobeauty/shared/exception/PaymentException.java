package com.flavia.dermobeauty.shared.exception;

/**
 * Exception thrown for payment processing failures.
 * Results in HTTP 502 responses (bad gateway from payment provider).
 */
public class PaymentException extends DomainException {

    public PaymentException(String message) {
        super(message);
    }

    public PaymentException(String message, Throwable cause) {
        super(message, cause);
    }
}

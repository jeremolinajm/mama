package com.flavia.dermobeauty.shared.exception;

/**
 * Exception thrown for domain validation failures.
 * Results in HTTP 400 responses.
 */
public class ValidationException extends DomainException {

    public ValidationException(String message) {
        super(message);
    }

    public ValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}

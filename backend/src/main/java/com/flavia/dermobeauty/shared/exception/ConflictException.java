package com.flavia.dermobeauty.shared.exception;

/**
 * Exception for conflict errors (409).
 * Used when an operation cannot be completed due to resource conflicts
 * (e.g., time slot already occupied).
 */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }

    public ConflictException(String message, Throwable cause) {
        super(message, cause);
    }
}

package com.flavia.dermobeauty.shared.exception;

/**
 * Base exception for domain-level business rule violations.
 * Extends RuntimeException to avoid polluting domain layer with checked exceptions.
 */
public class DomainException extends RuntimeException {

    public DomainException(String message) {
        super(message);
    }

    public DomainException(String message, Throwable cause) {
        super(message, cause);
    }
}

package com.flavia.dermobeauty.shared.exception;

/**
 * Exception thrown when a requested resource is not found.
 * Results in HTTP 404 responses.
 */
public class ResourceNotFoundException extends DomainException {

    public ResourceNotFoundException(String resourceType, Object id) {
        super(String.format("%s with id '%s' not found", resourceType, id));
    }

    public ResourceNotFoundException(String message) {
        super(message);
    }
}

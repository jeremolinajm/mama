-- V12: Create booking_history table for audit trail
-- Append-only table: records are never modified or deleted

CREATE TABLE booking_history (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,

    -- Event type enum (stored as string for flexibility)
    event_type VARCHAR(30) NOT NULL
        CHECK (event_type IN ('CREATED', 'STATUS_CHANGED', 'RESCHEDULED', 'CUSTOMER_UPDATED', 'PAYMENT_UPDATED')),

    -- Who made the change
    actor VARCHAR(20) NOT NULL
        CHECK (actor IN ('ADMIN', 'SYSTEM', 'CUSTOMER')),

    -- What changed (JSON diff)
    payload JSONB,

    -- When it happened (TIMESTAMPTZ for timezone safety)
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_booking_history_booking_id ON booking_history(booking_id);
CREATE INDEX idx_booking_history_event_type ON booking_history(event_type);
CREATE INDEX idx_booking_history_created_at ON booking_history(created_at);

-- GIN index for JSONB payload queries (optional, for future auditing)
CREATE INDEX idx_booking_history_payload ON booking_history USING GIN (payload);

-- Comments
COMMENT ON TABLE booking_history IS 'Audit trail for booking changes. Append-only: never modify or delete records.';
COMMENT ON COLUMN booking_history.event_type IS 'Type of change: CREATED, STATUS_CHANGED, RESCHEDULED, CUSTOMER_UPDATED, PAYMENT_UPDATED';
COMMENT ON COLUMN booking_history.actor IS 'Who made the change: ADMIN, SYSTEM, or CUSTOMER';
COMMENT ON COLUMN booking_history.payload IS 'JSON diff of what changed (e.g., {"old_status": "PENDING", "new_status": "CONFIRMED"})';

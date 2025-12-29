-- V10: Create blocks table for schedule blocking
-- Blocks are separate from bookings (not "fake bookings")

CREATE TABLE blocks (
    id BIGSERIAL PRIMARY KEY,
    block_number VARCHAR(50) NOT NULL UNIQUE,
    reason VARCHAR(500) NOT NULL,

    -- Time range (both stored as TIMESTAMPTZ for timezone safety)
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,

    -- Status (ACTIVE or CANCELLED)
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'CANCELLED')),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT chk_block_end_after_start CHECK (end_at > start_at),
    CONSTRAINT chk_block_aligned_start CHECK (EXTRACT(MINUTE FROM start_at) IN (0, 30)),
    CONSTRAINT chk_block_aligned_end CHECK (EXTRACT(MINUTE FROM end_at) IN (0, 30))
);

-- Indexes for performance
CREATE INDEX idx_blocks_number ON blocks(block_number);
CREATE INDEX idx_blocks_status ON blocks(status);
CREATE INDEX idx_blocks_start_at ON blocks(start_at);
CREATE INDEX idx_blocks_time_range ON blocks(start_at, end_at);

-- Partial index for active blocks (used in collision queries)
CREATE INDEX idx_blocks_active ON blocks(start_at, end_at) WHERE status = 'ACTIVE';

-- Comments
COMMENT ON TABLE blocks IS 'Schedule blocks for holidays, personal days, etc. Separate from bookings.';
COMMENT ON COLUMN blocks.block_number IS 'Human-readable reference (BLOCK-{ULID})';
COMMENT ON COLUMN blocks.reason IS 'Reason for blocking (e.g., "Feriado", "Vacaciones")';
COMMENT ON COLUMN blocks.start_at IS 'Block start time with timezone (TIMESTAMPTZ)';
COMMENT ON COLUMN blocks.end_at IS 'Block end time with timezone (TIMESTAMPTZ)';

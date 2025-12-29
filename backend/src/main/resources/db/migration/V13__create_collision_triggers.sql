-- V13: Create triggers for collision detection (concurrency safety)
-- This ensures no double-booking even under concurrent requests

-- Create a lock table for serializing collision checks
CREATE TABLE agenda_lock (
    id INTEGER PRIMARY KEY DEFAULT 1,
    CONSTRAINT single_row CHECK (id = 1)
);
INSERT INTO agenda_lock (id) VALUES (1);

-- Function to check booking collision
CREATE OR REPLACE FUNCTION check_booking_collision()
RETURNS TRIGGER AS $$
DECLARE
    new_end_at TIMESTAMPTZ;
    collision_count INTEGER;
BEGIN
    -- Only check for bookings that "occupy" time (PENDING or CONFIRMED)
    IF NEW.status NOT IN ('PENDING', 'CONFIRMED') THEN
        RETURN NEW;
    END IF;

    -- Calculate end time
    new_end_at := NEW.start_at + (NEW.duration_minutes * INTERVAL '1 minute');

    -- Acquire advisory lock for serialization (prevents race conditions)
    PERFORM pg_advisory_xact_lock(hashtext('agenda_collision'));

    -- Check collision with other bookings that occupy time
    SELECT COUNT(*) INTO collision_count
    FROM bookings b
    WHERE b.status IN ('PENDING', 'CONFIRMED')
      AND b.id IS DISTINCT FROM NEW.id  -- Exclude self (for updates/reschedule)
      AND b.start_at < new_end_at
      AND (b.start_at + (b.duration_minutes * INTERVAL '1 minute')) > NEW.start_at;

    IF collision_count > 0 THEN
        RAISE EXCEPTION 'slot_occupied: Time slot conflicts with existing booking'
            USING ERRCODE = '23P01';  -- exclusion_violation
    END IF;

    -- Check collision with active blocks
    SELECT COUNT(*) INTO collision_count
    FROM blocks bl
    WHERE bl.status = 'ACTIVE'
      AND bl.start_at < new_end_at
      AND bl.end_at > NEW.start_at;

    IF collision_count > 0 THEN
        RAISE EXCEPTION 'slot_occupied: Time slot conflicts with existing block'
            USING ERRCODE = '23P01';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check block collision
CREATE OR REPLACE FUNCTION check_block_collision()
RETURNS TRIGGER AS $$
DECLARE
    collision_count INTEGER;
BEGIN
    -- Only check for ACTIVE blocks
    IF NEW.status != 'ACTIVE' THEN
        RETURN NEW;
    END IF;

    -- Acquire advisory lock for serialization
    PERFORM pg_advisory_xact_lock(hashtext('agenda_collision'));

    -- Check collision with bookings that occupy time
    SELECT COUNT(*) INTO collision_count
    FROM bookings b
    WHERE b.status IN ('PENDING', 'CONFIRMED')
      AND b.start_at < NEW.end_at
      AND (b.start_at + (b.duration_minutes * INTERVAL '1 minute')) > NEW.start_at;

    IF collision_count > 0 THEN
        RAISE EXCEPTION 'slot_occupied: Block conflicts with existing booking'
            USING ERRCODE = '23P01';
    END IF;

    -- Check collision with other active blocks
    SELECT COUNT(*) INTO collision_count
    FROM blocks bl
    WHERE bl.status = 'ACTIVE'
      AND bl.id IS DISTINCT FROM NEW.id  -- Exclude self (for updates)
      AND bl.start_at < NEW.end_at
      AND bl.end_at > NEW.start_at;

    IF collision_count > 0 THEN
        RAISE EXCEPTION 'slot_occupied: Block conflicts with existing block'
            USING ERRCODE = '23P01';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trg_check_booking_collision
    BEFORE INSERT OR UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION check_booking_collision();

CREATE TRIGGER trg_check_block_collision
    BEFORE INSERT OR UPDATE ON blocks
    FOR EACH ROW
    EXECUTE FUNCTION check_block_collision();

-- Drop the old unique index that was per-service (we use global collision now)
DROP INDEX IF EXISTS idx_bookings_unique_slot;

-- Comments
COMMENT ON FUNCTION check_booking_collision() IS 'Trigger function to prevent booking collisions (double-booking). Uses advisory lock for concurrency safety.';
COMMENT ON FUNCTION check_block_collision() IS 'Trigger function to prevent block collisions. Uses advisory lock for concurrency safety.';

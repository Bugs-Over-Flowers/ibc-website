-- Migration to auto-update Event availableSlots when registrations are created/deleted
-- This subtracts the total numberOfParticipants from maxGuest to get remaining availableSlots

-- 1. Create Trigger Function to update Event availableSlots
CREATE OR REPLACE FUNCTION public.update_event_available_slots_trigger()
RETURNS TRIGGER AS $$
DECLARE
    v_event_id UUID;
    v_total_participants BIGINT;
    v_max_guest INTEGER;
BEGIN
    -- Determine which event was affected
    IF (TG_OP = 'DELETE') THEN
        v_event_id := OLD."eventId";
    ELSE
        v_event_id := NEW."eventId";
    END IF;

    -- Get total participants for this event across all registrations
    SELECT COALESCE(SUM("numberOfParticipants"), 0)
    INTO v_total_participants
    FROM "Registration"
    WHERE "eventId" = v_event_id;

    -- Get maxGuest for this event
    SELECT COALESCE("maxGuest", 0)
    INTO v_max_guest
    FROM "Event"
    WHERE "eventId" = v_event_id;

    -- Update availableSlots: maxGuest - total participants, ensuring it doesn't go below 0
    UPDATE "Event"
    SET "availableSlots" = GREATEST(0, v_max_guest - v_total_participants)
    WHERE "eventId" = v_event_id;

    -- Return appropriate record
    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create Trigger on Registration table
-- This fires when numberOfParticipants changes (updated by the existing participant trigger)
-- or when a registration is deleted
DROP TRIGGER IF EXISTS tr_update_event_available_slots ON "public"."Registration";
CREATE TRIGGER tr_update_event_available_slots
AFTER INSERT OR UPDATE OF "numberOfParticipants" OR DELETE ON "public"."Registration"
FOR EACH ROW
EXECUTE FUNCTION public.update_event_available_slots_trigger();

-- 3. Backfill existing events: calculate current availableSlots based on existing registrations
UPDATE "public"."Event" e
SET "availableSlots" = e."maxGuest" - COALESCE(
    (SELECT SUM(r."numberOfParticipants")
     FROM "public"."Registration" r
     WHERE r."eventId" = e."eventId"),
    0
);

-- 4. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.update_event_available_slots_trigger() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_event_available_slots_trigger() TO service_role;

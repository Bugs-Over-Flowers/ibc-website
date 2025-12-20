-- 1. Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_event_days()
RETURNS TRIGGER AS $$
DECLARE
  day_date DATE;
  day_label TEXT;
BEGIN
  -- Case 1: Event type changed to null (draft)
  IF (NEW."eventType" IS NULL) THEN
    DELETE FROM public."EventDay" WHERE "eventId" = NEW."eventId";
    RETURN NEW;
  END IF;

  -- Case 2: Event is inserted or updated with eventType = 'public' or 'private'
  IF (NEW."eventType" IN ('public', 'private')) THEN
    
    -- 1. Delete days that are outside the new range
    DELETE FROM public."EventDay"
    WHERE "eventId" = NEW."eventId"
    AND ("eventDate" < NEW."eventStartDate" OR "eventDate" > NEW."eventEndDate");

    -- 2. Insert missing days
    day_date := NEW."eventStartDate";
    WHILE day_date <= NEW."eventEndDate" LOOP
      -- Check if exists
      IF NOT EXISTS (
        SELECT 1 FROM public."EventDay" 
        WHERE "eventId" = NEW."eventId" AND "eventDate" = day_date
      ) THEN
        -- Generate label (e.g., "Day 1")
        day_label := 'Day ' || (day_date - NEW."eventStartDate" + 1)::TEXT;
        
        INSERT INTO public."EventDay" ("eventId", "eventDate", "label")
        VALUES (NEW."eventId", day_date, day_label);
      END IF;
      
      day_date := day_date + 1;
    END LOOP;

    -- 3. Update labels for existing rows to ensure they match the new start date sequence
    -- This ensures that if start date shifts, "Day 1" is always the first day.
    UPDATE public."EventDay"
    SET label = 'Day ' || ("eventDate" - NEW."eventStartDate" + 1)::TEXT
    WHERE "eventId" = NEW."eventId";
    
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create the trigger
DROP TRIGGER IF EXISTS on_event_change ON public."Event";
CREATE TRIGGER on_event_change
AFTER INSERT OR UPDATE ON public."Event"
FOR EACH ROW
EXECUTE FUNCTION public.handle_event_days();

-- 3. Add unique constraint
ALTER TABLE public."EventDay" 
ADD CONSTRAINT "EventDay_eventId_eventDate_key" UNIQUE ("eventId", "eventDate");

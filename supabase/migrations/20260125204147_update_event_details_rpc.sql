set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_event_status(p_event_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
  total_regs bigint := 0;
  verified_regs bigint := 0;
  pending_regs bigint := 0;
  participants_total bigint := 0;
  attended_total bigint := 0;
  day_rec record;
  days_arr jsonb := '[]'::jsonb;
  day_obj jsonb;
  participants_day bigint;
  attended_day bigint;
  has_event_days boolean;
BEGIN
  -- Overall registration counts
  SELECT COUNT(*) INTO total_regs 
  FROM "Registration" r 
  WHERE r."eventId" = p_event_id;

  SELECT COUNT(*) INTO verified_regs 
  FROM "Registration" r 
  WHERE r."eventId" = p_event_id 
    AND lower(coalesce(r."paymentStatus"::text, '')) = 'verified';

  SELECT COUNT(*) INTO pending_regs 
  FROM "Registration" r 
  WHERE r."eventId" = p_event_id 
    AND lower(coalesce(r."paymentStatus"::text, '')) = 'pending';

  -- Total participants registered for this event
  SELECT COUNT(DISTINCT p."participantId") INTO participants_total
  FROM "Participant" p
  JOIN "Registration" r ON p."registrationId" = r."registrationId"
  WHERE r."eventId" = p_event_id;

  -- Total unique participants who attended at least one day (have a check-in record)
  SELECT COUNT(DISTINCT ci."participantId") INTO attended_total
  FROM "CheckIn" ci
  JOIN "Participant" p ON p."participantId" = ci."participantId"
  JOIN "Registration" r ON r."registrationId" = p."registrationId"
  WHERE r."eventId" = p_event_id;

  -- Check if explicit event_days exist for this event
  SELECT EXISTS(SELECT 1 FROM "EventDay" ed WHERE ed."eventId" = p_event_id) INTO has_event_days;

  IF has_event_days THEN
    FOR day_rec IN
      SELECT ed."eventDayId" AS day_id, ed."label" AS day_label, ed."dayDate" AS day_date
      FROM "EventDay" ed
      WHERE ed."eventId" = p_event_id
      ORDER BY ed."dayDate", ed."eventDayId"
    LOOP
      -- Participants who checked in on this day
      SELECT COUNT(DISTINCT ci."participantId") INTO participants_day
      FROM "CheckIn" ci
      JOIN "Participant" p ON p."participantId" = ci."participantId"
      JOIN "Registration" r ON r."registrationId" = p."registrationId"
      WHERE r."eventId" = p_event_id 
        AND ci."eventDayId" = day_rec.day_id;

      -- For attended, we count the same as participants_day since CheckIn means attended
      attended_day := participants_day;

      day_obj := jsonb_build_object(
        'day_id', day_rec.day_id,
        'day_label', coalesce(day_rec.day_label, to_char(day_rec.day_date, 'YYYY-MM-DD')),
        'day_date', day_rec.day_date,
        'participants', coalesce(participants_day, 0),
        'attended', coalesce(attended_day, 0)
      );

      days_arr := days_arr || jsonb_build_array(day_obj);
    END LOOP;
  ELSE
    -- Fallback: aggregate by CheckIn date when no EventDay rows exist
    FOR day_rec IN
      SELECT (ci."date"::date) AS day_date
      FROM "CheckIn" ci
      JOIN "Participant" p ON p."participantId" = ci."participantId"
      JOIN "Registration" r ON r."registrationId" = p."registrationId"
      WHERE r."eventId" = p_event_id
      GROUP BY ci."date"::date
      ORDER BY ci."date"::date
    LOOP
      SELECT COUNT(DISTINCT ci."participantId") INTO participants_day
      FROM "CheckIn" ci
      JOIN "Participant" p ON p."participantId" = ci."participantId"
      JOIN "Registration" r ON r."registrationId" = p."registrationId"
      WHERE r."eventId" = p_event_id 
        AND ci."date"::date = day_rec.day_date;

      attended_day := participants_day;

      day_obj := jsonb_build_object(
        'day_id', null,
        'day_label', to_char(day_rec.day_date, 'YYYY-MM-DD'),
        'day_date', day_rec.day_date,
        'participants', coalesce(participants_day, 0),
        'attended', coalesce(attended_day, 0)
      );

      days_arr := days_arr || jsonb_build_array(day_obj);
    END LOOP;
  END IF;

  RETURN jsonb_build_object(
    'event_id', p_event_id::text,
    'total_registrations', coalesce(total_regs, 0),
    'verified_registrations', coalesce(verified_regs, 0),
    'pending_registrations', coalesce(pending_regs, 0),
    'participants', coalesce(participants_total, 0),
    'attended', coalesce(attended_total, 0),
    'event_days', days_arr
  );
END;
$function$
;



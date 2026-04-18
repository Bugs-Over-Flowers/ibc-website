CREATE OR REPLACE FUNCTION "public"."get_event_status"("p_event_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE
    AS $$
DECLARE
  total_regs bigint := 0;
  verified_regs bigint := 0;
  pending_regs bigint := 0;
  participants_total bigint := 0;
  attended_total bigint := 0;
  days_arr jsonb := '[]'::jsonb;
  has_event_days boolean;
BEGIN
  SELECT
    COUNT(*)::bigint,
    COUNT(*) FILTER (
      WHERE r."paymentProofStatus" = 'accepted'::"PaymentProofStatus"
    )::bigint,
    COUNT(*) FILTER (
      WHERE r."paymentProofStatus" = 'pending'::"PaymentProofStatus"
    )::bigint
  INTO total_regs, verified_regs, pending_regs
  FROM "Registration" r
  WHERE r."eventId" = p_event_id;

  SELECT COUNT(DISTINCT p."participantId") INTO participants_total
  FROM "Participant" p
  JOIN "Registration" r ON r."registrationId" = p."registrationId"
  WHERE r."eventId" = p_event_id
    AND r."paymentProofStatus" = 'accepted'::"PaymentProofStatus";

  SELECT COUNT(DISTINCT ci."participantId") INTO attended_total
  FROM "CheckIn" ci
  JOIN "Participant" p ON p."participantId" = ci."participantId"
  JOIN "Registration" r ON r."registrationId" = p."registrationId"
  WHERE r."eventId" = p_event_id
    AND r."paymentProofStatus" = 'accepted'::"PaymentProofStatus";

  SELECT EXISTS(SELECT 1 FROM "EventDay" ed WHERE ed."eventId" = p_event_id)
  INTO has_event_days;

  IF has_event_days THEN
    WITH accepted_checkins AS (
      SELECT
        ci."eventDayId",
        ci."participantId"
      FROM "CheckIn" ci
      JOIN "Participant" p ON p."participantId" = ci."participantId"
      JOIN "Registration" r ON r."registrationId" = p."registrationId"
      WHERE r."eventId" = p_event_id
        AND r."paymentProofStatus" = 'accepted'::"PaymentProofStatus"
    ),
    day_counts AS (
      SELECT
        ed."eventDayId" AS day_id,
        ed."label" AS day_label,
        ed."eventDate" AS day_date,
        COUNT(DISTINCT ac."participantId") AS participants
      FROM "EventDay" ed
      LEFT JOIN accepted_checkins ac ON ac."eventDayId" = ed."eventDayId"
      WHERE ed."eventId" = p_event_id
      GROUP BY ed."eventDayId", ed."label", ed."eventDate"
    )
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'day_id', day_id,
          'day_label', coalesce(day_label, to_char(day_date, 'YYYY-MM-DD')),
          'day_date', day_date,
          'participants', participants,
          'attended', participants
        )
        ORDER BY day_date, day_id
      ),
      '[]'::jsonb
    ) INTO days_arr
    FROM day_counts;
  ELSE
    WITH accepted_checkins AS (
      SELECT
        ci."date"::date AS day_date,
        ci."participantId"
      FROM "CheckIn" ci
      JOIN "Participant" p ON p."participantId" = ci."participantId"
      JOIN "Registration" r ON r."registrationId" = p."registrationId"
      WHERE r."eventId" = p_event_id
        AND r."paymentProofStatus" = 'accepted'::"PaymentProofStatus"
    ),
    day_counts AS (
      SELECT
        day_date,
        COUNT(DISTINCT "participantId") AS participants
      FROM accepted_checkins
      GROUP BY day_date
    )
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'day_id', null,
          'day_label', to_char(day_date, 'YYYY-MM-DD'),
          'day_date', day_date,
          'participants', participants,
          'attended', participants
        )
        ORDER BY day_date
      ),
      '[]'::jsonb
    ) INTO days_arr
    FROM day_counts;
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
$$;

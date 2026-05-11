ALTER TYPE "public"."participant_list_item"
  ADD ATTRIBUTE "payment_proof_status" "text";

CREATE OR REPLACE FUNCTION "public"."get_event_participant_list"("p_event_id" "uuid", "p_search_text" "text" DEFAULT NULL::"text") RETURNS SETOF "public"."participant_list_item"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
DECLARE
  v_search_pattern TEXT;
BEGIN
  PERFORM set_limit(0.3);

  IF p_search_text IS NOT NULL THEN
    v_search_pattern := '%' || p_search_text || '%';
  END IF;

  RETURN QUERY
  SELECT
    p."participantId",
    p."firstName",
    p."lastName",
    p."email",
    p."contactNumber",
    COALESCE(bm."businessName", r."nonMemberName") AS "affiliation",
    r."registrationDate",
    r."registrationId",
    p."participantIdentifier",
    r."paymentProofStatus"::text AS "payment_proof_status"
  FROM "Participant" p
  JOIN "Registration" r ON p."registrationId" = r."registrationId"
  LEFT JOIN "BusinessMember" bm ON r."businessMemberId" = bm."businessMemberId"
  WHERE r."eventId" = p_event_id
    AND (
      p_search_text IS NULL
      OR p_search_text = ''
      OR (p."firstName" % p_search_text OR p."firstName" ILIKE v_search_pattern)
      OR (p."lastName" % p_search_text OR p."lastName" ILIKE v_search_pattern)
      OR ((p."firstName" || ' ' || p."lastName") % p_search_text OR (p."firstName" || ' ' || p."lastName") ILIKE v_search_pattern)
      OR (p.email <% p_search_text OR p.email ILIKE v_search_pattern)
      OR (COALESCE(bm."businessName", r."nonMemberName") <% p_search_text OR COALESCE(bm."businessName", r."nonMemberName") ILIKE v_search_pattern)
    )
  ORDER BY
    CASE WHEN p_search_text IS NOT NULL AND p_search_text <> '' THEN
      CASE
        WHEN (
          p."firstName" ILIKE v_search_pattern
          OR p."lastName" ILIKE v_search_pattern
          OR (p."firstName" || ' ' || p."lastName") ILIKE v_search_pattern
          OR p."email" ILIKE v_search_pattern
          OR COALESCE(bm."businessName", r."nonMemberName") ILIKE v_search_pattern
        ) THEN 1
        ELSE 0
      END
    ELSE 0 END DESC,
    CASE WHEN p_search_text IS NOT NULL AND p_search_text <> '' THEN
      GREATEST(
        similarity(p."firstName", p_search_text),
        similarity(p."lastName", p_search_text),
        similarity(p."firstName" || ' ' || p."lastName", p_search_text),
        similarity(p."email", p_search_text),
        similarity(COALESCE(bm."businessName", r."nonMemberName"), p_search_text)
      )
    ELSE 0 END DESC,
    r."registrationDate" DESC;
END;
$$;

-- Update get_registration_list_stats to count all participants regardless of payment status
CREATE OR REPLACE FUNCTION "public"."get_registration_list_stats"("p_event_id" "uuid") RETURNS "public"."registration_stats"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
DECLARE
  v_result registration_stats;
BEGIN
  SELECT
    COUNT(DISTINCT r."registrationId")::INTEGER AS "totalRegistrations",
    COUNT(DISTINCT r."registrationId") FILTER (WHERE r."paymentProofStatus" = 'accepted')::INTEGER AS "verifiedRegistrations",
    COUNT(DISTINCT r."registrationId") FILTER (WHERE r."paymentProofStatus" = 'pending')::INTEGER AS "pendingRegistrations",
    COUNT(p."participantId")::INTEGER AS "totalParticipants"
  INTO v_result
  FROM "Registration" r
  LEFT JOIN "Participant" p ON r."registrationId" = p."registrationId"
  WHERE r."eventId" = p_event_id;

  RETURN v_result;
END;
$$;

-- Update get_event_status to count all participants regardless of payment status
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
  WHERE r."eventId" = p_event_id;

  SELECT COUNT(DISTINCT ci."participantId") INTO attended_total
  FROM "CheckIn" ci
  JOIN "Participant" p ON p."participantId" = ci."participantId"
  JOIN "Registration" r ON r."registrationId" = p."registrationId"
  WHERE r."eventId" = p_event_id;

  SELECT EXISTS(SELECT 1 FROM "EventDay" ed WHERE ed."eventId" = p_event_id)
  INTO has_event_days;

  IF has_event_days THEN
    WITH all_checkins AS (
      SELECT
        ci."eventDayId",
        ci."participantId"
      FROM "CheckIn" ci
      JOIN "Participant" p ON p."participantId" = ci."participantId"
      JOIN "Registration" r ON r."registrationId" = p."registrationId"
      WHERE r."eventId" = p_event_id
    ),
    day_counts AS (
      SELECT
        ed."eventDayId" AS day_id,
        ed."label" AS day_label,
        ed."eventDate" AS day_date,
        COUNT(DISTINCT ac."participantId") AS participants
      FROM "EventDay" ed
      LEFT JOIN all_checkins ac ON ac."eventDayId" = ed."eventDayId"
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
    WITH all_checkins AS (
      SELECT
        ci."checkInTime"::date AS day_date,
        ci."participantId"
      FROM "CheckIn" ci
      JOIN "Participant" p ON p."participantId" = ci."participantId"
      JOIN "Registration" r ON r."registrationId" = p."registrationId"
      WHERE r."eventId" = p_event_id
    ),
    day_counts AS (
      SELECT
        day_date,
        COUNT(DISTINCT "participantId") AS participants
      FROM all_checkins
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

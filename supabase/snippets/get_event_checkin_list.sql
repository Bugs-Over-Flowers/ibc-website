CREATE OR REPLACE FUNCTION get_event_checkin_list(p_event_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
WITH relevant_days as (
  SELECT "eventDayId", "eventDate", label
  from "EventDay"
  where "eventId" = p_event_id
),
expected_participants AS (
  SELECT COUNT(p."participantId") as total
  FROM "Participant" p
  JOIN "Registration" r ON p."registrationId" = r."registrationId"
  WHERE r."eventId" = p_event_id
)
SELECT jsonb_build_object(
  'stats', (
    jsonb_build_object(
      'totalExpectedParticipants', (SELECT total from expected_participants)
    )
  ),
  'eventDays', (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'eventDayId', rd."eventDayId",
          'eventDate', rd."eventDate",
          'label', rd.label
        )
        ORDER BY rd."eventDate"
      ),
      '[]'::jsonb
    )
    FROM relevant_days rd
  ),
  'checkIns', (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'checkInId', c."checkInId",
          'participantId', p."participantId",
          'firstName', p."firstName",
          'lastName', p."lastName",
          'email', p.email,
          'contactNumber', p."contactNumber",
          'eventDayId', c."eventDayId",
          'checkedInAt', c.date,
          'registrationId', p."registrationId",
          'affiliation', COALESCE(bm."businessName", r."nonMemberName")
        )
        ORDER BY c.date asc
      ),
      '[]'::jsonb
    )
    FROM "CheckIn" c
    JOIN "Participant" p ON p."participantId" = c."participantId"
    join relevant_days rd on rd."eventDayId" = c."eventDayId"
    left join "Registration" r on r."registrationId" = p."registrationId"
    left join "BusinessMember" bm on bm."businessMemberId" = r."businessMemberId"
  )
);
$$;

drop function if exists get_registration_list_stats(uuid);
drop type if exists registration_stats cascade;

create type registration_stats as (
  "totalRegistrations" integer,
  "verifiedRegistrations" integer,
  "pendingRegistrations" integer,
  "totalParticipants" integer
);


create or replace function get_registration_list_stats (
  p_event_id UUID
) RETURNS registration_stats LANGUAGE plpgsql STABLE SECURITY DEFINER as $$
DECLARE
    v_result registration_stats;
BEGIN

    -- Run the query
    SELECT
        COUNT(distinct r."registrationId")::INTEGER AS "totalRegistrations",
        COUNT(distinct r."registrationId") FILTER (WHERE r."paymentStatus" = 'verified')::INTEGER AS "verifiedRegistrations",
        COUNT(distinct r."registrationId") FILTER (WHERE r."paymentStatus" = 'pending')::INTEGER AS "pendingRegistrations",
        COUNT(p."participantId") FILTER (where r."paymentStatus" = 'verified')::INTEGER as "totalParticipants"
    INTO v_result
    FROM "Registration" r

    -- Left Join Participants
    LEFT JOIN "Participant" p On r."registrationId" = p."registrationId"

    WHERE r."eventId" = p_event_id;

    RETURN v_result;
END;
$$;

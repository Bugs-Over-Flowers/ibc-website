-- Drop the old version first to avoid argument mismatch errors
-- drop type IF exists registration_list_item cascade;

create type registration_list_item as (
  registration_id UUID,
  affiliation TEXT,
  registration_date timestamp with time zone,
  payment_status "PaymentStatus",
  payment_method "PaymentMethod",
  business_member_id UUID,
  business_name TEXT,
  is_member BOOLEAN,
  registrant JSONB,
  people INTEGER,
  registration_identifier TEXT
);

create or replace function get_registration_list (
  p_event_id UUID,
  p_search_text TEXT default null,
  p_payment_status "PaymentStatus" default null
) RETURNS SETOF registration_list_item LANGUAGE plpgsql STABLE SECURITY DEFINER as $$
declare
  v_search_pattern TEXT;
BEGIN
    -- 1. Set the fuzzy search threshold for this execution
    PERFORM set_limit(0.3);

    -- 2. Prepare the search pattern for ILIKE (surround with %)
    IF p_search_text IS NOT NULL THEN
        v_search_pattern := '%' || p_search_text || '%';
    END IF;

    RETURN QUERY
    SELECT
        r."registrationId",
        COALESCE(bm."businessName", r."nonMemberName") AS affiliation,
        r."registrationDate",
        r."paymentStatus",
        r."paymentMethod",
        bm."businessMemberId",
        bm."businessName",
        (bm."businessMemberId" IS NOT NULL) AS is_member,
        CASE
            WHEN p_data.principal_id IS NOT NULL THEN
                jsonb_build_object(
                    'firstName', p_data.p_first_name,
                    'lastName', p_data.p_last_name,
                    'email', p_data.p_email
                )
            ELSE NULL
        END,
        COALESCE(p_data.total_people, 0)::INTEGER AS people,
        r."identifier"
        AS registrant

    FROM "Registration" r
    LEFT JOIN "BusinessMember" bm ON r."businessMemberId" = bm."businessMemberId"

    -- Join Principal Participant
    LEFT JOIN LATERAL (
        SELECT
            COUNT(*) as total_people,
            MAX(CASE WHEN sub_p."isPrincipal" THEN sub_p."participantId"::text END) as principal_id,
            MAX(CASE WHEN sub_p."isPrincipal" THEN sub_p."firstName" END) as p_first_name,
            MAX(CASE WHEN sub_p."isPrincipal" THEN sub_p."lastName" END) as p_last_name,
            MAX(CASE WHEN sub_p."isPrincipal" THEN sub_p.email END) as p_email
        FROM "Participant" sub_p
        WHERE sub_p."registrationId" = r."registrationId"
    ) p_data ON true

    LEFT JOIN LATERAL (
        SELECT
            COALESCE(bm."businessName", r."nonMemberName") as affiliation,

            -- Calculate Match Score (0 if no search text)
            CASE WHEN p_search_text IS NOT NULL THEN
                GREATEST(
                    similarity(COALESCE(bm."businessName", r."nonMemberName"), p_search_text),
                    similarity(p_data.p_first_name || ' ' || p_data.p_last_name, p_search_text)
                )
            ELSE 0 END as sim_score,

            -- Calculate Exact Match Boolean
            CASE WHEN p_search_text IS NOT NULL THEN
                (
                  COALESCE(bm."businessName", r."nonMemberName") ILIKE v_search_pattern
                  OR (p_data.p_first_name || ' ' || p_data.p_last_name) ILIKE v_search_pattern
                  OR p_data.p_email ILIKE v_search_pattern
                )
            ELSE FALSE END as is_exact_match
    ) s ON true

    WHERE r."eventId" = p_event_id
      -- Ensure affiliation exists
      and s.affiliation is not null

      -- *** Filter By Status Logic ***
      AND (
        p_payment_status IS null
        OR
        r."paymentStatus" = p_payment_status::"PaymentStatus"
      )

      -- *** SEARCH LOGIC HERE ***
      AND (
          p_search_text IS NULL   -- If no search term, return everything

          -- Matches either Business Name OR Non-Member Name
          or s.is_exact_match
          or s.sim_score > 0.3
      )

    -- *** SORTING LOGIC ***
    ORDER BY
        -- Sort using the pre-calculated values (Super fast)
        CASE WHEN p_search_text IS NOT NULL THEN s.is_exact_match ELSE FALSE END DESC,
        CASE WHEN p_search_text IS NOT NULL THEN s.sim_score ELSE 0 END DESC,
        r."registrationDate" DESC;
END;
$$;

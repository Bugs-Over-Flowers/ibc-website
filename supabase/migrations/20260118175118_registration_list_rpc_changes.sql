drop type "public"."participant_list_item" cascade;

drop type "public"."registration_list_item" cascade;

set check_function_bodies = off;

create type "public"."participant_list_item" as ("participant_id" uuid, "first_name" text, "last_name" text, "email" text, "contact_number" text, "affiliation" text, "registration_date" timestamp with time zone, "registration_id" uuid);

create type "public"."registration_list_item" as ("registration_id" uuid, "affiliation" text, "registration_date" timestamp with time zone, "payment_status" public."PaymentStatus", "payment_method" public."PaymentMethod", "business_member_id" uuid, "business_name" text, "is_member" boolean, "registrant" jsonb, "people" integer, "registration_identifier" text);



CREATE OR REPLACE FUNCTION public.get_event_participant_list(p_event_id uuid, p_search_text text DEFAULT NULL::text)
 RETURNS SETOF public.participant_list_item
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
declare
  v_search_pattern TEXT;
BEGIN

    -- 1. Set the fuzzy search threshold for this execution
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
    -- COALESCE determines the company name:
    -- It prioritizes the linked Business Member name; if null, falls back to nonMemberName
    COALESCE(bm."businessName", r."nonMemberName") AS "affiliation",
    r."registrationDate",
    r."registrationId"
  FROM
    "Participant" p

  -- Select the registration
  JOIN
    "Registration" r ON p."registrationId" = r."registrationId"

  -- Check the affiliation
  LEFT JOIN
    "BusinessMember" bm ON r."businessMemberId" = bm."businessMemberId"

  -- Filter the event that is needed
  WHERE
    r."eventId" = p_event_id
    -- 1. Payment Status is verified
    AND r."paymentStatus" = 'verified'::"PaymentStatus"
    -- 2. Filter by Search Text (if provided) across Name, Email, or Company
    AND (
      -- return everything if no search text or empty
      p_search_text IS NULL
      OR p_search_text = ''

      -- filter by data: firstname, lastname, email, or affiliation
      OR (p."firstName" % p_search_text or p."firstName" ilike v_search_pattern)
      OR (p."lastName" % p_search_text or p."lastName" ilike v_search_pattern)
      OR (
        (p."firstName" || ' ' || p."lastName") % p_search_text
        or (p."firstName" || ' ' || p."lastName") ilike v_search_pattern)
      OR (p.email <% p_search_text OR p.email ilike v_search_pattern)
      OR (COALESCE(bm."businessName", r."nonMemberName") <% p_search_text OR COALESCE(bm."businessName", r."nonMemberName") ilike v_search_pattern)
    )

    ORDER BY

    CASE WHEN p_search_text IS NOT NULL AND p_search_text <> '' THEN
        -- *** PRIORITY 1: Exact Substring Matches ***
        -- If the text physically exists inside the string, bring it to the top.
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
        -- *** PRIORITY 2: Fuzzy Similarity Score ***
        -- If it wasn't an exact match, sort by how close the typo is.
        GREATEST(
          similarity(p."firstName", p_search_text),
          similarity(p."lastName", p_search_text),
          similarity(p."firstName" || ' ' || p."lastName", p_search_text),
          similarity(p."email", p_search_text),
          similarity(COALESCE(bm."businessName", r."nonMemberName"), p_search_text)
        )
      ELSE 0
    END DESC,
    -- Secondary Sort: Date (Newest first)
    r."registrationDate" DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_registration_list(p_event_id uuid, p_search_text text DEFAULT NULL::text, p_payment_status public."PaymentStatus" DEFAULT NULL::public."PaymentStatus")
 RETURNS SETOF public.registration_list_item
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
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
$function$
;

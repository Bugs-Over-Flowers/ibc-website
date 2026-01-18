-- drop function if exists get_event_participant_list(uuid, text, text);

-- drop type IF exists participant_list_item cascade;

create type participant_list_item as (
  participant_id UUID,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  contact_number TEXT,
  affiliation TEXT,
  registration_date TIMESTAMP with time zone,
  registration_id UUID
);

create or replace function get_event_participant_list (
  p_event_id UUID,
  p_search_text TEXT default null
) RETURNS SETOF participant_list_item LANGUAGE plpgsql STABLE SECURITY DEFINER as $$
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
$$;

select * from get_event_participant_list('2132acac-0d8f-4cba-97d4-a96bb52aa4c5')

CREATE OR REPLACE FUNCTION public.process_membership_statuses(p_reference_time timestamp with time zone DEFAULT NOW())
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    current_year_start date;
    next_year_start date;
BEGIN
    current_year_start := DATE_TRUNC('year', p_reference_time)::date;
    next_year_start := (current_year_start + INTERVAL '1 year')::date;

    -- Step 1: cancel members who were already unpaid and are now expired.
    UPDATE "BusinessMember"
    SET "membershipStatus" = 'cancelled'
    WHERE "membershipExpiryDate" IS NOT NULL
      AND "membershipExpiryDate" < p_reference_time
      AND "membershipStatus" = 'unpaid';

    -- Step 2: expired paid members enter grace period until next Jan 1.
    UPDATE "BusinessMember"
    SET "membershipStatus" = 'unpaid',
        "membershipExpiryDate" = next_year_start
    WHERE "membershipExpiryDate" IS NOT NULL
      AND "membershipExpiryDate" < p_reference_time
      AND "membershipStatus" = 'paid';
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_membership_expiry()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM public.process_membership_statuses(NOW());
END;
$function$;

CREATE OR REPLACE FUNCTION public.january_first_reset()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Use Jan 1 of the current year to support deterministic annual reset logic.
    PERFORM public.process_membership_statuses(DATE_TRUNC('year', NOW()));
END;
$function$;

GRANT ALL ON FUNCTION public.process_membership_statuses(timestamp with time zone) TO anon;
GRANT ALL ON FUNCTION public.process_membership_statuses(timestamp with time zone) TO authenticated;
GRANT ALL ON FUNCTION public.process_membership_statuses(timestamp with time zone) TO service_role;
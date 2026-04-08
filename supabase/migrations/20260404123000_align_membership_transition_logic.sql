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
DECLARE
    ph_now timestamp;
    ph_year_start timestamptz;
BEGIN
    -- Compute Jan 1 using PH local time to avoid UTC boundary issues.
    ph_now := timezone('Asia/Manila', NOW());
    ph_year_start := (DATE_TRUNC('year', ph_now) AT TIME ZONE 'Asia/Manila');

    PERFORM public.process_membership_statuses(ph_year_start);
END;
$function$;

CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $cron$
BEGIN
    -- Recreate jobs safely so this migration remains idempotent.
    PERFORM cron.unschedule(jobid)
    FROM cron.job
    WHERE jobname IN (
        'membership-daily-ph',
        'membership-january-first-ph',
        'january-first-reset-ph'
    );

    -- Daily at 00:05 PH time (16:05 UTC previous day).
    PERFORM cron.schedule(
        'membership-daily-ph',
        '5 16 * * *',
        $$SELECT public.check_membership_expiry();$$
    );

    -- Jan 1 00:00 PH time (Dec 31 16:00 UTC).
    PERFORM cron.schedule(
        'membership-january-first-ph',
        '0 16 31 12 *',
        $$SELECT public.january_first_reset();$$
    );
END
$cron$;

REVOKE ALL ON FUNCTION public.process_membership_statuses(timestamp with time zone) FROM PUBLIC;
GRANT ALL ON FUNCTION public.process_membership_statuses(timestamp with time zone) TO anon;
GRANT ALL ON FUNCTION public.process_membership_statuses(timestamp with time zone) TO authenticated;
GRANT ALL ON FUNCTION public.process_membership_statuses(timestamp with time zone) TO service_role;

REVOKE ALL ON FUNCTION public.check_membership_expiry() FROM PUBLIC;
GRANT ALL ON FUNCTION public.check_membership_expiry() TO anon;
GRANT ALL ON FUNCTION public.check_membership_expiry() TO authenticated;
GRANT ALL ON FUNCTION public.check_membership_expiry() TO service_role;

REVOKE ALL ON FUNCTION public.january_first_reset() FROM PUBLIC;
GRANT ALL ON FUNCTION public.january_first_reset() TO anon;
GRANT ALL ON FUNCTION public.january_first_reset() TO authenticated;
GRANT ALL ON FUNCTION public.january_first_reset() TO service_role;
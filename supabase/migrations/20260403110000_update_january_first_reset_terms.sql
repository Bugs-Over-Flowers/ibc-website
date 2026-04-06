CREATE OR REPLACE FUNCTION public.january_first_reset()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    one_year_ago date;
BEGIN
    -- Function is intended to run on January 1st via scheduler.
    -- New status terms:
    -- paid (joined < 1 year) -> unpaid
    -- unpaid (joined > 1 year) -> cancelled
    one_year_ago := (NOW() - INTERVAL '1 year')::date;

    UPDATE "BusinessMember"
    SET "membershipStatus" =
        CASE
            WHEN "membershipStatus" = 'paid'::"MembershipStatus"
                 AND "joinDate"::date > one_year_ago
            THEN 'unpaid'::"MembershipStatus"
            WHEN "membershipStatus" = 'unpaid'::"MembershipStatus"
                 AND "joinDate"::date <= one_year_ago
            THEN 'cancelled'::"MembershipStatus"
            ELSE "membershipStatus"
        END
    WHERE "membershipStatus" IN ('paid'::"MembershipStatus", 'unpaid'::"MembershipStatus");
END;
$function$;

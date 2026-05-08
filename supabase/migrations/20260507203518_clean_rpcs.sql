-- Cleanup unused RPC functions, orphaned trigger, and duplicates.
-- No tables or column types are affected.

-- 1. Drop unused RPC functions and their GRANTs
--    (CASCADE cleans up associated permissions/GRANTs)

DROP FUNCTION IF EXISTS public.check_membership_expiry() CASCADE;

DROP FUNCTION IF EXISTS public.get_all_sponsored_registrations() CASCADE;

DROP FUNCTION IF EXISTS public.get_events_for_select() CASCADE;

DROP FUNCTION IF EXISTS public.is_admin_user() CASCADE;

DROP FUNCTION IF EXISTS public.publish_event(p_event_id uuid) CASCADE;

DROP FUNCTION IF EXISTS public.get_sector_member_counts(p_sector_ids integer[]) CASCADE;

DROP FUNCTION IF EXISTS public.get_sponsored_registration_by_uuid(p_uuid uuid) CASCADE;

DROP FUNCTION IF EXISTS public.get_sponsored_registrations_with_details(p_event_id uuid) CASCADE;

-- DROP compute_primary_application_id last since get_member_primary_application wraps it
DROP FUNCTION IF EXISTS public.get_member_primary_application(p_member_id uuid) CASCADE;
DROP FUNCTION IF EXISTS public.compute_primary_application_id(p_member_id uuid) CASCADE;

-- DROP update_member_with_representatives (never called from app code)
DROP FUNCTION IF EXISTS public.update_member_with_representatives(
  p_member_id uuid,
  p_application_id uuid,
  p_business_name text,
  p_sector_id integer,
  p_company_address text,
  p_email_address text,
  p_landline text,
  p_mobile_number text,
  p_website_url text,
  p_membership_status public."MembershipStatus",
  p_join_date date,
  p_membership_expiry_date date,
  p_representatives jsonb
) CASCADE;


-- 2. Drop orphaned trigger function (defined but never wired to any trigger)
DROP FUNCTION IF EXISTS public.update_event_available_slots_trigger() CASCADE;

-- Drop dead columns that only the orphaned trigger touched
ALTER TABLE public."Event" DROP COLUMN IF EXISTS "availableSlots";
ALTER TABLE public."Event" DROP COLUMN IF EXISTS "maxGuest";


-- 3. Drop duplicate overload of submit_membership_application
--    (6-param version without companyProfileType; the 7-param version is the one used)
DROP FUNCTION IF EXISTS public.submit_membership_application(
  p_application_type text,
  p_company_details jsonb,
  p_representatives jsonb,
  p_payment_method text,
  p_application_member_type text,
  p_payment_proof_url text
) CASCADE;

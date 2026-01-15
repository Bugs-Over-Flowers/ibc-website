alter table "public"."BusinessMember" add column "primaryApplicationId" uuid;

alter table "public"."Event" add column "maxGuest" bigint;

alter table "public"."CheckIn" drop column "date";

alter table "public"."CheckIn" add column "timestamp" timestamp with time zone not null;

alter table "public"."Event" alter column "eventEndDate" set data type timestamp with time zone using "eventEndDate"::timestamp with time zone;

alter table "public"."Event" alter column "eventStartDate" set data type timestamp with time zone using "eventStartDate"::timestamp with time zone;

alter table "public"."Event" alter column "publishedAt" set data type timestamp with time zone using "publishedAt"::timestamp with time zone;

alter table "public"."Event" alter column "updatedAt" set data type timestamp with time zone using "updatedAt"::timestamp with time zone;

alter table "public"."Registration" alter column "registrationDate" drop default;

alter table "public"."Registration" alter column "registrationDate" set data type timestamp with time zone using "registrationDate"::timestamp with time zone;

alter type "public"."registration_list_item" alter attribute "registration_date" set data type timestamp with time zone;

alter type "public"."participant_list_item" alter attribute "registration_date" set data type timestamp with time zone;

CREATE INDEX "BusinessMember_primaryApplicationId_idx" ON public."BusinessMember" USING btree ("primaryApplicationId");

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.compute_primary_application_id(p_member_id uuid)
 RETURNS uuid
 LANGUAGE sql
 STABLE
AS $function$
  SELECT a."applicationId"
  FROM public."Application" a
  WHERE a."memberId" = p_member_id
  ORDER BY 
    CASE a."applicationStatus"
      WHEN 'approved' THEN 3
      WHEN 'pending' THEN 2
      WHEN 'new' THEN 1
      ELSE 0
    END DESC,
    a."applicationDate" DESC
  LIMIT 1;
$function$
;

CREATE OR REPLACE FUNCTION public.get_member_primary_application(p_member_id uuid)
 RETURNS uuid
 LANGUAGE sql
 STABLE
AS $function$
  SELECT public.compute_primary_application_id(p_member_id);
$function$
;

CREATE OR REPLACE FUNCTION public.update_primary_application_for_member()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  affected_member uuid;
BEGIN
  -- Handle INSERT/UPDATE: NEW is available
  affected_member := COALESCE(NEW."memberId", OLD."memberId");

  -- If UPDATE changed the memberId, recompute for both old and new
  IF TG_OP = 'UPDATE' AND NEW."memberId" IS DISTINCT FROM OLD."memberId" THEN
    IF OLD."memberId" IS NOT NULL THEN
      UPDATE public."BusinessMember"
      SET "primaryApplicationId" = public.compute_primary_application_id(OLD."memberId")
      WHERE "businessMemberId" = OLD."memberId";
    END IF;
  END IF;

  IF affected_member IS NOT NULL THEN
    UPDATE public."BusinessMember"
    SET "primaryApplicationId" = public.compute_primary_application_id(affected_member)
    WHERE "businessMemberId" = affected_member;
  END IF;

  RETURN NULL; -- statement-level side-effect only
END;
$function$
;

CREATE TRIGGER on_application_sync_primary AFTER INSERT OR DELETE OR UPDATE ON public."Application" FOR EACH ROW EXECUTE FUNCTION public.update_primary_application_for_member();

alter table "public"."Application" drop constraint "Application_memberId_fkey";

alter table "public"."EvaluationForm" drop constraint "EvaluationForm_eventId_fkey";

alter table "public"."EvaluationForm" drop constraint "EvaluationForm_q1Rating_check";

alter table "public"."EvaluationForm" drop constraint "EvaluationForm_q2Rating_check";

alter table "public"."EvaluationForm" drop constraint "EvaluationForm_q3Rating_check";

alter table "public"."EvaluationForm" drop constraint "EvaluationForm_q4Rating_check";

alter table "public"."EvaluationForm" drop constraint "EvaluationForm_q5Rating_check";

alter table "public"."BusinessMember" alter column "membershipStatus" drop default;

alter type "public"."MembershipStatus" rename to "MembershipStatus__old_version_to_be_dropped";

create type "public"."MembershipStatus" as enum ('paid', 'unpaid', 'cancelled');

alter table "public"."BusinessMember" alter column "membershipStatus" type "public"."MembershipStatus" using "membershipStatus"::text::"public"."MembershipStatus";

alter table "public"."BusinessMember" alter column "membershipStatus" set default 'paid'::public."MembershipStatus";

drop type "public"."MembershipStatus__old_version_to_be_dropped";

alter table "public"."Application" drop column "memberId";

alter table "public"."Application" add column "businessMemberId" uuid;

alter table "public"."BusinessMember" alter column "membershipStatus" set default 'paid'::public."MembershipStatus";

alter table "public"."EvaluationForm" alter column "createdAt" set not null;

alter table "public"."EvaluationForm" alter column "q1Rating" set not null;

alter table "public"."EvaluationForm" alter column "q1Rating" set data type public."ratingScale" using "q1Rating"::text::public."ratingScale";

alter table "public"."EvaluationForm" alter column "q2Rating" set not null;

alter table "public"."EvaluationForm" alter column "q2Rating" set data type public."ratingScale" using "q2Rating"::text::public."ratingScale";

alter table "public"."EvaluationForm" alter column "q3Rating" set not null;

alter table "public"."EvaluationForm" alter column "q3Rating" set data type public."ratingScale" using "q3Rating"::text::public."ratingScale";

alter table "public"."EvaluationForm" alter column "q4Rating" set not null;

alter table "public"."EvaluationForm" alter column "q4Rating" set data type public."ratingScale" using "q4Rating"::text::public."ratingScale";

alter table "public"."EvaluationForm" alter column "q5Rating" set not null;

alter table "public"."EvaluationForm" alter column "q5Rating" set data type public."ratingScale" using "q5Rating"::text::public."ratingScale";

alter table "public"."EvaluationForm" alter column "q6Rating" set not null;

alter table "public"."EvaluationForm" alter column "q6Rating" set data type public."ratingScale" using "q6Rating"::text::public."ratingScale";

alter table "public"."Event" add column "availableSlots" bigint;

alter table "public"."Registration" add column "numberOfParticipants" bigint;

alter table "public"."Application" add constraint "Application_businessMemberId_fkey" FOREIGN KEY ("businessMemberId") REFERENCES public."BusinessMember"("businessMemberId") ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."Application" validate constraint "Application_businessMemberId_fkey";

alter table "public"."EvaluationForm" add constraint "evaluationform_eventid_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"("eventId") ON DELETE CASCADE not valid;

alter table "public"."EvaluationForm" validate constraint "evaluationform_eventid_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.delete_evaluation(eval_id uuid)
 RETURNS TABLE(success boolean, message text)
 LANGUAGE plpgsql
AS $function$
declare
  deleted_count int;
begin
  delete from "EvaluationForm"
  where "evaluationId" = eval_id;
  
  get diagnostics deleted_count = row_count;
  
  if deleted_count = 0 then
    return query select false, 'Evaluation not found'::text;
  else
    return query select true, 'Evaluation deleted successfully'::text;
  end if;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_all_evaluations()
 RETURNS TABLE(evaluation_id uuid, event_id uuid, event_title text, event_start_date timestamp with time zone, event_end_date timestamp with time zone, venue text, name text, q1_rating public."ratingScale", q2_rating public."ratingScale", q3_rating public."ratingScale", q4_rating public."ratingScale", q5_rating public."ratingScale", q6_rating public."ratingScale", additional_comments text, feedback text, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE
AS $function$
  select
    ef."evaluationId",
    e."eventId",
    e."eventTitle",
    e."eventStartDate",
    e."eventEndDate",
    e."venue",
    ef."name",
    ef."q1Rating",
    ef."q2Rating",
    ef."q3Rating",
    ef."q4Rating",
    ef."q5Rating",
    ef."q6Rating",
    ef."additionalComments",
    ef."feedback",
    ef."createdAt"
  from
    "EvaluationForm" ef
    left join "Event" e on ef."eventId" = e."eventId"
  order by
    ef."createdAt" desc;
$function$
;

CREATE OR REPLACE FUNCTION public.get_evaluation_by_id(eval_id uuid)
 RETURNS TABLE(evaluation_id uuid, event_id uuid, event_title text, event_start_date timestamp with time zone, event_end_date timestamp with time zone, venue text, name text, q1_rating public."ratingScale", q2_rating public."ratingScale", q3_rating public."ratingScale", q4_rating public."ratingScale", q5_rating public."ratingScale", q6_rating public."ratingScale", additional_comments text, feedback text, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE
AS $function$
  select
    ef."evaluationId",
    e."eventId",
    e."eventTitle",
    e."eventStartDate",
    e."eventEndDate",
    e."venue",
    ef."name",
    ef."q1Rating",
    ef."q2Rating",
    ef."q3Rating",
    ef."q4Rating",
    ef."q5Rating",
    ef."q6Rating",
    ef."additionalComments",
    ef."feedback",
    ef."createdAt"
  from
    "EvaluationForm" ef
    left join "Event" e on ef."eventId" = e."eventId"
  where
    ef."evaluationId" = eval_id;
$function$
;

CREATE OR REPLACE FUNCTION public.submit_evaluation_form(p_event_id uuid, p_name text, p_q1_rating public."ratingScale", p_q2_rating public."ratingScale", p_q3_rating public."ratingScale", p_q4_rating public."ratingScale", p_q5_rating public."ratingScale", p_q6_rating public."ratingScale", p_additional_comments text DEFAULT NULL::text, p_feedback text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_evaluation_id uuid;
  v_name text;
BEGIN

  -- 1. Validate Inputs
  IF p_event_id IS NULL THEN
    RAISE EXCEPTION 'Event ID is required.';
  END IF;

  v_name := COALESCE(NULLIF(TRIM(p_name), ''), 'Anonymous Participant');

  -- 2. Insert into "EvaluationForm" Table
  INSERT INTO "EvaluationForm" (
    "eventId",
    "name",
    "q1Rating",
    "q2Rating",
    "q3Rating",
    "q4Rating",
    "q5Rating",
    "q6Rating",
    "additionalComments",
    "feedback",
    "createdAt"
  ) VALUES (
    p_event_id,
    p_name,
    p_q1_rating,
    p_q2_rating,
    p_q3_rating,
    p_q4_rating,
    p_q5_rating,
    p_q6_rating,
    p_additional_comments,
    p_feedback,
    NOW()
  )
  RETURNING "evaluationId" INTO v_evaluation_id;  -- Change "id" to your actual PK column name

  -- 3. Return Success
  RETURN jsonb_build_object(
    'evaluationId', v_evaluation_id,
    'status', 'success',
    'message', 'Evaluation submitted successfully.'
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Evaluation submission failed: %', SQLERRM;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_participant_count_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        UPDATE "Registration"
        SET "numberOfParticipants" = (
            SELECT COUNT(*) FROM "Participant" WHERE "registrationId" = NEW."registrationId"
        )
        WHERE "registrationId" = NEW."registrationId";
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE "Registration"
        SET "numberOfParticipants" = (
            SELECT COUNT(*) FROM "Participant" WHERE "registrationId" = OLD."registrationId"
        )
        WHERE "registrationId" = OLD."registrationId";
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_membership_expiry()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    current_year_start date;
    next_year_start date;
BEGIN
    -- Calculate January 1st of current year and next year
    current_year_start := DATE_TRUNC('year', NOW())::date;
    next_year_start := current_year_start + INTERVAL '1 year';
    
    -- Step 1: First, cancel members who are already unpaid AND expired
    -- (These are members who were given a grace period last year and didn't pay)
    UPDATE "BusinessMember" 
    SET "membershipStatus" = 'cancelled'
    WHERE "membershipExpiryDate" < NOW()
    AND "membershipStatus" = 'unpaid';
    
    -- Step 2: Then, handle expired paid members
    -- Give them a grace period: become unpaid with new expiry
    UPDATE "BusinessMember" 
    SET 
        "membershipStatus" = 'unpaid',
        "membershipExpiryDate" = next_year_start
    WHERE "membershipExpiryDate" < NOW()
    AND "membershipStatus" = 'paid';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_membership_expiry()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
    IF NEW."lastPaymentDate" IS NOT NULL THEN
        NEW."membershipExpiryDate" = 
            DATE_TRUNC('year', NEW."lastPaymentDate") 
            + INTERVAL '1 year';
        NEW."membershipStatus" = 'paid'::"MembershipStatus";
    END IF;
    RETURN NEW;
END;$function$
;

CREATE OR REPLACE FUNCTION public.submit_event_registration(p_event_id uuid, p_member_type text, p_identifier text, p_business_member_id uuid DEFAULT NULL::uuid, p_non_member_name text DEFAULT NULL::text, p_payment_method text DEFAULT 'onsite'::text, p_payment_path text DEFAULT NULL::text, p_registrant jsonb DEFAULT '{}'::jsonb, p_other_participants jsonb DEFAULT '[]'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_registration_id UUID;
  v_event_title TEXT;
  v_payment_status "PaymentStatus";
  v_payment_method_enum "PaymentMethod";
BEGIN

  -- Convert and cast the payment method
  v_payment_method_enum := (CASE 
    WHEN p_payment_method = 'online' THEN 'BPI' 
    ELSE 'ONSITE' 
  END)::"PaymentMethod";

  -- Determine payment status
  v_payment_status := (CASE 
    WHEN p_payment_method = 'online' THEN 'pending'
    ELSE 'verified'
  END)::"PaymentStatus";

  -- Insert registration record
  INSERT INTO "Registration" (
    "eventId",
    "paymentMethod",
    "paymentStatus",
    "businessMemberId",
    "nonMemberName",
    "identifier",
    "registrationDate"
  ) VALUES (
    p_event_id,
    v_payment_method_enum,
    v_payment_status,
    CASE WHEN p_member_type = 'member' THEN p_business_member_id ELSE NULL END,
    CASE WHEN p_member_type = 'nonmember' THEN p_non_member_name ELSE NULL END,
    p_identifier,
    NOW()
  )
  RETURNING "registrationId" INTO v_registration_id;

  -- Get event title for response
  SELECT "eventTitle" INTO v_event_title
  FROM "Event"
  WHERE "eventId" = p_event_id;

  -- Handle proof of payment if online payment
  IF p_payment_method = 'online' THEN
    INSERT INTO "ProofImage" (path, "registrationId")
    VALUES (p_payment_path, v_registration_id);
  END IF;

  -- Insert principal registrant
  INSERT INTO "Participant" (
    "registrationId",
    "isPrincipal",
    "firstName",
    "lastName",
    "contactNumber",
    email
  )
  VALUES (
    v_registration_id,
    TRUE,
    p_registrant->>'firstName',
    p_registrant->>'lastName',
    p_registrant->>'contactNumber',
    p_registrant->>'email'
  );

  -- Insert other registrants if any exist
  IF jsonb_array_length(p_other_participants) > 0 THEN
    INSERT INTO "Participant" (
      "registrationId",
      "isPrincipal",
      "firstName",
      "lastName",
      "contactNumber",
      email
    )
    SELECT
      v_registration_id,
      FALSE,
      registrant->>'firstName',
      registrant->>'lastName',
      registrant->>'contactNumber',
      registrant->>'email'
    FROM jsonb_array_elements(p_other_participants) AS registrant;
  END IF;

  -- Return success response with data
  RETURN jsonb_build_object(
    'registrationId', v_registration_id,
    'message', 'Registration created successfully'
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_primary_application_for_member()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  affected_member uuid;
BEGIN
  affected_member := COALESCE(NEW."businessMemberId", OLD."businessMemberId");
  
  IF affected_member IS NOT NULL THEN
    UPDATE "BusinessMember"
    SET "primaryApplicationId" = (
      SELECT "applicationId"
      FROM "Application"
      WHERE "businessMemberId" = affected_member
      ORDER BY "applicationDate" DESC
      LIMIT 1
    )
    WHERE "businessMemberId" = affected_member;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$
;


  create policy "Allow all inserts"
  on "public"."EvaluationForm"
  as permissive
  for insert
  to public
with check (true);



  create policy "Allow get for all users"
  on "public"."EvaluationForm"
  as permissive
  for select
  to public
using (true);



  create policy "Delete evaluation"
  on "public"."EvaluationForm"
  as permissive
  for delete
  to authenticated
using (true);


CREATE TRIGGER tr_update_participant_count AFTER INSERT OR DELETE OR UPDATE ON public."Participant" FOR EACH ROW EXECUTE FUNCTION public.update_participant_count_trigger();

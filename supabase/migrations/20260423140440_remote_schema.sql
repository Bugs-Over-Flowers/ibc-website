drop function if exists "public"."submit_event_registration"(p_event_id uuid, p_member_type text, p_identifier text, p_business_member_id uuid, p_non_member_name text, p_payment_method text, p_payment_path text, p_registrant jsonb, p_other_participants jsonb, p_sponsored_registration_id uuid);

drop function if exists "public"."submit_event_registration_standard"(p_event_id uuid, p_member_type text, p_identifier text, p_business_member_id uuid, p_non_member_name text, p_payment_method text, p_payment_path text, p_registrant jsonb, p_other_participants jsonb);

drop function if exists "public"."upsert_website_content"(p_section public."WebsiteContentSection", p_entry_key text, p_text_type public."WebsiteContentTextType", p_text_value text, p_icon text, p_image_url text, p_card_placement integer, p_is_active boolean);


alter table "public"."WebsiteContent" alter column section type "public"."WebsiteContentSection" using section::text::"public"."WebsiteContentSection";

alter table "public"."Registration" add column "note" text;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.submit_event_registration(p_event_id uuid, p_member_type text, p_identifier text, p_business_member_id uuid DEFAULT NULL::uuid, p_non_member_name text DEFAULT NULL::text, p_payment_method text DEFAULT 'onsite'::text, p_payment_path text DEFAULT NULL::text, p_registrant jsonb DEFAULT '{}'::jsonb, p_note text DEFAULT NULL::text, p_other_participants jsonb DEFAULT '[]'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_registration_id UUID;
  v_payment_proof_status "PaymentProofStatus";
  v_payment_method_enum "PaymentMethod";
BEGIN
  v_payment_method_enum := (
    CASE
      WHEN p_payment_method = 'online' THEN 'BPI'
      ELSE 'ONSITE'
    END
  )::"PaymentMethod";

  v_payment_proof_status := (
    CASE
      WHEN p_payment_method = 'online' THEN 'pending'
      ELSE 'accepted'
    END
  )::"PaymentProofStatus";

  INSERT INTO "Registration" (
    "eventId",
    "paymentMethod",
    "paymentProofStatus",
    "businessMemberId",
    "nonMemberName",
    "identifier",
    "note",
    "registrationDate"
  ) VALUES (
    p_event_id,
    v_payment_method_enum,
    v_payment_proof_status,
    CASE WHEN p_member_type = 'member' THEN p_business_member_id ELSE NULL END,
    CASE WHEN p_member_type = 'nonmember' THEN p_non_member_name ELSE NULL END,
    p_identifier,
    p_note,
    NOW()
  )
  RETURNING "registrationId" INTO v_registration_id;

  IF p_payment_method = 'online' THEN
    INSERT INTO "ProofImage" (path, "registrationId")
    VALUES (p_payment_path, v_registration_id);
  END IF;

  INSERT INTO "Participant" (
    "registrationId",
    "isPrincipal",
    "firstName",
    "lastName",
    "contactNumber",
    email
  ) VALUES (
    v_registration_id,
    TRUE,
    p_registrant->>'firstName',
    p_registrant->>'lastName',
    p_registrant->>'contactNumber',
    p_registrant->>'email'
  );

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

  RETURN jsonb_build_object(
    'registrationId', v_registration_id,
    'message', 'Registration created successfully'
  );


EXCEPTION
  WHEN OTHERS THEN
    -- If anything fails, the transaction auto-rolls back
    RAISE EXCEPTION 'Registration failed: %', SQLERRM;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_event_published_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF new."eventType" IS NULL then
        new."publishedAt" = null;
    else
        new."publishedAt" = now();
    end if;

    return NEW;
END;
$function$
;


  create policy "All can read 1aozmya_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'heroimages'::text));



  create policy "Authenticated can manage 1aozmya_0"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'heroimages'::text));



  create policy "Authenticated can manage 1aozmya_2"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = 'heroimages'::text));



  create policy "Authenticated can manage 1aozmya_3"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'heroimages'::text));

drop extension if exists "pg_net";
create type "public"."SponsoredRegistrationStatus" as enum ('active', 'full', 'disabled');
drop policy "Enable insert for all users" on "public"."Participant";
drop policy "Enable read access for all users" on "public"."Participant";
create table "public"."SponsoredRegistration" (
    "sponsoredRegistrationId" uuid not null default gen_random_uuid(),
    "uuid" uuid not null default gen_random_uuid(),
    "eventId" uuid not null,
    "sponsoredBy" text not null,
    "feeDeduction" numeric(10,2) not null default 0,
    "maxSponsoredGuests" bigint,
    "usedCount" bigint not null default 0,
    "status" public."SponsoredRegistrationStatus" not null default 'active'::public."SponsoredRegistrationStatus",
    "createdAt" timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text),
    "updatedAt" timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text)
      );
alter table "public"."SponsoredRegistration" enable row level security;
CREATE UNIQUE INDEX "SponsoredRegistration_pkey" ON public."SponsoredRegistration" USING btree ("sponsoredRegistrationId");
CREATE UNIQUE INDEX "SponsoredRegistration_uuid_unique" ON public."SponsoredRegistration" USING btree (uuid);
alter table "public"."SponsoredRegistration" add constraint "SponsoredRegistration_pkey" PRIMARY KEY using index "SponsoredRegistration_pkey";
alter table "public"."SponsoredRegistration" add constraint "SponsoredRegistration_event_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"("eventId") not valid;
alter table "public"."SponsoredRegistration" validate constraint "SponsoredRegistration_event_fkey";
alter table "public"."SponsoredRegistration" add constraint "SponsoredRegistration_used_check" CHECK ((("maxSponsoredGuests" IS NULL) OR ("usedCount" <= "maxSponsoredGuests"))) not valid;
alter table "public"."SponsoredRegistration" validate constraint "SponsoredRegistration_used_check";
alter table "public"."SponsoredRegistration" add constraint "SponsoredRegistration_uuid_unique" UNIQUE using index "SponsoredRegistration_uuid_unique";
set check_function_bodies = off;
CREATE OR REPLACE FUNCTION public.check_application_status(p_application_identifier text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'applicationId', a."applicationId",
    'identifier', a.identifier,
    'applicationStatus', a."applicationStatus",
    'applicationDate', a."applicationDate",
    'companyName', a."companyName",
    'hasInterview', CASE WHEN a."interviewId" IS NOT NULL THEN true ELSE false END,
    'interview', CASE 
      WHEN i."interviewId" IS NOT NULL THEN
        jsonb_build_object(
          'interviewId', i."interviewId",
          'interviewDate', i."interviewDate",
          'interviewVenue', i."interviewVenue",
          'status', i.status,
          'createdAt', i."createdAt"
        )
      ELSE NULL
    END
  )
  INTO v_result
  FROM "Application" a
  LEFT JOIN "Interview" i ON a."interviewId" = i."interviewId"
  WHERE a.identifier = p_application_identifier;
  
  IF v_result IS NULL THEN
    RAISE EXCEPTION 'Application with identifier % does not exist.', p_application_identifier;
  END IF;
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to check application status: %', SQLERRM;
END;
$function$;
grant delete on table "public"."SponsoredRegistration" to "anon";
grant insert on table "public"."SponsoredRegistration" to "anon";
grant references on table "public"."SponsoredRegistration" to "anon";
grant select on table "public"."SponsoredRegistration" to "anon";
grant trigger on table "public"."SponsoredRegistration" to "anon";
grant truncate on table "public"."SponsoredRegistration" to "anon";
grant update on table "public"."SponsoredRegistration" to "anon";
grant delete on table "public"."SponsoredRegistration" to "authenticated";
grant insert on table "public"."SponsoredRegistration" to "authenticated";
grant references on table "public"."SponsoredRegistration" to "authenticated";
grant select on table "public"."SponsoredRegistration" to "authenticated";
grant trigger on table "public"."SponsoredRegistration" to "authenticated";
grant truncate on table "public"."SponsoredRegistration" to "authenticated";
grant update on table "public"."SponsoredRegistration" to "authenticated";
grant delete on table "public"."SponsoredRegistration" to "service_role";
grant insert on table "public"."SponsoredRegistration" to "service_role";
grant references on table "public"."SponsoredRegistration" to "service_role";
grant select on table "public"."SponsoredRegistration" to "service_role";
grant trigger on table "public"."SponsoredRegistration" to "service_role";
grant truncate on table "public"."SponsoredRegistration" to "service_role";
grant update on table "public"."SponsoredRegistration" to "service_role";
create policy "Allow admins to delete sectors"
  on "public"."Sector"
  as permissive
  for delete
  to authenticated
using (true);
create policy "Allow admins to insert sectors"
  on "public"."Sector"
  as permissive
  for insert
  to authenticated
with check (true);
create policy "Allow admins to update sectors"
  on "public"."Sector"
  as permissive
  for update
  to authenticated
using (true)
with check (true);
create policy "Enable insert for authenticated users only"
  on "public"."SponsoredRegistration"
  as permissive
  for insert
  to authenticated
with check (true);
create policy "Enable read access for all users"
  on "public"."SponsoredRegistration"
  as permissive
  for select
  to authenticated
using (true);
create policy "Event admin can delete sponsored registrations"
  on "public"."SponsoredRegistration"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public."Event" e
  WHERE (e."eventId" = "SponsoredRegistration"."eventId"))));
create policy "Event admin can update sponsored registrations"
  on "public"."SponsoredRegistration"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public."Event" e
  WHERE (e."eventId" = "SponsoredRegistration"."eventId"))))
with check ((EXISTS ( SELECT 1
   FROM public."Event" e
  WHERE (e."eventId" = "SponsoredRegistration"."eventId"))));
create policy "Enable insert for all users"
  on "public"."Participant"
  as permissive
  for insert
  to anon, authenticated
with check (true);
create policy "Enable read access for all users"
  on "public"."Participant"
  as permissive
  for select
  to anon, authenticated
using (true);
drop policy "admin can access logoImage 18vv14g_0" on "storage"."objects";
drop policy "allow authenticated uploads" on "storage"."objects";
drop policy "insert for all 18vv14g_0" on "storage"."objects";
drop policy "Allow all operations for anyone 11d98ol_0" on "storage"."objects";
drop policy "Allow all operations for anyone 11d98ol_1" on "storage"."objects";
drop policy "Allow all operations for anyone 11d98ol_2" on "storage"."objects";
drop policy "Allow all operations for anyone 11d98ol_3" on "storage"."objects";
create policy "Allow all operations for anyone 11d98ol_0"
  on "storage"."objects"
  as permissive
  for insert
  to anon, authenticated
with check ((bucket_id = 'paymentproofs'::text));
create policy "Allow all operations for anyone 11d98ol_1"
  on "storage"."objects"
  as permissive
  for select
  to anon, authenticated
using ((bucket_id = 'paymentproofs'::text));
create policy "Allow all operations for anyone 11d98ol_2"
  on "storage"."objects"
  as permissive
  for delete
  to anon, authenticated
using ((bucket_id = 'paymentproofs'::text));
create policy "Allow all operations for anyone 11d98ol_3"
  on "storage"."objects"
  as permissive
  for update
  to anon, authenticated
using ((bucket_id = 'paymentproofs'::text));
DO $$
BEGIN
  IF to_regprocedure('storage.delete_prefix_hierarchy_trigger()') IS NOT NULL THEN
    EXECUTE 'CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger()';
  END IF;
END
$$;
DO $$
BEGIN
  IF to_regprocedure('storage.objects_insert_prefix_trigger()') IS NOT NULL THEN
    EXECUTE 'CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger()';
  END IF;
END
$$;
DO $$
BEGIN
  IF to_regprocedure('storage.objects_update_prefix_trigger()') IS NOT NULL THEN
    EXECUTE 'CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger()';
  END IF;
END
$$;
DO $$
BEGIN
  IF to_regprocedure('storage.prefixes_insert_trigger()') IS NOT NULL THEN
    EXECUTE 'CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger()';
  END IF;
END
$$;
DO $$
BEGIN
  IF to_regprocedure('storage.delete_prefix_hierarchy_trigger()') IS NOT NULL THEN
    EXECUTE 'CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger()';
  END IF;
END
$$;

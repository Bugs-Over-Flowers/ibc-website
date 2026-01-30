drop extension if exists "pg_net";
drop policy "Enable insert for all users" on "public"."Participant";
drop policy "Enable read access for all users" on "public"."Participant";
alter table "public"."Interview" add column "applicationId" uuid;
alter table "public"."Interview" add constraint "Interview_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES public."Application"("applicationId") ON UPDATE CASCADE ON DELETE SET NULL not valid;
alter table "public"."Interview" validate constraint "Interview_applicationId_fkey";
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

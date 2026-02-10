create policy "Allow admins to update sectors"
on "public"."Sector"
for update
to authenticated
using (true)
with check (true);

create policy "Allow admins to delete sectors"
on "public"."Sector"
for delete
to authenticated
using (true);

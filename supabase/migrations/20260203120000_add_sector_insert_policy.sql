create policy "Allow admins to insert sectors"
on "public"."Sector"
for insert
to authenticated
with check (true);

create policy "allow admins to do operations jqdsdq_0"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'headerimage'::text));
create policy "allow admins to do operations jqdsdq_1"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'headerimage'::text));
create policy "allow admins to do operations jqdsdq_2"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = 'headerimage'::text));
create policy "allow admins to do operations jqdsdq_3"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'headerimage'::text));
create policy "allow all operations for admins 19dgg40_0"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'logoimage'::text));
create policy "allow all operations for admins 19dgg40_1"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'logoimage'::text));
create policy "allow all operations for admins 19dgg40_2"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = 'logoimage'::text));
create policy "allow all operations for admins 19dgg40_3"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'logoimage'::text));
create policy "insert for all 19dgg40_0"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check ((bucket_id = 'logoimage'::text));

drop function if exists "public"."get_registration_list_checkin"(p_identifier text, p_today date);

drop function if exists "public"."get_sponsored_registration_by_uuid"(p_uuid text);


  create policy "Authenticated delete Networks"
  on "public"."Networks"
  as permissive
  for delete
  to authenticated
using (true);



  create policy "Authenticated insert Networks"
  on "public"."Networks"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Authenticated update Networks"
  on "public"."Networks"
  as permissive
  for update
  to authenticated
using (true)
with check (true);



  create policy "Public read Networks"
  on "public"."Networks"
  as permissive
  for select
  to public
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


CREATE TRIGGER on_application_sync_primary AFTER INSERT OR DELETE OR UPDATE ON public."Application" FOR EACH ROW EXECUTE FUNCTION public.update_primary_application_for_member();

CREATE TRIGGER set_member_identifier BEFORE INSERT ON public."BusinessMember" FOR EACH ROW EXECUTE FUNCTION public.generate_member_identifier();

CREATE TRIGGER trigger_set_membership_expiry BEFORE INSERT OR UPDATE OF "lastPaymentDate" ON public."BusinessMember" FOR EACH ROW EXECUTE FUNCTION public.set_membership_expiry();

CREATE TRIGGER on_event_change AFTER INSERT OR UPDATE ON public."Event" FOR EACH ROW EXECUTE FUNCTION public.handle_event_days();

CREATE TRIGGER on_event_publish AFTER INSERT OR UPDATE ON public."Event" FOR EACH ROW EXECUTE FUNCTION public.update_event_published_at();

CREATE TRIGGER set_networks_updated_at BEFORE UPDATE ON public."Networks" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER tr_update_participant_count AFTER INSERT OR DELETE OR UPDATE ON public."Participant" FOR EACH ROW EXECUTE FUNCTION public.update_participant_count_trigger();

CREATE TRIGGER tr_update_sponsored_registration_used_count_from_participant AFTER INSERT OR DELETE ON public."Participant" FOR EACH ROW EXECUTE FUNCTION public.update_sponsored_registration_used_count_from_participant();

CREATE TRIGGER tr_update_sponsored_registration_used_count AFTER INSERT OR DELETE OR UPDATE OF "sponsoredRegistrationId" ON public."Registration" FOR EACH ROW EXECUTE FUNCTION public.update_sponsored_registration_used_count_from_registration();

CREATE TRIGGER set_website_content_updated_at BEFORE UPDATE ON public."WebsiteContent" FOR EACH ROW EXECUTE FUNCTION public.update_website_content_updated_at();


  create policy "Admins can delete network logos"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'network-logos'::text));



  create policy "Admins can update network logos"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = 'network-logos'::text))
with check ((bucket_id = 'network-logos'::text));



  create policy "Admins can upload network logos"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'network-logos'::text));



  create policy "Network logos are publicly readable"
  on "storage"."objects"
  as permissive
  for select
  to anon, authenticated
using ((bucket_id = 'network-logos'::text));

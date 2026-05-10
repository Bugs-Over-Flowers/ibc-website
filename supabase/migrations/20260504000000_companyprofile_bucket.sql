INSERT INTO storage.buckets (id, name, public)
VALUES ('companyprofile', 'companyprofile', false);

CREATE POLICY "Company profile is publicly readable"
ON "storage"."objects"
AS permissive
FOR SELECT
TO anon, authenticated
USING ((bucket_id = 'companyprofile'::text));

CREATE POLICY "Authenticated users can upload company profiles"
ON "storage"."objects"
AS permissive
FOR INSERT
TO authenticated
WITH CHECK ((bucket_id = 'companyprofile'::text));

CREATE POLICY "Authenticated users can update company profiles"
ON "storage"."objects"
AS permissive
FOR UPDATE
TO authenticated
USING ((bucket_id = 'companyprofile'::text))
WITH CHECK ((bucket_id = 'companyprofile'::text));

CREATE POLICY "Authenticated users can delete company profiles"
ON "storage"."objects"
AS permissive
FOR DELETE
TO authenticated
USING ((bucket_id = 'companyprofile'::text));

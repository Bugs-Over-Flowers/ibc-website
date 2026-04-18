INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'personalimage',
  'personalimage',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/jpg']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "personalimage_insert_authenticated" ON storage.objects;
CREATE POLICY "personalimage_insert_authenticated"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'personalimage');

DROP POLICY IF EXISTS "personalimage_select_authenticated" ON storage.objects;
CREATE POLICY "personalimage_select_authenticated"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'personalimage');

DROP POLICY IF EXISTS "personalimage_update_authenticated" ON storage.objects;
CREATE POLICY "personalimage_update_authenticated"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'personalimage')
WITH CHECK (bucket_id = 'personalimage');

DROP POLICY IF EXISTS "personalimage_delete_authenticated" ON storage.objects;
CREATE POLICY "personalimage_delete_authenticated"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'personalimage');

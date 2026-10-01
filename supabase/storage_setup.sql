-- ====================================================================
-- SUPABASE STORAGE BUCKETS & POLICIES SETUP (RUN IN SQL EDITOR)
-- ====================================================================

-- 1. Create Public Storage Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('product-images', 'product-images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('category-images', 'category-images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('banners', 'banners', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('avatars', 'avatars', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Enable Storage RLS Policies
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
USING (bucket_id IN ('product-images', 'category-images', 'banners', 'avatars'));

DROP POLICY IF EXISTS "Allow authenticated/admin uploads" ON storage.objects;
CREATE POLICY "Allow authenticated/admin uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id IN ('product-images', 'category-images', 'banners', 'avatars'));

DROP POLICY IF EXISTS "Allow image updates" ON storage.objects;
CREATE POLICY "Allow image updates"
ON storage.objects FOR UPDATE
USING (bucket_id IN ('product-images', 'category-images', 'banners', 'avatars'));

DROP POLICY IF EXISTS "Allow image deletes" ON storage.objects;
CREATE POLICY "Allow image deletes"
ON storage.objects FOR DELETE
USING (bucket_id IN ('product-images', 'category-images', 'banners', 'avatars'));

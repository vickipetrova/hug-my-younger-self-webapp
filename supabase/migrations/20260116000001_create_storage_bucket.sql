-- Create storage bucket for user-uploaded images and generated outputs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'generations',
  'generations',
  true,
  10485760, -- 10MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- RLS Policy: Users can upload images to their own folder
CREATE POLICY "Users can upload own images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'generations' AND
  auth.uid() IS NOT NULL AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policy: Users can view their own images
CREATE POLICY "Users can view own images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'generations' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policy: Users can delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'generations' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policy: Users can update their own images (for replacing)
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'generations' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policy: Anyone can view public images (since bucket is public)
-- This allows generated images to be shared if needed
CREATE POLICY "Public can view generation images"
ON storage.objects FOR SELECT
USING (bucket_id = 'generations');


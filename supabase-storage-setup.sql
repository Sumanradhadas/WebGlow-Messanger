-- WebGlow Messenger - Supabase Storage Setup
-- Run this SQL in your Supabase SQL Editor to set up the storage bucket and policies

-- =====================================================
-- 1. CREATE STORAGE BUCKET
-- =====================================================
-- Note: You can also create this bucket via the Supabase Dashboard > Storage
-- This is the SQL equivalent

INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-media', 'chat-media', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. STORAGE RLS POLICIES
-- =====================================================

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to upload files to their own folder
-- Each user uploads to: {user_id}/filename.ext
CREATE POLICY "Users can upload to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat-media' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to view/download files in the bucket
CREATE POLICY "Authenticated users can view files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'chat-media'
);

-- Allow users to update/overwrite their own files (needed for upsert operations)
CREATE POLICY "Users can update own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'chat-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'chat-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Done! Your storage bucket is ready for file uploads.

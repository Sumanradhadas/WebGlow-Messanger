# Fix: File Upload "Row-Level Security Policy" Error

## Problem
When trying to send attachments, you're getting an error: **"Upload failed - new row violates row-level security policy"**

## Root Cause
The Supabase Storage bucket `chat-media` either doesn't exist or doesn't have the proper permissions for authenticated users to upload files.

## Solution: Setup via Supabase Dashboard

**Note:** Storage policies cannot be created via SQL due to permission restrictions. You must use the Dashboard UI.

1. **Create the Bucket:**
   - Go to **Storage** in your Supabase Dashboard
   - Click **New bucket**
   - Name: `chat-media`
   - Make it **Public** (checked)
   - Click **Create bucket**

2. **Set up RLS Policies:**
   - Click on the `chat-media` bucket
   - Go to the **Policies** tab
   - Click **New policy**
   
   **Policy 1: Allow Upload**
   - Name: `Users can upload to own folder`
   - Policy command: `INSERT`
   - Target roles: `authenticated`
   - WITH CHECK expression:
     ```sql
     (bucket_id = 'chat-media' AND (storage.foldername(name))[1] = auth.uid()::text)
     ```
   
   **Policy 2: Allow View**
   - Name: `Authenticated users can view files`
   - Policy command: `SELECT`
   - Target roles: `authenticated`
   - USING expression:
     ```sql
     bucket_id = 'chat-media'
     ```

3. **Save and Test**
   - Save both policies
   - Try uploading a file in your app

## Verification

After running the SQL or creating the bucket manually:

1. Sign in to your app
2. Try to attach and send a file (image, video, or document)
3. The upload should now work without errors
4. You should see the file in your message thread

## What This Does

The storage policies allow:
- ✅ Authenticated users to upload files to their own folder (`{user_id}/filename.ext`)
- ✅ Authenticated users to view/download any files in the bucket
- ✅ Users to update or delete only their own files

This ensures security while allowing the messaging functionality to work properly.

-- PWA and Push Notifications Migration
-- Run this if you already have an existing database and need to add PWA/FCM features

-- Add new columns to profiles table for FCM and online status
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fcm_token TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS online BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ;

-- Create index for online status lookups
CREATE INDEX IF NOT EXISTS idx_profiles_online ON profiles(online);

-- Update realtime publication to include profiles for online status
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- Done! Your database now supports PWA features and push notifications.

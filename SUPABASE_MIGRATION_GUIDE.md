# WebGlow Messenger - Supabase Migration Guide

## ✅ Migration Complete!

Your WebGlow Messenger has been successfully migrated from Firebase + GitHub to Supabase for all services:
- **Authentication**: Supabase Auth (email/password)
- **Database**: Supabase PostgreSQL
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage

## 🚀 Setup Instructions

### Step 1: Run Database Setup SQL

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `supabase-setup.sql` file in this repository
6. Paste it into the SQL editor
7. Click **Run** to execute the script

This will create:
- `profiles` table (user information)
- `conversations` table (chat conversations)
- `messages` table (all messages)
- `typing_status` table (typing indicators)
- Row Level Security (RLS) policies
- Helper functions for business logic
- Real-time subscriptions

### Step 2: Create Storage Bucket

1. In your Supabase Dashboard, click **Storage** in the left sidebar
2. Click **New bucket**
3. Name it: `chat-media`
4. **IMPORTANT**: Make sure **Public bucket** is **CHECKED** (this allows reading uploaded files)
5. Click **Create bucket**

### Step 3: Set Storage Policies

1. Click on the `chat-media` bucket
2. Go to **Policies** tab
3. Click **New policy**

**Upload Policy** (so authenticated users can upload):
```sql
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**Read Policy** (so anyone can view public files):
```sql
CREATE POLICY "Anyone can view files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'chat-media');
```

### Step 4: Test Your Application

1. The application is now running with Supabase!
2. **Sign up** with an admin email (must contain "admin"):
   - Example: `admin@yourcompany.com`
3. **Sign up** with a client email (any email without "admin"):
   - Example: `client@test.com`
4. Test messaging between client and admin
5. Test file uploads (images, videos, PDFs)

## 🔍 How It Works

### Authentication
- Email/password signup and signin
- Role is automatically assigned based on email:
  - Emails containing "admin" → Admin role
  - All other emails → Client role

### Database Structure

**profiles table**:
- Stores user information (id, email, name, phone, role)
- Linked to Supabase Auth users

**conversations table**:
- One conversation per client
- Tracks last message, unread count, assigned admin

**messages table**:
- All messages with timestamps
- Supports text and media (images, videos, files)
- Read receipts

**typing_status table**:
- Real-time typing indicators

### Storage
- Files are uploaded to Supabase Storage in `chat-media` bucket
- Each user has their own folder: `{user_id}/`
- Public URLs are generated for all uploaded files

### Real-time Features
- Messages appear instantly (Supabase Realtime)
- Typing indicators update in real-time
- Conversation list updates automatically

## 📝 Environment Variables

These are already configured in your Replit Secrets:
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 🔒 Security

All data access is controlled by Row Level Security (RLS) policies:
- Clients can only see their own conversation and messages
- Admins can see all conversations and messages
- Users can only update their own profile
- File uploads are restricted to authenticated users

## 🎯 What Changed

### Removed
- ❌ Firebase (Auth, Firestore)
- ❌ GitHub API for file storage
- ❌ `@octokit/rest` dependency
- ❌ `firebase` dependency
- ❌ GitHub PAT environment variables

### Added
- ✅ Supabase client (`@supabase/supabase-js`)
- ✅ PostgreSQL database with proper schema
- ✅ Supabase Storage for media files
- ✅ Supabase Realtime for live updates

### Updated
- ✅ `client/src/lib/auth.ts` - Now uses Supabase Auth
- ✅ `client/src/lib/messaging.ts` - Now uses Supabase PostgreSQL + Realtime
- ✅ `server/routes.ts` - Upload endpoint uses Supabase Storage
- ✅ `client/src/components/AdminPanel.tsx` - Works with Supabase
- ✅ `client/src/components/ClientChatView.tsx` - Works with Supabase

## 🆘 Troubleshooting

**"relation does not exist" errors**:
- Make sure you ran the `supabase-setup.sql` script completely

**"JWT expired" or auth errors**:
- Clear browser cookies and local storage
- Sign in again

**File upload fails**:
- Check that `chat-media` bucket exists and is public
- Verify storage policies are set correctly

**Messages not appearing in real-time**:
- Check that realtime is enabled on tables (done automatically by setup SQL)

**Role not working correctly**:
- Make sure your admin email contains the word "admin"
- Sign out and sign in again after changing email

## 📚 Next Steps

1. Run the database setup SQL
2. Create the storage bucket
3. Test signup and messaging
4. Customize the UI if needed
5. Deploy to production when ready!

Your app is now fully powered by Supabase! 🎉

here’s your complete developer setup document (ready to copy to your Replit / GitHub README or Notion).
This guide tells your developer exactly how to set up, connect, and build your WebGlow Messenger with Supabase, Firebase (for push), and PWA support.

💬 WebGlow Messenger — Developer Setup Guide

A one-to-one business messenger where WebGlow can chat with clients — just like WhatsApp but for your business.

⚙️ 1️⃣ Project Overview

Goal:
Create a personal messenger website for WebGlow where clients can sign up, chat with the admin, and share text, media, and PDFs.

Key Points:

UI/UX like WhatsApp (modern navy-blue dark theme, smooth animations)

One-to-one chat only (client ↔ admin)

Push notifications for new messages

“Add to Home Screen” via PWA install button

Data stored in Supabase (auth, db, storage)

Notifications handled by Firebase Cloud Messaging (FCM)

🧩 2️⃣ Tech Stack
Area	Technology
Frontend	React + Vite (or Next.js)
Styling	Tailwind CSS + Framer Motion
Auth & Database	Supabase
Storage (media/PDF)	Supabase Storage (chat-media bucket)
Realtime Messaging	Supabase Realtime
Push Notifications	Firebase Cloud Messaging (FCM)
Hosting	Replit / Vercel / Render
Version Control	GitHub Private Repo
🔑 3️⃣ Environment Variables (Create .env)

Add the following in your Replit or .env.local file:

VITE_SUPABASE_URL=https://your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ADMIN_EMAIL=yourbusiness@email.com
VITE_ADMIN_ID=admin-supabase-uid
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_SENDER_ID=your-firebase-sender-id
VITE_FIREBASE_APP_ID=your-firebase-app-id
VITE_FIREBASE_VAPID_KEY=your-firebase-vapid-key

🗃️ 4️⃣ Supabase Setup
4.1 Enable Authentication

Go to Authentication → Providers

Enable:

✅ “Allow new users to sign up”

✅ “Confirm email” (recommended)

4.2 Create Tables
Table: users
Column	Type	Note
id	uuid	from auth.users
email	text	
name	text	
phone	text	collected manually
avatar_url	text	optional
fcm_token	text	for notifications
created_at	timestamp	default now()
Table: messages
Column	Type	Note
id	uuid	PK
sender_id	uuid	FK → users.id
receiver_id	uuid	FK → users.id
content	text	
media_url	text	Supabase file URL
read	boolean	default false
created_at	timestamp	default now()

Enable Realtime on messages table.

4.3 Storage

Create a bucket named chat-media:

Public read ✅

Authenticated users can upload files only.

🔒 5️⃣ Supabase Policies (SQL)

For messages table:

-- Allow sender and receiver to view their own messages
create policy "Users can view own messages"
on messages for select
using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- Allow users to insert messages they send
create policy "Users can insert own messages"
on messages for insert
with check (auth.uid() = sender_id);


For users table:

create policy "Users can update own profile"
on users for update
using (auth.uid() = id);

☁️ 6️⃣ Firebase Setup (Push Notifications)

Go to Firebase Console

Create a new project → enable Cloud Messaging

Get your:

API key

Sender ID

App ID

VAPID key (for web push)

Add Firebase config in frontend using .env

Request browser notification permission on login.

⚛️ 7️⃣ Frontend Setup (React)
npm create vite@latest webglow-messenger --template react
cd webglow-messenger
npm install @supabase/supabase-js tailwindcss framer-motion firebase
npx tailwindcss init -p


Configure Tailwind → dark navy theme.

Initialize Supabase

src/lib/supabase.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

🪄 8️⃣ Core Features to Implement
Feature	Implementation
Signup / Login	Supabase Auth UI
Realtime Chat	Supabase Realtime messages subscription
Send Message	Insert into messages
Send Media	Upload file to chat-media → store URL in messages
Read Receipts	Update read field when message viewed
Admin Panel	Fetch all users + messages
Notifications	Firebase FCM integration
PWA	Add manifest.json + service worker
📱 9️⃣ PWA Setup

Create manifest.json:

{
  "name": "WebGlow Messenger",
  "short_name": "WebGlow",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0b0c20",
  "theme_color": "#0b0c20",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}


Add a service worker for caching + install prompt.

💎 10️⃣ UI / UX Guidelines

Theme: Navy blue dark with golden-blue glow accents

Chat Bubble Animation: Framer Motion spring-in effect

Layout: WhatsApp style → sidebar (users) + chat area

Typography: Inter or Poppins font

Mobile Friendly: Must be perfect on phones

🧾 11️⃣ Folder Structure (Recommended)
src/
 ┣ components/
 ┃ ┣ ChatWindow.jsx
 ┃ ┣ MessageBubble.jsx
 ┃ ┣ Sidebar.jsx
 ┣ pages/
 ┃ ┣ Login.jsx
 ┃ ┣ Register.jsx
 ┃ ┣ AdminPanel.jsx
 ┣ lib/
 ┃ ┣ supabase.js
 ┃ ┣ firebase.js
 ┣ App.jsx
 ┣ index.css

🚀 12️⃣ Deployment

Connect GitHub repo → Vercel or Render

Add environment variables in host settings

Deploy main branch

Test:

Login

Message sending

File upload

Push notification

PWA install prompt

✅ 13️⃣ Final Quality Checklist

 Supabase Auth working

 Realtime chat updates instantly

 Files upload successfully

 Push notifications appear

 PWA install works

 Dark modern UI
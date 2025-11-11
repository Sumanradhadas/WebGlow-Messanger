# WebGlow Personal Messenger

## Overview
WebGlow Personal Messenger is a client-to-admin messaging platform for personal business communication, featuring a WhatsApp-inspired interface. It enables clients to communicate exclusively with administrators, supporting real-time messaging, media sharing (images, videos, files), typing indicators, and read receipts. Built as a Progressive Web App (PWA) with a mobile-first design, it enforces a one-to-many communication model where multiple clients message a single admin, who manages all conversations through a dedicated admin panel. The project aims to provide a secure and efficient communication channel for personal business interactions.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework & Build System**: React 18 with TypeScript, Vite for build and HMR.
- **UI Component System**: shadcn/ui on Radix UI, Tailwind CSS for styling, custom dark navy theme (`#0A0F23`) with electric blue accents (`#00BFFF`), inspired by WhatsApp and Linear.
- **State Management & Data Fetching**: TanStack Query for server state, React Context API for auth and roles, Real-time subscriptions for live updates.
- **Authentication Flow**: Role-based access control (`client` and `admin`), email-based role detection, conditional rendering based on user role.
- **PWA Features**: Manifest.json, service worker for caching, `PWAInstallButton`, offline support, responsive design with adaptive chat bubbles and media scaling across devices.

### Backend Architecture
- **Server Framework**: Express.js with TypeScript, ESM, middleware for logging, JSON, and CORS.
- **API Design**: RESTful endpoint for authenticated file uploads (`/api/upload`) and media proxy (`/api/media/:userId/:fileName`).
- **Development vs Production**: Vite dev server with Express for development; static file serving from `dist/public` in production.

### Data Storage Solutions
- **Database**: Supabase PostgreSQL with `profiles`, `conversations`, `messages`, and `typing_status` tables.
  - `profiles`: User details, linked to Supabase Auth, includes `role` (client/admin).
  - `conversations`: One-to-one between client and admin.
  - `messages`: Stores text and media, indexed for performance.
  - `typing_status`: Real-time tracking.

### Authentication & Authorization
- **Supabase Authentication**: Email/password, `profiles` table creation on signup, role assignment based on email, `onAuthStateChanged` for persistent sessions.
- **Authorization Model**: Row Level Security (RLS) policies enforce data access, allowing clients to access only their own conversations and admins to access all.

### Real-Time Communication Architecture
- **Message Flow**: `sendMessage()` creates messages, real-time listeners update UI.
- **Typing Indicators**: Debounced detection, `setTypingStatus()` updates, `subscribeToTypingStatus()` refreshes UI.
- **Conversation Management**: `getOrCreateConversation()` ensures unique client-admin conversations.

### PWA & Notifications
- **Progressive Web App (PWA)**: Mobile-optimized, touch-friendly, responsive design, PWA manifest, service worker for caching, "Add to Home Screen" functionality.
- **Push Notifications**: Firebase Cloud Messaging (FCM) integration for background notifications, server-side `/api/send-notification` endpoint, smart notification logic (offline recipients only), includes sender/message preview.

## External Dependencies

### Supabase Services
- **Supabase Auth**: User authentication and session management.
- **Supabase PostgreSQL**: Primary database with RLS.
- **Supabase Realtime**: Real-time subscriptions for dynamic updates.
- **Supabase Storage**: Cloud storage for media files (`chat-media` bucket).

### Environment Variables
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL` (Replit auto-set)

### Third-Party Libraries
- `@supabase/supabase-js`: Supabase client.
- `multer`: Server-side multipart form data parsing for uploads.
- `date-fns`: Date formatting.
- `@radix-ui/*`: Headless UI components.
- `class-variance-authority`, `clsx`: Classname management.
- `zod`: Runtime schema validation.
- `firebase`, `firebase-admin`: For FCM push notifications.

### Design Assets
- **Google Fonts**: Inter, Poppins, Roboto.
- **External Logo**: `https://webglowx.onrender.com/logo.png`.
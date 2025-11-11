# WebGlow Messenger - PWA & Push Notifications Setup Guide

This guide explains how to complete the PWA and push notification setup for WebGlow Messenger.

## Important: App Works Without Firebase

**WebGlow Messenger works perfectly without Firebase configuration.** All core features (messaging, file uploads, online status) function normally. Push notifications are an optional enhancement.

- ✅ App starts and runs normally without Firebase
- ✅ All messaging features work
- ⚠️ Push notifications disabled until Firebase is configured

## Prerequisites (For Push Notifications Only)

To enable push notifications, you need to set up Firebase Cloud Messaging (FCM).

## Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Enable Google Analytics (optional)

### 2. Add a Web App

1. In your Firebase project, click the web icon (</>) to add a web app
2. Register your app with a nickname (e.g., "WebGlow Messenger")
3. Copy the Firebase config object - you'll need these values

### 3. Enable Cloud Messaging

1. In Firebase Console, go to "Build" → "Cloud Messaging"
2. Under "Web Push certificates", click "Generate key pair"
3. Copy the VAPID key

### 4. Get Service Account Credentials

1. Go to Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Extract the following values:
   - `project_id`
   - `client_email`
   - `private_key`

## Environment Variables

**Required for Push Notifications Only** - Add the following environment variables to your Replit Secrets:

### Client-side Firebase Config (Required for Notifications)
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key
```

### Server-side Firebase Admin Config
```
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Note:** The notification system runs entirely server-side via a Supabase realtime listener. No client-side secrets are required for notifications.

## Database Migration

If you already have an existing database, run the migration SQL to add PWA fields:

```sql
-- In your Supabase SQL Editor, run:
\i supabase-pwa-migration.sql
```

Or for new setups, the main `supabase-setup.sql` already includes all PWA fields.

## Testing Push Notifications

### On Desktop (Chrome/Edge/Firefox)

1. Open the app and sign in
2. Click the notification bell icon in the chat header
3. Allow notifications when prompted
4. Send a test message from another account
5. Close the browser tab (notifications only show when offline/background)
6. You should receive a push notification

### On Mobile (Android Chrome)

1. Open the app in Chrome on Android
2. Look for the "Install App" prompt at the bottom
3. Click "Install" to add to home screen
4. Open the installed app
5. Enable notifications via the bell icon
6. Send a test message from another account
7. Close the app
8. You should receive a push notification on your lock screen

### On iOS (Safari)

**Note:** iOS Safari has limited PWA support. Push notifications are only available on iOS 16.4+ with specific limitations.

1. Open the app in Safari
2. Tap Share → Add to Home Screen
3. Open the installed app
4. Enable notifications (may not be available on all iOS versions)

## Troubleshooting

### Notifications Not Working

1. **Check Browser Permissions**: Make sure notifications are allowed in browser settings
2. **Check Console**: Open DevTools and look for Firebase initialization errors
3. **Verify Environment Variables**: Make sure all Firebase config variables are set correctly
4. **Check Service Worker**: In DevTools → Application → Service Workers, verify the service worker is active
5. **Test Online Status**: Notifications only send when the recipient is offline

### PWA Install Not Showing

1. **HTTPS Required**: PWAs require HTTPS (Replit provides this automatically)
2. **Manifest Valid**: Check DevTools → Application → Manifest for any errors
3. **Service Worker Active**: The service worker must be registered

### Firebase Config Errors

If you see "Firebase config not available" in the console:

1. Check that all `VITE_FIREBASE_*` environment variables are set
2. Rebuild the project: `npm run build`
3. The build script automatically replaces placeholder values in `firebase-config.js`

## Security Best Practices

1. **Never commit Firebase credentials** to version control
2. **Rotate secrets regularly** especially `INTERNAL_NOTIFICATION_SECRET`
3. **Use Firebase security rules** to restrict access to your project
4. **Monitor FCM usage** in Firebase Console to detect unusual activity

## Architecture Overview

### Server-Side Notification System
WebGlow Messenger uses a secure server-side notification architecture:

1. **Supabase Realtime Listener**: Server listens for new messages via Supabase realtime subscriptions
2. **Smart Delivery**: Checks if recipient is offline before sending
3. **Firebase Admin SDK**: Sends notifications directly from server (no client-side secrets)
4. **Automatic Reconnection**: Built-in retry logic with exponential backoff

**Operational Requirements**:
- Server must stay running (use Replit Always-On or similar)
- Supabase realtime must be enabled
- Firebase Admin credentials must be set

### Features Overview

#### ✅ PWA Installation
- Add to home screen on mobile
- Standalone app experience
- Offline asset caching

#### ✅ Push Notifications
- Real-time message notifications
- Shows on lock screen
- Works when app is closed
- Smart delivery (only when offline)
- Secure server-side delivery

#### ✅ Online/Last Seen Status
- Live online status indicators
- "Last seen X ago" timestamps
- Automatic heartbeat updates
- Green dot for online users

#### ✅ Notification Controls
- Bell icon to toggle notifications
- FCM token cleared when disabled
- Notifications respect user preferences

## Need Help?

If you encounter issues:
1. Check the browser console for error messages
2. Verify all environment variables are set
3. Test in an incognito window to rule out caching issues
4. Check the Firebase Console for any service issues

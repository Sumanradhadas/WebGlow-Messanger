import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging';
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { supabase } from './supabase';

let firebaseApp: FirebaseApp | null = null;
let messaging: Messaging | null = null;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export function initializeFirebase() {
  if (firebaseApp) return firebaseApp;
  
  try {
    firebaseApp = initializeApp(firebaseConfig);
    messaging = getMessaging(firebaseApp);
    return firebaseApp;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

export async function getFCMToken(userId: string): Promise<string | null> {
  try {
    if (!messaging) {
      initializeFirebase();
      if (!messaging) {
        throw new Error('Failed to initialize Firebase Messaging');
      }
    }

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    if (token) {
      await saveFCMToken(userId, token);
      return token;
    } else {
      console.log('No registration token available');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

async function saveFCMToken(userId: string, token: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ fcm_token: token })
      .eq('id', userId);

    if (error) {
      console.error('Error saving FCM token:', error);
    }
  } catch (error) {
    console.error('Error saving FCM token:', error);
  }
}

export function onForegroundMessage(callback: (payload: any) => void) {
  if (!messaging) {
    initializeFirebase();
    if (!messaging) return () => {};
  }

  return onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);
    callback(payload);
  });
}

export async function clearFCMToken(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ fcm_token: null })
      .eq('id', userId);

    if (error) {
      console.error('Error clearing FCM token:', error);
    }
  } catch (error) {
    console.error('Error clearing FCM token:', error);
  }
}

export async function setupFCM(userId: string): Promise<void> {
  const hasPermission = await requestNotificationPermission();
  
  if (hasPermission) {
    await getFCMToken(userId);
    
    onForegroundMessage((payload) => {
      if (payload.notification) {
        const notification = new Notification(
          payload.notification.title || 'WebGlow Messenger',
          {
            body: payload.notification.body || 'You have a new message',
            icon: '/logo-192.png',
            badge: '/logo-192.png',
            tag: payload.data?.conversationId || 'message',
            data: payload.data,
          }
        );

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }
    });
  }
}

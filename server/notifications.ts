import type { Request, Response } from 'express';

let admin: any = null;

export async function initializeFirebaseAdmin() {
  if (admin) return admin;

  let projectId = process.env.FIREBASE_PROJECT_ID;
  let clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccountJson) {
      try {
        const serviceAccount = JSON.parse(serviceAccountJson);
        projectId = serviceAccount.project_id;
        clientEmail = serviceAccount.client_email;
        privateKey = serviceAccount.private_key;
      } catch (error) {
        console.error('[Firebase Admin] Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', error);
      }
    }
  }

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('[Firebase Admin] Push notifications disabled: Firebase credentials not configured.');
    console.warn('[Firebase Admin] To enable push notifications, set either:');
    console.warn('[Firebase Admin]   - FIREBASE_SERVICE_ACCOUNT (complete service account JSON)');
    console.warn('[Firebase Admin]   OR individual variables:');
    console.warn('[Firebase Admin]     - FIREBASE_PROJECT_ID');
    console.warn('[Firebase Admin]     - FIREBASE_CLIENT_EMAIL');
    console.warn('[Firebase Admin]     - FIREBASE_PRIVATE_KEY');
    console.warn('[Firebase Admin] See PWA_SETUP_GUIDE.md for instructions.');
    return null;
  }

  try {
    const { initializeApp, cert, getApps } = await import('firebase-admin/app');
    const { getMessaging } = await import('firebase-admin/messaging');

    if (getApps().length === 0) {
      const serviceAccount = {
        projectId: projectId,
        clientEmail: clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      };

      initializeApp({
        credential: cert(serviceAccount as any),
      });
    }

    admin = getMessaging();
    console.log('[Firebase Admin] Successfully initialized Firebase Admin SDK');
    return admin;
  } catch (error) {
    console.error('[Firebase Admin] Error initializing Firebase Admin:', error);
    console.error('[Firebase Admin] Push notifications will not work. Please check your Firebase credentials.');
    return null;
  }
}

export async function sendNotification(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    const internalSecret = process.env.INTERNAL_NOTIFICATION_SECRET;

    if (!authHeader || authHeader !== `Bearer ${internalSecret}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { token, title, body, data } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'FCM token is required' });
    }

    const messaging = await initializeFirebaseAdmin();
    if (!messaging) {
      return res.status(500).json({ error: 'Failed to initialize Firebase Admin' });
    }

    const message = {
      token,
      notification: {
        title: title || 'WebGlow Messenger',
        body: body || 'You have a new message',
      },
      data: data || {},
      webpush: {
        fcmOptions: {
          link: data?.conversationId ? `/?conversation=${data.conversationId}` : '/',
        },
        notification: {
          icon: '/logo-192.png',
          badge: '/logo-192.png',
          requireInteraction: false,
          vibrate: [200, 100, 200],
        },
      },
    };

    const response = await messaging.send(message);
    res.json({ success: true, messageId: response });
  } catch (error: any) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: error.message || 'Failed to send notification' });
  }
}

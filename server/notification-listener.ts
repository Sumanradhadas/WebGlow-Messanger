import { createClient } from '@supabase/supabase-js';
import { initializeFirebaseAdmin } from './notifications.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_BACKOFF_MS = 1000;

export async function startNotificationListener() {
  console.log('[Notification Listener] Starting notification listener...');

  const messaging = await initializeFirebaseAdmin();
  if (!messaging) {
    console.warn('[Notification Listener] Push notifications are disabled. The app will work normally without notifications.');
    console.warn('[Notification Listener] To enable notifications, configure Firebase Admin credentials and restart the server.');
    return;
  }

  const channel = supabase
    .channel('messages-channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      },
      async (payload) => {
        try {
          const message = payload.new;
          
          const { data: conversation } = await supabase
            .from('conversations')
            .select('client_id, client_name, assigned_admin_id')
            .eq('id', message.conversation_id)
            .maybeSingle();

          if (!conversation) return;

          let recipientId: string | null = null;
          
          if (message.sender_id === conversation.client_id) {
            if (conversation.assigned_admin_id) {
              recipientId = conversation.assigned_admin_id;
            } else {
              const { data: adminProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('role', 'admin')
                .limit(1)
                .maybeSingle();
              
              if (adminProfile) {
                recipientId = adminProfile.id;
              }
            }
          } else {
            recipientId = conversation.client_id;
          }

          if (!recipientId) {
            console.log(`[Notification Listener] No recipient found for message ${message.id}`);
            return;
          }

          const { data: recipient } = await supabase
            .from('profiles')
            .select('fcm_token, online')
            .eq('id', recipientId)
            .maybeSingle();

          if (!recipient?.fcm_token || recipient.online) {
            return;
          }

          const { data: sender } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', message.sender_id)
            .maybeSingle();

          let body = message.text || 'New message';
          if (message.media_type === 'image') {
            body = '📷 Photo';
          } else if (message.media_type === 'video') {
            body = '🎥 Video';
          } else if (message.media_type === 'file') {
            body = `📎 ${message.file_name || 'File'}`;
          }

          await messaging.send({
            token: recipient.fcm_token,
            notification: {
              title: `Message from ${sender?.name || 'WebGlow'}`,
              body: body,
            },
            data: {
              conversationId: message.conversation_id,
              senderId: message.sender_id,
            },
            webpush: {
              headers: {
                Urgency: 'high',
              },
              notification: {
                icon: '/logo-192.png',
                badge: '/logo-192.png',
                tag: message.conversation_id,
              },
            },
          });

          console.log(`[Notification Listener] Notification sent to ${recipientId} for message ${message.id}`);
        } catch (error) {
          console.error('[Notification Listener] Error handling message notification:', error);
        }
      }
    )
    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log('[Notification Listener] Successfully subscribed to message changes');
        reconnectAttempts = 0;
      } else if (status === 'CLOSED') {
        console.warn('[Notification Listener] Channel closed, attempting to reconnect...');
        attemptReconnect();
      } else if (status === 'CHANNEL_ERROR') {
        console.error('[Notification Listener] Channel error:', err);
        attemptReconnect();
      } else {
        console.log(`[Notification Listener] Status: ${status}`);
      }
    });

  return channel;
}

async function attemptReconnect() {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error('[Notification Listener] Max reconnect attempts reached. Manual restart required.');
    return;
  }

  reconnectAttempts++;
  const backoffMs = Math.min(BASE_BACKOFF_MS * Math.pow(2, reconnectAttempts), 30000);
  
  console.log(`[Notification Listener] Reconnecting in ${backoffMs}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
  
  setTimeout(() => {
    startNotificationListener();
  }, backoffMs);
}

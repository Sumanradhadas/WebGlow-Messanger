import { supabase } from './supabase';

export interface SendNotificationParams {
  recipientId: string;
  title: string;
  body: string;
  conversationId?: string;
  senderId: string;
}

export async function shouldSendNotification(recipientId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('online')
      .eq('id', recipientId)
      .maybeSingle();

    return !data?.online;
  } catch (error) {
    console.error('Error checking recipient status:', error);
    return true;
  }
}

export async function sendPushNotification(params: SendNotificationParams): Promise<void> {
  try {
    const shouldSend = await shouldSendNotification(params.recipientId);
    
    if (!shouldSend) {
      console.log('Recipient is online, skipping notification');
      return;
    }

    const { data: recipient } = await supabase
      .from('profiles')
      .select('fcm_token, name')
      .eq('id', params.recipientId)
      .maybeSingle();

    if (!recipient?.fcm_token) {
      console.log('Recipient has no FCM token');
      return;
    }

    const { data: sender } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', params.senderId)
      .maybeSingle();

    console.log('Notification will be sent by server-side listener');
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}

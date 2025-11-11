import { supabase, type Message as MessageType, type Conversation as ConversationType } from './supabase';
import { sendPushNotification } from './notifications';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'file';
  fileName?: string;
  fileSize?: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  lastMessage?: string;
  lastMessageTimestamp: string;
  unreadCount: number;
  assignedAdminId?: string;
}

export async function getOrCreateConversation(
  clientId: string,
  clientName: string,
  clientEmail: string,
  clientPhone?: string
): Promise<string> {
  const { data: existingConv, error: fetchError } = await supabase
    .from('conversations')
    .select('id')
    .eq('client_id', clientId)
    .maybeSingle();

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw fetchError;
  }

  if (existingConv) {
    return existingConv.id;
  }

  const { data: newConv, error: insertError } = await supabase
    .from('conversations')
    .insert({
      client_id: clientId,
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone || null,
      last_message: '',
      unread_count: 0,
    })
    .select('id')
    .single();

  if (insertError) throw insertError;
  if (!newConv) throw new Error('Failed to create conversation');

  return newConv.id;
}

export async function assignAdminToConversation(
  conversationId: string,
  adminId: string
): Promise<void> {
  const { error } = await supabase
    .from('conversations')
    .update({ assigned_admin_id: adminId })
    .eq('id', conversationId);

  if (error) throw error;
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  text: string,
  mediaUrl?: string,
  mediaType?: 'image' | 'video' | 'file',
  fileName?: string,
  fileSize?: string
): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      text: text || null,
      media_url: mediaUrl || null,
      media_type: mediaType || null,
      file_name: fileName || null,
      file_size: fileSize || null,
      is_read: false,
    });

  if (error) throw error;

  const { data: conversation } = await supabase
    .from('conversations')
    .select('client_id, assigned_admin_id')
    .eq('id', conversationId)
    .maybeSingle();

  if (conversation) {
    const recipientId = senderId === conversation.client_id 
      ? conversation.assigned_admin_id 
      : conversation.client_id;

    if (recipientId) {
      const notificationBody = mediaUrl 
        ? (mediaType === 'image' ? '📷 Image' : mediaType === 'video' ? '🎥 Video' : '📎 Attachment')
        : text;

      await sendPushNotification({
        recipientId,
        title: 'New Message',
        body: notificationBody,
        conversationId,
        senderId,
      });
    }
  }
}

export function subscribeToMessages(
  conversationId: string,
  callback: (messages: Message[]) => void
): () => void {
  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    const formattedMessages = (data || []).map(msg => ({
      id: msg.id,
      conversationId: msg.conversation_id,
      senderId: msg.sender_id,
      text: msg.text || '',
      mediaUrl: msg.media_url || undefined,
      mediaType: msg.media_type as 'image' | 'video' | 'file' | undefined,
      fileName: msg.file_name || undefined,
      fileSize: msg.file_size || undefined,
      timestamp: msg.created_at,
      isRead: msg.is_read,
    }));

    callback(formattedMessages);
  };

  fetchMessages();

  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      () => {
        fetchMessages();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToConversations(
  callback: (conversations: Conversation[]) => void
): () => void {
  const fetchConversations = async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return;
    }

    const formattedConvos = (data || []).map(conv => ({
      id: conv.id,
      clientId: conv.client_id,
      clientName: conv.client_name,
      clientEmail: conv.client_email,
      clientPhone: conv.client_phone || undefined,
      lastMessage: conv.last_message || undefined,
      lastMessageTimestamp: conv.last_message_at,
      unreadCount: conv.unread_count,
      assignedAdminId: conv.assigned_admin_id || undefined,
    }));

    callback(formattedConvos);
  };

  fetchConversations();

  const channel = supabase
    .channel('conversations')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations',
      },
      () => {
        fetchConversations();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function markMessagesAsRead(conversationId: string): Promise<void> {
  const { error } = await supabase.rpc('mark_messages_read', {
    p_conversation_id: conversationId,
  });

  if (error) {
    console.error('Error marking messages as read:', error);
  }
}

export async function setTypingStatus(
  conversationId: string,
  userId: string,
  isTyping: boolean
): Promise<void> {
  const { error } = await supabase
    .from('typing_status')
    .upsert({
      conversation_id: conversationId,
      user_id: userId,
      is_typing: isTyping,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error setting typing status:', error);
  }
}

export function subscribeToTypingStatus(
  conversationId: string,
  currentUserId: string,
  callback: (isTyping: boolean) => void
): () => void {
  const fetchTypingStatus = async () => {
    const { data } = await supabase
      .from('typing_status')
      .select('*')
      .eq('conversation_id', conversationId)
      .maybeSingle();

    if (data && data.user_id !== currentUserId) {
      callback(data.is_typing);
    }
  };

  fetchTypingStatus();

  const channel = supabase
    .channel(`typing:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'typing_status',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload: any) => {
        if (payload.new && payload.new.user_id !== currentUserId) {
          callback(payload.new.is_typing);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function uploadFile(file: File): Promise<{ url: string; fileName: string; fileSize: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload file');
  }

  const data = await response.json();
  return {
    url: data.url,
    fileName: data.fileName,
    fileSize: data.fileSize,
  };
}

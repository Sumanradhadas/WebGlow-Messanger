import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export type Profile = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'client' | 'admin';
  avatar_url?: string;
  created_at: string;
};

export type Conversation = {
  id: string;
  client_id: string;
  assigned_admin_id?: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  last_message?: string;
  last_message_at: string;
  unread_count: number;
  created_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  text?: string;
  media_url?: string;
  media_type?: string;
  file_name?: string;
  file_size?: string;
  is_read: boolean;
  created_at: string;
};

export type TypingStatus = {
  conversation_id: string;
  user_id: string;
  is_typing: boolean;
  updated_at: string;
};

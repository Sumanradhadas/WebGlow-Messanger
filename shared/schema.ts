import { z } from "zod";

export const profileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  phone: z.string().optional(),
  role: z.enum(['client', 'admin']),
  avatar_url: z.string().optional(),
  fcm_token: z.string().optional(),
  online: z.boolean().default(false),
  last_seen: z.string().optional(),
  created_at: z.string(),
});

export const conversationSchema = z.object({
  id: z.string().uuid(),
  client_id: z.string().uuid(),
  assigned_admin_id: z.string().uuid().optional(),
  client_name: z.string(),
  client_email: z.string().email(),
  client_phone: z.string().optional(),
  last_message: z.string().optional(),
  last_message_at: z.string(),
  unread_count: z.number().int().default(0),
  created_at: z.string(),
});

export const messageSchema = z.object({
  id: z.string().uuid(),
  conversation_id: z.string().uuid(),
  sender_id: z.string().uuid(),
  text: z.string().optional(),
  media_url: z.string().optional(),
  media_type: z.enum(['image', 'video', 'file']).optional(),
  file_name: z.string().optional(),
  file_size: z.string().optional(),
  is_read: z.boolean().default(false),
  created_at: z.string(),
});

export type Profile = z.infer<typeof profileSchema>;
export type Conversation = z.infer<typeof conversationSchema>;
export type Message = z.infer<typeof messageSchema>;

import { supabase } from './supabase';

let heartbeatInterval: NodeJS.Timeout | null = null;

export async function setUserOnline(userId: string): Promise<void> {
  return;
}

export async function setUserOffline(userId: string): Promise<void> {
  return;
}

function startHeartbeat(userId: string): void {
  return;
}

function stopHeartbeat(): void {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

export function setupPresenceTracking(userId: string): () => void {
  return () => {};
}

export function subscribeToUserStatus(userId: string, callback: (online: boolean, lastSeen: string | null) => void): () => void {
  return () => {};
}

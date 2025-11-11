import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Bell, BellOff } from 'lucide-react';
import { setupFCM, requestNotificationPermission, clearFCMToken } from '@/lib/fcm';
import { getCurrentUser } from '@/lib/auth';

interface NotificationToggleProps {
  variant?: 'icon' | 'inline';
}

export default function NotificationToggle({ variant = 'icon' }: NotificationToggleProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkPermission = () => {
      if ('Notification' in window) {
        setNotificationsEnabled(Notification.permission === 'granted');
      }
    };
    checkPermission();
  }, []);

  const toggleNotifications = async () => {
    setLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user) return;

      if (!notificationsEnabled) {
        const hasPermission = await requestNotificationPermission();
        if (hasPermission) {
          await setupFCM(user.id);
          setNotificationsEnabled(true);
        }
      } else {
        await clearFCMToken(user.id);
        setNotificationsEnabled(false);
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'inline') {
    return (
      <button
        onClick={toggleNotifications}
        disabled={loading}
        className="inline text-primary hover:underline cursor-pointer"
      >
        {notificationsEnabled ? 'Notifications on' : 'Enable notifications'}
      </button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleNotifications}
      disabled={loading}
      className="relative"
      title={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
    >
      {notificationsEnabled ? (
        <Bell className="h-5 w-5 text-primary" />
      ) : (
        <BellOff className="h-5 w-5 text-muted-foreground" />
      )}
      {notificationsEnabled && (
        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-green-500" />
      )}
    </Button>
  );
}

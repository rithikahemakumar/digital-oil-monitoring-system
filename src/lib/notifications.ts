/**
 * System and Browser Notification Service
 * Manages permission requests, PWA Service Worker notifications, and desktop alerts.
 */

export type NotificationPermissionStatus = 'default' | 'granted' | 'denied' | 'unsupported';

export function getNotificationPermission(): NotificationPermissionStatus {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission as NotificationPermissionStatus;
}

export async function requestNotificationPermission(): Promise<NotificationPermissionStatus> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const perm = await Notification.requestPermission();
    return perm as NotificationPermissionStatus;
  } catch (e) {
    console.error('Failed to request notification permission:', e);
    return Notification.permission as NotificationPermissionStatus;
  }
}

export async function sendSystemNotification(title: string, options?: {
  body?: string;
  icon?: string;
  tag?: string;
  data?: any;
}): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  const iconUrl = options?.icon || '/icon.svg';

  try {
    // Try service worker notification first (recommended for PWAs and mobile)
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && typeof registration.showNotification === 'function') {
        await registration.showNotification(title, {
          body: options?.body,
          icon: iconUrl,
          badge: iconUrl,
          tag: options?.tag || 'oilwise-alert',
          data: options?.data,
        });
        return true;
      }
    }

    // Direct desktop Web Notification fallback
    new Notification(title, {
      body: options?.body,
      icon: iconUrl,
      tag: options?.tag || 'oilwise-alert',
    });
    return true;
  } catch (err) {
    console.warn('Service worker notification failed, attempting basic Notification:', err);
    try {
      new Notification(title, {
        body: options?.body,
      });
      return true;
    } catch {
      return false;
    }
  }
}

// Service Worker for background notifications
// Handles both polling (while app is open) and Web Push (when browser is closed)

const NOTIFICATION_INTERVAL = 10000;
const API_BASE_URL = 'https://ikigai-backend.replit.app/api/v1';

let lastEventCheckTime = new Date();
let token = null;

// ─── Handle messages from the main app ───────────────────────────────────────

self.addEventListener('message', (event) => {
  if (event.data.type === 'SET_TOKEN') {
    token = event.data.token;
    startNotificationPoller();
  }
});

// ─── Web Push: fired by the server even when browser/tab is closed ────────────

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: '🔔 إشعار جديد', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || '🔔 IKIGAI Quest';
  const options = {
    body: data.body || '',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: data.tag || 'push',
    requireInteraction: true,
    data: data,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ─── Notification click: open/focus the app ───────────────────────────────────

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});

// ─── Polling (while app is open or tab is in background) ─────────────────────

async function checkForNotifications() {
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE_URL}/notifications/recent?limit=50`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) return;

    const data = await response.json();
    const notifications = data.data || [];

    for (const notification of notifications) {
      const notificationTime = new Date(notification.createdAt);
      if (notificationTime > lastEventCheckTime) {
        const notifData = getNotificationData(notification);
        await self.registration.showNotification(notifData.title, notifData.options);
      }
    }

    lastEventCheckTime = new Date();
  } catch (error) {
    // Silently fail
  }
}

function getNotificationData(notification) {
  const defaultOptions = {
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    requireInteraction: true,
  };

  switch (notification.type) {
    case 'QUIZ_CREATED':
      return {
        title: '🎯 مسابقة جديدة!',
        options: { body: `${notification.data?.title || 'New Quiz'} • ${notification.data?.xpReward || 0} XP`, tag: 'new-quiz', ...defaultOptions },
      };
    case 'EVENT_CREATED':
      return {
        title: '📅 حدث جديد!',
        options: { body: notification.data?.title || 'New Event', tag: 'new-event', ...defaultOptions },
      };
    case 'MATCH_CREATED':
      return {
        title: '⚽ مباراة جديدة!',
        options: { body: `${notification.data?.title || 'New Match'} • ${notification.data?.sport || 'Sports'}`, tag: 'new-match', ...defaultOptions },
      };
    case 'MATCH_LIVE':
      return {
        title: '🔴 المباراة مباشرة الآن!',
        options: { body: notification.data?.title || 'Match Starting', tag: 'match-live', ...defaultOptions },
      };
    case 'PUBLICATION_CREATED':
      return {
        title: '📰 منشور جديد!',
        options: { body: `${notification.data?.title || 'New Publication'} بقلم ${notification.data?.author || 'Unknown'}`, tag: 'new-publication', ...defaultOptions },
      };
    case 'ACHIEVEMENT_EARNED':
      return {
        title: '🎉 إنجاز جديد!',
        options: { body: notification.data?.achievement || 'Achievement Unlocked', tag: 'achievement', ...defaultOptions },
      };
    case 'LEVEL_UP':
      return {
        title: '⬆️ ارتقاء مستوى!',
        options: { body: notification.data?.levelName || 'Level Up', tag: 'level-up', ...defaultOptions },
      };
    default:
      return {
        title: '🔔 إشعار جديد',
        options: { body: notification.data?.message || '', tag: 'general', ...defaultOptions },
      };
  }
}

function startNotificationPoller() {
  checkForNotifications();
  setInterval(checkForNotifications, NOTIFICATION_INTERVAL);
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(clients.claim()));

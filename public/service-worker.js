// Service Worker for background notifications
// Runs even when the tab is closed

const NOTIFICATION_INTERVAL = 10000; // Check every 10 seconds
const API_BASE_URL = 'https://ikigai-backend.replit.app/api/v1';

let lastEventCheckTime = new Date();
let token = null;

// Handle incoming messages from the main app
self.addEventListener('message', (event) => {
  if (event.data.type === 'SET_TOKEN') {
    token = event.data.token;
    console.log('Service Worker: Received auth token');
    startNotificationPoller();
  }
});

// Check for new notifications
async function checkForNotifications() {
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE_URL}/notifications/recent?limit=50`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.log('Service Worker: Notification fetch failed');
      return;
    }

    const data = await response.json();
    const notifications = data.data || [];

    for (const notification of notifications) {
      const notificationTime = new Date(notification.createdAt);
      if (notificationTime > lastEventCheckTime) {
        // Show notification based on type
        const notifData = getNotificationData(notification);
        await self.registration.showNotification(notifData.title, notifData.options);
      }
    }

    lastEventCheckTime = new Date();
  } catch (error) {
    console.error('Service Worker: Error checking notifications:', error);
  }
}

// Get notification title and options based on type
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
        options: {
          body: `${notification.data?.title || 'New Quiz'} • ${notification.data?.xpReward || 0} XP`,
          tag: 'new-quiz',
          ...defaultOptions,
        },
      };

    case 'EVENT_CREATED':
      return {
        title: '📅 حدث جديد!',
        options: {
          body: `${notification.data?.title || 'New Event'}`,
          tag: 'new-event',
          ...defaultOptions,
        },
      };

    case 'MATCH_CREATED':
      return {
        title: '⚽ مباراة جديدة!',
        options: {
          body: `${notification.data?.title || 'New Match'} • ${notification.data?.sport || 'Sports'}`,
          tag: 'new-match',
          ...defaultOptions,
        },
      };

    case 'MATCH_LIVE':
      return {
        title: '🔴 المباراة مباشرة الآن!',
        options: {
          body: notification.data?.title || 'Match Starting',
          tag: 'match-live',
          ...defaultOptions,
        },
      };

    case 'PUBLICATION_CREATED':
      return {
        title: '📰 منشور جديد!',
        options: {
          body: `${notification.data?.title || 'New Publication'} بقلم ${notification.data?.author || 'Unknown'}`,
          tag: 'new-publication',
          ...defaultOptions,
        },
      };

    case 'ACHIEVEMENT_EARNED':
      return {
        title: '🎉 إنجاز جديد!',
        options: {
          body: notification.data?.achievement || 'Achievement Unlocked',
          tag: 'achievement',
          ...defaultOptions,
        },
      };

    case 'LEVEL_UP':
      return {
        title: '⬆️ ارتقاء مستوى!',
        options: {
          body: notification.data?.levelName || 'Level Up',
          tag: 'level-up',
          ...defaultOptions,
        },
      };

    default:
      return {
        title: '🔔 إشعار جديد',
        options: {
          body: notification.data?.message || 'New notification',
          tag: 'general',
          ...defaultOptions,
        },
      };
  }
}

// Start polling for notifications
function startNotificationPoller() {
  // Check immediately
  checkForNotifications();

  // Then check every 10 seconds
  setInterval(checkForNotifications, NOTIFICATION_INTERVAL);
}

// Handle notification click
self.addEventListener('click', (event) => {
  event.notification.close();

  // Open the app when notification is clicked
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Activate service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  event.waitUntil(clients.claim());
});

// Install service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing');
  self.skipWaiting();
});

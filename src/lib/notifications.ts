import api from './api';
import { Platform } from 'react-native';

const API_BASE = 'https://ikigai-backend.replit.app/api/v1';

// Conditionally import react-hot-toast only on web
let toast: any = null;
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  try {
    toast = require('react-hot-toast').default;
  } catch (error) {
    console.warn('react-hot-toast not available');
  }
}
const isMobileBrowser = () => {
  if (Platform.OS !== 'web') return false;
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Play notification sound
const playNotificationSound = () => {
  try {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    // Silently fail if audio context not available
  }
};

// Request notification permission — works on all browsers including mobile
const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  if (!('Notification' in window)) return false;

  if (Notification.permission === 'granted') return true;

  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  return false;
};

// Returns current permission state without prompting
export const getNotificationPermissionState = (): 'granted' | 'denied' | 'default' | 'unsupported' => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return 'unsupported';
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
};

const sendNotification = (title: string, options?: NotificationOptions) => {
  const isMobile = isMobileBrowser();
  const body = (options as any)?.body || '';
  const message = body ? `${title}\n${body}` : title;

  // For mobile browsers, use in-app toast + sound (permission may not be reliable there)
  if (isMobile) {
    playNotificationSound();
    
    if (toast && typeof toast.success === 'function') {
      const duration = (options as any)?.requireInteraction ? 5000 : 3000;
      toast.success(message, {
        duration,
        icon: '🔔',
        style: {
          background: '#1f2937',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
          maxWidth: '90vw',
          wordBreak: 'break-word',
        },
        position: 'top-center',
      });
    } else {
      console.log('Notification:', message);
    }
    return;
  }

  // For desktop, use Web Notifications API
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
      playNotificationSound();
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }
};

export const notificationService = {
  requestPermission: requestNotificationPermission,
  sendNotification,

  // Quiz notifications
  notifyQuizResult: (score: number, passed: boolean, xpEarned: number) => {
    const title = passed ? '✅ أجابتك صحيحة!' : '❌ حاول مرة أخرى';
    sendNotification(title, {
      body: `النتيجة: ${score}% ${xpEarned > 0 ? `• +${xpEarned} XP` : ''}`,
      tag: 'quiz-result',
    });
  },

  notifyNewQuiz: (quizTitle: string, xpReward: number) => {
    sendNotification('🎯 مسابقة جديدة!', {
      body: `${quizTitle} • ${xpReward} XP`,
      tag: 'new-quiz',
      requireInteraction: true,
    });
  },

  // Event notifications
  notifyNewEvent: (eventTitle: string, startTime: string) => {
    sendNotification('📅 حدث جديد!', {
      body: `${eventTitle} • ${new Date(startTime).toLocaleString('ar-EG')}`,
      tag: 'new-event',
      requireInteraction: true,
    });
  },

  notifyEventStarting: (eventTitle: string) => {
    sendNotification('⏰ الحدث يبدأ الآن!', {
      body: eventTitle,
      tag: 'event-starting',
      requireInteraction: true,
    });
  },

  // Sports/Match notifications
  notifyNewMatch: (matchTitle: string, sport: string) => {
    sendNotification('⚽ مباراة جديدة!', {
      body: `${matchTitle} • ${sport}`,
      tag: 'new-match',
      requireInteraction: true,
    });
  },

  notifyMatchLive: (matchTitle: string) => {
    sendNotification('🔴 المباراة مباشرة الآن!', {
      body: matchTitle,
      tag: 'match-live',
      requireInteraction: true,
    });
  },

  notifyMatchResult: (matchTitle: string, result: string, xpEarned: number) => {
    sendNotification('🏆 نتيجة المباراة', {
      body: `${matchTitle}\n${result} • +${xpEarned} XP`,
      tag: 'match-result',
    });
  },

  // Publication/Magazine notifications
  notifyNewPublication: (publicationTitle: string, author: string) => {
    sendNotification('📰 منشور جديد!', {
      body: `${publicationTitle} بقلم ${author}`,
      tag: 'new-publication',
      requireInteraction: true,
    });
  },

  // Achievement notifications
  notifyAchievement: (achievement: string) => {
    sendNotification(`🎉 إنجاز جديد!`, {
      body: achievement,
      tag: 'achievement',
    });
  },

  notifyLevelUp: (levelName: string) => {
    sendNotification(`⬆️ ارتقاء مستوى!`, {
      body: levelName,
      tag: 'level-up',
    });
  },

  // XP notifications
  notifyXpAwarded: (amount: number, reason: string) => {
    sendNotification(`⭐ +${amount} XP`, {
      body: reason,
      tag: 'xp-awarded',
    });
  },

  // Generic notifications
  notifyInfo: (title: string, message: string) => {
    sendNotification(title, {
      body: message,
      tag: 'info',
    });
  },
};

// ─── Web Push helpers ────────────────────────────────────────────────────────

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

const registerWebPush = async (registration: ServiceWorkerRegistration, authToken: string) => {
  try {
    if (!('PushManager' in window)) {
      console.log('Web Push not supported in this browser');
      return;
    }

    // 1. Get VAPID public key from backend
    const res = await fetch(`${API_BASE}/push-notifications/vapid-public-key`);
    if (!res.ok) return;
    const json = await res.json();
    const vapidPublicKey: string = json?.data?.publicKey;
    if (!vapidPublicKey) return;

    // 2. Re-use existing subscription or create a new one
    const existing = await registration.pushManager.getSubscription();
    const subscription = existing ?? await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    // 3. Send subscription to backend
    await fetch(`${API_BASE}/push-notifications/web-subscribe`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscription }),
    });

    console.log('Web Push subscription registered ✓');
  } catch (error) {
    console.log('Web Push registration skipped:', error);
  }
};

// ─── Service Worker + polling setup ──────────────────────────────────────────

let eventListenerInterval: any = null;
let lastEventCheckTime = new Date(Date.now() - 10 * 60 * 1000);
let serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

const registerServiceWorker = async (token: string) => {
  if (!('serviceWorker' in navigator)) return;

  try {
    serviceWorkerRegistration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
    });

    console.log('Service Worker registered ✓');

    const sendToken = (sw: ServiceWorker) => sw.postMessage({ type: 'SET_TOKEN', token });

    if (serviceWorkerRegistration.active) {
      sendToken(serviceWorkerRegistration.active);
    }

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (navigator.serviceWorker.controller) {
        sendToken(navigator.serviceWorker.controller);
      }
    });

    // Register Web Push after service worker is ready
    await registerWebPush(serviceWorkerRegistration, token);

  } catch (error) {
    console.error('Service Worker registration failed:', error);
  }
};

export const startEventListener = async (token: string, onNewEvent?: (event: any) => void) => {
  if (eventListenerInterval) return;

  await registerServiceWorker(token);

  const checkForNewEvents = async () => {
    try {
      const response = await api.get('/notifications/recent', {
        params: { limit: 50 },
      });

      const notifications = response.data.data || [];
      for (const notification of notifications) {
        const notificationTime = new Date(notification.createdAt);
        if (notificationTime > lastEventCheckTime) {
          onNewEvent?.(notification);
          
          switch (notification.type) {
            case 'QUIZ_CREATED':
              notificationService.notifyNewQuiz(
                notification.data?.title || 'New Quiz',
                notification.data?.xpReward || 0
              );
              break;
            case 'EVENT_CREATED':
              notificationService.notifyNewEvent(
                notification.data?.title || 'New Event',
                notification.data?.startTime || new Date().toISOString()
              );
              break;
            case 'MATCH_CREATED':
              notificationService.notifyNewMatch(
                notification.data?.title || 'New Match',
                notification.data?.sport || 'Sports'
              );
              break;
            case 'MATCH_LIVE':
              notificationService.notifyMatchLive(notification.data?.title || 'Match Starting');
              break;
            case 'PUBLICATION_CREATED':
              notificationService.notifyNewPublication(
                notification.data?.title || 'New Publication',
                notification.data?.author || 'Unknown'
              );
              break;
            case 'ACHIEVEMENT_EARNED':
              notificationService.notifyAchievement(notification.data?.achievement || 'Achievement Unlocked');
              break;
            case 'LEVEL_UP':
              notificationService.notifyLevelUp(notification.data?.levelName || 'Level Up');
              break;
          }
        }
      }

      lastEventCheckTime = new Date();
    } catch (error) {
      console.error('Error checking for new notifications:', error);
    }
  };

  eventListenerInterval = setInterval(checkForNewEvents, 3000);
  await checkForNewEvents();
};

export const stopEventListener = () => {
  if (eventListenerInterval) {
    clearInterval(eventListenerInterval);
    eventListenerInterval = null;
  }
};

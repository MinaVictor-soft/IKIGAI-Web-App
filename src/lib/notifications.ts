import api from './api';
import toast from 'react-hot-toast';

// Detect if running on mobile browser
const isMobileBrowser = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Play notification sound
const playNotificationSound = () => {
  try {
    // Use Web Audio API to play a simple beep
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
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

// Web Notifications API for desktop, toast fallback for mobile
const requestNotificationPermission = async () => {
  if (isMobileBrowser()) {
    // Mobile browsers don't need notification permission for in-app toasts
    return true;
  }

  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

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

const sendNotification = (title: string, options?: NotificationOptions) => {
  const isMobile = isMobileBrowser();
  const body = (options as any)?.body || '';
  const message = body ? `${title}\n${body}` : title;

  // For mobile browsers, use in-app toast + sound
  if (isMobile) {
    playNotificationSound();
    
    // Show toast notification with longer duration for important notifications
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
    return;
  }

  // For desktop, use Web Notifications API
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return;
  }

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

// Real-time event listener setup
let eventListenerInterval: any = null;
let lastEventCheckTime = new Date();
let serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

// Register Service Worker for background notifications
const registerServiceWorker = async (token: string) => {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Workers not supported');
    return;
  }

  try {
    serviceWorkerRegistration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
    });

    console.log('Service Worker registered successfully');

    // Send token to service worker so it can authenticate with backend
    if (serviceWorkerRegistration.active) {
      serviceWorkerRegistration.active.postMessage({
        type: 'SET_TOKEN',
        token: token,
      });
    }

    // Also send token when controller changes (e.g., on first registration)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SET_TOKEN',
          token: token,
        });
      }
    });
  } catch (error) {
    console.error('Service Worker registration failed:', error);
  }
};

export const startEventListener = async (token: string, onNewEvent?: (event: any) => void) => {
  if (eventListenerInterval) return; // Already running

  // Register service worker for background notifications
  await registerServiceWorker(token);

  const checkForNewEvents = async () => {
    try {
      const response = await api.get('/notifications/recent', {
        params: { limit: 50 },
      });

      const notifications = response.data.data || [];
      for (const notification of notifications) {
        // Check if this notification is newer than last check
        const notificationTime = new Date(notification.createdAt);
        if (notificationTime > lastEventCheckTime) {
          onNewEvent?.(notification);
          
          // Send appropriate web notification based on notification type
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

  // Check for new events every 5 seconds (ultra-fast real-time notifications when app is open)
  eventListenerInterval = setInterval(checkForNewEvents, 5000);
  
  // Initial check
  await checkForNewEvents();
};

export const stopEventListener = () => {
  if (eventListenerInterval) {
    clearInterval(eventListenerInterval);
    eventListenerInterval = null;
  }
};

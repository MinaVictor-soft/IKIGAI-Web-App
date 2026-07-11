import React, { useEffect, useRef, useState } from 'react';
import { Platform, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons as _Ionicons } from '@expo/vector-icons';
import { notificationService, getNotificationPermissionState, subscribeWebPush } from '../lib/notifications';
import { getAccessToken } from '../lib/storage';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LangContext';
import { useAvailableQuizzes, useFootballMatches, useMyQuizSubmissions, useActiveSessions, useMyXpHistory, usePublications, useAdminSettings, useUpcomingTournamentMatches, useTournaments } from '../hooks/useApi';
import { COLORS } from '../config/constants';
import { useViewed } from '../contexts/ViewedContext';

// Screens
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import ScannerScreen from '../screens/ScannerScreen';
import QuizListScreen from '../screens/QuizListScreen';
import QuizPlayScreen from '../screens/QuizPlayScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SportsScreen from '../screens/SportsScreen';
import TournamentScreen from '../screens/TournamentScreen';
import EventsScreen from '../screens/EventsScreen';
import LibraryScreen from '../screens/LibraryScreen';
import LoadingScreen from '../screens/LoadingScreen';
import InfoScreen from '../screens/InfoScreen';

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  QuizPlay: { quizId: string; title: string };
};

export type MainTabParamList = {
  Home: undefined;
  Events: undefined;
  Library: undefined;
  Sports: undefined;
  Tournament: undefined;
  Leaderboard: undefined;
  Scan: undefined;
  Quizzes: undefined;
  Profile: undefined;
  Info: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.text,
    border: COLORS.border,
    primary: COLORS.primary,
  },
};

function NotificationBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <View style={badgeStyles.badge}>
      <Text style={badgeStyles.badgeText}>{count > 9 ? '9+' : count}</Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  badge: { position: 'absolute', top: -2, right: -6, backgroundColor: COLORS.error, borderRadius: 9, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4, borderWidth: 1.5, borderColor: COLORS.surface },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
});

const notifBannerStyles = StyleSheet.create({
  banner: { position: 'absolute' as any, top: 0, left: 0, right: 0, zIndex: 9999, flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#334155' },
  text: { flex: 1, color: '#e2e8f0', fontSize: 12, textAlign: 'right', marginHorizontal: 8 },
  allow: { backgroundColor: '#7c3aed', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 5, marginLeft: 6 },
  allowText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  dismiss: { padding: 4, marginLeft: 4 },
});

function MainTabs() {
  const { t } = useLang();
  const { viewedPublicationIds } = useViewed();
  const { data: quizzes } = useAvailableQuizzes();
  const { data: matches } = useFootballMatches();
  const { data: submissions } = useMyQuizSubmissions();
  const { data: sessions } = useActiveSessions();
  const { data: history } = useMyXpHistory();
  const { data: publications } = usePublications();
  const { data: adminSettings } = useAdminSettings();
  const { data: tournamentMatches } = useUpcomingTournamentMatches();
  const { data: tournaments } = useTournaments();

  // Determine tab visibility based on admin settings (default true if no settings)
  const showSportsTab = adminSettings?.sportsTabVisibilityWeb ?? true;
  const showTournamentTab = adminSettings?.tournamentVisibilityWeb ?? true;

  // Web push notifications — permission banner + detect new quizzes
  const knownQuizIds = useRef<Set<string>>(new Set());
  const notifReady = useRef(false);
  const [showNotifBanner, setShowNotifBanner] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const state = getNotificationPermissionState();
    // If permission is still 'default' (never decided), ALWAYS show the banner —
    // dismissed flag is ignored because the user still hasn't subscribed.
    // Only suppress if they already granted or denied at the browser level.
    if (state === 'default') {
      setShowNotifBanner(true);
    }
  }, []);

  useEffect(() => {
    if (!quizzes) return;
    if (!notifReady.current) {
      quizzes.forEach((q: any) => knownQuizIds.current.add(q.id));
      notifReady.current = true;
      return;
    }
    if (Platform.OS === 'web') {
      quizzes.forEach((q: any) => {
        if (!knownQuizIds.current.has(q.id)) {
          knownQuizIds.current.add(q.id);
          notificationService.notifyNewQuiz(q.title || 'New Quiz', q.xpReward || 0);
        }
      });
    }
  }, [quizzes]);

  // Badge counts
  const submittedIds = new Set((submissions || []).map((s: any) => s.quizId));
  const newQuizzes = (quizzes || []).filter(q => !submittedIds.has(q.id)).length;
  const liveMatches = (matches || []).filter(m => m.status === 'LIVE').length;
  const activeTournaments = (tournaments || []).filter(t => t.status === 'LIVE' || t.status === 'GROUP_STAGE').length;

  const attendedSessionIds = new Set(
    (history || []).filter(tx => tx.sourceType === 'SESSION' && tx.sourceId).map(tx => tx.sourceId)
  );
  const now = new Date();
  const upcomingSessions = (sessions || []).filter(s => !attendedSessionIds.has(s.id) && new Date(s.endTime) > now);
  const upcomingMatches = (matches || []).filter(m => m.status === 'SCHEDULED' || m.status === 'LIVE');
  const upcomingTournamentMatches = (tournamentMatches || []).filter(m => m.status === 'SCHEDULED' || m.status === 'LIVE').length;
  const unsubmittedQuizzes = (quizzes || []).filter(q => !submittedIds.has(q.id));
  const eventsCount = upcomingSessions.length + upcomingMatches.length + upcomingTournamentMatches + unsubmittedQuizzes.length;

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const newPublications = (publications || []).filter((p: any) => p.publishedAt && new Date(p.publishedAt) > oneDayAgo && !viewedPublicationIds.has(p.id)).length;

  // Badge counts based on real user actions:
  // - Sports: live matches user hasn't viewed
  // - Library: new publications user hasn't opened
  // - Events: sessions user hasn't attended + scheduled/live matches + unsubmitted quizzes
  // - Tournament: tournaments currently LIVE or in GROUP_STAGE
  // - Quizzes: quizzes user hasn't submitted
  const getBadge = (tab: string) => {
    switch (tab) {
      case 'Events': return eventsCount;
      case 'Library': return newPublications;
      case 'Sports': return liveMatches;
      case 'Tournament': return activeTournaments;
      case 'Quizzes': return newQuizzes;
      default: return 0;
    }
  };

  const handleAllowNotifications = async () => {
    setShowNotifBanner(false);
    const granted = await notificationService.requestPermission();
    if (!granted) return;
    // Permission just granted — register Web Push subscription immediately
    try {
      const token = await getAccessToken();
      if (token) await subscribeWebPush(token);
    } catch (e) {
      console.error('Failed to subscribe to Web Push:', e);
    }
  };

  return (
    <>
      {/* Notification permission banner for mobile browsers */}
      {showNotifBanner && Platform.OS === 'web' && (
        <View style={notifBannerStyles.banner}>
          <_Ionicons name="notifications-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={notifBannerStyles.text}>فعّل الإشعارات لتصلك التحديثات حتى عند إغلاق التطبيق</Text>
          <TouchableOpacity onPress={handleAllowNotifications} style={notifBannerStyles.allow}>
            <Text style={notifBannerStyles.allowText}>تفعيل</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setShowNotifBanner(false); localStorage.setItem('notif_banner_dismissed', '1'); }} style={notifBannerStyles.dismiss}>
            <_Ionicons name="close" size={18} color="#aaa" />
          </TouchableOpacity>
        </View>
      )}
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: 56,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          switch (route.name) {
            case 'Home': iconName = focused ? 'home' : 'home-outline'; break;
            case 'Events': iconName = focused ? 'calendar' : 'calendar-outline'; break;
            case 'Library': iconName = focused ? 'book' : 'book-outline'; break;
            case 'Sports': iconName = focused ? 'football' : 'football-outline'; break;
            case 'Tournament': iconName = focused ? 'trophy' : 'trophy-outline'; break;
            case 'Leaderboard': iconName = focused ? 'podium' : 'podium-outline'; break;
            case 'Scan': iconName = focused ? 'qr-code' : 'qr-code-outline'; break;
            case 'Quizzes': iconName = focused ? 'help-circle' : 'help-circle-outline'; break;
            case 'Profile': iconName = focused ? 'person' : 'person-outline'; break;
            case 'Info': iconName = focused ? 'information-circle' : 'information-circle-outline'; break;
          }
          const badge = getBadge(route.name);
          return (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: focused ? COLORS.primary + '18' : 'transparent',
              overflow: 'visible',
            }}>
              <Ionicons name={iconName} size={focused ? 22 : 20} color={color} />
              {badge > 0 && <NotificationBadge count={badge} />}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: t('home') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: t('profile') }} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} options={{ tabBarLabel: t('leaderboard') }} />
      <Tab.Screen name="Events" component={EventsScreen} options={{ tabBarLabel: t('events') || 'Events' }} />
      <Tab.Screen name="Quizzes" component={QuizListScreen} options={{ tabBarLabel: t('quizzes') }} />
      <Tab.Screen name="Library" component={LibraryScreen} options={{ tabBarLabel: 'Library' }} />
      {showSportsTab && <Tab.Screen name="Sports" component={SportsScreen} options={{ tabBarLabel: t('sports') }} />}
      {showTournamentTab && <Tab.Screen name="Tournament" component={TournamentScreen} options={{ tabBarLabel: 'Tournaments' }} />}
      <Tab.Screen name="Scan" component={ScannerScreen} options={{ tabBarLabel: t('scanQr') }} />
      <Tab.Screen name="Info" component={InfoScreen} options={{ tabBarLabel: 'Info' }} />
    </Tab.Navigator>
    </>
  );
}

export default function AppNavigator() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return null; // SplashScreen in App.tsx covers this with zIndex 9999
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="QuizPlay"
              component={QuizPlayScreen}
              options={{ headerShown: true, headerStyle: { backgroundColor: COLORS.surface }, headerTintColor: COLORS.text }}
            />

          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

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
  banner: { position: 'absolute' as any, bottom: 80, left: 12, right: 12, zIndex: 9999, backgroundColor: '#4c1d95', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 12, borderWidth: 1, borderColor: '#7c3aed' },
  bannerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  bannerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  bannerIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#7c3aed', justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  text: { flex: 1, color: '#ede9fe', fontSize: 14, textAlign: 'right', lineHeight: 20, fontWeight: '600' },
  allow: { backgroundColor: '#fff', borderRadius: 10, paddingVertical: 12, alignItems: 'center', flex: 1 },
  allowText: { color: '#4c1d95', fontSize: 14, fontWeight: '800' },
  dismiss: { padding: 8, marginLeft: 4 },
  // Denied-state guide modal
  overlay: { position: 'absolute' as any, top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { backgroundColor: '#1e293b', borderRadius: 16, padding: 24, width: '100%', maxWidth: 380, borderWidth: 1, borderColor: '#334155' },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  cardSubtitle: { color: '#94a3b8', fontSize: 13, textAlign: 'center', marginBottom: 20 },
  step: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, gap: 12 },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#7c3aed', justifyContent: 'center', alignItems: 'center' },
  stepNumText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  stepText: { flex: 1, color: '#e2e8f0', fontSize: 13, lineHeight: 20, textAlign: 'right' },
  stepHighlight: { color: '#a78bfa', fontWeight: '700' },
  refreshBtn: { backgroundColor: '#7c3aed', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  refreshBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  closeGuide: { marginTop: 12, alignItems: 'center' },
  closeGuideText: { color: '#64748b', fontSize: 13 },
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
  const [showNotifGuide, setShowNotifGuide] = useState(false);
  const [showStepsModal, setShowStepsModal] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const state = getNotificationPermissionState();
    if (state === 'default') {
      // Never decided — show the enable banner
      setShowNotifBanner(true);
    } else if (state === 'denied') {
      // Blocked in browser — show step-by-step guide to unblock
      setShowNotifGuide(true);
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

  const [notifStatus, setNotifStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [notifError, setNotifError] = useState('');

  const handleAllowNotifications = async () => {
    setNotifStatus('loading');
    const granted = await notificationService.requestPermission();
    if (!granted) {
      setNotifStatus('idle');
      return;
    }
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Not logged in — no access token');
      await subscribeWebPush(token);
      setShowNotifBanner(false);
      setNotifStatus('success');
    } catch (e: any) {
      console.error('[Push ERROR]', e);
      setNotifStatus('error');
      setNotifError(e?.message || 'Unknown error');
    }
  };

  return (
    <>
      {/* Notification permission banner — shown when permission is 'default' */}
      {showNotifBanner && Platform.OS === 'web' && (
        <View style={notifBannerStyles.banner}>
          {/* Header row: icon + text + X — all in normal flow, no absolute */}
          <View style={notifBannerStyles.bannerHeader}>
            <View style={notifBannerStyles.bannerIcon}>
              <_Ionicons name={notifStatus === 'success' ? 'checkmark-circle' : notifStatus === 'error' ? 'alert-circle' : 'notifications'} size={22} color="#fff" />
            </View>
            <Text style={notifBannerStyles.text}>
              {notifStatus === 'loading' ? 'جارٍ التفعيل…' :
               notifStatus === 'success' ? '✓ تم تفعيل الإشعارات' :
               notifStatus === 'error' ? `فشل: ${notifError}` :
               'فعّل الإشعارات لتصلك التحديثات حتى عند إغلاق التطبيق'}
            </Text>
            <TouchableOpacity onPress={() => setShowNotifBanner(false)} style={notifBannerStyles.dismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <_Ionicons name="close" size={20} color="#c4b5fd" />
            </TouchableOpacity>
          </View>
          {notifStatus !== 'success' && (
            <TouchableOpacity
              onPress={handleAllowNotifications}
              style={[notifBannerStyles.allow, notifStatus === 'loading' && { opacity: 0.6 }]}
              disabled={notifStatus === 'loading'}
            >
              <Text style={notifBannerStyles.allowText}>
                {notifStatus === 'loading' ? '…' : notifStatus === 'error' ? '↺ حاول مجدداً' : '🔔 تفعيل الإشعارات'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Denied-state bottom card — non-blocking, same style as enable banner */}
      {showNotifGuide && Platform.OS === 'web' && (
        <View style={notifBannerStyles.banner}>
          <View style={notifBannerStyles.bannerHeader}>
            <View style={[notifBannerStyles.bannerIcon, { backgroundColor: '#be123c' }]}>
              <_Ionicons name="notifications-off" size={22} color="#fff" />
            </View>
            <Text style={notifBannerStyles.text}>الإشعارات محظورة — فعّلها من إعدادات المتصفح</Text>
            <TouchableOpacity onPress={() => setShowNotifGuide(false)} style={notifBannerStyles.dismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <_Ionicons name="close" size={20} color="#c4b5fd" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => setShowStepsModal(true)} style={notifBannerStyles.allow}>
            <Text style={notifBannerStyles.allowText}>🔧 كيف أفعّلها؟</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Steps modal — opens only when user taps "كيف أفعّلها؟", has X to close */}
      {showStepsModal && Platform.OS === 'web' && (
        <View style={notifBannerStyles.overlay}>
          <View style={notifBannerStyles.card}>
            <TouchableOpacity onPress={() => setShowStepsModal(false)} style={{ alignSelf: 'flex-end', marginBottom: 8 }}>
              <_Ionicons name="close" size={22} color="#94a3b8" />
            </TouchableOpacity>
            <Text style={notifBannerStyles.cardTitle}>🔔 فعّل الإشعارات</Text>
            <Text style={notifBannerStyles.cardSubtitle}>اتبع هذه الخطوات في Chrome:</Text>

            <View style={notifBannerStyles.step}>
              <View style={notifBannerStyles.stepNum}><Text style={notifBannerStyles.stepNumText}>1</Text></View>
              <Text style={notifBannerStyles.stepText}>اضغط على <Text style={notifBannerStyles.stepHighlight}>🔒</Text> بجانب عنوان الموقع</Text>
            </View>
            <View style={notifBannerStyles.step}>
              <View style={notifBannerStyles.stepNum}><Text style={notifBannerStyles.stepNumText}>2</Text></View>
              <Text style={notifBannerStyles.stepText}>اختر <Text style={notifBannerStyles.stepHighlight}>إعدادات الموقع</Text> (Site settings)</Text>
            </View>
            <View style={notifBannerStyles.step}>
              <View style={notifBannerStyles.stepNum}><Text style={notifBannerStyles.stepNumText}>3</Text></View>
              <Text style={notifBannerStyles.stepText}>اضغط على <Text style={notifBannerStyles.stepHighlight}>الإشعارات</Text> (Notifications)</Text>
            </View>
            <View style={notifBannerStyles.step}>
              <View style={notifBannerStyles.stepNum}><Text style={notifBannerStyles.stepNumText}>4</Text></View>
              <Text style={notifBannerStyles.stepText}>غيّر إلى <Text style={notifBannerStyles.stepHighlight}>السماح</Text> (Allow)</Text>
            </View>

            <TouchableOpacity
              style={notifBannerStyles.refreshBtn}
              onPress={() => { if (typeof window !== 'undefined') window.location.reload(); }}
            >
              <Text style={notifBannerStyles.refreshBtnText}>✓ انتهيت — تحديث الصفحة</Text>
            </TouchableOpacity>
          </View>
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

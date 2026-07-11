import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Pressable,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING } from '../config/constants';
import { usePublications, usePublicationCategories } from '../hooks/useApi';
import { useLang } from '../contexts/LangContext';
import { useViewed } from '../contexts/ViewedContext';
import { Publication } from '../types';
import ConferenceHeader from '../components/ConferenceHeader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  MAGAZINE: 'newspaper',
  PRAYER: 'heart',
  KHELWA: 'leaf',
  ARTICLE: 'document-text',
  OTHER: 'folder-open',
};

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getCategoryColor(pub: Publication): string {
  return pub.category?.color || '#6366F1';
}

function getCategoryIcon(pub: Publication): keyof typeof Ionicons.glyphMap {
  return CATEGORY_ICONS[pub.category?.name] || 'folder-open';
}

const BACKEND_BASE = 'https://ikigai-backend.replit.app';
const FRONTEND_BASE = 'ikigai-web-app.replit.app';

// Safety net: rewrite URLs that accidentally point to the frontend domain
function fixFileUrl(url: string): string {
  if (!url) return url;
  // Replace frontend domain with backend domain
  if (url.includes(FRONTEND_BASE)) {
    return url.replace(/https?:\/\/[^/]+/, BACKEND_BASE);
  }
  // If relative path, prepend backend base
  if (url.startsWith('/api/')) {
    return `${BACKEND_BASE}${url}`;
  }
  return url;
}

function isImageUrl(url: string): boolean {
  return !!url.match(/\.(png|jpg|jpeg|gif|webp|svg)(\?|$)/i);
}

function getViewerUrl(url: string): string | null {
  const fixed = fixFileUrl(url);
  // Google Drive file links
  if (fixed.includes('drive.google.com/file/d/')) {
    const fileId = fixed.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1];
    if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`;
  }
  // Google Docs/Sheets/Slides
  if (fixed.includes('docs.google.com')) {
    return fixed.replace(/\/edit.*$/, '/preview');
  }
  // Direct PDF links - use Google Docs Viewer for embedding
  if (fixed.match(/\.pdf(\?|$)/i)) {
    return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(fixed)}`;
  }
  // Images - return as-is for direct display
  if (isImageUrl(fixed)) {
    return fixed;
  }
  // Any other URL - try opening in webview directly
  return fixed;
}

export default function LibraryScreen() {
  const { lang } = useLang();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerTitle, setViewerTitle] = useState('');
  const [viewerType, setViewerType] = useState<'pdf' | 'image' | 'other'>('other');
  const categoryFilter = selectedCategory === 'ALL' ? undefined : selectedCategory;
  const { data: publications, isLoading, refetch } = usePublications(categoryFilter);
  const { data: categories } = usePublicationCategories();

  const { markPublicationViewed } = useViewed();

  const openPublication = useCallback((item: Publication) => {
    markPublicationViewed(item.id);
    const fixedUrl = fixFileUrl(item.contentUrl);
    const embeddedUrl = getViewerUrl(fixedUrl);
    setViewerTitle(item.title);
    if (isImageUrl(fixedUrl)) {
      setViewerType('image');
      setViewerUrl(fixedUrl);
    } else if (embeddedUrl) {
      setViewerType(fixedUrl.match(/\.pdf(\?|$)/i) ? 'pdf' : 'other');
      setViewerUrl(embeddedUrl);
    } else {
      Linking.openURL(fixedUrl);
    }
  }, [markPublicationViewed]);

  const renderItem = ({ item, index }: { item: Publication; index: number }) => {
    const catColor = getCategoryColor(item);
    return (
      <TouchableOpacity
        style={[styles.gridCard, index % 2 === 0 ? { marginRight: 6 } : { marginLeft: 6 }]}
        activeOpacity={0.8}
        onPress={() => openPublication(item)}
      >
        <LinearGradient
          colors={[catColor + '25', COLORS.surface]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gridCardGradient}
        >
          {/* Icon */}
          <View style={[styles.gridCardIcon, { backgroundColor: catColor + '20' }]}>
            <Ionicons name={getCategoryIcon(item)} size={28} color={catColor} />
          </View>

          {/* Title */}
          <Text style={styles.gridCardTitle} numberOfLines={2}>{item.title}</Text>

          {/* Meta row */}
          <View style={styles.gridCardMeta}>
            <View style={[styles.gridCatPill, { backgroundColor: catColor + '15' }]}>
              <Text style={[styles.gridCatText, { color: catColor }]}>
                {lang === 'ar' ? item.category?.labelAr : item.category?.labelEn}
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.gridCardFooter}>
            {item.fileSize ? (
              <Text style={styles.gridFooterText}>{formatFileSize(item.fileSize)}</Text>
            ) : null}
            {item.publishedAt && (
              <Text style={styles.gridFooterText}>
                {new Date(item.publishedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </Text>
            )}
          </View>

          {/* Read indicator */}
          <View style={[styles.gridReadBtn, { backgroundColor: catColor }]}>
            <Ionicons name="reader-outline" size={14} color="#fff" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ConferenceHeader />

      {/* Title */}
      <View style={styles.screenHeader}>
        <View style={styles.headerRow}>
          <Ionicons name="library" size={24} color={COLORS.primary} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.headerTitle}>{lang === 'ar' ? 'المكتبة' : 'Library'}</Text>
            <Text style={styles.headerSubtitle}>
              {publications?.length || 0} {lang === 'ar' ? 'ملف متاح' : 'publications available'}
            </Text>
          </View>
        </View>
      </View>

      {/* Category Grid */}
      <View style={styles.categoryGrid}>
        <TouchableOpacity
          style={[styles.categoryCard, selectedCategory === 'ALL' && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}
          onPress={() => setSelectedCategory('ALL')}
          activeOpacity={0.7}
        >
          <Ionicons name="grid" size={20} color={selectedCategory === 'ALL' ? '#fff' : COLORS.primary} />
          <Text style={[styles.categoryLabel, selectedCategory === 'ALL' && { color: '#fff' }]}>
            {lang === 'ar' ? 'الكل' : 'All'}
          </Text>
        </TouchableOpacity>
        {(categories || []).map((item) => {
          const isActive = selectedCategory === item.id;
          const icon = CATEGORY_ICONS[item.name] || 'folder-open';
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.categoryCard, isActive && { backgroundColor: item.color, borderColor: item.color }]}
              onPress={() => setSelectedCategory(item.id)}
              activeOpacity={0.7}
            >
              <Ionicons name={icon} size={20} color={isActive ? '#fff' : item.color} />
              <Text style={[styles.categoryLabel, isActive && { color: '#fff' }]}>
                {lang === 'ar' ? item.labelAr : item.labelEn}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : !publications?.length ? (
        <View style={styles.center}>
          <View style={styles.emptyIcon}>
            <Ionicons name="library-outline" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>No publications yet</Text>
          <Text style={styles.emptySubtitle}>New magazines, prayers & articles will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={publications}
          keyExtractor={(item) => item.id}
          
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.gridRow}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={COLORS.primary} />}
        />
      )}

      {/* In-app Viewer Overlay */}
      {!!viewerUrl && Platform.OS === 'web' && (
        <Pressable style={styles.webOverlay} onPress={() => setViewerUrl(null)}>
          <View style={styles.webOverlayInner} onStartShouldSetResponder={() => true}>
            <View style={styles.viewerHeader}>
              <TouchableOpacity onPress={() => setViewerUrl(null)} style={styles.viewerCloseBtn}>
                <Ionicons name="arrow-back" size={22} color={COLORS.text} />
              </TouchableOpacity>
              <Text style={styles.viewerTitle} numberOfLines={1}>{viewerTitle}</Text>
              <TouchableOpacity onPress={() => { if (viewerUrl) Linking.openURL(viewerUrl); }} style={styles.viewerExternalBtn}>
                <Ionicons name="open-outline" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
            {viewerType === 'image' ? (
              <View style={styles.webview}>
                {/* @ts-ignore */}
                <img src={viewerUrl} style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000' }} alt={viewerTitle} />
              </View>
            ) : (
              <View style={styles.webview}>
                {/* @ts-ignore */}
                <iframe src={viewerUrl} style={{ width: '100%', height: '100%', border: 'none' }} title={viewerTitle} />
              </View>
            )}
          </View>
        </Pressable>
      )}

      {/* Native Modal Viewer */}
      {!!viewerUrl && Platform.OS !== 'web' && (
        <Modal visible={!!viewerUrl} animationType="slide" onRequestClose={() => setViewerUrl(null)}>
          <View style={styles.viewerContainer}>
            <View style={styles.viewerHeader}>
              <TouchableOpacity onPress={() => setViewerUrl(null)} style={styles.viewerCloseBtn}>
                <Ionicons name="arrow-back" size={22} color={COLORS.text} />
              </TouchableOpacity>
              <Text style={styles.viewerTitle} numberOfLines={1}>{viewerTitle}</Text>
              <TouchableOpacity onPress={() => { if (viewerUrl) Linking.openURL(viewerUrl); }} style={styles.viewerExternalBtn}>
                <Ionicons name="open-outline" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
            {viewerType === 'image' ? (
              <Image source={{ uri: viewerUrl }} style={styles.webview} resizeMode="contain" />
            ) : (
              <WebView
                source={{ uri: viewerUrl }}
                style={styles.webview}
                startInLoadingState
                renderLoading={() => (
                  <View style={styles.webviewLoading}>
                    <ActivityIndicator color={COLORS.primary} size="large" />
                    <Text style={styles.loadingText}>Loading document...</Text>
                  </View>
                )}
              />
            )}
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  // Header
  screenHeader: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  headerSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  // Category Grid
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  categoryCard: { width: (SCREEN_WIDTH - 56) / 3, paddingVertical: 12, borderRadius: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', gap: 4 },
  categoryLabel: { fontSize: 11, fontWeight: '600', color: COLORS.textSecondary },
  // List
  list: { padding: 16, paddingTop: 4 },
  gridRow: { justifyContent: 'space-between' },
  // Grid Card
  gridCard: { flex: 1, marginBottom: 12, borderRadius: 16, overflow: 'hidden', maxWidth: '48.5%' },
  gridCardGradient: { padding: 14, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, minHeight: 180, justifyContent: 'space-between' },
  gridCardIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  gridCardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 8, lineHeight: 19 },
  gridCardMeta: { flexDirection: 'row', marginBottom: 6 },
  gridCatPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  gridCatText: { fontSize: 10, fontWeight: '700' },
  gridCardFooter: { flexDirection: 'row', gap: 8 },
  gridFooterText: { fontSize: 10, color: COLORS.textMuted },
  gridReadBtn: { position: 'absolute', top: 12, right: 12, width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  // Empty
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  emptySubtitle: { fontSize: 14, color: COLORS.textMuted, marginTop: 6, textAlign: 'center' },
  // Web overlay (replaces Modal on web)
  webOverlay: { position: 'fixed' as any, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, justifyContent: 'center', alignItems: 'center' },
  webOverlayInner: { width: '95%' as any, height: '90%' as any, backgroundColor: COLORS.background, borderRadius: 12, overflow: 'hidden' },
  // Viewer
  viewerContainer: { flex: 1, backgroundColor: COLORS.background },
  viewerHeader: { flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 54 : 30, paddingBottom: 12, paddingHorizontal: 16, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  viewerCloseBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  viewerTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: COLORS.text, marginHorizontal: 12 },
  viewerExternalBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  webview: { flex: 1 },
  webviewLoading: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  loadingText: { color: COLORS.textMuted, marginTop: 12, fontSize: 14 },
});

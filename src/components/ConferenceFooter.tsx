import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
// @ts-ignore
const Img = 'img' as any;
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../config/constants';

const SOCIAL_LINKS = [
  {
    name: 'Facebook',
    icon: 'logo-facebook' as const,
    url: 'https://www.facebook.com/lagnetsanawy',
    color: '#1877F2',
  },
  {
    name: 'YouTube',
    icon: 'logo-youtube' as const,
    url: 'https://www.youtube.com/@lagnetsanawy8545',
    color: '#FF0000',
  },
  {
    name: 'Instagram',
    icon: 'logo-instagram' as const,
    url: 'https://www.instagram.com/youthbishopric',
    color: '#E4405F',
  },
];

export default function ConferenceFooter() {
  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.footer}>
      <View style={styles.logosRow}>
        <Img src="/logo-lagna.png" style={imgStyles.footerLagna} />
        <Text style={styles.footerText}>لجنة خدمة ثانوى • أسقفية الشباب</Text>
        <Img src="/logo-oskofia.png" style={imgStyles.footerOskofia} />
      </View>
      
      {/* Social Links */}
      <View style={styles.socialRow}>
        {SOCIAL_LINKS.map((link) => (
          <TouchableOpacity
            key={link.name}
            style={[styles.socialBtn, { backgroundColor: link.color + '15' }]}
            onPress={() => openLink(link.url)}
            activeOpacity={0.7}
          >
            <Ionicons name={link.icon} size={22} color={link.color} />
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={styles.footerSubtext}>IKIGAI Quest 2026</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  logosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.md,
  },
  logo: {
    width: 36,
    height: 36,
  },
  footerText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    marginVertical: SPACING.md,
  },
  socialBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  footerSubtext: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 1,
  },
});

const imgStyles = {
  footerLagna: {
    width: 38,
    height: 38,
    borderRadius: 19,
    objectFit: 'contain' as const,
  },
  footerOskofia: {
    width: 28,
    height: 38,
    borderRadius: 4,
    objectFit: 'contain' as const,
  },
};

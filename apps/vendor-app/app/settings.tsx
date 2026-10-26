import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { THEME } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { SETTINGS_ITEMS } from '../constants/app-config';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { logoutDriver } from '../lib/auth';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mode, isDark, colors, setMode } = useTheme();

  const handleLogout = () => {
    logoutDriver();
    router.replace('/(auth)/login');
  };

  const handlePress = (id: string, label: string) => {
    if (id === 'terms') {
      router.push('/terms');
      return;
    }
    if (id === 'privacy') {
      router.push('/privacy');
      return;
    }
    Alert.alert('Settings', `Navigating to ${label}`);
  };

  const CardWrapper = ({ children, style }: { children: React.ReactNode; style: any }) => {
    if (Platform.OS === 'android') {
      return <View style={[style, { backgroundColor: colors.cardAndroid, borderColor: colors.cardBorder }]}>{children}</View>;
    }
    return (
      <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={style}>
        {children}
      </BlurView>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: Math.max(insets.top + 16, 44),
          paddingBottom: Math.max(insets.bottom + 32, 48),
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with Back Button */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.pillBg, borderColor: colors.cardBorder }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Appearance Section */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Appearance & Theme</Text>
      <CardWrapper style={[styles.card, { backgroundColor: colors.glassBg, borderColor: colors.cardBorder }]}>
        <View style={styles.themeInfoRow}>
          <View style={[styles.themeIconBox, { backgroundColor: isDark ? 'rgba(0, 207, 255, 0.12)' : 'rgba(0, 149, 217, 0.12)' }]}>
            <Ionicons
              name={mode === 'light' ? 'sunny' : mode === 'dark' ? 'moon' : 'contrast'}
              size={20}
              color={colors.primary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.themeTitle, { color: colors.text }]}>Display Theme</Text>
            <Text style={[styles.themeSubtitle, { color: colors.textSecondary }]}>
              {mode === 'light'
                ? '☀️ Day mode active (Sunlight optimized)'
                : mode === 'dark'
                ? '🌙 Night mode active (OLED high-contrast)'
                : '⚙️ System default active'}
            </Text>
          </View>
        </View>

        {/* 3-Pill Segmented Switcher */}
        <View style={[styles.themeSwitcherContainer, { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.35)' : 'rgba(0, 0, 0, 0.05)', borderColor: colors.divider }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.themePill,
              mode === 'light' && [styles.themePillActive, { backgroundColor: colors.primary }],
            ]}
            onPress={() => setMode('light')}
          >
            <Ionicons
              name="sunny"
              size={15}
              color={mode === 'light' ? '#FFFFFF' : colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.themePillText,
                { color: mode === 'light' ? '#FFFFFF' : colors.textSecondary },
                mode === 'light' && styles.themePillTextActive,
              ]}
            >
              Day
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.themePill,
              mode === 'dark' && [styles.themePillActive, { backgroundColor: colors.primary }],
            ]}
            onPress={() => setMode('dark')}
          >
            <Ionicons
              name="moon"
              size={15}
              color={mode === 'dark' ? '#000000' : colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.themePillText,
                { color: mode === 'dark' ? '#000000' : colors.textSecondary },
                mode === 'dark' && styles.themePillTextActive,
              ]}
            >
              Night
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.themePill,
              mode === 'system' && [styles.themePillActive, { backgroundColor: colors.primary }],
            ]}
            onPress={() => setMode('system')}
          >
            <Ionicons
              name="phone-portrait-outline"
              size={15}
              color={mode === 'system' ? (isDark ? '#000000' : '#FFFFFF') : colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.themePillText,
                { color: mode === 'system' ? (isDark ? '#000000' : '#FFFFFF') : colors.textSecondary },
                mode === 'system' && styles.themePillTextActive,
              ]}
            >
              System
            </Text>
          </TouchableOpacity>
        </View>
      </CardWrapper>

      {/* General Settings Section */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Preferences</Text>
      <CardWrapper style={[styles.card, { backgroundColor: colors.glassBg, borderColor: colors.cardBorder }]}>
        {SETTINGS_ITEMS.map((item, index) => (
          <View key={item.id}>
            <TouchableOpacity style={styles.itemRow} onPress={() => handlePress(item.id, item.label)} activeOpacity={0.7}>
              <View style={styles.itemLeft}>
                <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(0, 207, 255, 0.1)' : 'rgba(0, 149, 217, 0.1)' }]}>
                  <Ionicons name={item.icon as any} size={20} color={colors.primary} />
                </View>
                <Text style={[styles.itemLabel, { color: colors.text }]}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            {index < SETTINGS_ITEMS.length - 1 && <View style={[styles.divider, { backgroundColor: colors.divider }]} />}
          </View>
        ))}
      </CardWrapper>

      <Text style={[styles.versionText, { color: colors.textSecondary }]}>OmniGo Driver v2.4.1 · Clean Build</Text>

      <TouchableOpacity
        style={[styles.logoutBtn, { borderColor: 'rgba(255, 51, 102, 0.4)', backgroundColor: 'rgba(255, 51, 102, 0.08)' }]}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Ionicons name="log-out-outline" size={18} color={THEME.colors.danger} style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>LOGOUT</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 24,
    textAlign: 'center',
  },
  sectionTitle: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 24,
  },
  themeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  themeIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeTitle: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 15,
  },
  themeSubtitle: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 12,
    marginTop: 2,
  },
  themeSwitcherContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    gap: 4,
  },
  themePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 8,
  },
  themePillActive: {
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  themePillText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 13,
  },
  themePillTextActive: {
    fontFamily: THEME.fonts.inter.bold,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  itemLabel: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 15,
  },
  divider: {
    height: 1,
    marginLeft: 66,
  },
  versionText: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  logoutBtn: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoutText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 15,
    color: THEME.colors.danger,
    letterSpacing: 1,
  },
});

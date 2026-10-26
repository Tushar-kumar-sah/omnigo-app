import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { fetchCurrentUser, signOutUser } from '@/lib/api';
import { useTheme } from '@/context/ThemeContext';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mode, isDark, colors, setMode } = useTheme();

  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const u = await fetchCurrentUser();
          if (active && u) setUser(u);
        } catch (e) {
          console.warn('[Profile]', e);
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  const MENU_ITEMS = [
    { title: 'Settings', icon: 'settings-outline', route: '/settings' },
    { title: 'Notifications', icon: 'notifications-outline', route: '/notifications' },
    { title: 'Help & Support', icon: 'help-circle-outline', route: '/help' },
  ];

  const handleSignOut = async () => {
    await signOutUser();
    router.replace('/(auth)/login');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={colors.gradient} style={StyleSheet.absoluteFill} />

      <View style={[styles.headerArea, { paddingTop: Math.max(insets.top + 10, 44), borderBottomColor: colors.divider }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings & Profile</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Account details & preferences</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {/* User Profile Glass Card */}
        <TouchableOpacity
          style={styles.profileCardTouch}
          activeOpacity={0.85}
          onPress={() => router.push('/settings/edit-profile')}
        >
          <View
            style={[
              styles.profileCard,
              {
                backgroundColor: isDark ? 'rgba(10, 28, 60, 0.65)' : colors.cardBg,
                borderColor: colors.cardBorder,
              },
              Platform.OS === 'android' && { backgroundColor: isDark ? 'rgba(10,18,36,0.97)' : '#FFFFFF' },
            ]}
          >
            <LinearGradient
              colors={isDark ? ['rgba(0, 207, 255, 0.2)', 'rgba(255, 255, 255, 0.04)', 'transparent'] : ['rgba(0, 149, 217, 0.1)', 'rgba(0, 0, 0, 0.02)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={[styles.avatarWrapper, { borderColor: colors.primary, backgroundColor: isDark ? 'rgba(0, 207, 255, 0.15)' : 'rgba(0, 149, 217, 0.12)' }]}>
              {user?.avatar ? (
                <Image
                  source={{ uri: user.avatar }}
                  style={styles.avatarImg}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="person" size={38} color={colors.primary} />
              )}
            </View>
            <View style={styles.info}>
              <Text style={[styles.name, { color: colors.text }]}>{user?.name || 'Loading...'}</Text>
              {user?.email ? <Text style={[styles.email, { color: colors.primary }]}>{user.email}</Text> : null}
              <Text style={[styles.phone, { color: colors.textSecondary }]}>{user?.phone || 'Loading...'}</Text>
              <View style={styles.badge}>
                <Ionicons name="checkmark-circle" size={14} color="#00FF97" />
                <Text style={styles.badgeText}>Verified Google Account</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Appearance Mode Card */}
        <View style={styles.menuContainer}>
          <View
            style={[
              styles.menuCard,
              {
                backgroundColor: isDark ? 'rgba(14, 24, 48, 0.65)' : colors.cardBg,
                borderColor: colors.cardBorder,
                padding: 16,
              },
              Platform.OS === 'android' && { backgroundColor: isDark ? 'rgba(10,18,36,0.97)' : '#FFFFFF' },
            ]}
          >
            <View style={styles.themeHeaderRow}>
              <View style={[styles.themeIconBox, { backgroundColor: isDark ? 'rgba(0, 207, 255, 0.15)' : 'rgba(0, 149, 217, 0.15)' }]}>
                <Ionicons
                  name={mode === 'light' ? 'sunny' : mode === 'dark' ? 'moon' : 'contrast'}
                  size={18}
                  color={colors.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.themeTitleText, { color: colors.text }]}>Appearance Mode</Text>
                <Text style={[styles.themeSubtitleText, { color: colors.textSecondary }]}>
                  {mode === 'light' ? '☀️ Day mode' : mode === 'dark' ? '🌙 Night mode' : '⚙️ System default'}
                </Text>
              </View>
            </View>

            <View style={[styles.themePillRow, { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.35)' : 'rgba(0, 0, 0, 0.05)', borderColor: colors.divider }]}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.themePillBtn,
                  mode === 'light' && [styles.themePillBtnActive, { backgroundColor: colors.primary }],
                ]}
                onPress={() => setMode('light')}
              >
                <Ionicons
                  name="sunny"
                  size={13}
                  color={mode === 'light' ? '#FFFFFF' : colors.textSecondary}
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={[
                    styles.themePillBtnText,
                    { color: mode === 'light' ? '#FFFFFF' : colors.textSecondary },
                    mode === 'light' && styles.themePillBtnTextActive,
                  ]}
                >
                  Day
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.themePillBtn,
                  mode === 'dark' && [styles.themePillBtnActive, { backgroundColor: colors.primary }],
                ]}
                onPress={() => setMode('dark')}
              >
                <Ionicons
                  name="moon"
                  size={13}
                  color={mode === 'dark' ? '#000000' : colors.textSecondary}
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={[
                    styles.themePillBtnText,
                    { color: mode === 'dark' ? '#000000' : colors.textSecondary },
                    mode === 'dark' && styles.themePillBtnTextActive,
                  ]}
                >
                  Night
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.themePillBtn,
                  mode === 'system' && [styles.themePillBtnActive, { backgroundColor: colors.primary }],
                ]}
                onPress={() => setMode('system')}
              >
                <Ionicons
                  name="phone-portrait-outline"
                  size={13}
                  color={mode === 'system' ? (isDark ? '#000000' : '#FFFFFF') : colors.textSecondary}
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={[
                    styles.themePillBtnText,
                    { color: mode === 'system' ? (isDark ? '#000000' : '#FFFFFF') : colors.textSecondary },
                    mode === 'system' && styles.themePillBtnTextActive,
                  ]}
                >
                  System
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Menu Glass Cards */}
        <View style={styles.menuContainer}>
          <View
            style={[
              styles.menuCard,
              {
                backgroundColor: isDark ? 'rgba(14, 24, 48, 0.65)' : colors.cardBg,
                borderColor: colors.cardBorder,
              },
              Platform.OS === 'android' && { backgroundColor: isDark ? 'rgba(10,18,36,0.97)' : '#FFFFFF' },
            ]}
          >
            {MENU_ITEMS.map((item, idx) => (
              <TouchableOpacity
                key={item.title}
                style={[
                  styles.menuItem,
                  idx < MENU_ITEMS.length - 1 && [styles.menuItemBorder, { borderBottomColor: colors.divider }],
                ]}
                onPress={() => item.route && router.push(item.route as any)}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name={item.icon as any} size={20} color={colors.primary} style={{ marginRight: 14 }} />
                  <Text style={[styles.menuText, { color: colors.text }]}>{item.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtnTouch}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <View style={[styles.logoutBtn, Platform.OS === 'android' && { backgroundColor: 'rgba(42,10,10,0.97)' }]}>
            <Ionicons name="log-out-outline" size={20} color="#FF3B30" style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerArea: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 26 },
  headerSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 4 },
  list: { padding: 16, paddingBottom: 150 },
  profileCardTouch: { marginBottom: 20, borderRadius: 24, overflow: 'hidden' },
  profileCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
    overflow: 'hidden',
  },
  avatarWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
  },
  info: { flex: 1 },
  name: { fontFamily: 'Outfit_700Bold', fontSize: 22 },
  email: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 2 },
  phone: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 2 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    backgroundColor: 'rgba(0, 255, 151, 0.15)',
    borderWidth: 1,
    borderColor: '#00FF97',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: { color: '#00FF97', fontFamily: 'Inter_500Medium', fontSize: 11, marginLeft: 4 },
  themeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  themeIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeTitleText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 15,
  },
  themeSubtitleText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    marginTop: 2,
  },
  themePillRow: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    gap: 4,
  },
  themePillBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  themePillBtnActive: {
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  themePillBtnText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },
  themePillBtnTextActive: {
    fontFamily: 'Inter_700Bold',
  },
  menuContainer: { borderRadius: 24, overflow: 'hidden', marginBottom: 20 },
  menuCard: {
    paddingVertical: 6,
    borderRadius: 24,
    borderWidth: 1.5,
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
    overflow: 'hidden',
  },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18 },
  menuItemBorder: { borderBottomWidth: 1 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  menuText: { fontFamily: 'Outfit_600SemiBold', fontSize: 15 },
  logoutBtnTouch: { borderRadius: 20, overflow: 'hidden' },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(42, 14, 24, 0.65)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 59, 48, 0.45)',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  logoutText: { color: '#FF3B30', fontFamily: 'Outfit_700Bold', fontSize: 15 },
});

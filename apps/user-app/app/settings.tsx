import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { signOutUser } from '../lib/api';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);

  const handleSignOut = async () => {
    await signOutUser();
    router.replace('/(auth)/login');
  };

  const renderSectionHeader = (title: string) => (
    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{title}</Text>
  );

  const renderRow = (icon: any, title: string, value?: string, onPress?: () => void) => (
    <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress} activeOpacity={0.7}>
      <View style={styles.rowLeft}>
        <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(0, 207, 255, 0.15)' : 'rgba(0, 149, 217, 0.15)' }]}>
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
        <Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text>
      </View>
      <View style={styles.rowRight}>
        {value ? <Text style={[styles.rowValue, { color: colors.textSecondary }]}>{value}</Text> : null}
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  const renderToggleRow = (icon: any, title: string, value: boolean, onValueChange: (val: boolean) => void) => (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(0, 207, 255, 0.15)' : 'rgba(0, 149, 217, 0.15)' }]}>
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
        <Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)', true: colors.primary }}
        thumbColor="#FFFFFF"
        ios_backgroundColor={isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)'}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={colors.gradient} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 10, 44), borderBottomColor: colors.divider }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.pillBg, borderColor: colors.cardBorder }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 24, 40) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Section */}
        {renderSectionHeader('Account')}
        <View style={[styles.cardContainer, { backgroundColor: colors.glassBg, borderColor: colors.cardBorder }]}>
          {renderRow('person-outline', 'Edit Profile', '', () => router.push('/settings/edit-profile'))}
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          {renderRow('lock-closed-outline', 'Change Password', '', () => router.push('/settings/change-password'))}
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          {renderRow('location-outline', 'Saved Addresses', '', () => router.push('/settings/saved-addresses'))}
        </View>

        {/* Notifications Section */}
        {renderSectionHeader('Notifications')}
        <View style={[styles.cardContainer, { backgroundColor: colors.glassBg, borderColor: colors.cardBorder }]}>
          {renderToggleRow('notifications-outline', 'Push Notifications', pushEnabled, setPushEnabled)}
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          {renderToggleRow('mail-outline', 'Email Alerts', emailEnabled, setEmailEnabled)}
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          {renderToggleRow('chatbubble-outline', 'SMS Alerts', smsEnabled, setSmsEnabled)}
        </View>

        {/* Preferences Section */}
        {renderSectionHeader('Preferences')}
        <View style={[styles.cardContainer, { backgroundColor: colors.glassBg, borderColor: colors.cardBorder }]}>
          {renderRow('language-outline', 'Language', 'English', () => router.push('/settings/language'))}
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          {renderRow('speedometer-outline', 'Units', 'Kilometers', () => {})}
        </View>

        {/* About Section */}
        {renderSectionHeader('About')}
        <View style={[styles.cardContainer, { backgroundColor: colors.glassBg, borderColor: colors.cardBorder }]}>
          {renderRow('information-circle-outline', 'App Version', 'v2.4.1')}
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          {renderRow('document-text-outline', 'Terms of Service', '', () => router.push('/settings/terms'))}
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          {renderRow('shield-checkmark-outline', 'Privacy Policy', '', () => router.push('/settings/privacy'))}
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          {renderRow('star-outline', 'Rate Us', '', () => {})}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={[styles.signOutCard, { backgroundColor: 'rgba(255, 59, 48, 0.12)', borderColor: 'rgba(255, 59, 48, 0.45)' }]}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={22} color="#FF3B30" style={{ marginRight: 10 }} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 20,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 8,
    marginLeft: 4,
  },
  cardContainer: {
    borderRadius: 20,
    borderWidth: 1.5,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#00CFFF',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  themeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  themePillRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
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
    paddingVertical: 9,
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    flexShrink: 0,
  },
  rowTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    flexShrink: 1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  rowValue: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    marginRight: 8,
  },
  divider: {
    height: 1,
    marginLeft: 66,
  },
  signOutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    marginTop: 8,
    marginBottom: 24,
  },
  signOutText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    color: '#FF3B30',
  },
});

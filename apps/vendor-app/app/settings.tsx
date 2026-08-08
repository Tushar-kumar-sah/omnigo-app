import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { THEME } from '../constants/theme';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { SETTINGS_ITEMS } from '../constants/mock-data';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();

  const handleLogout = () => {
    router.replace('/(auth)/login');
  };

  const handlePress = (label: string) => {
    Alert.alert('Settings', `Navigating to ${label}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>

      <BlurView intensity={20} tint="dark" style={styles.card}>
        {SETTINGS_ITEMS.map((item, index) => (
          <View key={item.id}>
            <TouchableOpacity style={styles.itemRow} onPress={() => handlePress(item.label)}>
              <View style={styles.itemLeft}>
                <View style={styles.iconBox}>
                  <Ionicons name={item.icon as any} size={20} color={THEME.colors.primary} />
                </View>
                <Text style={styles.itemLabel}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
            {index < SETTINGS_ITEMS.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </BlurView>

      <Text style={styles.versionText}>OmniGo Driver v1.0.0</Text>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>LOGOUT</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  content: {
    padding: 24,
    paddingTop: 64,
    paddingBottom: 48,
  },
  title: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 32,
    color: THEME.colors.text,
    marginBottom: 24,
  },
  card: {
    backgroundColor: THEME.colors.glassBg,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    overflow: 'hidden',
    marginBottom: 32,
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
    backgroundColor: 'rgba(0, 207, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  itemLabel: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 16,
    color: THEME.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginLeft: 68,
  },
  versionText: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 14,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  logoutBtn: {
    padding: 16,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.danger,
    alignItems: 'center',
  },
  logoutText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 16,
    color: THEME.colors.danger,
    letterSpacing: 1,
  }
});

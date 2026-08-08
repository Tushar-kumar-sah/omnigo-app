import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { THEME } from '../constants/theme';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { mockNotifications } from '../constants/mock-data';
import { useRouter } from 'expo-router';

export default function NotificationsScreen() {
  const router = useRouter();

  const getIconData = (type: string) => {
    switch (type) {
      case 'success': return { name: 'checkmark-circle', color: THEME.colors.success };
      case 'job': return { name: 'car', color: THEME.colors.primary };
      case 'info': return { name: 'information-circle', color: '#3B82F6' };
      case 'payment': return { name: 'wallet', color: THEME.colors.success };
      case 'warning': return { name: 'warning', color: THEME.colors.warning };
      default: return { name: 'notifications', color: THEME.colors.textSecondary };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={THEME.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity>
          <Text style={styles.markRead}>Mark All Read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {mockNotifications.map((notif) => {
          const iconData = getIconData(notif.type);
          return (
            <BlurView 
              key={notif.id} 
              intensity={20} 
              tint="dark" 
              style={[
                styles.card, 
                !notif.read && styles.unreadCard
              ]}
            >
              <View style={styles.iconContainer}>
                <Ionicons name={iconData.name as any} size={24} color={iconData.color} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.notifTitle}>{notif.title}</Text>
                <Text style={styles.notifBody}>{notif.body}</Text>
                <Text style={styles.notifTime}>{notif.time}</Text>
              </View>
              {!notif.read && <View style={styles.unreadDot} />}
            </BlurView>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backBtn: {
    padding: 4,
  },
  title: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 20,
    color: THEME.colors.text,
  },
  markRead: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 14,
    color: THEME.colors.primary,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.glassBg,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    marginBottom: 12,
  },
  unreadCard: {
    borderColor: 'rgba(0, 207, 255, 0.3)',
    backgroundColor: 'rgba(13, 20, 32, 0.8)',
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  textContainer: {
    flex: 1,
  },
  notifTitle: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 16,
    color: THEME.colors.text,
    marginBottom: 4,
  },
  notifBody: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 14,
    color: THEME.colors.textSecondary,
    marginBottom: 8,
  },
  notifTime: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 12,
    color: '#666',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.primary,
    marginTop: 6,
  }
});

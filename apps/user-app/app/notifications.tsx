import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';
import {
  fetchCurrentUser,
  fetchNotifications as apiFetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  deleteNotificationApi
} from '../lib/api';

type NotificationType = 'success' | 'info' | 'payment' | 'alert' | 'promo' | 'reminder' | 'location' | 'safety';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: NotificationType;
  isUnread: boolean;
  section: 'Today' | 'Earlier';
}

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const u = await fetchCurrentUser();
        if (u?.uuid || u?.id) {
          const uid = u.uuid || u.id;
          setUserId(uid);
          const notifs = await apiFetchNotifications(uid);
          if (notifs) {
            setNotifications(notifs.map((n: any) => ({
              id: n.id,
              title: n.title,
              description: n.message || n.description,
              time: n.time || new Date(n.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: (n.type || 'info') as NotificationType,
              isUnread: n.is_read !== undefined ? !n.is_read : Boolean(n.isUnread),
              section: new Date(n.created_at || Date.now()).toDateString() === new Date().toDateString() ? 'Today' : new Date(n.created_at || Date.now()).toDateString() === new Date(Date.now() - 86400000).toDateString() ? 'Yesterday' : 'Earlier',
            })));
          }
        }
      } catch (e) {
        console.warn('[Notifications] fetch error', e);
      }
    };
    fetchNotifs();
  }, []);

  const markAllRead = async () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isUnread: false })));
    if (userId) {
      await markAllNotificationsRead(userId);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    setNotifications(prev => prev.map(notif => notif.id === id ? { ...notif, isUnread: false } : notif));
    await markNotificationRead(id);
  };

  const getIconConfig = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return { name: 'checkmark-circle', color: '#00FF97', bg: 'rgba(0, 255, 151, 0.15)' };
      case 'info':
        return { name: 'car', color: '#00CFFF', bg: 'rgba(0, 207, 255, 0.15)' };
      case 'payment':
        return { name: 'cash', color: '#00FF97', bg: 'rgba(0, 255, 151, 0.15)' };
      case 'alert':
        return { name: 'warning', color: '#FF3B30', bg: 'rgba(255, 59, 48, 0.15)' };
      case 'promo':
        return { name: 'gift', color: '#FFD700', bg: 'rgba(255, 215, 0, 0.15)' };
      case 'reminder':
        return { name: 'build', color: '#FFA500', bg: 'rgba(255, 165, 0, 0.15)' };
      case 'location':
        return { name: 'location', color: '#00CFFF', bg: 'rgba(0, 207, 255, 0.15)' };
      case 'safety':
        return { name: 'shield-checkmark', color: '#00FF97', bg: 'rgba(0, 255, 151, 0.15)' };
      default:
        return { name: 'notifications', color: '#FFFFFF', bg: 'rgba(255, 255, 255, 0.15)' };
    }
  };

  const renderNotificationItem = (item: NotificationItem) => {
    const iconConfig = getIconConfig(item.type);

    return (
      <TouchableOpacity 
        key={item.id} 
        style={[styles.notificationCard, item.isUnread && styles.unreadCard]}
        activeOpacity={0.7}
        onPress={() => { if(item.isUnread) handleMarkAsRead(item.id); }}
      >
        <View style={[styles.iconContainer, { backgroundColor: iconConfig.bg }]}>
          <Ionicons name={iconConfig.name as any} size={24} color={iconConfig.color} />
        </View>
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.titleText}>{item.title}</Text>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
          <Text style={styles.descriptionText} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
        {item.isUnread && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  const todayNotifications = notifications.filter(n => n.section === 'Today');
  const earlierNotifications = notifications.filter(n => n.section === 'Earlier');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050810" />
      <LinearGradient colors={['#050810', '#0a1222', '#050810']} style={StyleSheet.absoluteFillObject} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity style={styles.markAllButton} onPress={markAllRead}>
          <Ionicons name="checkmark-done" size={20} color="#00CFFF" />
          <Text style={styles.markAllText}>Read All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {todayNotifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today</Text>
            {todayNotifications.map(renderNotificationItem)}
          </View>
        )}

        {earlierNotifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Earlier</Text>
            {earlierNotifications.map(renderNotificationItem)}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050810',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(13, 20, 32, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 207, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.3)',
  },
  markAllText: {
    fontFamily: 'Inter_500Medium',
    color: '#00CFFF',
    fontSize: 12,
    marginLeft: 4,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 20, 32, 0.45)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  unreadCard: {
    backgroundColor: 'rgba(13, 20, 32, 0.7)',
    borderColor: 'rgba(0, 207, 255, 0.3)',
    shadowColor: '#00CFFF',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  titleText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    flexShrink: 0,
  },
  descriptionText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00CFFF',
    marginLeft: 10,
    shadowColor: '#00CFFF',
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
    flexShrink: 0,
  },
});

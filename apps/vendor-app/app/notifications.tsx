import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { THEME } from '../constants/theme';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type NotificationCategory = 'all' | 'earnings' | 'jobs' | 'compliance';
type NotificationType = 'success' | 'job' | 'info' | 'payment' | 'warning';

interface DriverNotification {
  id: string;
  category: 'earnings' | 'jobs' | 'compliance';
  title: string;
  body: string;
  time: string;
  type: NotificationType;
  read: boolean;
  actionLabel?: string;
  actionRoute?: string;
}

const INITIAL_NOTIFICATIONS: DriverNotification[] = [
  {
    id: 'notif-1',
    category: 'earnings',
    title: 'Weekly Payout Processed',
    body: '₹8,750 transferred successfully to HDFC Bank (A/C ••4589).',
    time: '5 min ago',
    type: 'payment',
    read: false,
    actionLabel: 'View Wallet',
    actionRoute: '/(tabs)/earnings',
  },
  {
    id: 'notif-2',
    category: 'jobs',
    title: 'High Demand Surge Active 🔥',
    body: '1.4x surge pricing now live in MG Road & Indiranagar. Go online to earn extra!',
    time: '25 min ago',
    type: 'job',
    read: false,
    actionLabel: 'Go Online',
    actionRoute: '/(tabs)',
  },
  {
    id: 'notif-3',
    category: 'compliance',
    title: 'Document Expiry Warning',
    body: 'Your Vehicle Fitness Certificate expires in 14 days. Upload a new copy to avoid job pause.',
    time: '2 hours ago',
    type: 'warning',
    read: false,
    actionLabel: 'Update Document',
    actionRoute: '/(tabs)/profile',
  },
  {
    id: 'notif-4',
    category: 'jobs',
    title: '5-Star Trip Rating! ⭐',
    body: 'Customer Rahul S. rated you 5 stars: "Driver arrived quickly and handled loading very smoothly!"',
    time: 'Yesterday',
    type: 'success',
    read: true,
    actionLabel: 'View History',
    actionRoute: '/(tabs)/history',
  },
  {
    id: 'notif-5',
    category: 'earnings',
    title: 'Daily Bonus Unlocked 🎁',
    body: 'Completed 3 tows today! ₹350 daily performance incentive added to your pending balance.',
    time: 'Yesterday',
    type: 'payment',
    read: true,
    actionLabel: 'View Earnings',
    actionRoute: '/(tabs)/earnings',
  },
  {
    id: 'notif-6',
    category: 'compliance',
    title: 'Safety Inspection Passed',
    body: 'Pre-tow vs post-tow vehicle inspection checklist verified with 0 damages reported on Job #7821.',
    time: '2 days ago',
    type: 'info',
    read: true,
  },
  {
    id: 'notif-7',
    category: 'compliance',
    title: 'Driver Account Verified ✓',
    body: 'Commercial Heavy Driving License (DL) successfully verified by OmniGo Verification Team.',
    time: '3 days ago',
    type: 'success',
    read: true,
    actionLabel: 'Check Status',
    actionRoute: '/(tabs)/profile',
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<DriverNotification[]>(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<NotificationCategory>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const toggleNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const handleAction = (item: DriverNotification) => {
    // Mark as read when action tapped
    setNotifications(prev =>
      prev.map(n => (n.id === item.id ? { ...n, read: true } : n))
    );
    if (item.actionRoute) {
      router.push(item.actionRoute as any);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    return n.category === activeTab;
  });

  const getIconData = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return { name: 'checkmark-circle' as const, color: THEME.colors.success, bg: 'rgba(0, 255, 151, 0.15)' };
      case 'job':
        return { name: 'flash' as const, color: THEME.colors.primary, bg: 'rgba(0, 207, 255, 0.15)' };
      case 'info':
        return { name: 'information-circle' as const, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)' };
      case 'payment':
        return { name: 'wallet' as const, color: THEME.colors.success, bg: 'rgba(0, 255, 151, 0.15)' };
      case 'warning':
        return { name: 'warning' as const, color: THEME.colors.warning, bg: 'rgba(255, 214, 10, 0.15)' };
      default:
        return { name: 'notifications' as const, color: THEME.colors.textSecondary, bg: 'rgba(255, 255, 255, 0.1)' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 10, 50) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={THEME.colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badgePill}>
              <Text style={styles.badgeText}>{unreadCount} new</Text>
            </View>
          )}
        </View>

        <TouchableOpacity 
          onPress={markAllRead} 
          disabled={unreadCount === 0}
          style={[styles.markReadBtn, unreadCount === 0 && { opacity: 0.5 }]}
          activeOpacity={0.7}
        >
          <Text style={styles.markReadText}>Read All</Text>
        </TouchableOpacity>
      </View>

      {/* Category Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          <TouchableOpacity
            style={[styles.tabChip, activeTab === 'all' && styles.tabChipActive]}
            onPress={() => setActiveTab('all')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
              All ({notifications.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabChip, activeTab === 'earnings' && styles.tabChipActive]}
            onPress={() => setActiveTab('earnings')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'earnings' && styles.tabTextActive]}>
              Earnings & Payouts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabChip, activeTab === 'jobs' && styles.tabChipActive]}
            onPress={() => setActiveTab('jobs')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'jobs' && styles.tabTextActive]}>
              Job Alerts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabChip, activeTab === 'compliance' && styles.tabChipActive]}
            onPress={() => setActiveTab('compliance')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'compliance' && styles.tabTextActive]}>
              Compliance & Safety
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Notifications List */}
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 20, 40) }]}
        showsVerticalScrollIndicator={false}
      >
        {filteredNotifications.length === 0 ? (
          <BlurView intensity={15} tint="dark" style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="notifications-off-outline" size={32} color={THEME.colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySub}>
              {activeTab === 'all'
                ? "You're all caught up! New dispatch alerts and payout updates will appear here."
                : `No notifications in ${activeTab} category.`}
            </Text>
          </BlurView>
        ) : (
          filteredNotifications.map((notif) => {
            const iconData = getIconData(notif.type);
            return (
              <BlurView
                key={notif.id}
                intensity={20}
                tint="dark"
                style={[
                  styles.card,
                  !notif.read && styles.unreadCard,
                ]}
              >
                <Pressable 
                  style={styles.cardInner}
                  onPress={() => toggleNotificationRead(notif.id)}
                >
                  <View style={[styles.iconContainer, { backgroundColor: iconData.bg }]}>
                    <Ionicons name={iconData.name} size={22} color={iconData.color} />
                  </View>

                  <View style={styles.textContainer}>
                    <View style={styles.topRow}>
                      <Text style={styles.notifTitle} numberOfLines={1}>
                        {notif.title}
                      </Text>
                      <View style={styles.metaRow}>
                        <Text style={styles.notifTime}>{notif.time}</Text>
                        {!notif.read && <View style={styles.unreadDot} />}
                      </View>
                    </View>

                    <Text style={styles.notifBody}>{notif.body}</Text>

                    {/* Quick Action Button & Delete */}
                    <View style={styles.cardFooter}>
                      {notif.actionLabel ? (
                        <TouchableOpacity
                          style={styles.actionPill}
                          onPress={() => handleAction(notif)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.actionPillText}>{notif.actionLabel}</Text>
                          <Ionicons name="arrow-forward" size={12} color={THEME.colors.primary} />
                        </TouchableOpacity>
                      ) : (
                        <View style={{ flex: 1 }} />
                      )}

                      <TouchableOpacity
                        onPress={() => deleteNotification(notif.id)}
                        style={styles.deleteBtn}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash-outline" size={15} color="rgba(255,255,255,0.3)" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Pressable>
              </BlurView>
            );
          })
        )}

        {notifications.length > 0 && (
          <TouchableOpacity style={styles.clearAllBtn} onPress={clearAll} activeOpacity={0.7}>
            <Ionicons name="trash-bin-outline" size={14} color="rgba(255,255,255,0.4)" />
            <Text style={styles.clearAllText}>Clear All Notifications</Text>
          </TouchableOpacity>
        )}
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
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 20,
    color: THEME.colors.text,
  },
  badgePill: {
    backgroundColor: 'rgba(0, 207, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.3)',
  },
  badgeText: {
    fontFamily: THEME.fonts.inter.bold,
    fontSize: 11,
    color: THEME.colors.primary,
  },
  markReadBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  markReadText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 12,
    color: THEME.colors.primary,
  },
  tabContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  tabScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tabChipActive: {
    backgroundColor: 'rgba(0, 207, 255, 0.15)',
    borderColor: THEME.colors.primary,
  },
  tabText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  tabTextActive: {
    fontFamily: THEME.fonts.inter.bold,
    color: THEME.colors.primary,
  },
  content: {
    padding: 16,
    paddingTop: 12,
  },
  card: {
    backgroundColor: THEME.colors.glassBg,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    marginBottom: 10,
    overflow: 'hidden',
  },
  unreadCard: {
    borderColor: 'rgba(0, 207, 255, 0.35)',
    backgroundColor: 'rgba(0, 207, 255, 0.04)',
  },
  cardInner: {
    flexDirection: 'row',
    padding: 14,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 15,
    color: THEME.colors.text,
    flex: 1,
    paddingRight: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  notifTime: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.primary,
  },
  notifBody: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 13,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 207, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.25)',
  },
  actionPillText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 11,
    color: THEME.colors.primary,
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 6,
  },
  emptyCard: {
    backgroundColor: THEME.colors.glassBg,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    padding: 32,
    alignItems: 'center',
    marginVertical: 40,
    overflow: 'hidden',
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 18,
    color: THEME.colors.text,
    marginBottom: 6,
  },
  emptySub: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    marginTop: 8,
  },
  clearAllText: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },
});

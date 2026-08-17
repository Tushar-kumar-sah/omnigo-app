import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { fetchCurrentUser } from '../../lib/api';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const u = await fetchCurrentUser();
        if (u) setUser(u);
      } catch (e) {
        console.warn('[Profile]', e);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const MENU_ITEMS = [
    { title: 'Membership', icon: 'card-outline', route: '/membership' },
    { title: 'Settings', icon: 'settings-outline', route: '/settings' },
    { title: 'Notifications', icon: 'notifications-outline', route: '/notifications' },
    { title: 'Help & Support', icon: 'help-circle-outline', route: '/help' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#050810', '#0a1222', '#050810']} style={StyleSheet.absoluteFillObject} />

      <View style={[styles.headerArea, { paddingTop: Math.max(insets.top + 10, 44) }]}>
        <Text style={styles.headerTitle}>Settings & Profile</Text>
        <Text style={styles.headerSubtitle}>Account details & preferences</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {/* User Profile Glass Card */}
        <View style={styles.profileCardTouch}>
          <BlurView intensity={85} tint="dark" style={styles.profileCard}>
            <LinearGradient
              colors={['rgba(0, 207, 255, 0.2)', 'rgba(255, 255, 255, 0.04)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.avatarWrapper}>
              <Ionicons name="person" size={38} color="#00CFFF" />
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{user?.name || 'Loading...'}</Text>
              <Text style={styles.phone}>{user?.phone || 'Loading...'}</Text>
              <View style={styles.badge}>
                <Ionicons name="checkmark-circle" size={14} color="#00FF97" />
                <Text style={styles.badgeText}>Verified Account</Text>
              </View>
            </View>
          </BlurView>
        </View>

        {/* Menu Glass Cards */}
        <View style={styles.menuContainer}>
          <BlurView intensity={85} tint="dark" style={styles.menuCard}>
            {MENU_ITEMS.map((item, idx) => (
              <TouchableOpacity
                key={item.title}
                style={[
                  styles.menuItem,
                  idx < MENU_ITEMS.length - 1 && styles.menuItemBorder,
                ]}
                onPress={() => item.route && router.push(item.route as any)}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name={item.icon as any} size={20} color="#00CFFF" style={{ marginRight: 14 }} />
                  <Text style={styles.menuText}>{item.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="rgba(255, 255, 255, 0.5)" />
              </TouchableOpacity>
            ))}
          </BlurView>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtnTouch}
          onPress={() => router.replace('/(auth)/login')}
          activeOpacity={0.8}
        >
          <BlurView intensity={85} tint="dark" style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={20} color="#FF3B30" style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </BlurView>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050810' },
  headerArea: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.08)' },
  headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 26, color: '#FFFFFF' },
  headerSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255, 255, 255, 0.65)', marginTop: 4 },
  list: { padding: 16, paddingBottom: 120 },
  profileCardTouch: { marginBottom: 20, borderRadius: 24, overflow: 'hidden' },
  profileCard: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: 'rgba(10, 28, 60, 0.65)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
    overflow: 'hidden',
  },
  avatarWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0, 207, 255, 0.15)',
    borderWidth: 1.5,
    borderColor: '#00CFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  info: { flex: 1 },
  name: { fontFamily: 'Outfit_700Bold', fontSize: 22, color: '#FFFFFF' },
  phone: { fontFamily: 'Inter_400Regular', color: 'rgba(255, 255, 255, 0.65)', fontSize: 13, marginTop: 2 },
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
  menuContainer: { borderRadius: 24, overflow: 'hidden', marginBottom: 24 },
  menuCard: {
    paddingVertical: 6,
    borderRadius: 24,
    backgroundColor: 'rgba(14, 24, 48, 0.65)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    overflow: 'hidden',
  },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.08)' },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  menuText: { color: '#FFFFFF', fontFamily: 'Outfit_600SemiBold', fontSize: 15 },
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

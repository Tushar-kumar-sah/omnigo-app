import { Tabs, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchCurrentUser, fetchActiveBooking } from '@/lib/api';
import { useTheme } from '@/context/ThemeContext';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDark, colors } = useTheme();

  // On Android with 3-button navigation, insets.bottom is typically 24-48px.
  // When insets.bottom is 0 (or undefined), provide standard 10px padding.
  const bottomInset = insets.bottom > 0 ? insets.bottom : (Platform.OS === 'android' ? 10 : 0);
  const TAB_BAR_HEIGHT = 60 + bottomInset;
  const TAB_PADDING_BOTTOM = Math.max(bottomInset, 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: TAB_BAR_HEIGHT,
          borderTopWidth: 1,
          borderTopColor: colors.divider,
          backgroundColor: Platform.OS === 'android' ? (isDark ? '#050810' : '#FFFFFF') : (isDark ? 'rgba(5, 8, 16, 0.95)' : 'rgba(255, 255, 255, 0.95)'),
          elevation: isDark ? 0 : 8,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0 : 0.08,
          shadowRadius: 8,
          paddingTop: 8,
          paddingBottom: TAB_PADDING_BOTTOM,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 10,
          marginTop: 2,
        },
      }}
    >
      {/* 1. Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconWrapper}>
              <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color as any} />
              {focused && <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />}
            </View>
          ),
        }}
      />

      {/* 2. Track Tab */}
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Track',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconWrapper}>
              <Ionicons name={focused ? 'navigate' : 'navigate-outline'} size={22} color={color as any} />
              {focused && <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />}
            </View>
          ),
        }}
      />

      {/* 3. Book Center Highlighted Tab (Single Active Booking Enforced) */}
      <Tabs.Screen
        name="sos"
        options={{
          title: 'Book',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.centerBookBadge, { backgroundColor: colors.primary }]}>
              <MaterialCommunityIcons name="tow-truck" size={26} color="#FFFFFF" />
            </View>
          ),
          tabBarLabelStyle: {
            fontFamily: 'Outfit_700Bold',
            fontSize: 10,
            color: colors.text,
            marginTop: 4,
          },
        }}
        listeners={() => ({
          tabPress: async (e) => {
            e.preventDefault();
            try {
              const u = await fetchCurrentUser();
              if (u?.id || u?.uuid) {
                const active = await fetchActiveBooking(u.uuid || u.id);
                if (active) {
                  router.push({
                    pathname: '/booking/tracking',
                    params: { bookingId: active.uuid || active.id, driverId: active.driverId || active.driver_id },
                  });
                  return;
                }
              }
            } catch (err) {}
            router.push('/booking/select-vehicle');
          },
        })}
      />

      {/* 4. History Tab */}
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconWrapper}>
              <Ionicons name={focused ? 'time' : 'time-outline'} size={22} color={color as any} />
              {focused && <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />}
            </View>
          ),
        }}
      />

      {/* 5. Settings Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconWrapper}>
              <Ionicons name={focused ? 'settings' : 'settings-outline'} size={22} color={color as any} />
              {focused && <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIndicator: {
    width: 14,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#00FF97',
    marginTop: 3,
  },
  centerBookBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#00CFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    marginTop: -4,
  },
});

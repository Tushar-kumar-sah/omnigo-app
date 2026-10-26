import { Tabs } from 'expo-router';
import { THEME } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
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
          backgroundColor: Platform.OS === 'android' ? (isDark ? '#080d19' : '#FFFFFF') : (isDark ? 'rgba(8, 13, 25, 0.95)' : 'rgba(255, 255, 255, 0.95)'),
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
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconWrapper}>
              <Ionicons name={focused ? 'map' : 'map-outline'} size={22} color={color as any} />
              {focused && <View style={[styles.activeDot, { backgroundColor: colors.success }]} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: 'Earnings',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconWrapper}>
              <Ionicons name={focused ? 'trending-up' : 'trending-up-outline'} size={22} color={color as any} />
              {focused && <View style={[styles.activeDot, { backgroundColor: colors.success }]} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconWrapper}>
              <Ionicons name={focused ? 'wallet' : 'wallet-outline'} size={22} color={color as any} />
              {focused && <View style={[styles.activeDot, { backgroundColor: colors.success }]} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconWrapper}>
              <Ionicons name={focused ? 'time' : 'time-outline'} size={22} color={color as any} />
              {focused && <View style={[styles.activeDot, { backgroundColor: colors.success }]} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconWrapper}>
              <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color as any} />
              {focused && <View style={[styles.activeDot, { backgroundColor: colors.success }]} />}
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
  activeDot: {
    width: 14,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#00FF97',
    marginTop: 3,
  },
});

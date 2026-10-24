import { Tabs, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

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
          borderTopColor: 'rgba(255, 255, 255, 0.08)',
          backgroundColor: Platform.OS === 'android' ? '#050810' : 'rgba(5, 8, 16, 0.95)',
          elevation: 0,
          paddingTop: 8,
          paddingBottom: TAB_PADDING_BOTTOM,
        },
        tabBarActiveTintColor: '#00FF97',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
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
              <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
              {focused && <View style={styles.activeIndicator} />}
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
              <Ionicons name={focused ? 'navigate' : 'navigate-outline'} size={22} color={color} />
              {focused && <View style={styles.activeIndicator} />}
            </View>
          ),
        }}
      />

      {/* 3. Book Center Highlighted Tab */}
      <Tabs.Screen
        name="sos"
        options={{
          title: 'Book',
          tabBarIcon: ({ focused }) => (
            <View style={styles.centerBookBadge}>
              <MaterialCommunityIcons name="tow-truck" size={26} color="#000000" />
            </View>
          ),
          tabBarLabelStyle: {
            fontFamily: 'Outfit_700Bold',
            fontSize: 10,
            color: '#FFFFFF',
            marginTop: 4,
          },
        }}
        listeners={() => ({
          tabPress: (e) => {
            e.preventDefault();
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
              <Ionicons name={focused ? 'time' : 'time-outline'} size={22} color={color} />
              {focused && <View style={styles.activeIndicator} />}
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
              <Ionicons name={focused ? 'settings' : 'settings-outline'} size={22} color={color} />
              {focused && <View style={styles.activeIndicator} />}
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
    backgroundColor: '#00FF97',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    marginTop: -4,
  },
});

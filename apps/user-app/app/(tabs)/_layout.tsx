import { Tabs, useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: Platform.OS === 'ios' ? 78 + insets.bottom : 70,
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.08)',
          backgroundColor: '#050810',
          elevation: 10,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 10),
        },
        tabBarBackground: () => (
          <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
        ),
        tabBarActiveTintColor: '#00FF97',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 11,
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
            fontSize: 11,
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
    shadowColor: '#00FF97',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
    marginTop: -4,
  },
});

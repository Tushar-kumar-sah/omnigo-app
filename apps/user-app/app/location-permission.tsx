import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';

export default function LocationPermissionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleEnable = () => {
    router.replace('/onboarding');
  };

  const handleLater = () => {
    router.replace('/onboarding');
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#050810', '#0a1222', '#050810']} style={StyleSheet.absoluteFill} />

      <View style={[styles.content, { paddingTop: Math.max(insets.top + 40, 80), paddingBottom: Math.max(insets.bottom + 20, 40) }]}>
        
        {/* Top Glowing Location Pin Icon */}
        <View style={styles.iconCircleOuter}>
          <View style={styles.iconCircleInner}>
            <Ionicons name="location-outline" size={40} color={theme.colors.primary} />
          </View>
        </View>

        {/* Title & Description Details */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Enable Location</Text>
          <Text style={styles.description}>
            Allow Omnigo to access your location for instant rescue services, real-time tracking, and finding the nearest towing vehicles.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.enableBtnTouch} onPress={handleEnable} activeOpacity={0.85}>
            <LinearGradient
              colors={['#00FF97', '#00CC7A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.enableBtn}
            >
              <Ionicons name="navigate-outline" size={20} color="#000" style={{ marginRight: 8 }} />
              <Text style={styles.enableBtnText}>Enable Location Services</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.laterBtnTouch} onPress={handleLater} activeOpacity={0.7}>
            <Text style={styles.laterBtnText}>
              Decide Later <Ionicons name="chevron-forward" size={14} color={theme.colors.textSecondary} />
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050810',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
  },
  iconCircleOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(0, 207, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  iconCircleInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(0, 207, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 28,
    color: '#00FF97',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  actionContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  enableBtnTouch: {
    width: '100%',
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    shadowColor: '#00FF97',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  enableBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  enableBtnText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    color: '#000000',
    letterSpacing: 0.3,
  },
  laterBtnTouch: {
    paddingVertical: 16,
    marginTop: 12,
  },
  laterBtnText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
});

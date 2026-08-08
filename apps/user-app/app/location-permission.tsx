import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
      {/* Dynamic Futuristic Dark Background Gradient */}
      <LinearGradient colors={['#050810', '#0a172c', '#050810']} style={StyleSheet.absoluteFill} />

      <View style={[styles.content, { paddingTop: Math.max(insets.top + 30, 60), paddingBottom: Math.max(insets.bottom + 20, 40) }]}>

        {/* 1. Hero Radar Pulse Graphic */}
        <View style={styles.heroSection}>
          <View style={styles.radarRingOuter3}>
            <View style={styles.radarRingOuter2}>
              <View style={styles.radarRingOuter1}>
                <View style={styles.radarCore}>
                  <LinearGradient
                    colors={['#00CFFF', '#00FF97']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.coreGradient}
                  >
                    <Ionicons name="location" size={42} color="#050810" />
                  </LinearGradient>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 2. Floating Text Section (No Card Frame per user request) */}
        <View style={styles.textSection}>
          <Text style={styles.title}>Enable Location</Text>
          <Text style={styles.description}>
            Allow <Text style={styles.highlightText}>OmniGo</Text> to access your real-time location for instant tow dispatch, live tracking, and emergency roadside assistance.
          </Text>

          {/* 3. Feature Chips Grid for Rich Visuals */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureBadge}>
              <Ionicons name="flash-outline" size={18} color="#00FF97" style={{ marginRight: 8 }} />
              <Text style={styles.featureText}>Instant Tow Rescue</Text>
            </View>

            <View style={styles.featureBadge}>
              <Ionicons name="navigate-outline" size={18} color="#00CFFF" style={{ marginRight: 8 }} />
              <Text style={styles.featureText}>Live GPS Radar</Text>
            </View>

            <View style={styles.featureBadge}>
              <MaterialCommunityIcons name="shield-check-outline" size={18} color="#00FF97" style={{ marginRight: 8 }} />
              <Text style={styles.featureText}>Verified Fleet</Text>
            </View>
          </View>
        </View>

        {/* 4. Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.enableBtnTouch} onPress={handleEnable} activeOpacity={0.85}>
            <LinearGradient
              colors={['#00FF97', '#00CFFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.enableBtn}
            >
              <Ionicons name="navigate" size={20} color="#050810" style={{ marginRight: 8 }} />
              <Text style={styles.enableBtnText}>Enable Location Services</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.laterBtnTouch} onPress={handleLater} activeOpacity={0.7}>
            <Text style={styles.laterBtnText}>
              Decide Later <Ionicons name="chevron-forward" size={14} color="rgba(255, 255, 255, 0.5)" />
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
    paddingHorizontal: 24,
  },

  /* 1. Radar Pulse Graphic */
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  radarRingOuter3: {
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(0, 207, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarRingOuter2: {
    width: 165,
    height: 165,
    borderRadius: 82.5,
    backgroundColor: 'rgba(0, 207, 255, 0.06)',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 207, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarRingOuter1: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 255, 151, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 255, 151, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00FF97',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  radarCore: {
    width: 76,
    height: 76,
    borderRadius: 38,
    overflow: 'hidden',
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 10,
  },
  coreGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* 2. Floating Text Section */
  textSection: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginVertical: 10,
  },
  title: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  highlightText: {
    fontFamily: 'Outfit_700Bold',
    color: '#00FF97',
  },

  /* 3. Feature Badges */
  featuresContainer: {
    width: '100%',
    gap: 10,
    alignItems: 'stretch',
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(10, 28, 60, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.25)',
  },
  featureText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  /* 4. Action Buttons */
  actionContainer: {
    width: '100%',
    alignItems: 'center',
  },
  enableBtnTouch: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#00FF97',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
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
    color: '#050810',
    letterSpacing: 0.3,
  },
  laterBtnTouch: {
    paddingVertical: 14,
    marginTop: 10,
  },
  laterBtnText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.55)',
  },
});

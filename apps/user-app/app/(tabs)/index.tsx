import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../constants/theme';

const AI_CAPTIONS = [
  "How can I help you?",
  "Need a quick tow?",
  "Engine issue? Ask me!",
  "Battery dead? Tap here!",
  "Emergency assist 24/7",
  "Instant rescue active!",
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [captionIndex, setCaptionIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Waving animation loop for AI Mascot
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: -1, duration: 350, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.delay(1500),
      ])
    ).start();

    // Rotating captions loop
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setCaptionIndex((prev) => (prev + 1) % AI_CAPTIONS.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }).start();
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const waveRotate = waveAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-12deg', '0deg', '12deg'],
  });

  const waveScale = waveAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0.96, 1.0, 1.08],
  });

  return (
    <View style={styles.container}>
      {/* Background Deep Cyber Dark */}
      <LinearGradient colors={['#050810', '#0a1222', '#050810']} style={StyleSheet.absoluteFillObject} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top + 10, 44), paddingBottom: Math.max(insets.bottom + 110, 120) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header Row: Welcome back & Action Icons */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.logoBadge}>
              <Image source={require('../../assets/logo.png')} style={styles.logoImg} resizeMode="contain" />
            </View>
            <View>
              <Text style={styles.greetingText}>Good Morning</Text>
              <Text style={styles.welcomeText}>Welcome back! 👋</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/notifications')}>
              <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.profileAvatarBtn} onPress={() => router.push('/profile')}>
              <LinearGradient colors={['#00FF97', '#00CFFF']} style={styles.profileAvatarGradient}>
                <Ionicons name="person" size={20} color="#000000" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Search Box (Left) + AI Mascot OUTSIDE (Right) + Text Callout Further Below */}
        <View style={styles.searchSectionContainer}>
          {/* Top Row: Search Box + AI Avatar Outside */}
          <View style={styles.searchRowWithExternalAi}>
            <View style={styles.searchBoxLeft}>
              <Ionicons name="search" size={18} color="rgba(255, 255, 255, 0.4)" style={{ marginRight: 10 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search services, towing..."
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
              />
            </View>

            {/* AI Assistant Avatar OUTSIDE on the Right with Waving Animation */}
            <TouchableOpacity 
              style={styles.aiAvatarExternalBtn} 
              onPress={() => router.push('/ai-assistant')} 
              activeOpacity={0.8}
            >
              <Animated.View style={{ width: '100%', height: '100%', transform: [{ rotate: waveRotate }, { scale: waveScale }] }}>
                <Image source={require('../../assets/ai_mascot.png')} style={styles.aiAvatarImg} resizeMode="contain" />
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* Floating Animated Speech Callout Bubble Positioned Further Down on Right */}
          <TouchableOpacity 
            style={styles.aiCalloutBelowContainer}
            onPress={() => router.push('/ai-assistant')} 
            activeOpacity={0.8}
          >
            <View style={styles.speechBubbleArrowTailTopRight} />
            <BlurView intensity={35} tint="dark" style={styles.aiSpeechBubbleCalloutBelow}>
              <Ionicons name="sparkles" size={12} color="#00CFFF" style={{ marginRight: 4 }} />
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [3, 0],
                      }),
                    },
                  ],
                }}
              >
                <Text style={styles.aiSpeechTextCallout}>{AI_CAPTIONS[captionIndex]}</Text>
              </Animated.View>
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* 3. Quick Actions Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        {/* Card 1: Book Tow (Cyan Glass Glow) */}
        <TouchableOpacity
          style={styles.actionCardTouch}
          onPress={() => router.push('/booking/select-vehicle')}
          activeOpacity={0.85}
        >
          <BlurView intensity={85} tint="dark" style={[styles.actionCard, styles.bookTowBorder]}>
            <LinearGradient
              colors={['rgba(0, 207, 255, 0.38)', 'rgba(0, 255, 151, 0.12)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Book Tow</Text>
              <Text style={styles.cardSubtitle}>Instant dispatch to your location</Text>
            </View>
            <View style={styles.cardRightGraphic}>
              <Image source={require('../../assets/book_tow_truck.png')} style={styles.towTruckThumb} resizeMode="contain" />
            </View>
          </BlurView>
        </TouchableOpacity>

        {/* Card 2: Schedule Tow (Emerald Green Glass Glow) */}
        <TouchableOpacity
          style={styles.actionCardTouch}
          onPress={() => router.push('/booking/schedule-tow')}
          activeOpacity={0.85}
        >
          <BlurView intensity={85} tint="dark" style={[styles.actionCard, styles.scheduleTowBorder]}>
            <LinearGradient
              colors={['rgba(0, 255, 151, 0.38)', 'rgba(0, 207, 255, 0.12)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Schedule Tow</Text>
              <Text style={styles.cardSubtitle}>Plan a pickup for later</Text>
            </View>
            <View style={styles.scheduleIconBadge}>
              <Ionicons name="calendar-outline" size={24} color="#00FF97" />
            </View>
          </BlurView>
        </TouchableOpacity>

        {/* Card 3: Emergency SOS (Red Crimson Glass Glow) */}
        <TouchableOpacity
          style={styles.actionCardTouch}
          onPress={() => router.push('/(tabs)/sos')}
          activeOpacity={0.85}
        >
          <BlurView intensity={85} tint="dark" style={[styles.actionCard, styles.emergencySosBorder]}>
            <LinearGradient
              colors={['rgba(255, 59, 48, 0.40)', 'rgba(255, 149, 0, 0.12)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Emergency SOS</Text>
              <Text style={styles.cardSubtitle}>Immediate roadside assistance</Text>
            </View>
            <View style={styles.sosBadge}>
              <Text style={styles.sosText}>SOS</Text>
            </View>
          </BlurView>
        </TouchableOpacity>

        {/* 4. Recent Activity Section */}
        <View style={styles.recentSectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/wallet')}>
            <Text style={styles.viewAllText}>View All &gt;</Text>
          </TouchableOpacity>
        </View>

        {/* Activity Item 1 */}
        <TouchableOpacity style={styles.activityItemTouch} activeOpacity={0.8} onPress={() => router.push('/(tabs)/bookings')}>
          <BlurView intensity={75} tint="dark" style={styles.activityItem}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.08)', 'rgba(0, 207, 255, 0.03)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={[styles.activityIconBadge, { backgroundColor: 'rgba(0, 207, 255, 0.15)' }]}>
              <Ionicons name="car-sport" size={20} color="#00CFFF" />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Tow Service Completed</Text>
              <Text style={styles.activitySubtitle}>MG Road — Anand Nagar</Text>
            </View>
            <View style={styles.activityRight}>
              <Text style={styles.activityAmount}>₹1,250</Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
          </BlurView>
        </TouchableOpacity>

        {/* Activity Item 2 */}
        <TouchableOpacity style={styles.activityItemTouch} activeOpacity={0.8} onPress={() => router.push('/(tabs)/bookings')}>
          <BlurView intensity={75} tint="dark" style={styles.activityItem}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 179, 0, 0.03)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={[styles.activityIconBadge, { backgroundColor: 'rgba(255, 179, 0, 0.15)' }]}>
              <Ionicons name="settings-outline" size={20} color="#FFB300" />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Engine Diagnostic Report</Text>
              <Text style={styles.activitySubtitle}>Vehicle: Honda City 2023</Text>
            </View>
            <View style={styles.activityRight}>
              <Text style={styles.activityWarningStatus}>3 Issues Found</Text>
              <Text style={styles.activityTime}>Yesterday</Text>
            </View>
          </BlurView>
        </TouchableOpacity>

        {/* Activity Item 3 */}
        <TouchableOpacity style={styles.activityItemTouch} activeOpacity={0.8} onPress={() => router.push('/(tabs)/bookings')}>
          <BlurView intensity={75} tint="dark" style={styles.activityItem}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.08)', 'rgba(0, 255, 151, 0.03)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={[styles.activityIconBadge, { backgroundColor: 'rgba(0, 255, 151, 0.15)' }]}>
              <Ionicons name="flash-outline" size={20} color="#00FF97" />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Battery Replacement</Text>
              <Text style={styles.activitySubtitle}>Kothrud Service Center</Text>
            </View>
            <View style={styles.activityRight}>
              <Text style={styles.activityAmount}>₹4,500</Text>
              <Text style={styles.activityTime}>3 days ago</Text>
            </View>
          </BlurView>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050810',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(0, 207, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 207, 255, 0.4)',
    marginRight: 12,
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  logoImg: {
    width: 40,
    height: 40,
  },
  greetingText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  welcomeText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 20,
    color: '#FFFFFF',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF97',
  },
  profileAvatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    overflow: 'hidden',
  },
  profileAvatarGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchSectionContainer: {
    marginBottom: 16,
  },
  searchRowWithExternalAi: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBoxLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 20, 32, 0.65)',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.25)',
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  aiAvatarExternalBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#00CFFF',
    backgroundColor: '#0A1222',
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  aiCalloutBelowContainer: {
    alignSelf: 'flex-end',
    marginTop: 6,
    marginRight: 8,
    position: 'relative',
  },
  speechBubbleArrowTailTopRight: {
    position: 'absolute',
    top: -4,
    right: 24,
    width: 8,
    height: 8,
    backgroundColor: '#00CFFF',
    transform: [{ rotate: '45deg' }],
    zIndex: 10,
  },
  aiSpeechBubbleCalloutBelow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 207, 255, 0.16)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#00CFFF',
    overflow: 'hidden',
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  aiSpeechTextCallout: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 10,
    color: '#00CFFF',
  },
  aiAvatarImg: {
    width: '120%',
    height: '135%',
    top: 2,
    alignSelf: 'center',
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  actionCardTouch: {
    marginBottom: 14,
    borderRadius: 22,
    overflow: 'hidden',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 22,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  topNeonGlowLine: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 2.5,
    borderRadius: 1.25,
    opacity: 0.9,
  },
  bookTowBorder: {
    backgroundColor: 'rgba(10, 28, 60, 0.65)',
    borderColor: '#00CFFF',
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.75,
    shadowRadius: 18,
    elevation: 12,
  },
  scheduleTowBorder: {
    backgroundColor: 'rgba(8, 38, 42, 0.65)',
    borderColor: '#00FF97',
    shadowColor: '#00FF97',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.75,
    shadowRadius: 18,
    elevation: 12,
  },
  emergencySosBorder: {
    backgroundColor: 'rgba(42, 14, 24, 0.65)',
    borderColor: '#FF3B30',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.75,
    shadowRadius: 18,
    elevation: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  cardSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.65)',
    marginTop: 4,
  },
  cardRightGraphic: {
    width: 115,
    height: 64,
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginRight: -14,
    marginVertical: -6,
  },
  towTruckThumb: {
    width: '100%',
    height: '100%',
  },
  scheduleIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 255, 151, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 151, 0.3)',
  },
  sosBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FF3B30',
  },
  sosText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 13,
    color: '#FF3B30',
    letterSpacing: 0.5,
  },
  recentSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 14,
  },
  viewAllText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 13,
    color: '#00CFFF',
  },
  activityItemTouch: {
    marginBottom: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(14, 24, 48, 0.55)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.30)',
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    overflow: 'hidden',
  },
  activityIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  activitySubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.55)',
    marginTop: 2,
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  activityAmount: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 14,
    color: '#00FF97',
  },
  activityWarningStatus: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 12,
    color: '#FFB300',
  },
  activityTime: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: 2,
  },
});

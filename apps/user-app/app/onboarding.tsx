import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    image: require('../assets/onboarding_1.jpg'),
    icon: 'flash-outline',
    title: 'Intelligent Rescue System',
    description:
      'Experience next-gen roadside assistance powered by AI. Our system detects breakdowns in real-time and dispatches the nearest rescue vehicle within seconds — ensuring you\'re never stranded.',
    buttonText: 'Next',
  },
  {
    id: '2',
    image: require('../assets/onboarding_2.jpg'),
    icon: 'hardware-chip-outline',
    title: 'AI Engine Diagnostic',
    description:
      'Meet OMNI-AI — your smart mobility assistant. Get instant diagnostic reports, maintenance alerts, and smart recommendations powered by advanced artificial intelligence.',
    buttonText: 'Next',
  },
  {
    id: '3',
    image: require('../assets/onboarding_3.jpg'),
    icon: 'navigate-outline',
    title: 'Realtime GPS LIVE Tracking',
    description:
      'Track your rescue vehicle in real-time with precision GPS. See exact arrival times, live route updates, and communicate directly with your driver — complete transparency at every step.',
    buttonText: 'Get Started',
  },
];

export default function OnboardingScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX     = useRef(new Animated.Value(0)).current;

  // Glow pulse for AI assistant
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Glow pulse loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1,   duration: 1200, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.5, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    router.replace('/(auth)/register');
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient colors={['#050810', '#0a1222', '#050810']} style={StyleSheet.absoluteFill} />

      {/* Top Header Bar */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 10, 40) }]}>
        <TouchableOpacity style={styles.skipBtn} onPress={handleFinish} activeOpacity={0.7}>
          <Text style={styles.skipText}>SKIP</Text>
        </TouchableOpacity>
      </View>

      {/* Main Slider Carousel */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        renderItem={({ item, index }) => (
          <View style={styles.slideWidthContainer}>
            <View style={styles.slideContent}>
              {/* Hero Graphic Card */}
              {index === 0 ? (
                // ── Slide 1: Intelligent Rescue System Image ──
                <View style={[styles.heroCardContainer, styles.rescueCardBorder]}>
                  <Image source={item.image} style={styles.heroImage} resizeMode="cover" />
                  <LinearGradient
                    colors={['transparent', 'rgba(5, 8, 16, 0.75)', '#050810']}
                    style={styles.heroOverlay}
                  />
                  {/* Glowing rescue badge */}
                  <View style={styles.rescueBadge}>
                    <Ionicons name="shield-checkmark" size={11} color="#00FF97" />
                    <Text style={styles.rescueBadgeText}>SECURE RESCUE</Text>
                  </View>
                </View>
              ) : index === 1 ? (
                // ── Slide 2: OMNI AI Assistant ──
                <View style={[styles.heroCardContainer, styles.omniCardBorder]}>
                  <View style={styles.omniBg}>
                    {/* Subtle neon glow behind character */}
                    <Animated.View style={[styles.omniGlow, { opacity: glowAnim }]} />
                    <Image
                      source={item.image}
                      style={styles.omniImage}
                      resizeMode="cover"
                    />
                    {/* Overlay sheen */}
                    <LinearGradient
                      colors={['transparent', 'rgba(5,8,16,0.7)', '#050810']}
                      style={styles.heroOverlay}
                    />
                  </View>
                  {/* OMNI AI badge */}
                  <View style={styles.omniBadge}>
                    <Ionicons name="hardware-chip-outline" size={11} color="#00CFFF" />
                    <Text style={styles.omniBadgeText}>OMNI-AI</Text>
                  </View>
                </View>
              ) : (
                // ── Slide 3: GPS Tracking image ──
                <View style={styles.heroCardContainer}>
                  <Image source={item.image} style={styles.heroImage} resizeMode="cover" />
                  <LinearGradient
                    colors={['transparent', 'rgba(5, 8, 16, 0.8)', '#050810']}
                    style={styles.heroOverlay}
                  />
                </View>
              )}

              {/* Center Icon Badge */}
              <View style={styles.iconBadge}>
                <Ionicons name={item.icon as any} size={22} color="#00FF97" />
              </View>

              {/* Title & Description Text */}
              <View style={styles.textWrapper}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
            </View>
          </View>
        )}
      />

      {/* Bottom Navigation Control Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom + 20, 30) }]}>
        {/* Pagination Dots */}
        <View style={styles.paginationContainer}>
          {SLIDES.map((_, index) => {
            const isActive = index === currentIndex;
            return (
              <View
                key={index}
                style={[
                  styles.dot,
                  isActive ? styles.dotActive : styles.dotInactive,
                ]}
              />
            );
          })}
        </View>

        {/* Next / Get Started Button */}
        <TouchableOpacity style={styles.nextBtnTouch} onPress={handleNext} activeOpacity={0.85}>
          <LinearGradient
            colors={['#00FF97', '#00CC7A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextBtn}
          >
            <Text style={styles.nextBtnText}>{SLIDES[currentIndex].buttonText}</Text>
            <Ionicons name="chevron-forward" size={18} color="#000" style={{ marginLeft: 4 }} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050810',
  },
  header: {
    width: '100%',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    zIndex: 10,
  },
  skipBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  skipText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 13,
    color: theme.colors.textSecondary,
    letterSpacing: 1.5,
  },
  slideWidthContainer: {
    width: width,
    alignItems: 'center',
  },
  slideContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  heroCardContainer: {
    width: width * 0.85,
    height: height * 0.38,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.25)',
    marginBottom: 20,
    position: 'relative',
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 8,
  },
  // Intelligent Rescue System styles
  rescueCardBorder: {
    borderColor: 'rgba(0,255,151,0.3)',
    shadowColor: '#00FF97',
    shadowOpacity: 0.45,
    shadowRadius: 20,
  },
  rescueBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,255,151,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,151,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rescueBadgeText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 10,
    color: '#00FF97',
    letterSpacing: 1,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  // OMNI AI character styles
  omniCardBorder: {
    borderColor: 'rgba(0,207,255,0.35)',
    shadowColor: '#00CFFF',
    shadowOpacity: 0.5,
    shadowRadius: 22,
  },
  omniBg: {
    flex: 1,
    backgroundColor: '#040d1a',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  omniGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(0,207,255,0.08)',
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 60,
    elevation: 0,
  },
  omniImage: {
    width: '100%',
    height: '100%',
  },
  omniBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,207,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,207,255,0.35)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  omniBadgeText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 10,
    color: '#00CFFF',
    letterSpacing: 1,
  },
  aiMascotCardContainer: {
    backgroundColor: 'rgba(13, 20, 32, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  aiMascotHeroImage: {
    width: '90%',
    height: '90%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 255, 151, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 151, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#00FF97',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  textWrapper: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  title: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 24,
    color: '#00FF97',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    width: '100%',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  dotActive: {
    width: 24,
    backgroundColor: '#00FF97',
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  nextBtnTouch: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#00FF97',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  nextBtnText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 15,
    color: '#000000',
  },
});

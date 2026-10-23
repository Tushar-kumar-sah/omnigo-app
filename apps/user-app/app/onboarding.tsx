import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  useWindowDimensions,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';

const SLIDES = [
  {
    id: '1',
    image: require('../assets/onboarding_1.jpg'),
    icon: 'flash',
    accentColor: '#00FF97',
    badgeText: 'SECURE RESCUE',
    badgeIcon: 'shield-checkmark',
    title: 'Intelligent Rescue System',
    description:
      "Experience next-gen roadside assistance powered by AI. Our system detects breakdowns in real-time and dispatches the nearest rescue vehicle within seconds — ensuring you're never stranded.",
    buttonText: 'Next',
  },
  {
    id: '2',
    image: require('../assets/onboarding_2.jpg'),
    icon: 'hardware-chip',
    accentColor: '#00CFFF',
    badgeText: 'OMNI-AI',
    badgeIcon: 'hardware-chip-outline',
    title: 'AI Engine Diagnostic',
    description:
      'Meet OMNI-AI — your smart mobility assistant. Get instant diagnostic reports, maintenance alerts, and smart recommendations powered by advanced artificial intelligence.',
    buttonText: 'Next',
  },
  {
    id: '3',
    image: require('../assets/onboarding_3.jpg'),
    icon: 'navigate',
    accentColor: '#00FF97',
    badgeText: 'LIVE GPS',
    badgeIcon: 'navigate-circle-outline',
    title: 'Realtime GPS LIVE Tracking',
    description:
      'Track your rescue vehicle in real-time with precision GPS. See exact arrival times, live route updates, and communicate directly with your driver — complete transparency at every step.',
    buttonText: 'Get Started',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Ensure safe fallback if dimensions are 0 during early layout
  const width = windowWidth || 380;
  const height = windowHeight || 800;

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    router.replace('/(auth)/register');
  };

  // Responsive hero card size (guaranteed non-zero, never squashed on any device)
  const cardWidth = Math.min(width - 48, 340);
  const cardHeight = Math.round(Math.min(Math.max(height * 0.34, 250), 300));

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient colors={['#050810', '#0a1222', '#050810']} style={StyleSheet.absoluteFill} />

      {/* Top Header Bar */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, 38) }]}>
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
        style={styles.flatList}
        contentContainerStyle={styles.flatListContent}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          if (index >= 0 && index < SLIDES.length) {
            setCurrentIndex(index);
          }
        }}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        renderItem={({ item }) => (
          <View style={[styles.slideWidthContainer, { width }]}>
            <View style={styles.slideContent}>
              {/* Hero Graphic Card */}
              <View
                style={[
                  styles.heroCardContainer,
                  {
                    width: cardWidth,
                    height: cardHeight,
                    borderColor:
                      item.accentColor === '#00CFFF'
                        ? 'rgba(0, 207, 255, 0.45)'
                        : 'rgba(0, 255, 151, 0.4)',
                  },
                  Platform.OS === 'ios' && {
                    shadowColor: item.accentColor,
                    shadowOpacity: 0.45,
                    shadowRadius: 18,
                  },
                ]}
              >
                <Image
                  source={item.image}
                  style={styles.heroImage}
                  resizeMode="cover"
                />

                {/* Subtle dark gradient overlay at the bottom */}
                <LinearGradient
                  colors={['transparent', 'rgba(5, 8, 16, 0.35)', 'rgba(5, 8, 16, 0.85)']}
                  style={styles.heroOverlay}
                />

                {/* Floating pill badge on top-right */}
                <View
                  style={[
                    styles.floatingBadge,
                    {
                      borderColor:
                        item.accentColor === '#00CFFF'
                          ? 'rgba(0, 207, 255, 0.4)'
                          : 'rgba(0, 255, 151, 0.4)',
                    },
                  ]}
                >
                  <Ionicons name={item.badgeIcon as any} size={12} color={item.accentColor} />
                  <Text style={[styles.floatingBadgeText, { color: item.accentColor }]}>
                    {item.badgeText}
                  </Text>
                </View>
              </View>

              {/* Center Icon Badge */}
              <View
                style={[
                  styles.iconBadge,
                  {
                    borderColor:
                      item.accentColor === '#00CFFF'
                        ? 'rgba(0, 207, 255, 0.35)'
                        : 'rgba(0, 255, 151, 0.35)',
                    backgroundColor:
                      item.accentColor === '#00CFFF'
                        ? 'rgba(0, 207, 255, 0.12)'
                        : 'rgba(0, 255, 151, 0.12)',
                  },
                ]}
              >
                <Ionicons name={item.icon as any} size={22} color={item.accentColor} />
              </View>

              {/* Title & Description Text */}
              <View style={styles.textWrapper}>
                <Text style={[styles.title, { color: item.accentColor }]}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
            </View>
          </View>
        )}
      />

      {/* Bottom Navigation Control Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom + 18, 26) }]}>
        {/* Interactive Pagination Dots */}
        <View style={styles.paginationContainer}>
          {SLIDES.map((slide, index) => {
            const isActive = index === currentIndex;
            return (
              <TouchableOpacity
                key={slide.id}
                onPress={() => {
                  flatListRef.current?.scrollToIndex({ index, animated: true });
                  setCurrentIndex(index);
                }}
                hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.dot,
                    isActive ? styles.dotActive : styles.dotInactive,
                    isActive && { backgroundColor: SLIDES[currentIndex].accentColor },
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Next / Get Started Button */}
        <TouchableOpacity style={styles.nextBtnTouch} onPress={handleNext} activeOpacity={0.85}>
          <LinearGradient
            colors={
              currentIndex === 1
                ? ['#00CFFF', '#0099CC']
                : ['#00FF97', '#00CC7A']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextBtn}
          >
            <Text style={styles.nextBtnText}>{SLIDES[currentIndex].buttonText}</Text>
            <Ionicons name="chevron-forward" size={18} color="#000000" style={{ marginLeft: 4 }} />
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
  flatList: {
    flex: 1,
  },
  flatListContent: {
    flexGrow: 1,
  },
  slideWidthContainer: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    maxHeight: 650,
  },
  heroCardContainer: {
    minHeight: 240,
    maxHeight: 320,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    marginBottom: 18,
    position: 'relative',
    backgroundColor: '#08101E',
    flexShrink: 0,
    elevation: Platform.OS === 'android' ? 0 : 6,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  floatingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(5, 8, 16, 0.78)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    zIndex: 5,
  },
  floatingBadgeText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 10.5,
    letterSpacing: 0.8,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 15,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    flexShrink: 0,
  },
  textWrapper: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  title: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 23,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13.5,
    color: 'rgba(255, 255, 255, 0.65)',
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 6,
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
    gap: 8,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 24,
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  nextBtnTouch: {
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 4,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 13,
  },
  nextBtnText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 15,
    color: '#000000',
  },
});

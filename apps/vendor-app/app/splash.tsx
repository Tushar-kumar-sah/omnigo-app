import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image, Animated, Text } from 'react-native';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
  const router = useRouter();

  // Animation Refs
  const popAnim = useRef(new Animated.Value(0.3)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Pop In + Fade In Animation Sequence
    Animated.parallel([
      Animated.spring(popAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Slow Glowing Beat (Heartbeat Pulse) Animation Loop
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );

    // Start pulsing slightly after the pop-in
    const pulseTimer = setTimeout(() => {
      pulseLoop.start();
    }, 400);

    // 3. Smooth Fade Out & Navigate to Main Driver App after 3 seconds
    const timer = setTimeout(() => {
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        router.replace('/(tabs)');
      });
    }, 3000);

    return () => {
      clearTimeout(pulseTimer);
      pulseLoop.stop();
      clearTimeout(timer);
    };
  }, [popAnim, pulseAnim, opacityAnim, router]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: opacityAnim,
            transform: [{ scale: Animated.multiply(popAnim, pulseAnim) }],
          },
        ]}
      >
        <Image
          source={require('../assets/logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>DRIVER & TOWING PARTNER</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Pure Black Background
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 250,
    alignItems: 'center',
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 30,
    elevation: 20,
  },
  logoImage: {
    width: 210,
    height: 210,
  },
  badgeContainer: {
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 207, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.35)',
  },
  badgeText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 12,
    color: '#00CFFF',
    letterSpacing: 2,
  },
});

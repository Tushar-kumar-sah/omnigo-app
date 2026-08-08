import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { THEME } from '../../constants/theme';

export default function UnderReviewScreen() {
  const router = useRouter();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(5, 8, 16, 0.4)', '#050810']}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.content}>
        {/* Animated Icon */}
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.iconOuter}>
            <View style={styles.iconInner}>
              <Ionicons name="hourglass-outline" size={56} color={THEME.colors.primary} />
            </View>
          </View>
        </Animated.View>

        {/* Title */}
        <Text style={styles.title}>Application Under Review</Text>
        <Text style={styles.subtitle}>
          Your documents are being verified by our team.{'\n'}We'll notify you once your account is approved.
        </Text>

        {/* Time Estimate */}
        <BlurView intensity={20} tint="dark" style={styles.timeBadge}>
          <Ionicons name="time-outline" size={18} color="#FFD60A" />
          <Text style={styles.timeText}>Usually takes 2–3 hours (max 12 hours)</Text>
        </BlurView>

        {/* What's Next Steps */}
        <BlurView intensity={15} tint="dark" style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>What happens next?</Text>
          
          <View style={styles.stepRow}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>1</Text></View>
            <Text style={styles.stepText}>Our team verifies your documents</Text>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>2</Text></View>
            <Text style={styles.stepText}>You'll receive an SMS & notification</Text>
          </View>
          <View style={styles.stepRow}>
            <View style={[styles.stepNum, { backgroundColor: 'rgba(0, 255, 151, 0.15)' }]}>
              <Text style={[styles.stepNumText, { color: '#00FF97' }]}>3</Text>
            </View>
            <Text style={styles.stepText}>Start accepting jobs & earning!</Text>
          </View>
        </BlurView>

        {/* Contact Support */}
        <TouchableOpacity style={styles.supportBtn} activeOpacity={0.8}>
          <BlurView intensity={20} tint="dark" style={styles.supportBtnInner}>
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={THEME.colors.primary} />
            <Text style={styles.supportBtnText}>Contact Support</Text>
          </BlurView>
        </TouchableOpacity>

        {/* Login Link */}
        <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={styles.loginLink}>
          <Text style={styles.loginLinkText}>
            Already Approved? <Text style={{ color: '#00FF97', fontFamily: 'Outfit_700Bold' }}>Login</Text>
          </Text>
        </TouchableOpacity>

        {/* DEV MODE: Continue Button */}
        <TouchableOpacity
          style={styles.devBtnTouch}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#FF6B35', '#FF4500']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.devBtn}
          >
            <Ionicons name="code-slash" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.devBtnText}>Continue (Dev Mode)</Text>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  iconContainer: {
    marginBottom: 28,
  },
  iconOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 207, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(0, 207, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.65)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 214, 10, 0.25)',
    backgroundColor: 'rgba(255, 214, 10, 0.08)',
    gap: 8,
    marginBottom: 24,
    overflow: 'hidden',
  },
  timeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#FFD60A',
  },
  stepsCard: {
    width: '100%',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(13, 20, 32, 0.5)',
    marginBottom: 20,
    overflow: 'hidden',
  },
  stepsTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 15,
    color: '#fff',
    marginBottom: 14,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 207, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 13,
    color: THEME.colors.primary,
  },
  stepText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    flex: 1,
  },
  supportBtn: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
  },
  supportBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.25)',
    backgroundColor: 'rgba(0, 207, 255, 0.06)',
    gap: 8,
    overflow: 'hidden',
  },
  supportBtnText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 14,
    color: THEME.colors.primary,
  },
  loginLink: {
    marginBottom: 20,
  },
  loginLinkText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  devBtnTouch: {
    width: '100%',
    borderRadius: 100,
    overflow: 'hidden',
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  devBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  devBtnText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 15,
    color: '#fff',
  },
});

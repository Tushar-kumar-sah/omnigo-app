import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { THEME } from '../../constants/theme';
import { BlurView } from 'expo-blur';

export default function UnderReviewScreen() {
  const router = useRouter();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Animated.View 
            style={[
              styles.iconContainer,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <Ionicons name="hourglass-outline" size={80} color={THEME.colors.primary} />
          </Animated.View>
          
          <Text style={styles.title}>Application Under Review</Text>
          
          <Text style={styles.subtitle}>
            Your documents are being verified by our team. We'll notify you once your account is approved.
          </Text>

          <BlurView intensity={20} tint="dark" style={styles.badge}>
            <Ionicons name="time-outline" size={20} color={THEME.colors.warning} />
            <Text style={styles.badgeText}>Usually takes 24-48 hours</Text>
          </BlurView>

          <TouchableOpacity style={styles.contactButton} activeOpacity={0.7}>
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.loginLink} 
          onPress={() => router.replace('/(auth)/login')}
          activeOpacity={0.7}
        >
          <Text style={styles.loginText}>
            Already Approved? <Text style={styles.loginTextHighlight}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: THEME.spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(0, 207, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: THEME.spacing.xxl,
    borderWidth: 2,
    borderColor: 'rgba(0, 207, 255, 0.2)',
  },
  title: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 28,
    color: THEME.colors.text,
    textAlign: 'center',
    marginBottom: THEME.spacing.md,
  },
  subtitle: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 16,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginBottom: THEME.spacing.xl,
    lineHeight: 24,
    paddingHorizontal: THEME.spacing.lg,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 184, 0, 0.1)', // warning tint
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.3)',
    marginBottom: THEME.spacing.xxl,
    overflow: 'hidden',
  },
  badgeText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 14,
    color: THEME.colors.warning,
    marginLeft: THEME.spacing.sm,
  },
  contactButton: {
    paddingVertical: 14,
    paddingHorizontal: THEME.spacing.xl,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: THEME.colors.primary,
    backgroundColor: 'rgba(0, 207, 255, 0.05)',
  },
  contactButtonText: {
    fontFamily: THEME.fonts.inter.bold,
    fontSize: 16,
    color: THEME.colors.primary,
  },
  loginLink: {
    paddingVertical: THEME.spacing.lg,
    alignItems: 'center',
  },
  loginText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 15,
    color: THEME.colors.textSecondary,
  },
  loginTextHighlight: {
    color: THEME.colors.primary,
    fontFamily: THEME.fonts.inter.bold,
  },
});

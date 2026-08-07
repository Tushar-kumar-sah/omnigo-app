/**
 * GlassCard — Glassmorphic container matching OmniGo futuristic design
 * Used across all screens for cards, panels, and overlays
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, borderRadius, spacing, shadows } from './theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  glowColor?: 'cyan' | 'green' | 'none';
  noBorder?: boolean;
  padding?: number;
}

export function GlassCard({
  children,
  style,
  intensity = 50,
  glowColor = 'none',
  noBorder = false,
  padding = spacing.xl,
}: GlassCardProps) {
  const glowShadow = glowColor === 'cyan'
    ? shadows.glowCyan
    : glowColor === 'green'
      ? shadows.glowGreen
      : shadows.cardShadow;

  const borderColor = glowColor === 'cyan'
    ? colors.glassBorderBright
    : glowColor === 'green'
      ? 'rgba(0, 255, 151, 0.25)'
      : colors.glassBorder;

  return (
    <View
      style={[
        styles.container,
        glowShadow,
        !noBorder && { borderWidth: 1, borderColor },
        style,
      ]}
    >
      <BlurView
        intensity={intensity}
        tint="dark"
        style={[styles.blur, { padding }]}
      >
        {children}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    backgroundColor: colors.glassBg,
  },
  blur: {
    flex: 1,
  },
});

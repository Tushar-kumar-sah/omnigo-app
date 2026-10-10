/**
 * GlassCard — cross-platform glass-morphism card component.
 * On iOS: uses real BlurView for glass effect.
 * On Android: uses solid dark opaque View (BlurView doesn't work on Android).
 */
import React from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassCardProps {
  style?: ViewStyle | ViewStyle[];
  children: React.ReactNode;
  intensity?: number;
  /** Override Android background color */
  androidBg?: string;
}

export default function GlassCard({
  style,
  children,
  intensity = 40,
  androidBg = 'rgba(13, 20, 40, 0.95)',
}: GlassCardProps) {
  if (Platform.OS === 'ios') {
    return (
      <BlurView intensity={intensity} tint="dark" style={style}>
        {children}
      </BlurView>
    );
  }

  return (
    <View style={[style, { backgroundColor: androidBg }]}>
      {children}
    </View>
  );
}

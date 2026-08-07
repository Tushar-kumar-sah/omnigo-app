/**
 * GlowButton — Neon-glowing CTA button (cyan or green variant)
 * Matches the ACCEPT / NEXT / Confirm buttons from reference images
 */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, shadows, typography } from './theme';

interface GlowButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'cyan' | 'green' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export function GlowButton({
  title,
  onPress,
  variant = 'cyan',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  icon,
}: GlowButtonProps) {
  const gradientColors = {
    cyan: [colors.accentCyan, '#0088CC'] as [string, string],
    green: [colors.accentGreen, '#00CC77'] as [string, string],
    danger: [colors.danger, '#CC0000'] as [string, string],
    outline: ['transparent', 'transparent'] as [string, string],
  };

  const glowStyle = {
    cyan: shadows.glowCyan,
    green: shadows.glowGreen,
    danger: shadows.glowDanger,
    outline: {},
  };

  const sizeStyle = {
    sm: { paddingVertical: 10, paddingHorizontal: 20 },
    md: { paddingVertical: 14, paddingHorizontal: 28 },
    lg: { paddingVertical: 18, paddingHorizontal: 36 },
  };

  const textSize = {
    sm: 13,
    md: 16,
    lg: 18,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.container,
        glowStyle[variant],
        disabled && styles.disabled,
        style,
      ]}
    >
      <LinearGradient
        colors={gradientColors[variant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.gradient,
          sizeStyle[size],
          variant === 'outline' && styles.outlineBorder,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={colors.textPrimary} size="small" />
        ) : (
          <>
            {icon}
            <Text
              style={[
                styles.text,
                { fontSize: textSize[size] },
                variant === 'outline' && { color: colors.accentCyan },
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    gap: 8,
  },
  outlineBorder: {
    borderWidth: 1,
    borderColor: colors.accentCyan,
    borderRadius: borderRadius.lg,
  },
  text: {
    ...typography.button,
    textAlign: 'center',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  disabled: {
    opacity: 0.5,
  },
});

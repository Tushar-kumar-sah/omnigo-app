/**
 * StatusBadge — Colored status pills for booking states
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { borderRadius, spacing } from './theme';

interface StatusBadgeProps {
  label: string;
  color: string;
  bgColor: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ label, color, bgColor, size = 'sm' }: StatusBadgeProps) {
  return (
    <View style={[
      styles.badge,
      { backgroundColor: bgColor },
      size === 'md' && styles.badgeMd,
    ]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[
        styles.text,
        { color },
        size === 'md' && styles.textMd,
      ]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 6,
  },
  badgeMd: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  textMd: {
    fontSize: 13,
  },
});

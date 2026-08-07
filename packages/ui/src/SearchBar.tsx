/**
 * SearchBar — Glowing search input matching the reference images
 * Cyan border glow, dark glass background
 */
import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, shadows } from './theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onPress?: () => void;
  editable?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search',
  onFocus,
  onPress,
  editable = true,
}: SearchBarProps) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      style={[styles.container, shadows.glowCyan]}
      activeOpacity={0.8}
    >
      <Ionicons name="search" size={18} color={colors.accentCyan} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        onFocus={onFocus}
        editable={editable}
        pointerEvents={onPress ? 'none' : 'auto'}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassBg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.glassBorderBright,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: colors.textPrimary,
  },
});

import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { THEME } from '../../constants/theme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={THEME.colors.text} />
      </TouchableOpacity>
      
      <Text style={styles.title}>Join OmniGo</Text>
      <Text style={styles.subtitle}>Register as a Driver Partner</Text>

      <BlurView intensity={20} tint="dark" style={styles.card}>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color={THEME.colors.textSecondary} style={styles.inputIcon} />
          <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor={THEME.colors.textSecondary} />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="call-outline" size={20} color={THEME.colors.textSecondary} style={styles.inputIcon} />
          <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor={THEME.colors.textSecondary} keyboardType="phone-pad" />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="car-outline" size={20} color={THEME.colors.textSecondary} style={styles.inputIcon} />
          <TextInput style={styles.input} placeholder="Vehicle Type (e.g. Flatbed)" placeholderTextColor={THEME.colors.textSecondary} />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="document-text-outline" size={20} color={THEME.colors.textSecondary} style={styles.inputIcon} />
          <TextInput style={styles.input} placeholder="License Number" placeholderTextColor={THEME.colors.textSecondary} />
        </View>

        <TouchableOpacity style={styles.registerBtn} onPress={() => router.replace('/(tabs)')}>
          <LinearGradient
            colors={[THEME.colors.primary, THEME.colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btnGradient}
          >
            <Text style={styles.btnText}>REGISTER & CONTINUE</Text>
          </LinearGradient>
        </TouchableOpacity>
      </BlurView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  content: {
    padding: 24,
    paddingTop: 64,
  },
  backBtn: {
    marginBottom: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 36,
    color: THEME.colors.text,
  },
  subtitle: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 16,
    color: THEME.colors.textSecondary,
    marginBottom: 32,
    marginTop: 8,
  },
  card: {
    backgroundColor: THEME.colors.glassBg,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    padding: 24,
    overflow: 'hidden',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 16,
    color: THEME.colors.text,
  },
  registerBtn: {
    marginTop: 16,
    borderRadius: THEME.borderRadius.md,
    overflow: 'hidden',
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  btnGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  btnText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 16,
    color: '#000',
    letterSpacing: 1,
  }
});

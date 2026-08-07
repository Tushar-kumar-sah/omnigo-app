import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { THEME } from '../../constants/theme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    // Navigate to tabs for mock
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="car-sport" size={64} color={THEME.colors.primary} />
        <Text style={styles.title}>OmniGo</Text>
        <Text style={styles.subtitle}>Driver Partner</Text>
      </View>
      
      <BlurView intensity={20} tint="dark" style={styles.card}>
        <Text style={styles.cardTitle}>Welcome Back</Text>
        
        <View style={styles.inputContainer}>
          <Ionicons name="call-outline" size={20} color={THEME.colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor={THEME.colors.textSecondary}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
          <LinearGradient
            colors={[THEME.colors.primary, THEME.colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btnGradient}
          >
            <Text style={styles.btnText}>SEND OTP</Text>
            <Ionicons name="arrow-forward" size={20} color="#000" />
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.registerLink} onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.registerText}>Don't have an account? <Text style={styles.registerTextBold}>Register</Text></Text>
        </TouchableOpacity>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 42,
    color: THEME.colors.text,
    marginTop: 16,
  },
  subtitle: {
    fontFamily: THEME.fonts.outfit.medium,
    fontSize: 20,
    color: THEME.colors.primary,
    letterSpacing: 2,
  },
  card: {
    backgroundColor: THEME.colors.glassBg,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    padding: 24,
    overflow: 'hidden',
  },
  cardTitle: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 24,
    color: THEME.colors.text,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 24,
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
  loginBtn: {
    borderRadius: THEME.borderRadius.md,
    overflow: 'hidden',
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  btnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    paddingHorizontal: 24,
  },
  btnText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 16,
    color: '#000',
    marginRight: 8,
    letterSpacing: 1,
  },
  registerLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  registerText: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 14,
    color: THEME.colors.textSecondary,
  },
  registerTextBold: {
    color: THEME.colors.primary,
    fontFamily: THEME.fonts.inter.bold,
  }
});

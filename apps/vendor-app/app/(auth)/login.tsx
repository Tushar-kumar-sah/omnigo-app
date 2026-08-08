import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { THEME } from '../../constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  const handleSendOtp = () => {
    router.push('/(auth)/otp-verify');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="car-sport" size={60} color={THEME.colors.primary} />
          </View>
          <Text style={styles.title}>OmniGo</Text>
          <Text style={styles.subtitle}>Driver Partner</Text>
        </View>

        <BlurView intensity={20} tint="dark" style={styles.glassCard}>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setLoginMethod('phone')}
              activeOpacity={0.8}
            >
              {loginMethod === 'phone' && (
                <LinearGradient
                  colors={[THEME.colors.primary, THEME.colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFillObject}
                />
              )}
              <Text style={[styles.toggleText, loginMethod === 'phone' && styles.toggleTextActive]}>
                Phone
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setLoginMethod('email')}
              activeOpacity={0.8}
            >
              {loginMethod === 'email' && (
                <LinearGradient
                  colors={[THEME.colors.primary, THEME.colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFillObject}
                />
              )}
              <Text style={[styles.toggleText, loginMethod === 'email' && styles.toggleTextActive]}>
                Email
              </Text>
            </TouchableOpacity>
          </View>

          {loginMethod === 'phone' ? (
            <View style={styles.inputContainer}>
              <View style={styles.prefixContainer}>
                <Text style={styles.prefixText}>+91</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                placeholderTextColor={THEME.colors.textSecondary}
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                maxLength={10}
              />
            </View>
          ) : (
            <View style={styles.inputContainer}>
              <View style={styles.prefixContainer}>
                <Ionicons name="mail" size={20} color={THEME.colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter email address"
                placeholderTextColor={THEME.colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          )}

          <TouchableOpacity activeOpacity={0.8} style={styles.buttonContainer} onPress={handleSendOtp}>
            <LinearGradient
              colors={[THEME.colors.primary, THEME.colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>SEND OTP</Text>
              <Ionicons name="arrow-forward" size={20} color="#050810" />
            </LinearGradient>
          </TouchableOpacity>
        </BlurView>

        <TouchableOpacity 
          style={styles.registerLink} 
          onPress={() => router.push('/(auth)/register')}
          activeOpacity={0.8}
        >
          <Text style={styles.registerText}>
            Don't have an account? <Text style={styles.registerTextHighlight}>Register</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: THEME.spacing.lg,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: THEME.spacing.xxl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 207, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.3)',
  },
  title: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 36,
    color: THEME.colors.text,
    marginBottom: THEME.spacing.xs,
  },
  subtitle: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 18,
    color: THEME.colors.primary,
    letterSpacing: 2,
  },
  glassCard: {
    backgroundColor: THEME.colors.glassBg,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    overflow: 'hidden',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(13, 20, 32, 0.8)',
    borderRadius: THEME.borderRadius.full,
    marginBottom: THEME.spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: THEME.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  toggleText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 16,
    color: THEME.colors.textSecondary,
    zIndex: 1,
  },
  toggleTextActive: {
    color: '#050810',
    fontFamily: THEME.fonts.inter.bold,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 8, 16, 0.5)',
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.2)',
    marginBottom: THEME.spacing.lg,
    overflow: 'hidden',
  },
  prefixContainer: {
    paddingHorizontal: THEME.spacing.md,
    borderRightWidth: 1,
    borderRightColor: 'rgba(0, 207, 255, 0.2)',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 207, 255, 0.05)',
  },
  prefixText: {
    fontFamily: THEME.fonts.inter.bold,
    fontSize: 16,
    color: THEME.colors.primary,
  },
  input: {
    flex: 1,
    height: 56,
    paddingHorizontal: THEME.spacing.md,
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 16,
    color: THEME.colors.text,
  },
  buttonContainer: {
    marginTop: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.md,
    overflow: 'hidden',
  },
  button: {
    flexDirection: 'row',
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 16,
    color: '#050810',
    marginRight: THEME.spacing.sm,
  },
  registerLink: {
    marginTop: THEME.spacing.xl,
    alignItems: 'center',
  },
  registerText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 15,
    color: THEME.colors.textSecondary,
  },
  registerTextHighlight: {
    color: THEME.colors.primary,
    fontFamily: THEME.fonts.inter.bold,
  },
});

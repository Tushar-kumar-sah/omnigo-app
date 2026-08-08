import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  SafeAreaView
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { THEME } from '../../constants/theme';

export default function OtpVerifyScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    // In a real app, verify OTP against backend here
    router.replace('/(tabs)');
  };

  const handleResend = () => {
    setCountdown(30);
    // Add resend logic here
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={THEME.colors.text} />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>Verify Phone</Text>
          <Text style={styles.subtitle}>
            Code sent to <Text style={styles.highlight}>+91 98***43210</Text>
          </Text>

          <BlurView intensity={20} tint="dark" style={styles.glassCard}>
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => { inputRefs.current[index] = ref; }}
                  style={[
                    styles.otpInput,
                    digit ? styles.otpInputActive : null
                  ]}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(val) => handleOtpChange(val, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  selectTextOnFocus
                />
              ))}
            </View>

            <View style={styles.resendContainer}>
              {countdown > 0 ? (
                <Text style={styles.resendText}>
                  Resend code in <Text style={styles.countdownText}>00:{countdown.toString().padStart(2, '0')}</Text>
                </Text>
              ) : (
                <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                  <Text style={styles.resendActionText}>Resend OTP</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity 
              activeOpacity={0.8} 
              style={styles.buttonContainer} 
              onPress={handleVerify}
            >
              <LinearGradient
                colors={[THEME.colors.primary, THEME.colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>VERIFY</Text>
                <Ionicons name="checkmark-circle" size={20} color="#050810" />
              </LinearGradient>
            </TouchableOpacity>
          </BlurView>
        </View>
      </KeyboardAvoidingView>
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
  },
  backButton: {
    padding: THEME.spacing.lg,
    paddingTop: Platform.OS === 'android' ? 40 : THEME.spacing.lg,
  },
  content: {
    flex: 1,
    padding: THEME.spacing.lg,
    justifyContent: 'center',
    paddingBottom: 100, // offset slightly to center better visually
  },
  title: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 32,
    color: THEME.colors.text,
    marginBottom: THEME.spacing.xs,
  },
  subtitle: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 16,
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.xl,
  },
  highlight: {
    color: THEME.colors.primary,
    fontFamily: THEME.fonts.inter.medium,
  },
  glassCard: {
    backgroundColor: THEME.colors.glassBg,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    overflow: 'hidden',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.xl,
  },
  otpInput: {
    width: 48,
    height: 56,
    backgroundColor: 'rgba(5, 8, 16, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: THEME.borderRadius.md,
    color: THEME.colors.primary,
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 24,
    textAlign: 'center',
  },
  otpInputActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: 'rgba(0, 207, 255, 0.05)',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
  },
  resendText: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 14,
    color: THEME.colors.textSecondary,
  },
  countdownText: {
    color: THEME.colors.warning,
    fontFamily: THEME.fonts.inter.bold,
  },
  resendActionText: {
    fontFamily: THEME.fonts.inter.bold,
    fontSize: 14,
    color: THEME.colors.primary,
  },
  buttonContainer: {
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
});

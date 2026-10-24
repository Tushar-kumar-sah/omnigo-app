import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  SafeAreaView, 
  Keyboard, 
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { THEME } from '@/constants/theme';
import { verifyDriverPhoneOtp, sendDriverPhoneOtp } from '@/lib/auth';

export default function OtpVerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    phone?: string;
    code?: string;
    fullName?: string;
    flow?: 'login' | 'register';
  }>();

  const phone = params.phone || '+919876543210';
  const initialCode = params.code || '123456';
  const fullName = params.fullName || '';
  const flow = params.flow || 'login';

  const [activeCode, setActiveCode] = useState(initialCode);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(30);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleOtpChange = (value: string, index: number) => {
    setErrorMsg(null);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Dismiss keyboard once all 6 digits entered
    if (newOtp.filter(Boolean).length === 6) {
      inputRefs.current[index]?.blur();
      Keyboard.dismiss();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const autoFillOtp = () => {
    const digits = (activeCode || '123456').slice(0, 6).split('');
    while (digits.length < 6) digits.push('0');
    setOtp(digits);
    setErrorMsg(null);
  };

  const handleVerify = async () => {
    Keyboard.dismiss();
    const enteredOtp = otp.join('').trim();
    if (enteredOtp.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const { driver, isNew, error } = await verifyDriverPhoneOtp({
      phone,
      otp: enteredOtp,
      fullName,
      flow,
    });

    setLoading(false);

    if (error || !driver) {
      setErrorMsg(error || 'Invalid OTP code. Please try again.');
      return;
    }

    if (flow === 'register' || isNew) {
      router.push('/(auth)/driver-verification');
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleResend = async () => {
    setErrorMsg(null);
    setCountdown(30);
    const res = await sendDriverPhoneOtp(phone);
    if (res.code) {
      setActiveCode(res.code);
    }
    if (res.error) {
      setErrorMsg(res.error);
    }
  };

  const maskedPhone = phone.length >= 10
    ? `${phone.slice(0, 5)} **** ${phone.slice(-3)}`
    : phone;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
              Code sent to <Text style={styles.highlight}>{maskedPhone}</Text>
            </Text>

            {/* Test Helper Banner */}
            {activeCode ? (
              <TouchableOpacity style={styles.demoBanner} onPress={autoFillOtp} activeOpacity={0.8}>
                <Ionicons name="key-outline" size={15} color="#00CFFF" style={{ marginRight: 6 }} />
                <Text style={styles.demoBannerText}>
                  Your OTP: <Text style={styles.demoCode}>{activeCode}</Text> (Tap to auto-fill)
                </Text>
              </TouchableOpacity>
            ) : null}

            {/* Error Banner */}
            {errorMsg ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color="#FF453A" style={{ marginRight: 6 }} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            <View style={[styles.glassCard, { backgroundColor: Platform.OS === 'android' ? '#0d1a30' : 'rgba(13, 28, 60, 0.55)' }]}>
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => { inputRefs.current[index] = ref; }}
                    style={[
                      styles.otpInput,
                      digit ? styles.otpInputActive : null,
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
                disabled={loading}
              >
                <LinearGradient
                  colors={[THEME.colors.primary, THEME.colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.button}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#050810" />
                  ) : (
                    <>
                      <Text style={styles.buttonText}>VERIFY & CONTINUE</Text>
                      <Ionicons name="checkmark-circle" size={20} color="#050810" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050810',
  },
  container: {
    flex: 1,
  },
  backButton: {
    padding: 16,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    marginTop: -40,
  },
  title: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 32,
    color: '#00FF97',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 16,
  },
  highlight: {
    color: '#FFFFFF',
    fontFamily: 'Outfit_600SemiBold',
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 207, 255, 0.12)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.35)',
    marginBottom: 16,
    alignSelf: 'center',
  },
  demoBannerText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#00CFFF',
  },
  demoCode: {
    fontFamily: 'Outfit_700Bold',
    letterSpacing: 1.5,
    color: '#FFFFFF',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 69, 58, 0.15)',
    borderColor: '#FF453A',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#FF8A80',
    flex: 1,
  },
  glassCard: {
    borderRadius: 24,
    padding: 24,
    backgroundColor: 'rgba(13, 20, 32, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  otpInput: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(5, 8, 16, 0.6)',
    color: '#FFFFFF',
    fontFamily: 'Outfit_700Bold',
    fontSize: 22,
    textAlign: 'center',
  },
  otpInputActive: {
    borderColor: '#00FF97',
    backgroundColor: 'rgba(0, 255, 151, 0.08)',
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#00FF97',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    } : {
      elevation: 0,
    }),
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resendText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  countdownText: {
    color: '#00FF97',
    fontFamily: 'Outfit_600SemiBold',
  },
  resendActionText: {
    color: '#00FF97',
    fontFamily: 'Outfit_700Bold',
    fontSize: 14,
  },
  buttonContainer: {
    borderRadius: 100,
    overflow: 'hidden',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  buttonText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 15,
    color: '#050810',
    letterSpacing: 1,
  },
});

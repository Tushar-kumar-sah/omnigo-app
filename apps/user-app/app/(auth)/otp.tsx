import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { verifyPhoneOtp, sendPhoneOtp } from '@/lib/api';

export default function OTPScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    phone?: string;
    fullName?: string;
    password?: string;
    code?: string;
    flow?: 'login' | 'register';
  }>();

  const phone = params.phone || '+919876543210';
  const [otp, setOtp] = useState('');
  const [liveCode, setLiveCode] = useState(params.code || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [timer, setTimer] = useState(30);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (params.code) {
      setLiveCode(String(params.code));
    }
  }, [params.code]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async (codeOverride?: string) => {
    const finalOtp = (codeOverride ?? otp).trim();
    if (finalOtp.length !== 4) {
      setErrorMsg('Please enter the 4-digit verification code.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);
    const { user, error } = await verifyPhoneOtp({
      phone,
      otp: finalOtp,
      fullName: params.fullName,
      password: params.password,
      flow: (params.flow as any) || 'login',
    });
    setLoading(false);

    if (error || !user) {
      setErrorMsg(error || 'Invalid OTP code. Please try again.');
      return;
    }

    router.replace('/(tabs)');
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setErrorMsg(null);
    const res = await sendPhoneOtp(phone);
    if (res.error) {
      setErrorMsg(res.error);
      return;
    }
    setLiveCode(res.code);
    setOtp('');
    setTimer(30);
  };

  const handleAutoFill = () => {
    if (!liveCode) return;
    setOtp(liveCode);
    setErrorMsg(null);
  };

  const digits = [otp[0] || '', otp[1] || '', otp[2] || '', otp[3] || ''];

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('@/assets/auth_bg.jpg')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(5, 8, 16, 0.45)', 'rgba(5, 8, 16, 0.72)', 'rgba(5, 8, 16, 0.92)']}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[
          styles.content,
          { paddingTop: Math.max(insets.top + 16, 48), paddingBottom: Math.max(insets.bottom + 24, 36) },
        ]}
      >
        {/* Top Row: Back Button + Live OTP Notification */}
        <View style={styles.topNavRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          {liveCode ? (
            <TouchableOpacity style={styles.smsBanner} onPress={handleAutoFill} activeOpacity={0.85}>
              <Ionicons name="chatbubble-ellipses" size={16} color="#00FF97" />
              <Text style={styles.smsBannerText}>
                OTP Code: <Text style={styles.smsCodeHighlight}>{liveCode}</Text> (Tap to Fill)
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.centerBlock}>
          {/* Top Badge */}
          <View style={styles.badge}>
            <Ionicons name="shield-checkmark" size={13} color="#00CFFF" style={{ marginRight: 6 }} />
            <Text style={styles.badgeText}>PHONE VERIFICATION</Text>
          </View>

          <Text style={styles.title}>Enter OTP</Text>
          <Text style={styles.subtitle}>
            We've sent a 4-digit verification code to{'\n'}
            <Text style={styles.phoneHighlight}>{phone}</Text>
          </Text>

          {errorMsg ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color="#FF453A" style={{ marginRight: 8 }} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* 4-Digit OTP Boxes */}
          <TouchableOpacity
            activeOpacity={1}
            style={styles.otpBoxesRow}
            onPress={() => inputRef.current?.focus()}
          >
            {digits.map((digit, idx) => {
              const isFocused = otp.length === idx || (otp.length === 4 && idx === 3);
              return (
                <View
                  key={idx}
                  style={[
                    styles.otpBox,
                    digit ? styles.otpBoxFilled : null,
                    isFocused ? styles.otpBoxFocused : null,
                  ]}
                >
                  <Text style={styles.otpDigitText}>{digit || '•'}</Text>
                </View>
              );
            })}
          </TouchableOpacity>

          {/* Hidden TextInput driving the 4 boxes */}
          <TextInput
            ref={inputRef}
            value={otp}
            onChangeText={(val) => {
              const clean = val.replace(/\D/g, '').slice(0, 4);
              setOtp(clean);
              if (errorMsg) setErrorMsg(null);
            }}
            keyboardType="number-pad"
            maxLength={4}
            autoFocus
            style={styles.hiddenInput}
          />

          {/* Verify Button */}
          <TouchableOpacity
            style={styles.verifyBtnTouch}
            onPress={() => handleVerify()}
            disabled={loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#00FF97', '#00CC7A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.verifyBtn}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#050810" />
              ) : (
                <>
                  <Text style={styles.verifyBtnText}>Verify & Continue</Text>
                  <Ionicons name="checkmark-circle" size={18} color="#050810" style={{ marginLeft: 8 }} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Resend Row */}
          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>Didn't receive the code? </Text>
            {timer > 0 ? (
              <Text style={styles.resendTimer}>Resend in {timer}s</Text>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendLink}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050810',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(13, 24, 48, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smsBanner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 151, 0.14)',
    borderWidth: 1,
    borderColor: '#00FF97',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
    gap: 8,
  },
  smsBannerText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#FFFFFF',
  },
  smsCodeHighlight: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 14,
    color: '#00FF97',
    letterSpacing: 1,
  },
  centerBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 207, 255, 0.14)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.35)',
    marginBottom: 16,
  },
  badgeText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 10,
    color: '#00CFFF',
    letterSpacing: 1.5,
  },
  title: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 34,
    color: '#00FF97',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 28,
  },
  phoneHighlight: {
    fontFamily: 'Outfit_700Bold',
    color: '#00CFFF',
  },
  errorBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 69, 58, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.45)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 18,
  },
  errorText: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#FF453A',
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginBottom: 28,
  },
  otpBox: {
    width: 62,
    height: 68,
    borderRadius: 18,
    backgroundColor: 'rgba(13, 24, 48, 0.82)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxFilled: {
    borderColor: '#00FF97',
    backgroundColor: 'rgba(0, 255, 151, 0.12)',
  },
  otpBoxFocused: {
    borderColor: '#00CFFF',
  },
  otpDigitText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 26,
    color: '#FFFFFF',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  verifyBtnTouch: {
    width: '100%',
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    shadowColor: '#00FF97',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 20,
  },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  verifyBtnText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    color: '#050810',
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  resendTimer: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  resendLink: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 14,
    color: '#00FF97',
  },
});

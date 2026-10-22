import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '@/constants/theme';
import GoogleAuthModal from '@/components/GoogleAuthModal';
import {
  registerDriverWithCredentials,
  sendDriverPhoneOtp,
} from '@/lib/auth';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('phone');
  const [fullName, setFullName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [googleModalVisible, setGoogleModalVisible] = useState(false);

  const handleSignUp = async () => {
    setErrorMsg(null);

    if (!fullName || fullName.trim().length < 2) {
      setErrorMsg('Please enter your full legal name.');
      return;
    }
    if (!emailOrPhone || !emailOrPhone.trim()) {
      setErrorMsg(activeTab === 'email' ? 'Please enter your email.' : 'Please enter your phone number.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (activeTab === 'phone') {
      setLoading(true);
      const res = await sendDriverPhoneOtp(emailOrPhone);
      setLoading(false);

      if (res.error) {
        setErrorMsg(res.error);
        return;
      }

      router.push({
        pathname: '/(auth)/otp-verify',
        params: {
          phone: res.formattedPhone,
          code: res.code,
          fullName: fullName.trim(),
          flow: 'register',
        },
      });
      return;
    }

    // Email registration
    setLoading(true);
    const { driver, error } = await registerDriverWithCredentials({
      fullName: fullName.trim(),
      identifier: emailOrPhone.trim(),
      password,
      mode: 'email',
    });
    setLoading(false);

    if (error || !driver) {
      setErrorMsg(error || 'Failed to register account. Please try again.');
      return;
    }

    router.push('/(auth)/driver-verification');
  };

  const handleGoogleSuccess = (driver: any, isNew: boolean) => {
    setGoogleModalVisible(false);
    if (isNew) {
      router.push('/(auth)/driver-verification');
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(5, 8, 16, 0.35)', 'rgba(5, 8, 16, 0.55)', 'rgba(5, 8, 16, 0.85)']}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: Math.max(insets.top + 20, 50), paddingBottom: Math.max(insets.bottom + 20, 40) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Badge */}
          <View style={styles.topBadgeContainer}>
            <BlurView intensity={20} tint="dark" style={styles.topBadge}>
              <Ionicons name="car-sport" size={12} color={THEME.colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.topBadgeText}>BECOME A DRIVER PARTNER</Text>
            </BlurView>
          </View>

          {/* Title & Subtitle */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Register for driver & towing services</Text>
          </View>

          {/* Error Banner */}
          {errorMsg ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color="#FF453A" style={{ marginRight: 8 }} />
              <Text style={styles.errorBannerText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Social SSO Button (Google Only) */}
          <View style={styles.socialRow}>
            <TouchableOpacity
              style={styles.ssoBtn}
              onPress={() => {
                setErrorMsg(null);
                setGoogleModalVisible(true);
              }}
              activeOpacity={0.8}
            >
              <Image
                source={require('@/assets/google_logo.png')}
                style={{ width: 20, height: 20, marginRight: 10 }}
                resizeMode="contain"
              />
              <Text style={styles.ssoBtnText}>Continue with Google</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email / Phone Toggle Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'phone' && styles.activeTab]}
              onPress={() => {
                setActiveTab('phone');
                setErrorMsg(null);
              }}
              activeOpacity={0.8}
            >
              {activeTab === 'phone' ? (
                <LinearGradient
                  colors={['#00FF97', '#00CC7A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.activeTabGradient}
                >
                  <Ionicons name="call-outline" size={16} color="#000" style={{ marginRight: 6 }} />
                  <Text style={styles.activeTabText}>Phone</Text>
                </LinearGradient>
              ) : (
                <View style={styles.inactiveTabInner}>
                  <Ionicons name="call-outline" size={16} color={THEME.colors.textSecondary} style={{ marginRight: 6 }} />
                  <Text style={styles.inactiveTabText}>Phone</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'email' && styles.activeTab]}
              onPress={() => {
                setActiveTab('email');
                setErrorMsg(null);
              }}
              activeOpacity={0.8}
            >
              {activeTab === 'email' ? (
                <LinearGradient
                  colors={['#00FF97', '#00CC7A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.activeTabGradient}
                >
                  <Ionicons name="mail-outline" size={16} color="#000" style={{ marginRight: 6 }} />
                  <Text style={styles.activeTabText}>Email</Text>
                </LinearGradient>
              ) : (
                <View style={styles.inactiveTabInner}>
                  <Ionicons name="mail-outline" size={16} color={THEME.colors.textSecondary} style={{ marginRight: 6 }} />
                  <Text style={styles.inactiveTabText}>Email</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Form Input Fields */}
          <View style={styles.formContainer}>
            {/* Full Name */}
            <BlurView intensity={30} tint="dark" style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color={THEME.colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter full legal name"
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </BlurView>

            {/* Email or Phone */}
            <BlurView intensity={30} tint="dark" style={styles.inputWrapper}>
              <Ionicons
                name={activeTab === 'email' ? 'mail-outline' : 'call-outline'}
                size={18}
                color={THEME.colors.primary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder={activeTab === 'email' ? 'Enter driver email' : 'Enter 10-digit mobile number'}
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                keyboardType={activeTab === 'email' ? 'email-address' : 'phone-pad'}
                autoCapitalize="none"
                value={emailOrPhone}
                onChangeText={setEmailOrPhone}
              />
            </BlurView>

            {/* Password */}
            <BlurView intensity={30} tint="dark" style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color={THEME.colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Create a strong password"
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="rgba(255, 255, 255, 0.6)" />
              </TouchableOpacity>
            </BlurView>
          </View>

          {/* Create Account Button */}
          <TouchableOpacity
            style={styles.signInBtnTouch}
            onPress={handleSignUp}
            disabled={loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#00FF97', '#00CC7A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.signInBtn}
            >
              {loading ? (
                <ActivityIndicator color="#000000" size="small" />
              ) : (
                <>
                  <Text style={styles.signInBtnText}>
                    {activeTab === 'phone' ? 'Verify with Phone OTP' : 'Create Account'}
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color="#000" style={{ marginLeft: 6 }} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.createAccountText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Google Auth Modal */}
      <GoogleAuthModal
        visible={googleModalVisible}
        onClose={() => setGoogleModalVisible(false)}
        onSuccess={handleGoogleSuccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050810',
  },
  scrollContent: {
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  topBadgeContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  topBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 207, 255, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.3)',
    overflow: 'hidden',
  },
  topBadgeText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 10,
    color: THEME.colors.primary,
    letterSpacing: 1.5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 34,
    color: '#00FF97',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 255, 151, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    marginTop: 6,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 69, 58, 0.16)',
    borderColor: '#FF453A',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#FF8A80',
  },
  socialRow: {
    gap: 10,
    marginBottom: 20,
  },
  ssoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(13, 28, 60, 0.55)',
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    overflow: 'hidden',
  },
  ssoBtnText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dividerText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginHorizontal: 12,
    letterSpacing: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(13, 20, 32, 0.35)',
    borderRadius: 100,
    padding: 4,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  tab: {
    flex: 1,
    borderRadius: 100,
    overflow: 'hidden',
  },
  activeTab: {
    shadowColor: '#00FF97',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  activeTabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 100,
  },
  activeTabText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 14,
    color: '#000000',
  },
  inactiveTabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  inactiveTabText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  formContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 28, 60, 0.55)',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    height: 56,
    overflow: 'hidden',
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  eyeBtn: {
    padding: 6,
  },
  signInBtnTouch: {
    borderRadius: 100,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#00FF97',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  signInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  signInBtnText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    color: '#000000',
    letterSpacing: 0.3,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  createAccountText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 14,
    color: '#00FF97',
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { registerWithCredentials, sendPhoneOtp } from '@/lib/api';
import GoogleAuthModal from '@/components/GoogleAuthModal';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');
  const [fullName, setFullName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [googleModalVisible, setGoogleModalVisible] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSignUp = async () => {
    setErrorMsg(null);
    if (!agreeTerms) {
      setErrorMsg('Please agree to the Terms of Service and Privacy Policy to create an account.');
      return;
    }
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (activeTab === 'phone') {
      setLoading(true);
      const otpRes = await sendPhoneOtp(emailOrPhone);
      setLoading(false);
      if (otpRes.error) {
        setErrorMsg(otpRes.error);
        return;
      }
      router.push({
        pathname: '/(auth)/otp',
        params: {
          phone: otpRes.formattedPhone,
          fullName: fullName.trim(),
          password,
          code: otpRes.code,
          flow: 'register',
        },
      });
      return;
    }

    setLoading(true);
    const { user, error } = await registerWithCredentials({
      fullName,
      identifier: emailOrPhone,
      password,
      mode: activeTab,
    });
    setLoading(false);
    if (error || !user) {
      setErrorMsg(error || 'Unable to create account. Please try again.');
      return;
    }
    router.replace('/(tabs)');
  };

  const handleGoogleSignUp = () => {
    setErrorMsg(null);
    if (!agreeTerms) {
      setErrorMsg('Please agree to the Terms of Service and Privacy Policy to continue with Google.');
      return;
    }
    setGoogleModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* OmniGo Silver Tow Truck Background Image - Highly Visible */}
      <ImageBackground
        source={require('@/assets/auth_bg.jpg')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(5, 8, 16, 0.35)', 'rgba(5, 8, 16, 0.55)', 'rgba(5, 8, 16, 0.85)']}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>

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
          {/* Top Badge: JOIN OMNIGO ECOSYSTEM */}
          <View style={styles.topBadgeContainer}>
            <View style={styles.topBadge}>
              <Ionicons name="sparkles" size={12} color={theme.colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.topBadgeText}>JOIN OMNIGO ECOSYSTEM</Text>
            </View>
          </View>

          {/* Title & Subtitle */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Register for intelligent rescue & towing services</Text>
          </View>

          {/* Social SSO Button (Google Only with Original Multi-Color Logo) */}
          <View style={styles.socialRow}>
            <TouchableOpacity onPress={handleGoogleSignUp} activeOpacity={0.85}>
              <View style={styles.ssoBtn}>
                <Image
                  source={require('@/assets/google_logo.png')}
                  style={styles.googleLogoImg}
                  resizeMode="contain"
                />
                <Text style={styles.ssoBtnText}>Continue with Google</Text>
              </View>
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
              style={[styles.tab, activeTab === 'email' && styles.activeTab]}
              onPress={() => {
                setActiveTab('email');
                setEmailOrPhone('');
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
                  <Ionicons name="mail-outline" size={16} color={theme.colors.textSecondary} style={{ marginRight: 6 }} />
                  <Text style={styles.inactiveTabText}>Email</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'phone' && styles.activeTab]}
              onPress={() => {
                setActiveTab('phone');
                setEmailOrPhone('');
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
                  <Ionicons name="call-outline" size={16} color={theme.colors.textSecondary} style={{ marginRight: 6 }} />
                  <Text style={styles.inactiveTabText}>Phone</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {errorMsg ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color="#FF453A" style={{ marginRight: 8 }} />
              <Text style={styles.errorBannerText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Form Input Fields */}
          <View style={styles.formContainer}>
            {/* Input 1: Enter your full name */}
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color={theme.colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                value={fullName}
                onChangeText={(t) => {
                  setFullName(t);
                  if (errorMsg) setErrorMsg(null);
                }}
              />
            </View>

            {/* Input 2: Enter your email / phone */}
            <View style={styles.inputWrapper}>
              <Ionicons
                name={activeTab === 'email' ? 'mail-outline' : 'call-outline'}
                size={18}
                color={theme.colors.primary}
                style={styles.inputIcon}
              />
              {activeTab === 'phone' && (
                <View style={styles.countryPrefixBadge}>
                  <Text style={styles.countryPrefixText}>+91</Text>
                </View>
              )}
              <TextInput
                style={styles.input}
                placeholder={activeTab === 'email' ? 'Enter your email' : 'Enter 10-digit mobile number'}
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                keyboardType={activeTab === 'email' ? 'email-address' : 'phone-pad'}
                maxLength={activeTab === 'phone' ? 10 : 100}
                autoCapitalize="none"
                value={emailOrPhone}
                onChangeText={(t) => {
                  setEmailOrPhone(activeTab === 'phone' ? t.replace(/\D/g, '') : t);
                  if (errorMsg) setErrorMsg(null);
                }}
              />
            </View>

            {/* Input 3: Enter your password (Email mode only) */}
            {activeTab === 'email' && (
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color={theme.colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password (min 6 chars)"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    if (errorMsg) setErrorMsg(null);
                  }}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="rgba(255, 255, 255, 0.6)" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Terms & Privacy Agreement Checkbox */}
          <View style={styles.termsContainer}>
            <TouchableOpacity
              style={styles.checkboxTouchable}
              onPress={() => {
                setAgreeTerms(!agreeTerms);
                if (errorMsg) setErrorMsg(null);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.checkboxBox, agreeTerms && styles.checkboxBoxChecked]}>
                {agreeTerms && <Ionicons name="checkmark-sharp" size={13} color="#000000" />}
              </View>
              <Text style={styles.termsLabel}>
                I agree to OmniGo's{' '}
                <Text
                  style={styles.termsLink}
                  onPress={(e) => {
                    e.stopPropagation();
                    router.push('/terms');
                  }}
                >
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text
                  style={styles.termsLink}
                  onPress={(e) => {
                    e.stopPropagation();
                    router.push('/privacy');
                  }}
                >
                  Privacy Policy
                </Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Create Account Primary Button */}
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
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <>
                  <Text style={styles.signInBtnText}>
                    {activeTab === 'phone' ? 'Verify Phone & Create Account' : 'Create Account'}
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color="#000" style={{ marginLeft: 6 }} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Footer Link */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.createAccountText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <GoogleAuthModal
        visible={googleModalVisible}
        onClose={() => setGoogleModalVisible(false)}
        onSuccess={() => {
          setGoogleModalVisible(false);
          router.replace('/(tabs)');
        }}
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
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.3)',
    overflow: 'hidden',
  },
  topBadgeText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 10,
    color: theme.colors.primary,
    letterSpacing: 1.5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
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
  socialRow: {
    marginBottom: 20,
  },
  ssoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(13, 24, 48, 0.78)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  googleLogoImg: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  ssoBtnText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 15,
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
    backgroundColor: 'rgba(13, 20, 32, 0.55)',
    borderRadius: theme.borderRadius.full,
    padding: 4,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  tab: {
    flex: 1,
    borderRadius: theme.borderRadius.full,
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
    borderRadius: theme.borderRadius.full,
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
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 69, 58, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.45)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  errorBannerText: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#FF453A',
  },
  formContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 24, 48, 0.75)',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    height: 54,
  },
  inputIcon: {
    marginRight: 10,
  },
  countryPrefixBadge: {
    paddingRight: 10,
    marginRight: 10,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.2)',
  },
  countryPrefixText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 14,
    color: '#00FF97',
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
    borderRadius: theme.borderRadius.full,
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
  termsContainer: {
    marginBottom: 20,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  checkboxTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  checkboxBoxChecked: {
    backgroundColor: '#00FF97',
    borderColor: '#00FF97',
  },
  termsLabel: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255, 255, 255, 0.75)',
    lineHeight: 18,
  },
  termsLink: {
    fontFamily: 'Outfit_700Bold',
    color: '#00FF97',
    textDecorationLine: 'underline',
  },
});

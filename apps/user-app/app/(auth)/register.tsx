import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');
  const [fullName, setFullName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = () => {
    router.replace('/(tabs)');
  };

  const handleGoogleSignUp = () => {
    router.replace('/(tabs)');
  };

  const handleAppleSignUp = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      {/* OmniGo Silver Tow Truck Background Image - Highly Visible */}
      <ImageBackground
        source={require('../../assets/auth_bg.jpg')}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(5, 8, 16, 0.35)', 'rgba(5, 8, 16, 0.55)', 'rgba(5, 8, 16, 0.85)']}
          style={StyleSheet.absoluteFillObject}
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
        >
          {/* Top Badge: JOIN OMNIGO ECOSYSTEM */}
          <View style={styles.topBadgeContainer}>
            <BlurView intensity={20} tint="dark" style={styles.topBadge}>
              <Ionicons name="sparkles" size={12} color={theme.colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.topBadgeText}>JOIN OMNIGO ECOSYSTEM</Text>
            </BlurView>
          </View>

          {/* Title & Subtitle */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Register for intelligent rescue & towing services</Text>
          </View>

          {/* Social SSO Buttons (Google & Apple) */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.ssoBtnTouch} onPress={handleGoogleSignUp} activeOpacity={0.8}>
              <BlurView intensity={25} tint="dark" style={styles.ssoBtn}>
                <Ionicons name="logo-google" size={18} color="#4285F4" style={{ marginRight: 8 }} />
                <Text style={styles.ssoBtnText}>Continue with Google</Text>
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity style={styles.ssoBtnTouch} onPress={handleAppleSignUp} activeOpacity={0.8}>
              <BlurView intensity={25} tint="dark" style={styles.ssoBtn}>
                <Ionicons name="logo-apple" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.ssoBtnText}>Continue with Apple</Text>
              </BlurView>
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
              onPress={() => setActiveTab('email')}
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
              onPress={() => setActiveTab('phone')}
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

          {/* Form Input Fields */}
          <View style={styles.formContainer}>
            {/* Input 1: Enter your full name */}
            <BlurView intensity={30} tint="dark" style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color={theme.colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                value={fullName}
                onChangeText={setFullName}
              />
            </BlurView>

            {/* Input 2: Enter your email / phone */}
            <BlurView intensity={30} tint="dark" style={styles.inputWrapper}>
              <Ionicons
                name={activeTab === 'email' ? 'mail-outline' : 'call-outline'}
                size={18}
                color={theme.colors.primary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder={activeTab === 'email' ? 'Enter your email' : 'Enter your phone number'}
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                keyboardType={activeTab === 'email' ? 'email-address' : 'phone-pad'}
                autoCapitalize="none"
                value={emailOrPhone}
                onChangeText={setEmailOrPhone}
              />
            </BlurView>

            {/* Input 3: Enter your password */}
            <BlurView intensity={30} tint="dark" style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color={theme.colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
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

          {/* Create Account Primary Button */}
          <TouchableOpacity style={styles.signInBtnTouch} onPress={handleSignUp} activeOpacity={0.85}>
            <LinearGradient
              colors={['#00FF97', '#00CC7A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.signInBtn}
            >
              <Text style={styles.signInBtnText}>Create Account</Text>
              <Ionicons name="arrow-forward" size={18} color="#000" style={{ marginLeft: 6 }} />
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
    gap: 10,
    marginBottom: 20,
  },
  ssoBtnTouch: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  ssoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(13, 20, 32, 0.35)',
    paddingVertical: 13,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  ssoBtnText: {
    fontFamily: 'Outfit_600SemiBold',
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
    borderRadius: theme.borderRadius.full,
    padding: 4,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
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
  formContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 20, 32, 0.45)',
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.35)',
    height: 54,
    overflow: 'hidden',
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
});

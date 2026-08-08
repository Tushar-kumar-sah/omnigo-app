import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { THEME } from '../../constants/theme';
import { mockIncomingJob } from '../../constants/mock-data';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function ArrivalVerifyScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    // In mock, any 4-digit is accepted
    if (otp.join('').length === 4) {
      router.push('/job/pre-inspection');
    }
  };

  const isComplete = otp.join('').length === 4;

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={THEME.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify Customer</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <View style={styles.fraudBadge}>
            <Ionicons name="shield-checkmark" size={24} color={THEME.colors.success} />
          </View>
          <Text style={styles.customerName}>{mockIncomingJob.customerName}</Text>
          <Text style={styles.vehicleDetails}>
            {mockIncomingJob.vehicleMake} {mockIncomingJob.vehicleModel} • {mockIncomingJob.vehiclePlate}
          </Text>
        </View>

        <Text style={styles.instructionText}>
          Enter the 4-digit code shown on the customer's app
        </Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <View key={index} style={styles.otpInputContainer}>
              <TextInput
                ref={(ref) => { inputs.current[index] = ref; }}
                style={[
                  styles.otpInput,
                  digit ? styles.otpInputFilled : null,
                  index === 0 && digit ? { borderColor: THEME.colors.success } : null
                ]}
                value={digit}
                onChangeText={(val) => handleOtpChange(val.replace(/[^0-9]/g, '').slice(-1), index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            </View>
          ))}
        </View>

        <Text style={styles.subtleInfo}>
          <Ionicons name="information-circle-outline" size={14} color={THEME.colors.textSecondary} />
          {' '}This confirms you're at the correct vehicle
        </Text>

        <TouchableOpacity 
          style={[styles.verifyBtn, !isComplete && styles.verifyBtnDisabled]} 
          onPress={handleVerify}
          disabled={!isComplete}
        >
          <LinearGradient
            colors={isComplete ? [THEME.colors.success, '#00CC7A'] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btnGradient}
          >
            <Text style={[styles.verifyBtnText, !isComplete && styles.verifyBtnTextDisabled]}>
              VERIFY & PROCEED
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050810',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 20,
    color: THEME.colors.text,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  infoCard: {
    width: '100%',
    backgroundColor: THEME.colors.glassBg,
    borderRadius: THEME.borderRadius.lg,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    marginBottom: 40,
    marginTop: 20,
  },
  fraudBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 255, 151, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 151, 0.3)',
  },
  customerName: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 24,
    color: THEME.colors.text,
    marginBottom: 8,
  },
  vehicleDetails: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 16,
    color: THEME.colors.textSecondary,
  },
  instructionText: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 16,
    color: THEME.colors.text,
    marginBottom: 32,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 320,
    marginBottom: 32,
  },
  otpInputContainer: {
    width: 64,
    height: 76,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  otpInput: {
    flex: 1,
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 32,
    color: THEME.colors.text,
    textAlign: 'center',
  },
  otpInputFilled: {
    borderColor: THEME.colors.primary,
    backgroundColor: 'rgba(0, 207, 255, 0.05)',
  },
  subtleInfo: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 14,
    color: THEME.colors.textSecondary,
    marginBottom: 40,
    textAlign: 'center',
  },
  verifyBtn: {
    width: '100%',
    borderRadius: THEME.borderRadius.md,
    overflow: 'hidden',
    shadowColor: THEME.colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  verifyBtnDisabled: {
    shadowOpacity: 0,
  },
  btnGradient: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyBtnText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 18,
    color: '#000',
    letterSpacing: 1,
  },
  verifyBtnTextDisabled: {
    color: THEME.colors.textSecondary,
  },
});

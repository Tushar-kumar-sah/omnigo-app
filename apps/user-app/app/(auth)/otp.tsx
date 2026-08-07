import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { theme, glassStyle } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

export default function OTPScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter OTP</Text>
      <Text style={styles.subtitle}>Sent to your mobile number</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="0000"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="number-pad"
          value={otp}
          onChangeText={setOtp}
          maxLength={4}
          textAlign="center"
        />
      </View>

      <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.glowButtonContainer}>
        <LinearGradient colors={['#00CFFF', '#0CF2FF']} style={styles.glowButton}>
          <Text style={styles.glowButtonText}>Verify</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', padding: theme.spacing.lg },
  title: { fontFamily: 'Outfit_700Bold', fontSize: 32, color: theme.colors.text, textAlign: 'center', marginBottom: theme.spacing.sm },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 16, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.xxl },
  inputContainer: { ...glassStyle, paddingHorizontal: theme.spacing.md, marginBottom: theme.spacing.lg, width: 150, alignSelf: 'center' },
  input: { color: theme.colors.text, height: 60, fontFamily: 'Inter_500Medium', fontSize: 24, letterSpacing: 10 },
  glowButtonContainer: { shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 10 },
  glowButton: { borderRadius: theme.borderRadius.lg, paddingVertical: theme.spacing.md, alignItems: 'center' },
  glowButtonText: { color: '#000', fontFamily: 'Outfit_600SemiBold', fontSize: 18 },
});

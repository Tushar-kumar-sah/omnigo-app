import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../constants/theme';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const hasLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const isValid = hasLength && hasUpper && hasNumber && hasSpecial && passwordsMatch;

  const handleUpdate = () => {
    if (isValid) {
      // Proceed to update password
      router.back();
    }
  };

  const renderCheckItem = (label: string, met: boolean) => (
    <View style={styles.checkItem}>
      <Ionicons
        name={met ? "checkmark-circle" : "ellipse-outline"}
        size={20}
        color={met ? "#00FF97" : "rgba(255, 255, 255, 0.3)"}
      />
      <Text style={[styles.checkText, met && styles.checkTextMet]}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#050810', '#0a1222', '#050810']} style={StyleSheet.absoluteFillObject} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Security Icon */}
          <View style={styles.iconSection}>
            <LinearGradient
              colors={['rgba(0, 207, 255, 0.2)', 'rgba(0, 255, 151, 0.2)']}
              style={styles.iconBg}
            >
              <MaterialCommunityIcons name="shield-lock-outline" size={60} color="#00CFFF" />
            </LinearGradient>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Current Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Password</Text>
              <View style={[
                styles.inputWrapper,
                focusedField === 'current' && styles.inputWrapperFocused
              ]}>
                <Ionicons name="lock-closed-outline" size={20} color={focusedField === 'current' ? '#00CFFF' : 'rgba(255, 255, 255, 0.5)'} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter current password"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  secureTextEntry={!showCurrent}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  onFocus={() => setFocusedField('current')}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                  <Ionicons name={showCurrent ? "eye-off-outline" : "eye-outline"} size={22} color="rgba(255, 255, 255, 0.5)" />
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <View style={[
                styles.inputWrapper,
                focusedField === 'new' && styles.inputWrapperFocused
              ]}>
                <Ionicons name="lock-open-outline" size={20} color={focusedField === 'new' ? '#00CFFF' : 'rgba(255, 255, 255, 0.5)'} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter new password"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  secureTextEntry={!showNew}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  onFocus={() => setFocusedField('new')}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                  <Ionicons name={showNew ? "eye-off-outline" : "eye-outline"} size={22} color="rgba(255, 255, 255, 0.5)" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={[
                styles.inputWrapper,
                focusedField === 'confirm' && styles.inputWrapperFocused
              ]}>
                <Ionicons name="shield-checkmark-outline" size={20} color={focusedField === 'confirm' ? '#00CFFF' : 'rgba(255, 255, 255, 0.5)'} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm new password"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  secureTextEntry={!showConfirm}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => setFocusedField('confirm')}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                  <Ionicons name={showConfirm ? "eye-off-outline" : "eye-outline"} size={22} color="rgba(255, 255, 255, 0.5)" />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Checklist */}
            <View style={styles.checklistContainer}>
              <Text style={styles.checklistTitle}>Password Requirements:</Text>
              {renderCheckItem('At least 8 characters', hasLength)}
              {renderCheckItem('One uppercase letter', hasUpper)}
              {renderCheckItem('One number', hasNumber)}
              {renderCheckItem('One special character', hasSpecial)}
              {renderCheckItem('Passwords match', passwordsMatch)}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.saveButton, !isValid && styles.saveButtonDisabled]} 
          onPress={handleUpdate}
          disabled={!isValid}
        >
          <LinearGradient
            colors={isValid ? ['#00CFFF', '#00FF97'] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveButtonGradient}
          >
            <Text style={[styles.saveButtonText, !isValid && styles.saveButtonTextDisabled]}>
              Update Password
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
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
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 100,
  },
  iconSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0, 207, 255, 0.3)',
    shadowColor: '#00CFFF',
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  formContainer: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 20, 32, 0.45)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    height: 56,
  },
  inputWrapperFocused: {
    borderColor: '#00CFFF',
    shadowColor: '#00CFFF',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  checklistContainer: {
    backgroundColor: 'rgba(13, 20, 32, 0.45)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    gap: 12,
  },
  checklistTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  checkTextMet: {
    color: '#00FF97',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(5, 8, 16, 0.9)',
    alignItems: 'center',
  },
  forgotPassword: {
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#00CFFF',
  },
  saveButton: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    width: '100%',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 18,
    color: '#050810',
  },
  saveButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.3)',
  }
});

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

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [fullName, setFullName] = useState('Tushar Kumar');
  const [email, setEmail] = useState('tushar@omnigo.in');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [gender, setGender] = useState('Male');
  
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSave = () => {
    // Perform save action
    router.back();
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#050810', '#0a1222', '#050810']} style={StyleSheet.absoluteFillObject} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <LinearGradient
              colors={['#00FF97', '#00CFFF']}
              style={styles.avatarBorder}
            >
              <View style={styles.avatarInner}>
                <Ionicons name="person" size={40} color="rgba(255, 255, 255, 0.7)" />
              </View>
            </LinearGradient>
            <TouchableOpacity style={styles.changePhotoButton}>
              <Ionicons name="camera" size={16} color="#050810" />
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={[
                styles.inputWrapper,
                focusedField === 'name' && styles.inputWrapperFocused
              ]}>
                <Ionicons name="person-outline" size={20} color={focusedField === 'name' ? '#00CFFF' : 'rgba(255, 255, 255, 0.5)'} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  value={fullName}
                  onChangeText={setFullName}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[
                styles.inputWrapper,
                focusedField === 'email' && styles.inputWrapperFocused
              ]}>
                <Ionicons name="mail-outline" size={20} color={focusedField === 'email' ? '#00CFFF' : 'rgba(255, 255, 255, 0.5)'} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter email"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={[
                styles.inputWrapper,
                focusedField === 'phone' && styles.inputWrapperFocused
              ]}>
                <Ionicons name="call-outline" size={20} color={focusedField === 'phone' ? '#00CFFF' : 'rgba(255, 255, 255, 0.5)'} />
                <TextInput
                  style={styles.input}
                  placeholder="+91 XXXXX XXXXX"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Date of Birth */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Birth</Text>
              <TouchableOpacity style={styles.inputWrapper}>
                <Ionicons name="calendar-outline" size={20} color="rgba(255, 255, 255, 0.5)" />
                <Text style={styles.inputText}>15 Jan 1998</Text>
              </TouchableOpacity>
            </View>

            {/* Gender */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderRow}>
                {['Male', 'Female', 'Other'].map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[
                      styles.genderChip,
                      gender === g && styles.genderChipSelected
                    ]}
                    onPress={() => setGender(g)}
                  >
                    <Text style={[
                      styles.genderChipText,
                      gender === g && styles.genderChipTextSelected
                    ]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Button */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <LinearGradient
            colors={['#00CFFF', '#00FF97']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveButtonGradient}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
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
  saveText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#00CFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 100,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarBorder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -16,
    zIndex: 1,
  },
  avatarInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#121A28',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00CFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 24,
  },
  changePhotoText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#050810',
    marginLeft: 6,
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
  inputText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  genderChip: {
    flex: 1,
    backgroundColor: 'rgba(13, 20, 32, 0.45)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderChipSelected: {
    borderColor: '#00FF97',
    backgroundColor: 'rgba(0, 255, 151, 0.1)',
  },
  genderChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  genderChipTextSelected: {
    color: '#00FF97',
    fontFamily: 'Inter_600SemiBold',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(5, 8, 16, 0.9)',
  },
  saveButton: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
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
});

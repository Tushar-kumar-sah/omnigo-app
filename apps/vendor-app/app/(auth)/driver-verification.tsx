import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../../constants/theme';

type DocStatus = 'empty' | 'uploaded';

export default function DriverVerificationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Personal Details
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  // Vehicle Details
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');

  // Document uploads (simulated)
  const [licenceFront, setLicenceFront] = useState<DocStatus>('empty');
  const [licenceBack, setLicenceBack] = useState<DocStatus>('empty');
  const [vehicleRC, setVehicleRC] = useState<DocStatus>('empty');
  const [insurance, setInsurance] = useState<DocStatus>('empty');
  const [profilePhoto, setProfilePhoto] = useState<DocStatus>('empty');
  const [vehiclePhoto, setVehiclePhoto] = useState<DocStatus>('empty');

  const simulateUpload = (setter: (s: DocStatus) => void) => {
    setter('uploaded');
  };

  const handleSubmit = () => {
    router.replace('/(auth)/under-review');
  };

  const renderInput = (
    icon: string,
    placeholder: string,
    value: string,
    onChangeText: (t: string) => void,
    options?: { keyboardType?: any; autoCapitalize?: any; multiline?: boolean }
  ) => (
    <BlurView intensity={30} tint="dark" style={[styles.inputWrapper, options?.multiline && { height: 80, alignItems: 'flex-start', paddingTop: 14 }]}>
      <Ionicons name={icon as any} size={18} color={THEME.colors.primary} style={styles.inputIcon} />
      <TextInput
        style={[styles.input, options?.multiline && { textAlignVertical: 'top' }]}
        placeholder={placeholder}
        placeholderTextColor="rgba(255, 255, 255, 0.5)"
        value={value}
        onChangeText={onChangeText}
        keyboardType={options?.keyboardType || 'default'}
        autoCapitalize={options?.autoCapitalize || 'sentences'}
        multiline={options?.multiline}
      />
    </BlurView>
  );

  const renderUploadBox = (
    label: string,
    icon: string,
    status: DocStatus,
    onPress: () => void
  ) => (
    <TouchableOpacity
      style={[styles.uploadBox, status === 'uploaded' && styles.uploadBoxDone]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {status === 'uploaded' ? (
        <>
          <View style={styles.uploadedBadge}>
            <Ionicons name="checkmark-circle" size={28} color="#00FF97" />
          </View>
          <Text style={styles.uploadedText}>Uploaded</Text>
          <Text style={styles.uploadLabelDone}>{label}</Text>
        </>
      ) : (
        <>
          <View style={styles.uploadIconCircle}>
            <Ionicons name={icon as any} size={24} color={THEME.colors.primary} />
          </View>
          <Text style={styles.uploadLabel}>{label}</Text>
          <Text style={styles.uploadHint}>Tap to upload</Text>
        </>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(5, 8, 16, 0.35)', 'rgba(5, 8, 16, 0.55)', 'rgba(5, 8, 16, 0.85)']}
        style={StyleSheet.absoluteFillObject}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: Math.max(insets.top + 10, 40), paddingBottom: Math.max(insets.bottom + 30, 50) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="shield-checkmark" size={32} color={THEME.colors.primary} />
            </View>
            <Text style={styles.title}>Driver Verification</Text>
            <Text style={styles.subtitle}>Complete your profile to start accepting jobs</Text>
          </View>

          {/* Progress Steps */}
          <View style={styles.stepsRow}>
            <View style={[styles.stepDot, styles.stepDotActive]} />
            <View style={[styles.stepLine, styles.stepLineActive]} />
            <View style={[styles.stepDot, styles.stepDotActive]} />
            <View style={[styles.stepLine, styles.stepLineActive]} />
            <View style={[styles.stepDot, styles.stepDotActive]} />
            <View style={styles.stepLine} />
            <View style={styles.stepDot} />
          </View>
          <View style={styles.stepsLabelRow}>
            <Text style={styles.stepLabelActive}>Personal</Text>
            <Text style={styles.stepLabelActive}>Vehicle</Text>
            <Text style={styles.stepLabelActive}>Documents</Text>
            <Text style={styles.stepLabel}>Review</Text>
          </View>

          {/* Section 1: Personal Details */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person" size={18} color={THEME.colors.primary} />
              <Text style={styles.sectionTitle}>Personal Details</Text>
            </View>
            {renderInput('person-outline', 'Full Name', fullName, setFullName, { autoCapitalize: 'words' })}
            {renderInput('call-outline', 'Phone Number', phone, setPhone, { keyboardType: 'phone-pad' })}
            {renderInput('mail-outline', 'Email Address', email, setEmail, { keyboardType: 'email-address', autoCapitalize: 'none' })}
            {renderInput('calendar-outline', 'Date of Birth (DD/MM/YYYY)', dob, setDob, { keyboardType: 'number-pad' })}
            {renderInput('home-outline', 'Full Address', address, setAddress, { multiline: true })}
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                {renderInput('location-outline', 'City', city, setCity)}
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                {renderInput('map-outline', 'State', state, setState)}
              </View>
            </View>
            {renderInput('pin-outline', 'Pincode', pincode, setPincode, { keyboardType: 'number-pad' })}
          </View>

          {/* Section 2: Vehicle Details */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="car-sport" size={18} color={THEME.colors.primary} />
              <Text style={styles.sectionTitle}>Vehicle Details</Text>
            </View>
            {renderInput('car-outline', 'Vehicle Make (e.g. Mahindra)', vehicleMake, setVehicleMake)}
            {renderInput('car-sport-outline', 'Vehicle Model (e.g. Bolero)', vehicleModel, setVehicleModel)}
            {renderInput('pricetag-outline', 'License Plate (e.g. MH 02 AB 1234)', vehiclePlate, setVehiclePlate, { autoCapitalize: 'characters' })}
            {renderInput('time-outline', 'Vehicle Year (e.g. 2022)', vehicleYear, setVehicleYear, { keyboardType: 'number-pad' })}
          </View>

          {/* Section 3: Document Upload */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={18} color={THEME.colors.primary} />
              <Text style={styles.sectionTitle}>Upload Documents</Text>
            </View>
            <Text style={styles.docNote}>
              Upload clear photos of the following documents. All documents must be valid and not expired.
            </Text>

            {/* Profile Photo */}
            <Text style={styles.docGroupTitle}>Profile Photo</Text>
            <View style={styles.uploadRow}>
              {renderUploadBox('Selfie Photo', 'camera-outline', profilePhoto, () => simulateUpload(setProfilePhoto))}
            </View>

            {/* Driving Licence */}
            <Text style={styles.docGroupTitle}>Driving Licence</Text>
            <View style={styles.uploadRow}>
              {renderUploadBox('Front Side', 'card-outline', licenceFront, () => simulateUpload(setLicenceFront))}
              {renderUploadBox('Back Side', 'card-outline', licenceBack, () => simulateUpload(setLicenceBack))}
            </View>

            {/* Vehicle Documents */}
            <Text style={styles.docGroupTitle}>Vehicle Documents</Text>
            <View style={styles.uploadRow}>
              {renderUploadBox('Vehicle RC', 'document-outline', vehicleRC, () => simulateUpload(setVehicleRC))}
              {renderUploadBox('Insurance', 'shield-outline', insurance, () => simulateUpload(setInsurance))}
            </View>

            {/* Vehicle Photo */}
            <Text style={styles.docGroupTitle}>Vehicle Photo</Text>
            <View style={styles.uploadRow}>
              {renderUploadBox('Vehicle Photo', 'image-outline', vehiclePhoto, () => simulateUpload(setVehiclePhoto))}
            </View>
          </View>

          {/* Info Banner */}
          <BlurView intensity={20} tint="dark" style={styles.infoBanner}>
            <Ionicons name="information-circle" size={20} color={THEME.colors.primary} />
            <Text style={styles.infoText}>
              Your details will be verified by our team. This usually takes 2–3 hours (max 12 hours). You'll be notified once approved.
            </Text>
          </BlurView>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitBtnTouch} onPress={handleSubmit} activeOpacity={0.85}>
            <LinearGradient
              colors={['#00FF97', '#00CC7A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitBtn}
            >
              <Ionicons name="shield-checkmark" size={20} color="#000" style={{ marginRight: 8 }} />
              <Text style={styles.submitBtnText}>Submit for Verification</Text>
            </LinearGradient>
          </TouchableOpacity>
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
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 207, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 28,
    color: '#00FF97',
    textShadowColor: 'rgba(0, 255, 151, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  stepDotActive: {
    backgroundColor: '#00FF97',
    borderColor: '#00FF97',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: '#00FF97',
  },
  stepsLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 24,
  },
  stepLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
  },
  stepLabelActive: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#00FF97',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  sectionTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 18,
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 28, 60, 0.55)',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginBottom: 12,
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
    marginTop: 2,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  docNote: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 16,
    lineHeight: 18,
  },
  docGroupTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 10,
    marginTop: 4,
  },
  uploadRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  uploadBox: {
    flex: 1,
    height: 120,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 207, 255, 0.3)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(10, 28, 60, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  uploadBoxDone: {
    borderColor: '#00FF97',
    borderStyle: 'solid',
    backgroundColor: 'rgba(0, 255, 151, 0.06)',
  },
  uploadIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 207, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  uploadLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  uploadHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
    marginTop: 2,
  },
  uploadedBadge: {
    marginBottom: 6,
  },
  uploadedText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 12,
    color: '#00FF97',
  },
  uploadLabelDone: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0, 207, 255, 0.08)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.2)',
    gap: 10,
    overflow: 'hidden',
  },
  infoText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 18,
  },
  submitBtnTouch: {
    borderRadius: 100,
    overflow: 'hidden',
    marginBottom: 10,
    shadowColor: '#00FF97',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  submitBtnText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    color: '#000',
    letterSpacing: 0.3,
  },
});

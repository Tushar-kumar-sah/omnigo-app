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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { THEME } from '@/constants/theme';
import { updateDriver } from '@omnigo/api';
import { getAuthenticatedDriverId } from '@/lib/auth';

interface DocItem {
  uri: string | null;
  status: 'empty' | 'uploaded';
}

type DocKey =
  | 'profilePhoto'
  | 'licenceFront'
  | 'licenceBack'
  | 'vehicleRC'
  | 'insurance'
  | 'vehiclePhoto';

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

  // Real Camera Document Captures
  const [documents, setDocuments] = useState<Record<DocKey, DocItem>>({
    profilePhoto: { uri: null, status: 'empty' },
    licenceFront: { uri: null, status: 'empty' },
    licenceBack: { uri: null, status: 'empty' },
    vehicleRC: { uri: null, status: 'empty' },
    insurance: { uri: null, status: 'empty' },
    vehiclePhoto: { uri: null, status: 'empty' },
  });

  const [activeCapturingKey, setActiveCapturingKey] = useState<DocKey | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Captures document with device camera.
   * - 'profilePhoto' opens Front / Selfie Camera.
   * - All other documents open Back / Rear Camera.
   */
  const captureDocumentPhoto = async (key: DocKey, label: string) => {
    try {
      setActiveCapturingKey(key);

      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Camera Permission Required',
          'OmniGo requires live camera access to verify driver identity and original vehicle documents.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Choose from Gallery',
              onPress: () => pickFromGallery(key),
            },
          ]
        );
        setActiveCapturingKey(null);
        return;
      }

      // Check camera facing: profile uses selfie (front), all other documents use back camera
      const isSelfie = key === 'profilePhoto';
      const cameraFacing = isSelfie ? ImagePicker.CameraType.front : ImagePicker.CameraType.back;

      const result = await ImagePicker.launchCameraAsync({
        cameraType: cameraFacing,
        allowsEditing: true,
        aspect: isSelfie ? [1, 1] : [4, 3],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const capturedUri = result.assets[0].uri;
        setDocuments((prev) => ({
          ...prev,
          [key]: { uri: capturedUri, status: 'uploaded' },
        }));
      }
    } catch (err: any) {
      console.warn('[Driver Verification] Camera capture error:', err);
      Alert.alert(
        'Camera Unavailable',
        'Could not start camera on this device. Would you like to pick a document photo from your gallery instead?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Choose from Gallery',
            onPress: () => pickFromGallery(key),
          },
        ]
      );
    } finally {
      setActiveCapturingKey(null);
    }
  };

  /**
   * Fallback for simulators or environments without a physical camera sensor
   */
  const pickFromGallery = async (key: DocKey) => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.85,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        setDocuments((prev) => ({
          ...prev,
          [key]: { uri: res.assets[0].uri, status: 'uploaded' },
        }));
      }
    } catch (e) {
      console.warn('Gallery pick error:', e);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const driverId = getAuthenticatedDriverId();
      await updateDriver(driverId, {
        name: fullName.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        city: city.trim() || undefined,
        address: address.trim() || undefined,
        vehiclePlate: vehiclePlate.trim() || undefined,
        vehicleNumber: vehiclePlate.trim() || undefined,
        avatar: documents.profilePhoto.uri || undefined,
        kycStatus: 'pending_review',
        isVerified: false,
      });
    } catch (e) {
      console.warn('Driver verification submit error:', e);
    } finally {
      setIsSubmitting(false);
    }
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
    docKey: DocKey,
    label: string,
    cameraHint: 'Selfie Camera' | 'Back Camera',
    defaultIcon: string
  ) => {
    const doc = documents[docKey];
    const isCapturing = activeCapturingKey === docKey;
    const isUploaded = doc.status === 'uploaded' && doc.uri;

    return (
      <View style={[styles.uploadBox, isUploaded && styles.uploadBoxDone]}>
        {isUploaded ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: doc.uri! }} style={styles.thumbnailPhoto} resizeMode="cover" />
            
            {/* Overlay Gradient */}
            <LinearGradient
              colors={['rgba(0, 0, 0, 0.65)', 'transparent', 'rgba(0, 0, 0, 0.85)']}
              style={StyleSheet.absoluteFill}
            />

            {/* Top Verified Camera Badge */}
            <View style={styles.verifiedTag}>
              <Ionicons name="shield-checkmark" size={11} color="#00FF97" style={{ marginRight: 4 }} />
              <Text style={styles.verifiedTagText}>CAMERA VERIFIED</Text>
            </View>

            {/* Bottom Controls */}
            <View style={styles.previewBottom}>
              <Text style={styles.previewDocTitle} numberOfLines={1}>{label}</Text>
              <TouchableOpacity
                style={styles.retakeBtn}
                onPress={() => captureDocumentPhoto(docKey, label)}
                activeOpacity={0.8}
              >
                <Ionicons name="camera-reverse" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.retakeBtnText}>Retake</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.emptyBoxTouch}
            onPress={() => captureDocumentPhoto(docKey, label)}
            disabled={isCapturing}
            activeOpacity={0.7}
          >
            {isCapturing ? (
              <ActivityIndicator size="small" color="#00FF97" />
            ) : (
              <>
                <View style={[styles.uploadIconCircle, docKey === 'profilePhoto' && styles.selfieIconCircle]}>
                  <Ionicons
                    name={docKey === 'profilePhoto' ? 'camera' : (defaultIcon as any)}
                    size={22}
                    color={docKey === 'profilePhoto' ? '#00FF97' : '#00CFFF'}
                  />
                </View>
                <Text style={styles.uploadLabel}>{label}</Text>
                <View style={styles.cameraTypePill}>
                  <Ionicons
                    name={docKey === 'profilePhoto' ? 'person-circle-outline' : 'scan-outline'}
                    size={10}
                    color="rgba(255, 255, 255, 0.85)"
                    style={{ marginRight: 3 }}
                  />
                  <Text style={styles.cameraTypeText}>{cameraHint}</Text>
                </View>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
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
            <Text style={styles.subtitle}>Complete real camera verification to start towing</Text>
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
            {renderInput('car-sport-outline', 'Vehicle Model (e.g. Bolero Tow)', vehicleModel, setVehicleModel)}
            {renderInput('pricetag-outline', 'License Plate (e.g. MH 02 AB 1234)', vehiclePlate, setVehiclePlate, { autoCapitalize: 'characters' })}
            {renderInput('time-outline', 'Vehicle Year (e.g. 2023)', vehicleYear, setVehicleYear, { keyboardType: 'number-pad' })}
          </View>

          {/* Section 3: Real Camera Document Verification */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="camera" size={18} color={THEME.colors.primary} />
              <Text style={styles.sectionTitle}>Live Camera Document Verification</Text>
            </View>
            <Text style={styles.docNote}>
              Capture genuine photos with your device camera. Profile photo uses your selfie camera; all official vehicle papers use your rear camera.
            </Text>

            {/* Profile Selfie Photo */}
            <Text style={styles.docGroupTitle}>Profile Photo (Selfie Camera)</Text>
            <View style={styles.uploadRow}>
              {renderUploadBox('profilePhoto', 'Selfie Photo', 'Selfie Camera', 'camera')}
            </View>

            {/* Driving Licence */}
            <Text style={styles.docGroupTitle}>Driving Licence (Back Camera)</Text>
            <View style={styles.uploadRow}>
              {renderUploadBox('licenceFront', 'Licence Front', 'Back Camera', 'card-outline')}
              {renderUploadBox('licenceBack', 'Licence Back', 'Back Camera', 'card-outline')}
            </View>

            {/* Vehicle Documents */}
            <Text style={styles.docGroupTitle}>Vehicle Documents (Back Camera)</Text>
            <View style={styles.uploadRow}>
              {renderUploadBox('vehicleRC', 'Vehicle RC Book', 'Back Camera', 'document-text-outline')}
              {renderUploadBox('insurance', 'Insurance Certificate', 'Back Camera', 'shield-checkmark-outline')}
            </View>

            {/* Vehicle Photo */}
            <Text style={styles.docGroupTitle}>Vehicle Live Photo (Back Camera)</Text>
            <View style={styles.uploadRow}>
              {renderUploadBox('vehiclePhoto', 'Tow Truck Live Photo', 'Back Camera', 'car-sport-outline')}
            </View>
          </View>

          {/* Info Banner */}
          <BlurView intensity={20} tint="dark" style={styles.infoBanner}>
            <Ionicons name="shield-checkmark" size={20} color={THEME.colors.primary} />
            <Text style={styles.infoText}>
              All photos are securely submitted to OmniGo partner verification servers. Approval typically takes 2–3 hours.
            </Text>
          </BlurView>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitBtnTouch}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#00FF97', '#00CC7A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitBtn}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <>
                  <Ionicons name="shield-checkmark" size={20} color="#000" style={{ marginRight: 8 }} />
                  <Text style={styles.submitBtnText}>Submit for Verification</Text>
                </>
              )}
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
    color: 'rgba(255,255,255,0.85)',
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
    height: 146,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 207, 255, 0.35)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(10, 28, 60, 0.45)',
    overflow: 'hidden',
  },
  uploadBoxDone: {
    borderColor: '#00FF97',
    borderStyle: 'solid',
    backgroundColor: '#050810',
    shadowColor: '#00FF97',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyBoxTouch: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  uploadIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(0, 207, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.3)',
  },
  selfieIconCircle: {
    backgroundColor: 'rgba(0, 255, 151, 0.12)',
    borderColor: 'rgba(0, 255, 151, 0.35)',
  },
  uploadLabel: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 13,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  cameraTypePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  cameraTypeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  previewContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
    justifyContent: 'space-between',
    padding: 8,
  },
  thumbnailPhoto: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(5, 8, 16, 0.82)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 151, 0.4)',
  },
  verifiedTagText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 9,
    color: '#00FF97',
    letterSpacing: 0.5,
  },
  previewBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(5, 8, 16, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  previewDocTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#FFFFFF',
    flex: 1,
    marginRight: 6,
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 207, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#00CFFF',
  },
  retakeBtnText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 10,
    color: '#FFFFFF',
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

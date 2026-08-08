import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Platform, 
  KeyboardAvoidingView 
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { THEME } from '../../constants/theme';
import { VEHICLE_TYPES } from '../../constants/mock-data';

const STEPS = [
  'Personal Info',
  'Documents',
  'Vehicle Details',
  'Bank Details',
  'Consent'
];

export default function RegisterScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [vehicleType, setVehicleType] = useState<string | null>(null);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      router.push('/(auth)/under-review');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      router.back();
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      <Text style={styles.stepTitle}>
        Step {currentStep + 1}: {STEPS[currentStep]}
      </Text>
      <View style={styles.progressBar}>
        {STEPS.map((_, index) => (
          <View key={index} style={styles.progressSegmentWrapper}>
            <View 
              style={[
                styles.progressSegment, 
                index <= currentStep ? styles.progressSegmentActive : null
              ]} 
            />
          </View>
        ))}
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <View style={styles.photoUploadContainer}>
        <TouchableOpacity style={styles.photoUpload} activeOpacity={0.8}>
          <Ionicons name="camera" size={32} color={THEME.colors.textSecondary} />
          <Text style={styles.photoUploadText}>Upload Photo</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="As per documents"
          placeholderTextColor={THEME.colors.textMuted || '#555'}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone Number</Text>
        <View style={styles.phoneInputContainer}>
          <View style={styles.prefixContainer}>
            <Text style={styles.prefixText}>+91</Text>
          </View>
          <TextInput
            style={styles.phoneInput}
            placeholder="Enter phone number"
            placeholderTextColor={THEME.colors.textMuted || '#555'}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="your@email.com"
          placeholderTextColor={THEME.colors.textMuted || '#555'}
          keyboardType="email-address"
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionDescription}>Upload clear, readable photos of your original documents.</Text>
      
      <View style={styles.documentGroup}>
        <Text style={styles.label}>Driving License</Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.docUploadBox} activeOpacity={0.8}>
            <Ionicons name="id-card-outline" size={32} color={THEME.colors.primary} />
            <Text style={styles.docUploadText}>Front Side</Text>
          </TouchableOpacity>
          <View style={{ width: 16 }} />
          <TouchableOpacity style={styles.docUploadBox} activeOpacity={0.8}>
            <Ionicons name="id-card-outline" size={32} color={THEME.colors.primary} />
            <Text style={styles.docUploadText}>Back Side</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.documentGroup}>
        <Text style={styles.label}>Vehicle RC</Text>
        <TouchableOpacity style={styles.docUploadBoxFull} activeOpacity={0.8}>
          <Ionicons name="document-text-outline" size={32} color={THEME.colors.primary} />
          <Text style={styles.docUploadText}>Registration Certificate</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.documentGroup}>
        <Text style={styles.label}>Vehicle Insurance</Text>
        <TouchableOpacity style={styles.docUploadBoxFull} activeOpacity={0.8}>
          <Ionicons name="shield-checkmark-outline" size={32} color={THEME.colors.primary} />
          <Text style={styles.docUploadText}>Valid Insurance Document</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => {
    // Fallback if VEHICLE_TYPES is not fully formed or empty
    const localTypes = VEHICLE_TYPES?.length > 0 ? VEHICLE_TYPES : [
      { id: 'sedan', name: 'Sedan', icon: 'car-outline' },
      { id: 'suv', name: 'SUV', icon: 'car-sport-outline' },
      { id: 'hatchback', name: 'Hatchback', icon: 'car-outline' },
      { id: 'bike', name: 'Bike', icon: 'bicycle-outline' },
      { id: 'truck', name: 'Truck', icon: 'bus-outline' },
      { id: 'bus', name: 'Bus', icon: 'bus-outline' }
    ];

    return (
      <View style={styles.stepContent}>
        <Text style={styles.label}>Vehicle Category</Text>
        <View style={styles.vehicleGrid}>
          {localTypes.map((type: any) => (
            <TouchableOpacity 
              key={type.id} 
              style={[
                styles.vehicleCard,
                vehicleType === type.id ? styles.vehicleCardActive : null
              ]}
              onPress={() => setVehicleType(type.id)}
              activeOpacity={0.8}
            >
              <Ionicons 
                name={type.icon as any || 'car-outline'} 
                size={32} 
                color={vehicleType === type.id ? THEME.colors.primary : THEME.colors.textSecondary} 
              />
              <Text style={[
                styles.vehicleCardText,
                vehicleType === type.id ? styles.vehicleCardTextActive : null
              ]}>
                {type.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Make & Model</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Maruti Suzuki Swift"
            placeholderTextColor={THEME.colors.textMuted || '#555'}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Year</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY"
              keyboardType="number-pad"
              placeholderTextColor={THEME.colors.textMuted || '#555'}
            />
          </View>
          <View style={{ width: 16 }} />
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Color</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. White"
              placeholderTextColor={THEME.colors.textMuted || '#555'}
            />
          </View>
        </View>

        <Text style={styles.label}>Vehicle Photos</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vehiclePhotoScroll}>
          <TouchableOpacity style={styles.vehiclePhotoBox} activeOpacity={0.8}>
            <Ionicons name="camera-outline" size={24} color={THEME.colors.primary} />
            <Text style={styles.vehiclePhotoText}>Front</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.vehiclePhotoBox} activeOpacity={0.8}>
            <Ionicons name="camera-outline" size={24} color={THEME.colors.primary} />
            <Text style={styles.vehiclePhotoText}>Rear</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.vehiclePhotoBox} activeOpacity={0.8}>
            <Ionicons name="camera-outline" size={24} color={THEME.colors.primary} />
            <Text style={styles.vehiclePhotoText}>Side</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <View style={styles.infoBadge}>
        <Ionicons name="information-circle" size={20} color={THEME.colors.primary} />
        <Text style={styles.infoBadgeText}>Your earnings will be transferred here</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Account Holder Name</Text>
        <TextInput
          style={styles.input}
          placeholder="As per bank records"
          placeholderTextColor={THEME.colors.textMuted || '#555'}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Bank Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. HDFC Bank"
          placeholderTextColor={THEME.colors.textMuted || '#555'}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Account Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter account number"
          keyboardType="number-pad"
          secureTextEntry
          placeholderTextColor={THEME.colors.textMuted || '#555'}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>IFSC Code</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. HDFC0001234"
          autoCapitalize="characters"
          placeholderTextColor={THEME.colors.textMuted || '#555'}
        />
      </View>

      <View style={styles.divider}>
        <Text style={styles.dividerText}>OR</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>UPI ID (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. name@upi"
          autoCapitalize="none"
          placeholderTextColor={THEME.colors.textMuted || '#555'}
        />
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContent}>
      <Ionicons name="document-text" size={60} color={THEME.colors.primary} style={{ alignSelf: 'center', marginBottom: 24 }} />
      <Text style={styles.consentTitle}>Partner Agreement</Text>
      <Text style={styles.consentText}>
        By submitting this application, you agree to become a driver partner with OmniGo. You confirm that all documents provided are genuine and valid.
      </Text>

      <TouchableOpacity style={styles.checkboxContainer} activeOpacity={0.8}>
        <View style={[styles.checkbox, { backgroundColor: THEME.colors.primary }]}>
          <Ionicons name="checkmark" size={16} color="#000" />
        </View>
        <Text style={styles.checkboxLabel}>I accept the Terms & Conditions</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.checkboxContainer} activeOpacity={0.8}>
        <View style={[styles.checkbox, { backgroundColor: THEME.colors.primary }]}>
          <Ionicons name="checkmark" size={16} color="#000" />
        </View>
        <Text style={styles.checkboxLabel}>I accept the Privacy Policy</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.checkboxContainer} activeOpacity={0.8}>
        <View style={[styles.checkbox, { backgroundColor: THEME.colors.primary }]}>
          <Ionicons name="checkmark" size={16} color="#000" />
        </View>
        <Text style={styles.checkboxLabel}>I agree to OmniGo driver partner terms</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={THEME.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Register</Text>
        <View style={{ width: 40 }} />
      </View>

      {renderStepIndicator()}

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <BlurView intensity={20} tint="dark" style={styles.glassCard}>
          {currentStep === 0 && renderStep1()}
          {currentStep === 1 && renderStep2()}
          {currentStep === 2 && renderStep3()}
          {currentStep === 3 && renderStep4()}
          {currentStep === 4 && renderStep5()}

          <View style={styles.actions}>
            {currentStep > 0 && (
              <TouchableOpacity style={styles.secondaryButton} onPress={handleBack}>
                <Text style={styles.secondaryButtonText}>BACK</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              activeOpacity={0.8} 
              style={[styles.primaryButton, currentStep === 0 && { flex: 1 }]} 
              onPress={handleNext}
            >
              <LinearGradient
                colors={[THEME.colors.primary, THEME.colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Text style={styles.primaryButtonText}>
                  {currentStep === STEPS.length - 1 ? 'SUBMIT' : 'NEXT'}
                </Text>
                <Ionicons 
                  name={currentStep === STEPS.length - 1 ? 'checkmark-circle' : 'arrow-forward'} 
                  size={20} 
                  color="#050810" 
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </BlurView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 40 : 60,
    paddingHorizontal: THEME.spacing.lg,
    paddingBottom: THEME.spacing.md,
  },
  backButton: {
    padding: THEME.spacing.xs,
  },
  headerTitle: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 20,
    color: THEME.colors.text,
  },
  stepIndicatorContainer: {
    paddingHorizontal: THEME.spacing.lg,
    paddingBottom: THEME.spacing.lg,
  },
  stepTitle: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 14,
    color: THEME.colors.primary,
    marginBottom: THEME.spacing.sm,
  },
  progressBar: {
    flexDirection: 'row',
    height: 4,
    gap: 4,
  },
  progressSegmentWrapper: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressSegment: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  progressSegmentActive: {
    backgroundColor: THEME.colors.primary,
  },
  scrollContent: {
    padding: THEME.spacing.lg,
    paddingBottom: 40,
  },
  glassCard: {
    backgroundColor: THEME.colors.glassBg,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    overflow: 'hidden',
  },
  stepContent: {
    marginBottom: THEME.spacing.xl,
  },
  photoUploadContainer: {
    alignItems: 'center',
    marginBottom: THEME.spacing.xl,
  },
  photoUpload: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(5, 8, 16, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoUploadText: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: THEME.spacing.xs,
  },
  inputGroup: {
    marginBottom: THEME.spacing.lg,
  },
  label: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 14,
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.xs,
  },
  input: {
    height: 52,
    backgroundColor: 'rgba(5, 8, 16, 0.5)',
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.15)',
    paddingHorizontal: THEME.spacing.md,
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 15,
    color: THEME.colors.text,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    height: 52,
    backgroundColor: 'rgba(5, 8, 16, 0.5)',
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.15)',
    overflow: 'hidden',
  },
  prefixContainer: {
    paddingHorizontal: THEME.spacing.md,
    borderRightWidth: 1,
    borderRightColor: 'rgba(0, 207, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 207, 255, 0.05)',
  },
  prefixText: {
    fontFamily: THEME.fonts.inter.bold,
    fontSize: 15,
    color: THEME.colors.primary,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: THEME.spacing.md,
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 15,
    color: THEME.colors.text,
  },
  sectionDescription: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 14,
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.lg,
  },
  documentGroup: {
    marginBottom: THEME.spacing.lg,
  },
  row: {
    flexDirection: 'row',
  },
  docUploadBox: {
    flex: 1,
    height: 100,
    backgroundColor: 'rgba(5, 8, 16, 0.5)',
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.3)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  docUploadBoxFull: {
    height: 100,
    backgroundColor: 'rgba(5, 8, 16, 0.5)',
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.3)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  docUploadText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 12,
    color: THEME.colors.primary,
    marginTop: THEME.spacing.xs,
  },
  vehicleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: THEME.spacing.xl,
  },
  vehicleCard: {
    width: '31%', // approx 3 per row
    height: 80,
    backgroundColor: 'rgba(5, 8, 16, 0.5)',
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleCardActive: {
    backgroundColor: 'rgba(0, 207, 255, 0.1)',
    borderColor: THEME.colors.primary,
  },
  vehicleCardText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 4,
  },
  vehicleCardTextActive: {
    color: THEME.colors.primary,
    fontFamily: THEME.fonts.inter.bold,
  },
  vehiclePhotoScroll: {
    flexDirection: 'row',
  },
  vehiclePhotoBox: {
    width: 100,
    height: 80,
    backgroundColor: 'rgba(5, 8, 16, 0.5)',
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.3)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vehiclePhotoText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 12,
    color: THEME.colors.primary,
    marginTop: 4,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 207, 255, 0.1)',
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    marginBottom: THEME.spacing.lg,
  },
  infoBadgeText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 13,
    color: THEME.colors.text,
    marginLeft: THEME.spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: THEME.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerText: {
    backgroundColor: THEME.colors.glassBg,
    paddingHorizontal: THEME.spacing.sm,
    color: THEME.colors.textMuted || '#555',
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 12,
  },
  consentTitle: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 24,
    color: THEME.colors.text,
    marginBottom: THEME.spacing.md,
    textAlign: 'center',
  },
  consentText: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 14,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginBottom: THEME.spacing.xl,
    lineHeight: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
    backgroundColor: 'rgba(5, 8, 16, 0.5)',
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: THEME.spacing.sm,
  },
  checkboxLabel: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 14,
    color: THEME.colors.text,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: THEME.spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  secondaryButtonText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 16,
    color: THEME.colors.text,
  },
  primaryButton: {
    flex: 2,
    borderRadius: THEME.borderRadius.md,
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: 'row',
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 16,
    color: '#050810',
    marginRight: THEME.spacing.sm,
  },
});

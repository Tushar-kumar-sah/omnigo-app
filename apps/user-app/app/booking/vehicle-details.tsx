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
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../constants/theme';

export default function VehicleDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [plate, setPlate] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [notes, setNotes] = useState('');

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const colors = [
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Black', hex: '#222222' },
    { name: 'Silver', hex: '#C0C0C0' },
    { name: 'Red', hex: '#FF3B30' },
    { name: 'Blue', hex: '#00CFFF' },
    { name: 'Gray', hex: '#808080' },
  ];

  const isValid = make.trim() !== '' && model.trim() !== '' && plate.trim() !== '';

  const handleContinue = () => {
    if (isValid) {
      router.push('/booking/confirm');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={['#050810', '#0a1222', '#050810']} style={StyleSheet.absoluteFillObject} />
      
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.inner, { paddingTop: insets.top }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Vehicle Details</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressDotCompleted} />
            <View style={styles.progressLineCompleted} />
            <View style={styles.progressDotActive} />
            <View style={styles.progressLinePending} />
            <View style={styles.progressDotPending} />
            <View style={styles.progressLinePending} />
            <View style={styles.progressDotPending} />
          </View>
          <Text style={styles.stepText}>Step 2 of 4</Text>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
            
            {/* Input Fields */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Vehicle Make</Text>
              <View style={[styles.inputContainer, focusedField === 'make' && styles.inputFocused]}>
                <Ionicons name="car-outline" size={20} color="rgba(255, 255, 255, 0.5)" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Maruti Suzuki"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  value={make}
                  onChangeText={setMake}
                  onFocus={() => setFocusedField('make')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Vehicle Model</Text>
              <View style={[styles.inputContainer, focusedField === 'model' && styles.inputFocused]}>
                <Ionicons name="car-sport-outline" size={20} color="rgba(255, 255, 255, 0.5)" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Swift Dzire"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  value={model}
                  onChangeText={setModel}
                  onFocus={() => setFocusedField('model')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>License Plate</Text>
              <View style={[styles.inputContainer, focusedField === 'plate' && styles.inputFocused]}>
                <Ionicons name="card-outline" size={20} color="rgba(255, 255, 255, 0.5)" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. MH 02 AB 1234"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  value={plate}
                  onChangeText={setPlate}
                  autoCapitalize="characters"
                  onFocus={() => setFocusedField('plate')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Vehicle Color</Text>
              <View style={styles.colorPickerContainer}>
                {colors.map((color) => (
                  <TouchableOpacity
                    key={color.name}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: color.hex },
                      selectedColor === color.name && styles.colorSelected
                    ]}
                    onPress={() => setSelectedColor(color.name)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Additional Notes (Optional)</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer, focusedField === 'notes' && styles.inputFocused]}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Any special instructions..."
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  onFocus={() => setFocusedField('notes')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Footer Action */}
          <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={handleContinue}
              disabled={!isValid}
            >
              <LinearGradient
                colors={isValid ? ['#00CFFF', '#00FF97'] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.continueBtn}
              >
                <Text style={[styles.continueBtnText, !isValid && styles.continueBtnTextDisabled]}>
                  CONTINUE
                </Text>
                <Ionicons 
                  name="arrow-forward" 
                  size={20} 
                  color={isValid ? '#050810' : 'rgba(255,255,255,0.3)'} 
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050810',
  },
  inner: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 20,
    color: '#FFF',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginTop: 10,
    marginBottom: 5,
  },
  progressDotCompleted: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00FF97',
    shadowColor: '#00FF97',
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  progressDotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00CFFF',
    borderWidth: 2,
    borderColor: '#050810',
    shadowColor: '#00CFFF',
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  progressDotPending: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressLineCompleted: {
    flex: 1,
    height: 2,
    backgroundColor: '#00FF97',
    marginHorizontal: 4,
  },
  progressLinePending: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 4,
  },
  stepText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#00CFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 10,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 20, 32, 0.45)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    height: 56,
  },
  inputFocused: {
    borderColor: '#00CFFF',
    shadowColor: '#00CFFF',
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#FFF',
    height: '100%',
  },
  textAreaContainer: {
    height: 120,
    alignItems: 'flex-start',
    paddingVertical: 16,
  },
  textArea: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#FFF',
    width: '100%',
  },
  colorPickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(13, 20, 32, 0.45)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  colorSelected: {
    borderColor: '#00CFFF',
    transform: [{ scale: 1.1 }],
    shadowColor: '#00CFFF',
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 15,
    backgroundColor: 'rgba(5, 8, 16, 0.9)',
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
  },
  continueBtnText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    color: '#050810',
    marginRight: 8,
  },
  continueBtnTextDisabled: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
});

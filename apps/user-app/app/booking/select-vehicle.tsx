import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../../constants/theme';

const VEHICLE_IMAGES = {
  sedan: require('../../assets/vehicles/sedan.jpg'),
  suv: require('../../assets/vehicles/suv.jpg'),
  hatchback: require('../../assets/vehicles/hatchback.jpg'),
  bike: require('../../assets/vehicles/bike.jpg'),
  truck: require('../../assets/vehicles/truck.jpg'),
  bus: require('../../assets/vehicles/bus.jpg'),
};

const VEHICLE_TYPES = [
  { id: 'sedan', label: 'Sedan', desc: 'Compact & mid-size' },
  { id: 'suv', label: 'SUV', desc: 'Large vehicles' },
  { id: 'hatchback', label: 'Hatchback', desc: 'Small cars' },
  { id: 'bike', label: 'Bike', desc: 'Two wheelers' },
  { id: 'truck', label: 'Truck', desc: 'Commercial' },
  { id: 'bus', label: 'Bus / Van', desc: 'Large transport' },
];

const COLORS = [
  { id: 'white', color: '#FFFFFF', label: 'White' },
  { id: 'black', color: '#1a1a1a', label: 'Black' },
  { id: 'silver', color: '#C0C0C0', label: 'Silver' },
  { id: 'red', color: '#E53935', label: 'Red' },
  { id: 'blue', color: '#1E88E5', label: 'Blue' },
  { id: 'gray', color: '#757575', label: 'Gray' },
  { id: 'green', color: '#43A047', label: 'Green' },
  { id: 'gold', color: '#FFB300', label: 'Gold' },
];

const PHOTO_LABELS = ['Front View', 'Rear View', 'Left Side', 'Right Side'];

export default function SelectVehicleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Vehicle type
  const [selectedType, setSelectedType] = useState('');

  // Vehicle details
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  // Media
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null, null]);
  const [video, setVideo] = useState<string | null>(null);

  // Focus states
  const [focusedField, setFocusedField] = useState('');

  const photosUploaded = photos.filter(Boolean).length;
  const canContinue =
    selectedType !== '' &&
    brand.trim().length > 0 &&
    model.trim().length > 0 &&
    licensePlate.trim().length > 0 &&
    selectedColor !== '' &&
    photosUploaded >= 4 &&
    video !== null;

  const pickPhoto = async (index: number) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Photo library access was denied. Please enable it in your device Settings to upload photos.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const updated = [...photos];
      updated[index] = result.assets[0].uri;
      setPhotos(updated);
    }
  };

  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Photo library access was denied. Please enable it in your device Settings to upload videos.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: true,
      videoMaxDuration: 60,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setVideo(result.assets[0].uri);
    }
  };

  const takePhoto = async (index: number) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera access was denied. Please enable it in your device Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const updated = [...photos];
      updated[index] = result.assets[0].uri;
      setPhotos(updated);
    }
  };

  const showPhotoOptions = (index: number) => {
    Alert.alert('Upload Photo', `${PHOTO_LABELS[index]}`, [
      { text: 'Camera', onPress: () => takePhoto(index) },
      { text: 'Gallery', onPress: () => pickPhoto(index) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#050810', '#0a1222', '#050810']} style={StyleSheet.absoluteFillObject} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, 48) }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book a Tow</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 24, 40) }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress Steps */}
        <View style={styles.progressRow}>
          <View style={[styles.progressStep, styles.progressStepActive]}>
            <Text style={styles.progressStepNumActive}>1</Text>
          </View>
          <View style={[styles.progressLine, styles.progressLineActive]} />
          <View style={styles.progressStep}>
            <Text style={styles.progressStepNum}>2</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={styles.progressStep}>
            <Text style={styles.progressStepNum}>3</Text>
          </View>
        </View>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressLabelActive}>Vehicle Info</Text>
          <Text style={styles.progressLabel}>Confirm</Text>
          <Text style={styles.progressLabel}>Find Driver</Text>
        </View>

        {/* SECTION 1: Vehicle Type */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionNumBadge}>
            <Text style={styles.sectionNumText}>1</Text>
          </View>
          <Text style={styles.sectionTitle}>Select Vehicle Type</Text>
        </View>

        <View style={styles.typeGrid}>
          {VEHICLE_TYPES.map((v) => {
            const isSelected = v.id === selectedType;
            return (
              <TouchableOpacity
                key={v.id}
                onPress={() => setSelectedType(v.id)}
                style={[styles.typeCard, isSelected && styles.typeCardSelected]}
                activeOpacity={0.7}
              >
                {isSelected && (
                  <LinearGradient
                    colors={['rgba(0, 207, 255, 0.2)', 'rgba(0, 255, 151, 0.08)']}
                    style={[StyleSheet.absoluteFillObject, { borderRadius: 16 }]}
                  />
                )}
                <View style={[styles.typeIcon, isSelected && styles.typeIconSelected]}>
                  <Image
                    source={VEHICLE_IMAGES[v.id as keyof typeof VEHICLE_IMAGES]}
                    style={styles.typeVehicleImg}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[styles.typeLabel, isSelected && styles.typeLabelSelected]}>{v.label}</Text>
                <Text style={[styles.typeDesc, isSelected && styles.typeDescSelected]}>{v.desc}</Text>
                {isSelected && (
                  <View style={styles.typeCheckBadge}>
                    <Ionicons name="checkmark-circle" size={18} color="#00FF97" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* SECTION 2: Vehicle Details */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionNumBadge}>
            <Text style={styles.sectionNumText}>2</Text>
          </View>
          <Text style={styles.sectionTitle}>Vehicle Details</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Brand / Make</Text>
          <TextInput
            style={[styles.input, focusedField === 'brand' && styles.inputFocused]}
            placeholder="e.g. Maruti Suzuki, Hyundai, Tata"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={brand}
            onChangeText={setBrand}
            onFocus={() => setFocusedField('brand')}
            onBlur={() => setFocusedField('')}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Model</Text>
          <TextInput
            style={[styles.input, focusedField === 'model' && styles.inputFocused]}
            placeholder="e.g. Swift Dzire, Creta, Nexon"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={model}
            onChangeText={setModel}
            onFocus={() => setFocusedField('model')}
            onBlur={() => setFocusedField('')}
          />
        </View>

        <View style={styles.formRowDouble}>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>Year</Text>
            <TextInput
              style={[styles.input, focusedField === 'year' && styles.inputFocused]}
              placeholder="e.g. 2023"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={year}
              onChangeText={setYear}
              keyboardType="number-pad"
              maxLength={4}
              onFocus={() => setFocusedField('year')}
              onBlur={() => setFocusedField('')}
            />
          </View>
          <View style={[styles.formGroup, { flex: 1.4 }]}>
            <Text style={styles.inputLabel}>License Plate</Text>
            <TextInput
              style={[styles.input, focusedField === 'plate' && styles.inputFocused]}
              placeholder="e.g. MH 02 AB 1234"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={licensePlate}
              onChangeText={setLicensePlate}
              autoCapitalize="characters"
              onFocus={() => setFocusedField('plate')}
              onBlur={() => setFocusedField('')}
            />
          </View>
        </View>

        {/* Color Picker */}
        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Vehicle Color</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorRow}>
            {COLORS.map((c) => {
              const isSelected = c.id === selectedColor;
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setSelectedColor(c.id)}
                  style={[styles.colorChip, isSelected && styles.colorChipSelected]}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.colorDot,
                      { backgroundColor: c.color },
                      isSelected && styles.colorDotSelected,
                    ]}
                  />
                  <Text style={[styles.colorLabel, isSelected && styles.colorLabelSelected]}>{c.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* SECTION 3: Vehicle Photos */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionNumBadge}>
            <Text style={styles.sectionNumText}>3</Text>
          </View>
          <Text style={styles.sectionTitle}>Vehicle Photos</Text>
          <View style={styles.photoCountBadge}>
            <Text style={styles.photoCountText}>{photosUploaded}/4</Text>
          </View>
        </View>
        <Text style={styles.sectionSubtitle}>Upload 4 clear photos of your vehicle from all sides</Text>

        <View style={styles.photoGrid}>
          {PHOTO_LABELS.map((label, index) => (
            <TouchableOpacity
              key={label}
              style={[styles.photoCard, photos[index] && styles.photoCardFilled]}
              onPress={() => showPhotoOptions(index)}
              activeOpacity={0.7}
            >
              {photos[index] ? (
                <>
                  <Image source={{ uri: photos[index]! }} style={styles.photoImage} />
                  <View style={styles.photoOverlay}>
                    <Text style={styles.photoLabel}>{label}</Text>
                    <View style={styles.photoCheckCircle}>
                      <Ionicons name="checkmark" size={14} color="#000" />
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.photoRemoveBtn}
                    onPress={() => {
                      const updated = [...photos];
                      updated[index] = null;
                      setPhotos(updated);
                    }}
                  >
                    <Ionicons name="close-circle" size={22} color="#FF3B30" />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.photoPlaceholderIcon}>
                    <Ionicons name="camera-outline" size={28} color="rgba(255,255,255,0.35)" />
                  </View>
                  <Text style={styles.photoPlaceholderLabel}>{label}</Text>
                  <Text style={styles.photoPlaceholderHint}>Tap to upload</Text>
                </>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* SECTION 4: 360° Video */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionNumBadge}>
            <Text style={styles.sectionNumText}>4</Text>
          </View>
          <Text style={styles.sectionTitle}>360° Vehicle Video</Text>
          {video && (
            <View style={[styles.photoCountBadge, { backgroundColor: 'rgba(0,255,151,0.15)' }]}>
              <Ionicons name="checkmark" size={12} color="#00FF97" />
            </View>
          )}
        </View>
        <Text style={styles.sectionSubtitle}>
          Record a 360° walk-around video of your vehicle (max 60 seconds)
        </Text>

        <TouchableOpacity
          style={[styles.videoUploadCard, video && styles.videoUploadCardFilled]}
          onPress={pickVideo}
          activeOpacity={0.7}
        >
          {video ? (
            <View style={styles.videoUploadedContent}>
              <LinearGradient
                colors={['rgba(0, 255, 151, 0.1)', 'rgba(0, 207, 255, 0.05)']}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.videoPlayCircle}>
                <Ionicons name="play" size={28} color="#00FF97" />
              </View>
              <View style={styles.videoUploadedInfo}>
                <Text style={styles.videoUploadedTitle}>360° Video Uploaded</Text>
                <Text style={styles.videoUploadedHint}>Tap to replace</Text>
              </View>
              <TouchableOpacity
                style={styles.videoRemoveBtn}
                onPress={() => setVideo(null)}
              >
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.videoPlaceholderContent}>
              <View style={styles.videoIconCircle}>
                <MaterialCommunityIcons name="rotate-3d-variant" size={32} color="rgba(255,255,255,0.4)" />
              </View>
              <Text style={styles.videoPlaceholderTitle}>Upload 360° Video</Text>
              <Text style={styles.videoPlaceholderHint}>Walk around your vehicle and record</Text>
              <View style={styles.videoUploadBtnInner}>
                <Ionicons name="cloud-upload-outline" size={16} color="#00CFFF" />
                <Text style={styles.videoUploadBtnText}>Choose from Gallery</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.continueBtn, !canContinue && styles.continueBtnDisabled]}
          onPress={() => {
            if (canContinue) router.push('/booking/confirm');
          }}
          activeOpacity={canContinue ? 0.85 : 1}
        >
          <LinearGradient
            colors={canContinue ? ['#00FF97', '#00CFFF'] : ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueBtnGradient}
          >
            <Text style={[styles.continueBtnText, !canContinue && styles.continueBtnTextDisabled]}>
              CONTINUE
            </Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={canContinue ? '#000' : 'rgba(255,255,255,0.25)'}
            />
          </LinearGradient>
        </TouchableOpacity>

        {/* Requirement Checklist */}
        {!canContinue && (
          <View style={styles.checklistCard}>
            <Text style={styles.checklistTitle}>Complete to continue:</Text>
            <CheckItem done={selectedType !== ''} label="Select vehicle type" />
            <CheckItem done={brand.trim().length > 0} label="Enter brand / make" />
            <CheckItem done={model.trim().length > 0} label="Enter model" />
            <CheckItem done={licensePlate.trim().length > 0} label="Enter license plate" />
            <CheckItem done={selectedColor !== ''} label="Select vehicle color" />
            <CheckItem done={photosUploaded >= 4} label={`Upload 4 photos (${photosUploaded}/4)`} />
            <CheckItem done={video !== null} label="Upload 360° video" />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function CheckItem({ done, label }: { done: boolean; label: string }) {
  return (
    <View style={checkStyles.row}>
      <Ionicons
        name={done ? 'checkmark-circle' : 'ellipse-outline'}
        size={16}
        color={done ? '#00FF97' : 'rgba(255,255,255,0.25)'}
      />
      <Text style={[checkStyles.label, done && checkStyles.labelDone]}>{label}</Text>
    </View>
  );
}

const checkStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  label: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
  },
  labelDone: {
    color: 'rgba(255,255,255,0.7)',
    textDecorationLine: 'line-through',
  },
});

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
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  headerTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },

  // Progress Steps
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  progressStep: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressStepActive: {
    backgroundColor: 'rgba(0, 207, 255, 0.15)',
    borderColor: '#00CFFF',
  },
  progressStepNum: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 13,
    color: 'rgba(255,255,255,0.3)',
  },
  progressStepNumActive: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 13,
    color: '#00CFFF',
  },
  progressLine: {
    width: 50,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 6,
  },
  progressLineActive: {
    backgroundColor: 'rgba(0, 207, 255, 0.3)',
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  progressLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.3)',
  },
  progressLabelActive: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#00CFFF',
  },

  // Section headers
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
    marginTop: 8,
  },
  sectionNumBadge: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 207, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.3)',
  },
  sectionNumText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 12,
    color: '#00CFFF',
  },
  sectionTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
  },
  sectionSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    marginBottom: 14,
    marginLeft: 34,
  },

  // Vehicle Type Grid
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  typeCard: {
    width: '31%',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(13, 20, 32, 0.45)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    overflow: 'hidden',
    gap: 4,
  },
  typeCardSelected: {
    borderColor: '#00CFFF',
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  typeIcon: {
    width: 70,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    overflow: 'hidden',
  },
  typeIconSelected: {
    backgroundColor: 'transparent',
  },
  typeVehicleImg: {
    width: '100%',
    height: '100%',
  },
  typeLabel: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  typeLabelSelected: {
    color: '#FFFFFF',
  },
  typeDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
  },
  typeDescSelected: {
    color: 'rgba(0, 207, 255, 0.7)',
  },
  typeCheckBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
  },

  // Form fields
  formGroup: {
    marginBottom: 16,
  },
  formRowDouble: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 6,
    marginLeft: 2,
  },
  input: {
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(13, 20, 32, 0.55)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  inputFocused: {
    borderColor: '#00CFFF',
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },

  // Color picker
  colorRow: {
    gap: 8,
    paddingVertical: 4,
  },
  colorChip: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(13, 20, 32, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  colorChipSelected: {
    borderColor: '#00CFFF',
    backgroundColor: 'rgba(0, 207, 255, 0.08)',
  },
  colorDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  colorDotSelected: {
    borderColor: '#00CFFF',
    borderWidth: 2.5,
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  colorLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
  },
  colorLabelSelected: {
    color: '#00CFFF',
    fontFamily: 'Inter_500Medium',
  },

  // Photo grid
  photoCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 207, 255, 0.12)',
  },
  photoCountText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    color: '#00CFFF',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  photoCard: {
    width: '47.5%',
    aspectRatio: 4 / 3,
    borderRadius: 16,
    backgroundColor: 'rgba(13, 20, 32, 0.45)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    gap: 4,
  },
  photoCardFilled: {
    borderStyle: 'solid',
    borderColor: '#00FF97',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: 10,
    borderRadius: 14,
    flexDirection: 'row',
  },
  photoLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#FFFFFF',
    flex: 1,
  },
  photoCheckCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#00FF97',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoRemoveBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  photoPlaceholderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
  },
  photoPlaceholderHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
    color: 'rgba(255,255,255,0.25)',
  },

  // Video upload
  videoUploadCard: {
    borderRadius: 20,
    backgroundColor: 'rgba(13, 20, 32, 0.45)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: 28,
  },
  videoUploadCardFilled: {
    borderStyle: 'solid',
    borderColor: '#00FF97',
  },
  videoPlaceholderContent: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 8,
  },
  videoIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  videoPlaceholderTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
  },
  videoPlaceholderHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
  },
  videoUploadBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 207, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.25)',
    marginTop: 4,
  },
  videoUploadBtnText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#00CFFF',
  },
  videoUploadedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
    overflow: 'hidden',
  },
  videoPlayCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0, 255, 151, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 255, 151, 0.3)',
  },
  videoUploadedInfo: {
    flex: 1,
  },
  videoUploadedTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: '#00FF97',
  },
  videoUploadedHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  videoRemoveBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.2)',
  },

  // Continue button
  continueBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  continueBtnDisabled: {
    opacity: 0.7,
  },
  continueBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
    borderRadius: 16,
  },
  continueBtnText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    color: '#000000',
    letterSpacing: 1,
  },
  continueBtnTextDisabled: {
    color: 'rgba(255,255,255,0.3)',
  },

  // Checklist
  checklistCard: {
    borderRadius: 16,
    backgroundColor: 'rgba(13, 20, 32, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    marginBottom: 12,
  },
  checklistTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 8,
  },
});

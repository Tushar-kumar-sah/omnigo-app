import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/context/ThemeContext';
import { fetchCurrentUser, updateCurrentUserProfile } from '@/lib/api';

const DEFAULT_USER_ID = 'a0000000-0000-0000-0000-000000000001';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const YEARS = Array.from({ length: 85 }, (_, i) => 2015 - i); // 2015 down to 1931

function formatDob(day: number, monthIndex: number, year: number): string {
  const dd = String(day).padStart(2, '0');
  return `${dd} ${MONTHS_SHORT[monthIndex]} ${year}`;
}

function parseDobString(dobStr: string): { day: number; month: number; year: number } | null {
  if (!dobStr || dobStr === '—') return null;
  const parts = dobStr.trim().split(/\s+/);
  if (parts.length === 3) {
    const d = parseInt(parts[0], 10);
    const m = MONTHS_SHORT.findIndex((mName) => mName.toLowerCase() === parts[1].slice(0, 3).toLowerCase());
    const y = parseInt(parts[2], 10);
    if (!isNaN(d) && m !== -1 && !isNaN(y)) {
      return { day: d, month: m, year: y };
    }
  }
  const parsedDate = new Date(dobStr);
  if (!isNaN(parsedDate.getTime())) {
    return {
      day: parsedDate.getDate(),
      month: parsedDate.getMonth(),
      year: parsedDate.getFullYear(),
    };
  }
  return null;
}

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();

  const [userId, setUserId] = useState(DEFAULT_USER_ID);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);

  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [dobModalVisible, setDobModalVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState<'days' | 'months' | 'years'>('days');

  // Calendar picker state (defaults to 15 Aug 2000)
  const [calDay, setCalDay] = useState(15);
  const [calMonth, setCalMonth] = useState(7); // August (0-indexed)
  const [calYear, setCalYear] = useState(2000);

  const [saving, setSaving] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const u = await fetchCurrentUser();
      if (u) {
        if (u.uuid || u.id) setUserId(u.uuid || u.id);
        setFullName(u.name && u.name !== '—' ? u.name : '');
        setEmail(u.email && u.email !== '—' ? u.email : '');
        setPhone(u.phone && u.phone !== '—' ? u.phone : '');
        const loadedDob = u.dob && u.dob !== '—' ? u.dob : '';
        setDob(loadedDob);
        const parsed = parseDobString(loadedDob);
        if (parsed) {
          setCalDay(parsed.day);
          setCalMonth(parsed.month);
          setCalYear(parsed.year);
        }
        setGender(u.gender && u.gender !== '—' ? u.gender : '');
        if (u.avatar) setAvatar(u.avatar);
      }
    })();
  }, []);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstWeekdayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handleOpenDobModal = () => {
    Keyboard.dismiss();
    const parsed = parseDobString(dob);
    if (parsed) {
      setCalDay(parsed.day);
      setCalMonth(parsed.month);
      setCalYear(parsed.year);
    }
    setPickerMode('days');
    setDobModalVisible(true);
  };

  const handlePrevMonth = () => {
    if (calMonth === 0) {
      const newYear = calYear - 1;
      setCalMonth(11);
      setCalYear(newYear);
      const maxD = getDaysInMonth(11, newYear);
      if (calDay > maxD) setCalDay(maxD);
    } else {
      const newMonth = calMonth - 1;
      setCalMonth(newMonth);
      const maxD = getDaysInMonth(newMonth, calYear);
      if (calDay > maxD) setCalDay(maxD);
    }
  };

  const handleNextMonth = () => {
    if (calMonth === 11) {
      const newYear = calYear + 1;
      setCalMonth(0);
      setCalYear(newYear);
      const maxD = getDaysInMonth(0, newYear);
      if (calDay > maxD) setCalDay(maxD);
    } else {
      const newMonth = calMonth + 1;
      setCalMonth(newMonth);
      const maxD = getDaysInMonth(newMonth, calYear);
      if (calDay > maxD) setCalDay(maxD);
    }
  };

  const handleSelectMonth = (mIdx: number) => {
    setCalMonth(mIdx);
    const maxD = getDaysInMonth(mIdx, calYear);
    if (calDay > maxD) setCalDay(maxD);
    setPickerMode('days');
  };

  const handleSelectYear = (yr: number) => {
    setCalYear(yr);
    const maxD = getDaysInMonth(calMonth, yr);
    if (calDay > maxD) setCalDay(maxD);
    setPickerMode('days');
  };

  const handleConfirmDob = () => {
    const formatted = formatDob(calDay, calMonth, calYear);
    setDob(formatted);
    setDobModalVisible(false);
  };

  const handlePickFromCamera = async () => {
    setPhotoModalVisible(false);
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission Required', 'Please allow camera access in Settings to take a profile photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const newAvatar = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;
        setAvatar(newAvatar);
        await updateCurrentUserProfile(userId, { avatar: newAvatar });
      }
    } catch (e) {
      console.warn('[EditProfile] Camera error:', e);
      Alert.alert('Camera Error', 'Unable to open camera on this device.');
    }
  };

  const handlePickFromGallery = async () => {
    setPhotoModalVisible(false);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission Required', 'Please allow photo library access in Settings to choose a profile photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const newAvatar = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;
        setAvatar(newAvatar);
        await updateCurrentUserProfile(userId, { avatar: newAvatar });
      }
    } catch (e) {
      console.warn('[EditProfile] Gallery error:', e);
      Alert.alert('Gallery Error', 'Unable to open photo library.');
    }
  };

  const handleSave = async () => {
    Keyboard.dismiss();
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      Alert.alert('Name Required', 'Please enter your full name.');
      return;
    }

    setSaving(true);
    try {
      await updateCurrentUserProfile(userId, {
        name: trimmedName,
        phone: phone.trim(),
        email: email.trim(),
        dob: dob.trim(),
        gender,
        ...(avatar ? { avatar } : {}),
      });
      setSaving(false);
      setSavedBanner(true);
      setTimeout(() => {
        router.back();
      }, 450);
    } catch (e) {
      setSaving(false);
      Alert.alert('Error', 'Could not save changes. Please try again.');
    }
  };

  const daysInCurrentMonth = getDaysInMonth(calMonth, calYear);
  const firstWeekday = getFirstWeekdayOfMonth(calMonth, calYear);
  const calendarCells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1),
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={colors.gradient} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.divider }]}>
        <TouchableOpacity style={[styles.iconButton, !isDark && { backgroundColor: colors.pillBg }]} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      {savedBanner && (
        <View style={styles.savedToast}>
          <Ionicons name="checkmark-circle" size={18} color="#050810" />
          <Text style={styles.savedToastText}>Profile changes saved!</Text>
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity activeOpacity={0.85} onPress={() => setPhotoModalVisible(true)}>
              <LinearGradient
                colors={['#00FF97', '#00CFFF']}
                style={styles.avatarBorder}
              >
                <View style={styles.avatarInner}>
                  {avatar ? (
                    <Image
                      source={{ uri: avatar }}
                      style={{ width: '100%', height: '100%', borderRadius: 40 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons name="person" size={40} color="rgba(255, 255, 255, 0.7)" />
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.changePhotoButton}
              activeOpacity={0.85}
              onPress={() => setPhotoModalVisible(true)}
            >
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
                  placeholder="Enter email address"
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
              <TouchableOpacity
                style={[
                  styles.inputWrapper,
                  dobModalVisible && styles.inputWrapperFocused,
                ]}
                activeOpacity={0.8}
                onPress={handleOpenDobModal}
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={dob ? '#00CFFF' : 'rgba(255, 255, 255, 0.5)'}
                />
                <Text
                  style={[
                    styles.inputText,
                    !dob && { color: 'rgba(255, 255, 255, 0.35)' },
                  ]}
                >
                  {dob || 'Select Date of Birth'}
                </Text>
                <Ionicons name="chevron-down" size={18} color="rgba(255, 255, 255, 0.45)" />
              </TouchableOpacity>
            </View>

            {/* Gender */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderRow}>
                {(['Male', 'Female', 'Other'] as const).map((g) => {
                  const isSelected = gender === g;
                  const iconName =
                    g === 'Male' ? 'male-outline' : g === 'Female' ? 'female-outline' : 'person-outline';
                  return (
                    <TouchableOpacity
                      key={g}
                      style={[
                        styles.genderChip,
                        isSelected && styles.genderChipSelected
                      ]}
                      activeOpacity={0.8}
                      onPress={() => setGender(g)}
                    >
                      <Ionicons
                        name={iconName}
                        size={16}
                        color={isSelected ? '#00FF97' : 'rgba(255, 255, 255, 0.6)'}
                        style={{ marginRight: 6 }}
                      />
                      <Text style={[
                        styles.genderChipText,
                        isSelected && styles.genderChipTextSelected
                      ]}>{g}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Save Button */}
      <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom + 12, 20) }]}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
          <LinearGradient
            colors={['#00CFFF', '#00FF97']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveButtonGradient}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#050810" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Date of Birth Calendar Modal */}
      <Modal
        visible={dobModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDobModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setDobModalVisible(false)}
          />
          <View style={[styles.calendarSheet, { paddingBottom: Math.max(insets.bottom + 18, 24) }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Date of Birth</Text>

            {/* Selected Date Preview Pill */}
            <View style={styles.dobPreviewBanner}>
              <Ionicons name="calendar" size={16} color="#00FF97" />
              <Text style={styles.dobPreviewText}>
                {String(calDay).padStart(2, '0')} {MONTHS_FULL[calMonth]} {calYear}
              </Text>
            </View>

            {/* Month & Year Selector Header */}
            <View style={styles.calNavRow}>
              <TouchableOpacity style={styles.calArrowBtn} onPress={handlePrevMonth}>
                <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.calMonthYearCenter}>
                <TouchableOpacity
                  style={[
                    styles.calSelectorPill,
                    pickerMode === 'months' && styles.calSelectorPillActive,
                  ]}
                  onPress={() => setPickerMode(pickerMode === 'months' ? 'days' : 'months')}
                >
                  <Text style={styles.calSelectorPillText}>{MONTHS_FULL[calMonth]}</Text>
                  <Ionicons name="caret-down" size={12} color="#00CFFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.calSelectorPill,
                    pickerMode === 'years' && styles.calSelectorPillActive,
                  ]}
                  onPress={() => setPickerMode(pickerMode === 'years' ? 'days' : 'years')}
                >
                  <Text style={styles.calSelectorPillText}>{calYear}</Text>
                  <Ionicons name="caret-down" size={12} color="#00FF97" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.calArrowBtn} onPress={handleNextMonth}>
                <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Mode 1: Month Grid */}
            {pickerMode === 'months' && (
              <View style={styles.monthGrid}>
                {MONTHS_SHORT.map((mName, idx) => {
                  const active = idx === calMonth;
                  return (
                    <TouchableOpacity
                      key={mName}
                      style={[styles.monthCell, active && styles.monthCellActive]}
                      onPress={() => handleSelectMonth(idx)}
                    >
                      <Text style={[styles.monthCellText, active && styles.monthCellTextActive]}>
                        {mName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Mode 2: Year Picker Scroll Grid */}
            {pickerMode === 'years' && (
              <ScrollView style={styles.yearScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.yearGrid}>
                  {YEARS.map((yr) => {
                    const active = yr === calYear;
                    return (
                      <TouchableOpacity
                        key={yr}
                        style={[styles.yearCell, active && styles.yearCellActive]}
                        onPress={() => handleSelectYear(yr)}
                      >
                        <Text style={[styles.yearCellText, active && styles.yearCellTextActive]}>
                          {yr}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            )}

            {/* Mode 3: Calendar Days Grid */}
            {pickerMode === 'days' && (
              <View style={styles.daysContainer}>
                <View style={styles.weekHeaderRow}>
                  {WEEKDAYS.map((wd) => (
                    <Text key={wd} style={styles.weekHeaderText}>
                      {wd}
                    </Text>
                  ))}
                </View>

                <View style={styles.daysGrid}>
                  {calendarCells.map((dayNum, index) => {
                    if (dayNum === null) {
                      return <View key={`empty-${index}`} style={styles.dayCell} />;
                    }
                    const isSelected = dayNum === calDay;
                    return (
                      <TouchableOpacity
                        key={`day-${dayNum}`}
                        style={styles.dayCell}
                        activeOpacity={0.75}
                        onPress={() => setCalDay(dayNum)}
                      >
                        <View style={[styles.dayCircle, isSelected && styles.dayCircleSelected]}>
                          <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                            {dayNum}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Modal Footer Actions */}
            <View style={styles.calFooterRow}>
              <TouchableOpacity
                style={styles.calCancelBtn}
                onPress={() => setDobModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.calCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.calConfirmBtn}
                onPress={handleConfirmDob}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#00CFFF', '#00FF97']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.calConfirmGradient}
                >
                  <Text style={styles.calConfirmText}>Confirm Date</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Camera / Gallery Picker Modal */}
      <Modal
        visible={photoModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPhotoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setPhotoModalVisible(false)}
          />
          <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom + 20, 28) }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Change Profile Photo</Text>
            <Text style={styles.modalSubtitle}>Select how you would like to update your photo</Text>

            <TouchableOpacity style={styles.optionBtn} onPress={handlePickFromCamera} activeOpacity={0.8}>
              <View style={[styles.optionIconBox, { backgroundColor: 'rgba(0, 255, 151, 0.14)' }]}>
                <Ionicons name="camera-outline" size={22} color="#00FF97" />
              </View>
              <View style={styles.optionTextWrap}>
                <Text style={styles.optionTitle}>Take Photo</Text>
                <Text style={styles.optionDesc}>Use your camera to capture a new photo</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionBtn} onPress={handlePickFromGallery} activeOpacity={0.8}>
              <View style={[styles.optionIconBox, { backgroundColor: 'rgba(0, 207, 255, 0.14)' }]}>
                <Ionicons name="images-outline" size={22} color="#00CFFF" />
              </View>
              <View style={styles.optionTextWrap}>
                <Text style={styles.optionTitle}>Choose from Gallery</Text>
                <Text style={styles.optionDesc}>Pick an existing photo from your phone</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setPhotoModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 14,
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
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: '#00CFFF',
  },
  savedToast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00FF97',
    marginHorizontal: 20,
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 6,
  },
  savedToastText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 14,
    color: '#050810',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 22,
  },
  avatarBorder: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -14,
    zIndex: 1,
  },
  avatarInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#121A28',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00CFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 22,
  },
  changePhotoText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#050810',
    marginLeft: 6,
  },
  formContainer: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 20, 32, 0.6)',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    height: 52,
  },
  inputWrapperFocused: {
    borderColor: '#00CFFF',
  },
  input: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  inputText: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderChip: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(13, 20, 32, 0.6)',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderChipSelected: {
    borderColor: '#00FF97',
    backgroundColor: 'rgba(0, 255, 151, 0.14)',
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
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(5, 8, 16, 0.95)',
  },
  saveButton: {
    height: 54,
    borderRadius: 27,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 17,
    color: '#050810',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.76)',
    justifyContent: 'flex-end',
  },
  calendarSheet: {
    backgroundColor: '#0B1324',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.25)',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  dobPreviewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 255, 151, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 151, 0.35)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 8,
    marginTop: 8,
    marginBottom: 14,
  },
  dobPreviewText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 15,
    color: '#00FF97',
  },
  calNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  calArrowBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  calMonthYearCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  calSelectorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  calSelectorPillActive: {
    borderColor: '#00CFFF',
    backgroundColor: 'rgba(0, 207, 255, 0.15)',
  },
  calSelectorPillText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  daysContainer: {
    marginBottom: 12,
  },
  weekHeaderRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekHeaderText: {
    width: '14.28%',
    textAlign: 'center',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.45)',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleSelected: {
    backgroundColor: '#00FF97',
  },
  dayText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },
  dayTextSelected: {
    fontFamily: 'Outfit_700Bold',
    color: '#050810',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginVertical: 10,
  },
  monthCell: {
    width: '30%',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
  },
  monthCellActive: {
    backgroundColor: 'rgba(0, 207, 255, 0.2)',
    borderColor: '#00CFFF',
  },
  monthCellText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  monthCellTextActive: {
    color: '#00CFFF',
  },
  yearScroll: {
    maxHeight: 240,
    marginVertical: 6,
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    paddingBottom: 10,
  },
  yearCell: {
    width: '22%',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
  },
  yearCellActive: {
    backgroundColor: 'rgba(0, 255, 151, 0.2)',
    borderColor: '#00FF97',
  },
  yearCellText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  yearCellTextActive: {
    color: '#00FF97',
  },
  calFooterRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  calCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calCancelText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  calConfirmBtn: {
    flex: 1.4,
    height: 48,
    borderRadius: 16,
    overflow: 'hidden',
  },
  calConfirmGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calConfirmText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 15,
    color: '#050810',
  },
  modalSheet: {
    backgroundColor: '#0D1526',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 22,
    paddingTop: 12,
  },
  modalHandle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.65)',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 14,
    marginBottom: 12,
  },
  optionIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionTextWrap: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  optionDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  cancelBtn: {
    marginTop: 4,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 59, 48, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.35)',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 15,
    color: '#FF453A',
  },
});

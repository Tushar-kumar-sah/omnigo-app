import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@/constants/theme';
import { CONDITION_CHECKLIST } from '@/constants/app-config';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ConditionReportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobId = params.id as string;
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [fuelLevel, setFuelLevel] = useState<string>('Quarter');

  const fuelOptions = [
    { key: 'Empty', label: 'Empty' },
    { key: 'Low', label: 'Low' },
    { key: 'Quarter', label: '1/4' },
    { key: 'Half', label: '1/2' },
    { key: 'Full', label: 'Full' },
  ];

  const handleToggle = (id: string) => {
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 36 : 16) + 14;

  return (
    <View style={styles.container}>
      {/* Top Header Bar */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, 48) }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={THEME.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Condition Report</Text>
          <Text style={styles.headerSub}>Vehicle Handover Verification</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Scrollable Content Body */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Pre-Tow Inspection Summary</Text>

        {/* Checklist Card */}
        <BlurView intensity={20} tint="dark" style={styles.card}>
          <Text style={styles.sectionTitle}>Checklist</Text>
          {CONDITION_CHECKLIST.filter((i) => i.type === 'toggle').map((item) => (
            <View key={item.id} style={styles.checklistItem}>
              <Text style={styles.checklistLabel}>{item.label}</Text>
              <Switch
                value={checklist[item.id] || false}
                onValueChange={() => handleToggle(item.id)}
                trackColor={{ false: '#2A3040', true: THEME.colors.success }}
                thumbColor={'#FFF'}
              />
            </View>
          ))}

          <View style={styles.divider} />

          {/* Fuel Level Selection */}
          <Text style={styles.checklistLabel}>Fuel Level</Text>
          <View style={styles.fuelOptionsRow}>
            {fuelOptions.map((option) => {
              const isActive = fuelLevel === option.key;
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[styles.fuelButton, isActive && styles.fuelButtonActive]}
                  onPress={() => setFuelLevel(option.key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.fuelButtonText, isActive && styles.fuelButtonTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </BlurView>

        {/* Damage Notice Badge */}
        <BlurView intensity={20} tint="dark" style={[styles.card, { marginTop: THEME.spacing.md }]}>
          <View style={styles.damageHeader}>
            <Ionicons name="shield-checkmark" size={22} color={THEME.colors.success} />
            <View style={{ flex: 1 }}>
              <Text style={styles.damageTitle}>Pre-Inspection Damage Saved</Text>
              <Text style={styles.damageSubtitle}>
                GPS watermarked photos & marked zones are recorded in customer trip log.
              </Text>
            </View>
          </View>
        </BlurView>

        <Text style={styles.footerNote}>
          A copy of this condition report is automatically synced to the customer app and dispatch ledger.
        </Text>
      </ScrollView>

      {/* Pinned Bottom Footer with Generous System Bar Clearance */}
      <View style={[styles.footer, { paddingBottom: bottomInset }]}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push({ pathname: '/job/towing', params: { id: jobId } })}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[THEME.colors.success, '#00CC7A']}
            style={styles.btn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.btnText}>CONFIRM & START TOWING</Text>
            <Ionicons name="arrow-forward" size={20} color="#000" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
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
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: THEME.colors.glassBg,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.glassBorder,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleBox: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 18,
    color: THEME.colors.text,
  },
  headerSub: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  title: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 22,
    color: THEME.colors.text,
    marginBottom: 16,
  },
  card: {
    backgroundColor: THEME.colors.glassBg,
    borderColor: THEME.colors.glassBorder,
    borderWidth: 1,
    borderRadius: THEME.borderRadius.lg,
    padding: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 17,
    color: THEME.colors.text,
    marginBottom: 14,
  },
  checklistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  checklistLabel: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 15,
    color: THEME.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.colors.glassBorder,
    marginVertical: 14,
  },
  fuelOptionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    width: '100%',
  },
  fuelButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 2,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fuelButtonActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  fuelButtonText: {
    fontFamily: THEME.fonts.inter.medium,
    color: THEME.colors.textSecondary,
    fontSize: 13,
  },
  fuelButtonTextActive: {
    color: '#000',
    fontFamily: THEME.fonts.outfit.bold,
  },
  damageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  damageTitle: {
    fontFamily: THEME.fonts.outfit.bold,
    color: THEME.colors.text,
    fontSize: 15,
  },
  damageSubtitle: {
    fontFamily: THEME.fonts.inter.regular,
    color: THEME.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  footerNote: {
    fontFamily: THEME.fonts.inter.regular,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    marginTop: 20,
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  footer: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: THEME.colors.background,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.glassBorder,
  },
  actionBtn: {
    width: '100%',
  },
  btn: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: THEME.borderRadius.md,
    gap: 8,
  },
  btnText: {
    color: '#000',
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 16,
    letterSpacing: 0.5,
  },
});

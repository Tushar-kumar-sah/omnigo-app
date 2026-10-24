import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '@/constants/theme';

const PARTNER_PRIVACY_SECTIONS = [
  {
    id: 1,
    icon: 'map-marker-path',
    title: 'Background Location Tracking',
    content:
      'OmniGo Driver collects real-time location data, including in the background (via FOREGROUND_SERVICE_LOCATION), while your status is set to Online or during active towing dispatches. This enables automatic nearby job dispatching, route optimization, and live trip tracking for the customer and customer support team.',
  },
  {
    id: 2,
    icon: 'card-account-details-outline',
    title: 'KYC & Driver Verification Data',
    content:
      'We collect and verify commercial driver licenses, vehicle registration certificates (RC), commercial vehicle insurance, pollution compliance, PAN cards, and selfie verification photos to ensure passenger safety, commercial legitimacy, and compliance with motor transport regulations.',
  },
  {
    id: 3,
    icon: 'bank-transfer',
    title: 'Banking & Payout Information',
    content:
      'We collect bank account numbers, IFSC codes, UPI Virtual Payment Addresses (VPA), and PAN details to process automatic weekly earnings payouts and instant on-demand IMPS wallet withdrawals, as well as for mandatory tax deduction (TDS) reporting.',
  },
  {
    id: 4,
    icon: 'camera-burst',
    title: 'Vehicle Condition & Inspection Media',
    content:
      'Photos and digital reports captured during pre-inspection and post-inspection (including odometer readings, tire condition, bumper dents, and hookup angles) are stored securely on our cloud infrastructure to protect drivers against fraudulent vehicle damage claims.',
  },
  {
    id: 5,
    icon: 'phone-incoming-outline',
    title: 'Masked Call Telephony & Logs',
    content:
      'When you contact a customer through the app, calls are routed through an encrypted telephony proxy that masks your personal mobile number. We record call timestamps and connection status to maintain safety and resolve service disputes.',
  },
  {
    id: 6,
    icon: 'shield-lock-outline',
    title: 'Data Security & Encryption',
    content:
      'All driver financial, identity, and location records are transmitted via TLS 1.3 encryption and stored in secure, access-controlled data vaults. We do not sell or rent driver partner data to third-party advertisers.',
  },
  {
    id: 7,
    icon: 'database-eye-outline',
    title: 'Data Retention & Account Deletion',
    content:
      'Transport regulations require us to retain trip and transaction logs for statutory audit periods. However, partners may request account deletion and removal of non-statutory personal data at any time by contacting partner-support@omnigo.in.',
  },
];

export default function PartnerPrivacyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#050810', '#0a1222', '#050810']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 10, 44) }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Partner Privacy Policy</Text>
          <Text style={styles.headerSubtitle}>Driver Data Protection</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom + 30, 40) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Badge Card */}
        <View style={styles.badgeCard}>
          <View style={styles.badgeIconBox}>
            <MaterialCommunityIcons name="shield-account" size={28} color="#00CFFF" />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.badgeTitle}>Driver & Partner Privacy</Text>
            <Text style={styles.badgeMeta}>Last updated: October 2026 · Version 2.4</Text>
          </View>
        </View>

        <Text style={styles.introText}>
          OmniGo values the privacy and safety of our towing partners. This policy outlines how your background location, KYC documents, vehicle inspection reports, and payout data are safeguarded.
        </Text>

        {/* Privacy Sections */}
        {PARTNER_PRIVACY_SECTIONS.map((sec) => (
          <View key={sec.id} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrap}>
                <MaterialCommunityIcons
                  name={sec.icon as any}
                  size={20}
                  color={THEME.colors.primary}
                />
              </View>
              <Text style={styles.sectionTitle}>{sec.title}</Text>
            </View>
            <Text style={styles.sectionBody}>{sec.content}</Text>
          </View>
        ))}

        {/* Footer Note */}
        <View style={styles.footerNote}>
          <Ionicons name="lock-closed" size={18} color="#00CFFF" />
          <Text style={styles.footerNoteText}>
            Questions regarding data rights or privacy practices? Contact our Data Protection Officer at privacy@omnigo.in.
          </Text>
        </View>

        {/* Got It Button */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#00CFFF', '#0077FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.actionGradient}
          >
            <Text style={styles.actionBtnText}>ACKNOWLEDGE PRIVACY POLICY</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
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
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: THEME.fonts.outfit.bold,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: THEME.fonts.inter.regular,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  content: {
    padding: 20,
  },
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Platform.OS === 'android' ? '#0d1428' : 'rgba(13, 20, 32, 0.75)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.25)',
    marginBottom: 16,
  },
  badgeIconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 207, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTitle: {
    fontSize: 15,
    fontFamily: THEME.fonts.outfit.bold,
    color: '#FFFFFF',
  },
  badgeMeta: {
    fontSize: 12,
    fontFamily: THEME.fonts.inter.regular,
    color: 'rgba(255, 255, 255, 0.55)',
    marginTop: 4,
  },
  introText: {
    fontSize: 13,
    fontFamily: THEME.fonts.inter.regular,
    color: 'rgba(255, 255, 255, 0.65)',
    lineHeight: 20,
    marginBottom: 20,
  },
  sectionCard: {
    backgroundColor: Platform.OS === 'android' ? '#0d1428' : 'rgba(13, 20, 32, 0.65)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 207, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: THEME.fonts.outfit.bold,
    color: '#FFFFFF',
    flex: 1,
  },
  sectionBody: {
    fontSize: 13,
    fontFamily: THEME.fonts.inter.regular,
    color: 'rgba(255, 255, 255, 0.72)',
    lineHeight: 20,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 207, 255, 0.08)',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.2)',
  },
  footerNoteText: {
    flex: 1,
    fontSize: 12,
    fontFamily: THEME.fonts.inter.regular,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
    marginLeft: 10,
  },
  actionBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  actionGradient: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 15,
    fontFamily: THEME.fonts.outfit.bold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});

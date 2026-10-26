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
import { useTheme } from '@/context/ThemeContext';

const PARTNER_TERMS = [
  {
    id: 1,
    icon: 'briefcase-check-outline',
    title: 'Independent Partner Agreement',
    content:
      'By registering as an OmniGo Towing Partner or Driver, you operate as an independent contractor and commercial service provider, not an employee. You have full discretion over your operating hours while upholding the quality, safety, and reliability standards established in this agreement.',
  },
  {
    id: 2,
    icon: 'card-account-details-star-outline',
    title: 'Partner Eligibility & Verification',
    content:
      'Partners must maintain an active commercial driving license (appropriate for medium/heavy towing vehicles), valid vehicle registration certificate (RC), commercial vehicle insurance, fitness certificate, and clean background verification. Any document expiration or suspension will pause dispatch eligibility.',
  },
  {
    id: 3,
    icon: 'camera-metering-center',
    title: 'Mandatory Pre-Inspection Protocol',
    content:
      'Drivers must verify the customer via OTP before initiating hookup and document the vehicle’s condition by taking a minimum of 4 timestamped pre-inspection photos covering all angles, existing dents, and odometer readings. Failure to document existing damages creates full liability for transit damage claims.',
  },
  {
    id: 4,
    icon: 'cash-sync',
    title: 'Earnings, Commission & Payouts',
    content:
      'OmniGo charges a transparent 15% platform technology fee on completed jobs. Earnings are deposited automatically every Tuesday to your registered bank account with zero withdrawal fees. Instant IMPS transfers are available 24/7 for eligible verified accounts. Waiting charges (+₹10/min after 5 free minutes) and customer no-show fees (₹150) are credited to your earnings wallet.',
  },
  {
    id: 5,
    icon: 'shield-alert-outline',
    title: 'Safety Equipment & Towing Protocol',
    content:
      'Partners must strictly adhere to road transport regulations and towing load limits. Flatbed ramps, safety chains, secondary safety straps, beacon hazard lights, and high-visibility reflective safety vests are mandatory on every dispatch. Misusing the in-app SOS emergency feature for non-emergencies is strictly prohibited.',
  },
  {
    id: 6,
    icon: 'cancel',
    title: 'Cancellation & Customer No-Show',
    content:
      'Once a job is accepted, drivers must proceed immediately to the pickup location. If a customer is unreachable upon arrival, drivers must wait a minimum of 5 minutes before submitting a No-Show claim to receive the ₹150 compensation fee. Unwarranted driver cancellations after acceptance affect dispatch priority and may incur penalty fees.',
  },
  {
    id: 7,
    icon: 'car-off',
    title: 'Vehicle Custody & Transit Liability',
    content:
      'During the tow transit from pickup spot to the designated drop-off workshop, the partner exercises care and custody over the customer’s vehicle. Any transit damage caused by improper wheel strap hookup, speeding, or negligence is the partner’s legal responsibility. OmniGo provides third-party claim arbitration assistance.',
  },
  {
    id: 8,
    icon: 'account-lock-outline',
    title: 'Code of Conduct & Deactivation',
    content:
      'OmniGo maintains zero tolerance for intoxication, harassment, off-app cash negotiations, charging rates higher than platform estimates, or sharing partner accounts. Violations result in immediate permanent account termination and forfeiture of pending platform incentives.',
  },
];

export default function PartnerTermsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={colors.gradient}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 10, 44) }]}>
        <TouchableOpacity
          style={[styles.backButton, !isDark && { backgroundColor: '#FFFFFF', borderColor: colors.cardBorder }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Partner Terms</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Towing Partner Agreement</Text>
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
        <View style={[styles.badgeCard, !isDark && { backgroundColor: '#FFFFFF', borderColor: colors.cardBorder }]}>
          <View style={styles.badgeIconBox}>
            <MaterialCommunityIcons name="tow-truck" size={28} color="#00FF97" />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={[styles.badgeTitle, { color: colors.text }]}>OmniGo Towing Partner Terms</Text>
            <Text style={[styles.badgeMeta, { color: colors.textSecondary }]}>Last updated: October 2026 · Version 2.4</Text>
          </View>
        </View>

        <Text style={[styles.introText, { color: colors.textSecondary }]}>
          Please read these Partner Terms of Service carefully before accepting dispatches on the OmniGo Partner Network. By registering as a driver or towing vendor, you agree to these legal conditions.
        </Text>

        {/* Terms Sections */}
        {PARTNER_TERMS.map((sec) => (
          <View key={sec.id} style={[styles.sectionCard, !isDark && { backgroundColor: '#FFFFFF', borderColor: colors.cardBorder }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrap}>
                <MaterialCommunityIcons
                  name={sec.icon as any}
                  size={20}
                  color={colors.primary}
                />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{sec.title}</Text>
            </View>
            <Text style={[styles.sectionBody, { color: colors.textSecondary }]}>{sec.content}</Text>
          </View>
        ))}

        {/* Footer Note */}
        <View style={styles.footerNote}>
          <Ionicons name="information-circle-outline" size={18} color="#00FF97" />
          <Text style={styles.footerNoteText}>
            For questions regarding partner compliance, contact Partner Support at partners@omnigo.in or via the 24/7 Partner Helpline.
          </Text>
        </View>

        {/* Got It Button */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#00FF97', '#00CC7A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.actionGradient}
          >
            <Text style={styles.actionBtnText}>I UNDERSTAND & AGREE</Text>
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
    borderColor: 'rgba(0, 255, 151, 0.25)',
    marginBottom: 16,
  },
  badgeIconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 255, 151, 0.12)',
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
    backgroundColor: 'rgba(0, 255, 151, 0.08)',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 151, 0.2)',
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
    color: '#000000',
    letterSpacing: 0.5,
  },
});

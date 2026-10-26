import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const TERMS_SECTIONS = [
  {
    id: 1,
    title: 'Acceptance of Terms',
    content: 'By creating an account or booking any service on OmniGo, you agree to these Terms of Service. If you do not accept these terms, you must not use the platform or request roadside services.',
  },
  {
    id: 2,
    title: 'Towing & Roadside Assistance Services',
    content: 'OmniGo connects stranded vehicle owners with qualified, independent towing and breakdown partners. Available services include flatbed towing, wheel-lift towing, accident vehicle recovery, battery jumpstarts, tire changes, and fuel delivery.',
  },
  {
    id: 3,
    title: 'Vehicle Ownership & Authority',
    content: 'By requesting a tow, you warrant that you are the registered owner of the vehicle or possess explicit legal authorization from the owner to arrange transport. The assigned driver may request to inspect the vehicle RC and your photo identification before hookup.',
  },
  {
    id: 4,
    title: 'Pre-Inspection & Damage Verification',
    content: 'Upon arriving at the pickup location, the assigned driver will conduct a mandatory digital pre-inspection documenting existing scratches, dents, and odometer readings. You have the right and duty to inspect these photos before providing your verification OTP.',
  },
  {
    id: 5,
    title: 'Fares, Surcharges & Waiting Charges',
    content: 'All fares are estimated transparently upfront based on base fee, distance, and vehicle category. A complimentary 5-minute waiting period begins when the driver arrives at your pickup location. Subsequent waiting is billed at ₹10/minute. Customer no-shows after 5 minutes of driver arrival incur a ₹150 cancellation charge.',
  },
  {
    id: 6,
    title: 'Cancellation & Refund Policy',
    content: 'You may cancel any dispatch request free of charge within 2 minutes of driver assignment. Cancellations after 2 minutes or after the driver has traveled significant distance incur a nominal dispatch cancellation fee to compensate the towing partner.',
  },
  {
    id: 7,
    title: 'Road Safety & Emergency SOS',
    content: 'While awaiting assistance, ensure your vehicle hazard blinkers are active and wait in a safe location away from oncoming traffic. The in-app SOS feature connects directly with local emergency helplines; fraudulent SOS alerts result in immediate account termination.',
  },
  {
    id: 8,
    title: 'Limitation of Liability',
    content: 'OmniGo operates as a technology aggregator. Independent towing operators are responsible for transit care. In the event of transit damage, OmniGo facilitates direct arbitration between your insurer and the partner’s commercial carrier insurance.',
  },
];

export default function TermsOfServiceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={colors.gradient}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20), borderBottomColor: colors.divider }]}>
        <TouchableOpacity
          style={[styles.backButton, !isDark && { backgroundColor: colors.pillBg }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Terms of Service</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 120 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.metaContainer}>
          <Ionicons name="document-text-outline" size={32} color="#00CFFF" style={styles.metaIcon} />
          <Text style={[styles.lastUpdatedText, { color: colors.textSecondary }]}>Last updated: August 1, 2026</Text>
          <Text style={[styles.introText, { color: colors.textSecondary }]}>
            Please read these terms carefully before using the OmniGo platform.
          </Text>
        </View>

        {TERMS_SECTIONS.map((section, index) => (
          <View key={section.id} style={[styles.glassCard, !isDark && { backgroundColor: '#FFFFFF', borderColor: colors.cardBorder }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{section.id}</Text>
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
            </View>
            <View style={[styles.separator, { backgroundColor: colors.divider }]} />
            <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>{section.content}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#00FF97', '#00CFFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.acceptButtonGradient}
          >
            <Text style={styles.acceptButtonText}>I Accept</Text>
            <Ionicons name="checkmark-circle-outline" size={22} color="#050810" />
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
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(5, 8, 16, 0.8)',
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Outfit_600SemiBold',
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  metaContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  metaIcon: {
    marginBottom: 12,
  },
  lastUpdatedText: {
    color: '#00FF97',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500',
    marginBottom: 8,
  },
  introText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  glassCard: {
    backgroundColor: 'rgba(13, 20, 32, 0.45)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    padding: 20,
    marginBottom: 20,
    shadowColor: '#00CFFF',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 207, 255, 0.15)',
    borderWidth: 1,
    borderColor: '#00CFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  badgeText: {
    color: '#00CFFF',
    fontSize: 14,
    fontFamily: 'Outfit_700Bold',
    fontWeight: 'bold',
  },
  sectionTitle: {
    flex: 1,
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Outfit_600SemiBold',
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 12,
  },
  sectionContent: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(5, 8, 16, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  acceptButton: {
    width: '100%',
    shadowColor: '#00FF97',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  acceptButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  acceptButtonText: {
    color: '#050810',
    fontSize: 18,
    fontFamily: 'Outfit_700Bold',
    fontWeight: '700',
    marginRight: 8,
  },
});

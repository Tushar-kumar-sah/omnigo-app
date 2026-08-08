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
import { theme } from '../../constants/theme';

const TERMS_SECTIONS = [
  {
    id: 1,
    title: 'Acceptance of Terms',
    content: 'By accessing or using the OmniGo towing and roadside assistance services, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, you must not access or use our services.',
  },
  {
    id: 2,
    title: 'Service Description',
    content: 'OmniGo provides a technology platform connecting users requiring emergency roadside assistance, towing, and related services with independent third-party service providers. We do not provide towing services directly.',
  },
  {
    id: 3,
    title: 'User Responsibilities',
    content: 'You must maintain accurate account information, ensure lawful use of the platform, not misuse the emergency SOS features, and agree to pay for all requested services. False emergency requests may lead to permanent account suspension.',
  },
  {
    id: 4,
    title: 'Payment Terms',
    content: 'Fares are calculated based on a base fee plus distance and service type. Estimates are provided before confirming a booking. Payments can be securely processed via UPI, Credit/Debit Cards, or Cash directly to the driver.',
  },
  {
    id: 5,
    title: 'Cancellation Policy',
    content: 'You may cancel a service request free of charge within 2 minutes of a driver being assigned. Cancellations made after this period may be subject to a 10% cancellation fee based on the estimated fare.',
  },
  {
    id: 6,
    title: 'Limitation of Liability',
    content: 'OmniGo shall not be liable for indirect, incidental, special, exemplary, punitive, or consequential damages, including lost profits or property damage related to, in connection with, or otherwise resulting from any use of the services.',
  },
  {
    id: 7,
    title: 'Changes to Terms',
    content: 'OmniGo reserves the right to modify these terms at any time. We will notify users of significant changes. Continued use of the platform after such modifications constitutes your consent to such changes.',
  },
];

export default function TermsOfServiceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#050810', '#0a1222', '#050810']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
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
          <Text style={styles.lastUpdatedText}>Last updated: August 1, 2026</Text>
          <Text style={styles.introText}>
            Please read these terms carefully before using the OmniGo platform.
          </Text>
        </View>

        {TERMS_SECTIONS.map((section, index) => (
          <View key={section.id} style={styles.glassCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{section.id}</Text>
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <View style={styles.separator} />
            <Text style={styles.sectionContent}>{section.content}</Text>
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

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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../constants/theme';

const PRIVACY_SECTIONS = [
  {
    id: 'collect',
    icon: 'card-account-details-outline',
    title: 'Information We Collect',
    content: 'We collect personal information that you provide to us including your name, phone number, email address, physical location, vehicle details, and payment information to facilitate our services.',
  },
  {
    id: 'use',
    icon: 'chart-box-outline',
    title: 'How We Use Your Data',
    content: 'Your data is strictly used to provide towing and roadside assistance services, match you with nearby drivers, process secure payments, provide customer support, and improve the overall app experience.',
  },
  {
    id: 'location',
    icon: 'map-marker-radius-outline',
    title: 'Location Data',
    content: 'We require access to your real-time GPS location while the app is in use to ensure accurate service delivery, enable trip tracking, and optimize the matching of drivers to your location.',
  },
  {
    id: 'share',
    icon: 'share-variant-outline',
    title: 'Data Sharing',
    content: 'We share necessary details (such as your name and pickup location) with assigned service providers. We also share data with payment processors and law enforcement agencies only when legally required.',
  },
  {
    id: 'security',
    icon: 'shield-lock-outline',
    title: 'Data Security',
    content: 'We employ industry-standard encryption protocols for data storage and secure transmission. Regular security audits are conducted to protect your personal information against unauthorized access.',
  },
  {
    id: 'rights',
    icon: 'account-cog-outline',
    title: 'Your Rights',
    content: 'You retain the right to access your personal data, request account deletion, opt-out of marketing communications, and export a copy of your data at any time through the app settings.',
  },
  {
    id: 'contact',
    icon: 'email-outline',
    title: 'Contact Us',
    content: 'For any privacy-related concerns or inquiries, you can reach out to our dedicated privacy team at privacy@omnigo.in or through our 24/7 customer support hotline.',
  },
];

export default function PrivacyPolicyScreen() {
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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.metaContainer}>
          <View style={styles.shieldContainer}>
            <MaterialCommunityIcons name="shield-check" size={48} color="#00FF97" />
            <View style={styles.glowEffect} />
          </View>
          <Text style={styles.lastUpdatedText}>Effective: August 1, 2026</Text>
          <Text style={styles.introText}>
            We value your privacy and are committed to protecting your personal information.
          </Text>
        </View>

        {PRIVACY_SECTIONS.map((section) => (
          <View key={section.id} style={styles.glassCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name={section.icon as any} size={24} color="#00CFFF" />
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <View style={styles.separator} />
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}
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
  shieldContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00FF97',
    opacity: 0.15,
    transform: [{ scale: 1.5 }],
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
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 207, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
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
});

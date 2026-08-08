import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME } from '../../constants/theme';
import { BlurView } from 'expo-blur';
import { mockIncomingJob } from '../../constants/mock-data';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function NavigationScreen() {
  const router = useRouter();
  const [jobState, setJobState] = useState<'EN_ROUTE_PICKUP' | 'AT_PICKUP' | 'TOWING'>('EN_ROUTE_PICKUP');

  const handleAction = () => {
    if (jobState === 'EN_ROUTE_PICKUP') {
      setJobState('AT_PICKUP');
    } else if (jobState === 'AT_PICKUP') {
      setJobState('TOWING');
    } else {
      router.replace('/job/complete');
    }
  };

  const getButtonText = () => {
    switch (jobState) {
      case 'EN_ROUTE_PICKUP': return 'ARRIVED AT PICKUP';
      case 'AT_PICKUP': return 'START TOWING';
      case 'TOWING': return 'COMPLETE JOB';
    }
  };

  return (
    <View style={styles.container}>
      {/* Fake Map */}
      <View style={styles.fakeMapGrid} />

      <View style={styles.headerBanner}>
        <LinearGradient
          colors={[THEME.colors.primary, THEME.colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.bannerGradient}
        >
          <Text style={styles.bannerText}>JOB ACCEPTED - {jobState === 'TOWING' ? 'Heading to Drop' : 'Heading to Pickup'}</Text>
        </LinearGradient>
      </View>

      <View style={styles.bottomCardContainer}>
        <BlurView intensity={40} tint="dark" style={styles.bottomCard}>
          <View style={styles.customerRow}>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{mockIncomingJob.customerName}</Text>
              <Text style={styles.vehicleInfo}>{mockIncomingJob.vehicleType}</Text>
            </View>
            <TouchableOpacity style={styles.callBtn}>
              <Ionicons name="call" size={20} color="#000" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.etaRow}>
            <Ionicons name="time-outline" size={24} color={THEME.colors.primary} />
            <Text style={styles.etaText}>Arriving in 4 mins (1.2 km)</Text>
          </View>
          
          <TouchableOpacity style={styles.actionBtn} onPress={handleAction}>
            <LinearGradient
              colors={jobState === 'TOWING' ? [THEME.colors.success, '#00CC7A'] : [THEME.colors.primary, THEME.colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btnGradient}
            >
              <Text style={styles.btnText}>{getButtonText()}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05070A',
  },
  fakeMapGrid: {
    flex: 1,
    opacity: 0.1,
    backgroundColor: '#05070A',
  },
  headerBanner: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    borderRadius: THEME.borderRadius.md,
    overflow: 'hidden',
    zIndex: 10,
  },
  bannerGradient: {
    padding: 12,
    alignItems: 'center',
  },
  bannerText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 14,
    color: '#000',
    letterSpacing: 1,
  },
  bottomCardContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  bottomCard: {
    backgroundColor: THEME.colors.glassBg,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    padding: 24,
  },
  customerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 20,
    color: THEME.colors.text,
  },
  vehicleInfo: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 14,
    color: THEME.colors.textSecondary,
    marginTop: 4,
  },
  callBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 16,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  etaText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 16,
    color: THEME.colors.text,
    marginLeft: 12,
  },
  actionBtn: {
    borderRadius: THEME.borderRadius.md,
    overflow: 'hidden',
  },
  btnGradient: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 16,
    color: '#000',
    letterSpacing: 1,
  }
});

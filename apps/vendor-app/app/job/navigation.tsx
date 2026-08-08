import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { THEME } from '../../constants/theme';
import { BlurView } from 'expo-blur';
import { mockIncomingJob, CANCEL_REASONS } from '../../constants/mock-data';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

type NavState = 'EN_ROUTE_PICKUP' | 'AT_PICKUP';

export default function NavigationScreen() {
  const router = useRouter();
  const [navState, setNavState] = useState<NavState>('EN_ROUTE_PICKUP');
  const [cancelModalVisible, setCancelModalVisible] = useState(false);

  const handleMainAction = () => {
    if (navState === 'EN_ROUTE_PICKUP') {
      setNavState('AT_PICKUP');
    } else {
      router.push('/job/arrival-verify');
    }
  };

  const handleCancelReason = (reason: string) => {
    setCancelModalVisible(false);
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      {/* Fake Map Background */}
      <View style={styles.fakeMapGrid}>
        {Array.from({ length: 400 }).map((_, i) => (
          <View key={i} style={styles.mapDot} />
        ))}
      </View>

      {/* Top Banner */}
      <LinearGradient
        colors={[THEME.colors.background, 'transparent']}
        style={styles.topBannerContainer}
      >
        <View style={styles.topBanner}>
          <Ionicons 
            name={navState === 'EN_ROUTE_PICKUP' ? 'navigate-circle' : 'location'} 
            size={24} 
            color={THEME.colors.primary} 
          />
          <View style={styles.topBannerTextContainer}>
            <Text style={styles.topBannerTitle}>
              {navState === 'EN_ROUTE_PICKUP' ? 'En Route to Pickup' : 'Arrived at Pickup'}
            </Text>
            <Text style={styles.topBannerSub}>
              {navState === 'EN_ROUTE_PICKUP' ? `Head to ${mockIncomingJob.pickup}` : 'Wait for customer or contact them'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Bottom Card */}
      <View style={styles.bottomContainer}>
        <BlurView intensity={80} tint="dark" style={styles.card}>
          <View style={styles.customerHeader}>
            <View>
              <Text style={styles.customerName}>{mockIncomingJob.customerName}</Text>
              <Text style={styles.customerPhone}>{mockIncomingJob.customerPhone}</Text>
            </View>
            <View style={styles.contactActions}>
              <TouchableOpacity style={[styles.circleBtn, { backgroundColor: 'rgba(0, 207, 255, 0.15)' }]}>
                <Ionicons name="chatbubble" size={20} color={THEME.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.circleBtn, { backgroundColor: 'rgba(0, 255, 151, 0.15)' }]}>
                <Ionicons name="call" size={20} color={THEME.colors.success} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.vehicleChipsContainer}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{mockIncomingJob.vehicleMake} {mockIncomingJob.vehicleModel}</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{mockIncomingJob.vehicleColor}</Text>
            </View>
            <View style={[styles.chip, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <Text style={[styles.chipText, { fontFamily: THEME.fonts.inter.bold }]}>
                {mockIncomingJob.vehiclePlate}
              </Text>
            </View>
          </View>

          <View style={styles.etaRow}>
            <Ionicons name="time-outline" size={20} color={THEME.colors.primary} />
            <Text style={styles.etaText}>
              {navState === 'EN_ROUTE_PICKUP' 
                ? `Arriving in ${mockIncomingJob.eta} (${mockIncomingJob.pickupDistance})` 
                : 'Waiting for Customer'}
            </Text>
          </View>

          <TouchableOpacity style={styles.mainActionBtn} onPress={handleMainAction}>
            <LinearGradient
              colors={navState === 'EN_ROUTE_PICKUP' 
                ? [THEME.colors.primary, THEME.colors.secondary] 
                : [THEME.colors.success, '#00CC7A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btnGradient}
            >
              <Text style={styles.mainActionBtnText}>
                {navState === 'EN_ROUTE_PICKUP' ? 'ARRIVED AT PICKUP' : 'VERIFY CUSTOMER'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cancelBtn} 
            onPress={() => setCancelModalVisible(true)}
          >
            <Text style={styles.cancelBtnText}>Cancel Job</Text>
          </TouchableOpacity>
        </BlurView>
      </View>

      {/* Cancel Reasons Modal */}
      <Modal
        visible={cancelModalVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cancel Job</Text>
            <Text style={styles.modalSub}>Please select a reason for cancellation:</Text>
            
            {CANCEL_REASONS.map((reason, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.reasonRow}
                onPress={() => handleCancelReason(reason)}
              >
                <Text style={styles.reasonText}>{reason}</Text>
                <Ionicons name="chevron-forward" size={20} color={THEME.colors.textSecondary} />
              </TouchableOpacity>
            ))}

            <TouchableOpacity 
              style={styles.closeModalBtn} 
              onPress={() => setCancelModalVisible(false)}
            >
              <Text style={styles.closeModalText}>Close</Text>
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
  fakeMapGrid: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    flexWrap: 'wrap',
    opacity: 0.15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapDot: {
    width: 2,
    height: 2,
    backgroundColor: THEME.colors.primary,
    margin: 15,
    borderRadius: 1,
  },
  topBannerContainer: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  topBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.glassBg,
    borderRadius: THEME.borderRadius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
  },
  topBannerTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  topBannerTitle: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 18,
    color: THEME.colors.text,
  },
  topBannerSub: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 14,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    overflow: 'hidden',
    padding: 24,
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  customerName: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 22,
    color: THEME.colors.text,
  },
  customerPhone: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 14,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  contactActions: {
    flexDirection: 'row',
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  vehicleChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.full,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  chipText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 13,
    color: THEME.colors.text,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 207, 255, 0.05)',
    padding: 12,
    borderRadius: THEME.borderRadius.sm,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.15)',
  },
  etaText: {
    fontFamily: THEME.fonts.inter.bold,
    fontSize: 15,
    color: THEME.colors.text,
    marginLeft: 8,
  },
  mainActionBtn: {
    borderRadius: THEME.borderRadius.md,
    overflow: 'hidden',
    marginBottom: 16,
  },
  btnGradient: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainActionBtnText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 18,
    color: '#000',
    letterSpacing: 1,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelBtnText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 15,
    color: THEME.colors.danger,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: THEME.colors.surfaceDark,
    borderRadius: THEME.borderRadius.lg,
    padding: 24,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  modalTitle: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 22,
    color: THEME.colors.text,
    marginBottom: 8,
  },
  modalSub: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 15,
    color: THEME.colors.textSecondary,
    marginBottom: 20,
  },
  reasonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  reasonText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 16,
    color: THEME.colors.text,
  },
  closeModalBtn: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: THEME.borderRadius.md,
  },
  closeModalText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 16,
    color: THEME.colors.text,
  },
});

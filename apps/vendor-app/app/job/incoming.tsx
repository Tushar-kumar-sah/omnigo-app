import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, ScrollView } from 'react-native';
import { THEME } from '../../constants/theme';
import { BlurView } from 'expo-blur';

import { getBookingById, assignDriver, updateBookingStatus, Booking, getPricingRules } from '@omnigo/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function IncomingJobScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [timeLeft, setTimeLeft] = useState(20);
  const [showEarningsBreakdown, setShowEarningsBreakdown] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [pricingRules, setPricingRules] = useState<any>(null);

  const jobId = (params.id as string);
  const DRIVER_ID = 'b0000000-0000-0000-0000-000000000001'; // TODO: Replace with authenticated driver ID

  useEffect(() => {
    async function loadData() {
      try {
        const b = await getBookingById(jobId);
        setBooking(b);
        const p = await getPricingRules();
        setPricingRules(p);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, [jobId]);

  useEffect(() => {
    if (timeLeft <= 0) {
      router.back();
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, router]);

  const handleAccept = async () => {
    try {
      await assignDriver(jobId, DRIVER_ID);
      await updateBookingStatus(jobId, 'driver_assigned');
      router.replace({ pathname: '/job/navigation', params: { id: jobId } });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDecline = () => {
    router.back();
  };

  const jobData = booking ? {
    eta: booking.estimatedETA ? `${booking.estimatedETA} mins` : '—',
    pickupDistance: booking.distance ? `${booking.distance} km` : '—',
    driverEarnings: `₹${booking.finalPrice || booking.estimatedPrice || 0}`,
    customerPayment: `₹${booking.finalPrice || booking.estimatedPrice || 0}`,
    platformFee: '₹0',
    baseFare: `₹${Math.round((booking.estimatedPrice || 0) * 0.7)}`,
    distanceFare: `₹${Math.round((booking.estimatedPrice || 0) * 0.2)}`,
    tip: '₹0',
    platformCommissionRate: '10%',
    customerName: 'Customer',
    vehicleMake: booking.customerVehicle?.brand || '',
    vehicleModel: booking.customerVehicle?.model || '',
    vehicleColor: 'White',
    vehiclePlate: booking.customerVehicle?.number || '—',
    vehicleType: booking.vehicleTypeId || '—',
    pickup: booking.pickup?.address || '—',
    drop: booking.dropoff?.address || '—',
    distance: booking.distance ? `${booking.distance} km` : '—',
    waitingChargeRule: pricingRules?.waitingChargePerMin ? `₹${pricingRules.waitingChargePerMin} per minute` : '₹50 for every 15 mins',
    cancellationPenaltyRule: '₹100 if cancelled after 5 mins'
  } : null;

  if (!jobData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#fff' }}>Loading...</Text>
      </View>
    );
  }

  const vehicleIcon = 'car-outline';

  return (
    <View style={styles.container}>
      <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{timeLeft}s</Text>
          </View>
          
          <View style={styles.card}>
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.etaText}>Pickup in {jobData.eta}</Text>
                <Text style={styles.pickupDistText}>{jobData.pickupDistance} away</Text>
              </View>
            </View>

            {/* Fare Summary & Breakdown */}
            <Pressable onPress={() => setShowEarningsBreakdown(!showEarningsBreakdown)} style={styles.fareSummaryBar}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fareSummaryLabel}>Your Net Earnings</Text>
                <Text style={styles.priceText}>{jobData.driverEarnings}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', flexShrink: 1, marginLeft: 8 }}>
                <Text style={styles.customerPayText}>Customer: {jobData.customerPayment}</Text>
                <Text style={styles.platformFeeText}>Fee: -{jobData.platformFee}</Text>
              </View>
            </Pressable>

            {showEarningsBreakdown && (
              <View style={styles.breakdownBox}>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Customer Total Payment</Text>
                  <Text style={styles.breakdownVal}>{jobData.customerPayment}</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Base Towing Fare</Text>
                  <Text style={styles.breakdownVal}>{jobData.baseFare}</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Distance</Text>
                  <Text style={styles.breakdownVal}>{jobData.distanceFare}</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Direct Customer Tip</Text>
                  <Text style={[styles.breakdownVal, { color: THEME.colors.success }]}>+{jobData.tip}</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>OmniGo Fee ({jobData.platformCommissionRate})</Text>
                  <Text style={[styles.breakdownVal, { color: THEME.colors.danger }]}>-{jobData.platformFee}</Text>
                </View>
                <View style={styles.breakdownDivider} />
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownTotalLabel}>Net Take-Home Earnings</Text>
                  <Text style={styles.breakdownTotalVal}>{jobData.driverEarnings}</Text>
                </View>
              </View>
            )}
            
            <View style={styles.divider} />
            
            <View style={styles.customerRow}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.customerName}>{jobData.customerName}</Text>
                <Text style={styles.vehicleDetails}>
                  {jobData.vehicleMake} {jobData.vehicleModel} • {jobData.vehicleColor}
                </Text>
                <Text style={styles.vehiclePlate}>{jobData.vehiclePlate}</Text>
              </View>
              <View style={styles.vehicleTypeBadge}>
                <Ionicons name={vehicleIcon as any} size={20} color={THEME.colors.primary} />
              </View>
            </View>
            
            <View style={styles.locationContainer}>
              <View style={styles.locRow}>
                <Ionicons name="radio-button-on" size={18} color={THEME.colors.primary} />
                <Text style={styles.locText} numberOfLines={1}>{jobData.pickup}</Text>
              </View>
              <View style={styles.locLineContainer}>
                <View style={styles.locDot} />
                <View style={styles.locDot} />
                <View style={styles.locDot} />
              </View>
              <View style={styles.locRow}>
                <Ionicons name="location" size={18} color={THEME.colors.danger} />
                <Text style={styles.locText} numberOfLines={1}>{jobData.drop}</Text>
              </View>
            </View>
            
            <View style={styles.distanceBox}>
              <Ionicons name="navigate-outline" size={15} color={THEME.colors.textSecondary} />
              <Text style={styles.distanceText}>Total Trip Distance: {jobData.distance}</Text>
            </View>

            {/* Cancellation Rules & Waiting-Time Notice */}
            <View style={styles.policyNoticeBox}>
              <View style={styles.policyRow}>
                <Ionicons name="time-outline" size={13} color={THEME.colors.primary} style={{ marginTop: 2 }} />
                <Text style={styles.policyText}><Text style={{ color: '#fff', fontFamily: THEME.fonts.inter.bold }}>Waiting:</Text> {jobData.waitingChargeRule}</Text>
              </View>
              <View style={[styles.policyRow, { marginTop: 6 }]}>
                <Ionicons name="shield-checkmark-outline" size={13} color={THEME.colors.warning} style={{ marginTop: 2 }} />
                <Text style={styles.policyText}><Text style={{ color: '#fff', fontFamily: THEME.fonts.inter.bold }}>Rules:</Text> {jobData.cancellationPenaltyRule}</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept} activeOpacity={0.8}>
              <LinearGradient
                colors={[THEME.colors.success, '#00CC7A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btnGradient}
              >
                <Text style={styles.acceptBtnText}>ACCEPT JOB</Text>
                <Ionicons name="chevron-forward-outline" size={22} color="#000" />
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.declineBtn} onPress={handleDecline} activeOpacity={0.7}>
              <Text style={styles.declineBtnText}>DECLINE (NO PENALTY)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050810',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingVertical: 40,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  timerContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.colors.glassBg,
    borderWidth: 2,
    borderColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -32,
    zIndex: 10,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  timerText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 22,
    color: THEME.colors.text,
  },
  card: {
    width: '100%',
    backgroundColor: THEME.colors.glassBg,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    padding: 20,
    paddingTop: 44,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  etaText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 20,
    color: THEME.colors.primary,
  },
  pickupDistText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 14,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 151, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 151, 0.3)',
  },
  priceText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 22,
    color: THEME.colors.success,
  },
  breakdownBox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: THEME.borderRadius.md,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 14,
    color: THEME.colors.textSecondary,
  },
  breakdownVal: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 14,
    color: THEME.colors.text,
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 8,
  },
  breakdownTotalLabel: {
    fontFamily: THEME.fonts.inter.bold,
    fontSize: 14,
    color: THEME.colors.text,
  },
  breakdownTotalVal: {
    fontFamily: THEME.fonts.inter.bold,
    fontSize: 14,
    color: THEME.colors.success,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
  },
  customerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  customerName: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 20,
    color: THEME.colors.text,
    marginBottom: 4,
  },
  vehicleDetails: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 14,
    color: THEME.colors.textSecondary,
    marginBottom: 4,
  },
  vehiclePlate: {
    fontFamily: THEME.fonts.inter.bold,
    fontSize: 14,
    color: THEME.colors.text,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  vehicleTypeBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 207, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationContainer: {
    marginBottom: 20,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 16,
    color: THEME.colors.text,
    marginLeft: 12,
    flex: 1,
  },
  locLineContainer: {
    marginLeft: 9,
    marginVertical: 4,
    width: 2,
    alignItems: 'center',
  },
  locDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME.colors.textSecondary,
    marginVertical: 2,
  },
  distanceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: THEME.borderRadius.sm,
    marginBottom: 24,
  },
  distanceText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 14,
    color: THEME.colors.textSecondary,
    marginLeft: 8,
  },
  acceptBtn: {
    borderRadius: THEME.borderRadius.md,
    overflow: 'hidden',
    shadowColor: THEME.colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    marginBottom: 16,
  },
  btnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
  },
  acceptBtnText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 18,
    color: '#000',
    letterSpacing: 1,
    marginRight: 8,
  },
  fareSummaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 151, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 151, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  fareSummaryLabel: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  customerPayText: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 12,
    color: THEME.colors.text,
  },
  platformFeeText: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 11,
    color: THEME.colors.danger,
  },
  policyNoticeBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: THEME.borderRadius.sm,
    padding: 10,
    marginBottom: 16,
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  policyText: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 11,
    color: THEME.colors.textSecondary,
    flex: 1,
  },
  declineBtn: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.danger,
    backgroundColor: 'rgba(255, 51, 102, 0.05)',
  },
  declineBtnText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 14,
    color: THEME.colors.danger,
    letterSpacing: 1,
  }
});

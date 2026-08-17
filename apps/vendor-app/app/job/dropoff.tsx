import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';

import { updateBookingStatus, createLedgerEntry, getLedgerByBooking, getBookingById, Booking } from '@omnigo/api';
import { useLocalSearchParams } from 'expo-router';

export default function DropoffScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobId = (params.id as string);
  const DRIVER_ID = 'b0000000-0000-0000-0000-000000000001'; // TODO: Replace with authenticated driver ID

  const [booking, setBooking] = useState<Booking | null>(null);
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const b = await getBookingById(jobId);
        setBooking(b);
        const l = await getLedgerByBooking(jobId);
        setLedgerEntries(l);
      } catch (e) { console.error(e); }
    }
    loadData();
  }, [jobId]);

  const canComplete = true;

  const handleComplete = async () => {
    try {
      const totalAmount = booking?.finalPrice || booking?.estimatedPrice || 0;
      await updateBookingStatus(jobId, 'completed', { finalPrice: totalAmount });
      if (booking) {
        await createLedgerEntry({
          bookingId: jobId,
          driverId: DRIVER_ID,
          amount: totalAmount,
          type: 'credit',
          description: `Trip ${jobId} Net Earning`,
          status: 'Completed'
        });
      }
      router.push({ pathname: '/job/complete', params: { id: jobId } });
    } catch (e) {
      console.error(e);
      router.push({ pathname: '/job/complete', params: { id: jobId } });
    }
  };

  const jobData = booking ? {
    distance: booking.distance ? `${booking.distance} km` : '—',
    duration: booking.estimatedETA ? `${booking.estimatedETA} mins` : '—',
    vehiclePlate: booking.customerVehicle?.number || '—',
    customerPayment: `₹${booking.finalPrice || booking.estimatedPrice || 0}`,
    platformFee: '₹0',
    platformCommissionRate: '10%',
    tip: '₹0',
    driverEarnings: `₹${booking.finalPrice || booking.estimatedPrice || 0}`
  } : null;

  if (!jobData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#fff' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Drop-off & Payment</Text>

        <BlurView intensity={25} tint="dark" style={styles.statusBadge}>
          <View style={styles.statusIconCircle}>
            <Ionicons name="shield-checkmark" size={24} color={THEME.colors.success} />
          </View>
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusTitle}>Vehicle Safely Delivered</Text>
            <Text style={styles.statusSubtitle}>Arrived at destination. Tow rig uncoupled and vehicle safely handed over.</Text>
          </View>
        </BlurView>

        {/* 1. Trip Summary */}
        <BlurView intensity={20} tint="dark" style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Distance</Text>
              <Text style={styles.summaryValue}>{jobData.distance}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Duration</Text>
              <Text style={styles.summaryValue}>{jobData.duration}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Vehicle</Text>
              <Text style={styles.summaryValue}>{jobData.vehiclePlate}</Text>
            </View>
          </View>
        </BlurView>

        {/* 2. OmniGo Gateway & Ledger Breakdown */}
        <BlurView intensity={20} tint="dark" style={styles.sectionCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="shield-checkmark" size={18} color="#00FF97" />
              <Text style={styles.sectionTitle}>OmniGo Ledger & Settlement</Text>
            </View>
            <View style={{ backgroundColor: 'rgba(0, 255, 151, 0.12)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
              <Text style={{ fontFamily: THEME.fonts.inter.bold, fontSize: 10, color: THEME.colors.success }}>PAID VIA GATEWAY</Text>
            </View>
          </View>
          
          <View style={styles.breakdownBox}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>1. Customer Payment (Gross)</Text>
              <Text style={styles.breakdownVal}>{jobData.customerPayment}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>2. Booking ID</Text>
              <Text style={[styles.breakdownVal, { color: THEME.colors.text }]}>{jobId}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>3. Payment ID</Text>
              <Text style={[styles.breakdownVal, { color: THEME.colors.primary }]}>{booking?.id ? 'PAY-' + booking.id.slice(0,8).toUpperCase() : 'PAY-PENDING'}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>4. OmniGo Commission ({jobData.platformCommissionRate})</Text>
              <Text style={[styles.breakdownVal, { color: THEME.colors.danger }]}>-{jobData.platformFee}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>5. Customer Direct Tip (100% Pass-through)</Text>
              <Text style={[styles.breakdownVal, { color: THEME.colors.success }]}>+{jobData.tip}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownTotalLabel}>6. Net Credited to Partner Ledger</Text>
              <Text style={styles.breakdownTotalVal}>{jobData.driverEarnings}</Text>
            </View>
          </View>

          {/* Ledger & Settlement Status Pill */}
          <View style={styles.paymentStatus}>
            <Ionicons name="checkmark-circle" size={18} color={THEME.colors.success} />
            <Text style={styles.paymentStatusText}>
              Credited to Partner Ledger · Next Auto-Payout on Tuesday
            </Text>
          </View>
        </BlurView>
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleComplete} disabled={!canComplete}>
          <LinearGradient
            colors={canComplete ? [THEME.colors.success, '#00CC7A'] : ['#333', '#222']}
            style={styles.btn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.btnText}>COMPLETE JOB & RATE</Text>
            <Ionicons name="checkmark-done" size={24} color={canComplete ? "#000" : "#666"} />
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
  scrollContent: {
    padding: THEME.spacing.md,
    paddingTop: 64,
  },
  title: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 28,
    color: THEME.colors.text,
    marginBottom: THEME.spacing.lg,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 151, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 255, 151, 0.3)',
    borderRadius: THEME.borderRadius.lg,
    padding: 16,
    marginBottom: THEME.spacing.md,
    overflow: 'hidden',
  },
  statusIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 255, 151, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    flexShrink: 0,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 151, 0.3)',
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontFamily: THEME.fonts.outfit.bold,
    color: THEME.colors.success,
    fontSize: 16,
    marginBottom: 2,
  },
  statusSubtitle: {
    fontFamily: THEME.fonts.inter.regular,
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    lineHeight: 16,
  },
  summaryCard: {
    backgroundColor: THEME.colors.glassBg,
    borderColor: THEME.colors.glassBorder,
    borderWidth: 1,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    overflow: 'hidden',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontFamily: THEME.fonts.inter.regular,
    color: THEME.colors.textSecondary,
    fontSize: 13,
  },
  summaryValue: {
    fontFamily: THEME.fonts.outfit.bold,
    color: THEME.colors.primary,
    fontSize: 16,
    marginTop: THEME.spacing.xs,
  },
  sectionCard: {
    backgroundColor: THEME.colors.glassBg,
    borderColor: THEME.colors.glassBorder,
    borderWidth: 1,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 18,
    color: THEME.colors.text,
    marginBottom: THEME.spacing.xs,
  },
  subtitle: {
    fontFamily: THEME.fonts.inter.regular,
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.md,
    fontSize: 13,
  },
  breakdownBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: THEME.borderRadius.sm,
    padding: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  breakdownLabel: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 13,
    color: THEME.colors.textSecondary,
    flex: 1,
    paddingRight: 8,
  },
  breakdownVal: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 13,
    color: THEME.colors.text,
    textAlign: 'right',
    flexShrink: 0,
  },
  breakdownTotalLabel: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 14,
    color: '#fff',
    flex: 1,
  },
  breakdownTotalVal: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 16,
    color: THEME.colors.success,
    textAlign: 'right',
    flexShrink: 0,
  },
  paymentTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  paymentTotalLabel: {
    fontFamily: THEME.fonts.inter.medium,
    color: THEME.colors.text,
    fontSize: 16,
  },
  paymentTotalValue: {
    fontFamily: THEME.fonts.outfit.bold,
    color: THEME.colors.success,
    fontSize: 24,
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: THEME.spacing.sm,
    marginBottom: THEME.spacing.md,
  },
  methodBtn: {
    flex: 1,
    padding: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    alignItems: 'center',
  },
  methodBtnActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: 'rgba(0, 207, 255, 0.1)',
  },
  methodText: {
    fontFamily: THEME.fonts.inter.medium,
    color: THEME.colors.textSecondary,
  },
  methodTextActive: {
    color: THEME.colors.primary,
  },
  paymentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
    backgroundColor: 'rgba(0, 255, 151, 0.1)',
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.sm,
    justifyContent: 'center',
  },
  paymentStatusText: {
    fontFamily: THEME.fonts.outfit.medium,
    color: THEME.colors.success,
    fontSize: 16,
  },
  cashSection: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.sm,
    borderColor: THEME.colors.warning,
    borderWidth: 1,
  },
  cashPrompt: {
    fontFamily: THEME.fonts.outfit.medium,
    color: THEME.colors.warning,
    fontSize: 16,
    marginBottom: THEME.spacing.md,
  },
  cashBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: THEME.colors.warning,
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.md,
    borderRadius: THEME.borderRadius.full,
  },
  cashBtnCollected: {
    backgroundColor: THEME.colors.warning,
  },
  cashBtnText: {
    fontFamily: THEME.fonts.outfit.bold,
    color: THEME.colors.text,
  },
  bottomSpacer: {
    height: 100,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: THEME.spacing.md,
    backgroundColor: THEME.colors.background,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.glassBorder,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    gap: THEME.spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 8,
  },
  btnText: {
    color: '#000',
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 16,
  }
});

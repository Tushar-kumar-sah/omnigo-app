import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  updateBookingStatus,
  createLedgerEntry,
  getLedgerByBooking,
  getBookingById,
  Booking,
} from '@omnigo/api';
import { getAuthenticatedDriverId } from '@/lib/auth';

export default function DropoffScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobId = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      if (!jobId) return;
      try {
        const b = await getBookingById(jobId);
        setBooking(b);
        const l = await getLedgerByBooking(jobId);
        setLedgerEntries(l);
      } catch (e) {
        console.error('[DropoffScreen] loadData error:', e);
      }
    }
    loadData();
  }, [jobId]);

  const handleComplete = async () => {
    try {
      const grossFare = Number(booking?.finalPrice || booking?.estimatedPrice || 1350);
      const commissionRate = 0.10;
      const commissionAmount = Math.round(grossFare * commissionRate);
      const netEarning = grossFare - commissionAmount;
      const effectiveDriverId = booking?.driverId || getAuthenticatedDriverId();

      await updateBookingStatus(jobId, 'completed', { finalPrice: grossFare });
      if (booking) {
        await createLedgerEntry({
          bookingId: jobId,
          driverId: effectiveDriverId,
          grossCustomerFare: grossFare,
          commissionRate: commissionRate,
          commissionAmount: commissionAmount,
          driverGrossEarning: grossFare,
          driverNetEarning: netEarning,
          amount: netEarning,
          type: 'credit',
          description: `Trip Earnings - ${booking.bookingNumber || jobId.slice(0, 8).toUpperCase()}`,
          status: 'Completed',
          settlementStatus: 'unsettled',
        });
      }
      router.push({ pathname: '/job/complete', params: { id: jobId } });
    } catch (e) {
      console.error('[DropoffScreen] handleComplete error:', e);
      router.push({ pathname: '/job/complete', params: { id: jobId } });
    }
  };

  const grossFare = Number(booking?.finalPrice || booking?.estimatedPrice || 1350);
  const commissionRate = 0.10;
  const commissionAmount = Math.round(grossFare * commissionRate);
  const netEarnings = grossFare - commissionAmount;

  // Clean distance formatting (prevent "8 km km")
  const formatDistance = (val: any) => {
    if (!val) return '8.2 km';
    const s = String(val).trim();
    if (s.toLowerCase().endsWith('km')) return s;
    const num = parseFloat(s);
    return isNaN(num) ? s : `${num} km`;
  };

  // Clean duration formatting
  const formatDuration = (val: any, distVal: any) => {
    if (val) {
      const s = String(val).trim();
      return s.toLowerCase().endsWith('min') || s.toLowerCase().endsWith('mins') ? s : `${s} mins`;
    }
    const d = parseFloat(String(distVal || ''));
    if (!isNaN(d) && d > 0) {
      return `${Math.max(12, Math.round(d * 2.5))} mins`;
    }
    return '18 mins';
  };

  // Clean vehicle registration formatting
  const getVehicleInfo = (b: any) => {
    if (!b) return 'Customer Vehicle';
    const c = b.customerVehicle;
    if (c?.number) return c.number;
    if (c?.plate) return c.plate;
    if (b.vehiclePlate) return b.vehiclePlate;
    if (b.vehicle_number) return b.vehicle_number;
    if (c?.brand || c?.model) return `${c.brand || ''} ${c.model || ''}`.trim();
    return 'WB-02-AB-4819';
  };

  const distanceFormatted = formatDistance(booking?.distance);
  const durationFormatted = formatDuration(booking?.estimatedETA, booking?.distance);
  const vehicleFormatted = getVehicleInfo(booking);

  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 36 : 16) + 14;

  return (
    <View style={styles.container}>
      {/* 1. Fixed Top Header Bar with Safe Area Inset */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, 48) }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={THEME.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Drop-off & Payment</Text>
          <Text style={styles.headerSub}>Trip Settlement & Handover</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* 2. Scrollable Body Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Badge */}
        <BlurView intensity={25} tint="dark" style={styles.statusBadge}>
          <View style={styles.statusIconCircle}>
            <Ionicons name="shield-checkmark" size={24} color={THEME.colors.success} />
          </View>
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusTitle}>Vehicle Safely Delivered</Text>
            <Text style={styles.statusSubtitle}>
              Arrived at destination. Tow rig uncoupled and vehicle safely handed over.
            </Text>
          </View>
        </BlurView>

        {/* Trip Summary Telemetry Card */}
        <BlurView intensity={20} tint="dark" style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Distance</Text>
              <Text style={styles.summaryValue}>{distanceFormatted}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Duration</Text>
              <Text style={styles.summaryValue}>{durationFormatted}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Vehicle</Text>
              <Text style={styles.summaryValue} numberOfLines={1}>{vehicleFormatted}</Text>
            </View>
          </View>
        </BlurView>

        {/* OmniGo Ledger & Settlement Breakdown Card */}
        <BlurView intensity={20} tint="dark" style={styles.sectionCard}>
          {/* Card Header Row */}
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="receipt-outline" size={18} color={THEME.colors.primary} />
              <Text style={styles.sectionTitle}>Ledger & Settlement</Text>
            </View>
            <View style={styles.paidBadge}>
              <Ionicons name="checkmark-circle" size={13} color={THEME.colors.success} />
              <Text style={styles.paidBadgeText}>PAID ONLINE</Text>
            </View>
          </View>

          {/* Breakdown Items Box */}
          <View style={styles.breakdownBox}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>1. Customer Fare (Gross)</Text>
              <Text style={styles.breakdownVal}>₹{grossFare}</Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>2. Booking Reference</Text>
              <Text style={[styles.breakdownVal, { color: THEME.colors.text }]}>
                #{booking?.bookingNumber || (jobId ? jobId.slice(0, 8).toUpperCase() : 'BK-1082')}
              </Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>3. Payment Reference</Text>
              <Text style={[styles.breakdownVal, { color: THEME.colors.primary }]}>
                PAY-{(jobId ? jobId.slice(0, 8) : '1CB13299').toUpperCase()}
              </Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>4. Platform Fee (10%)</Text>
              <Text style={[styles.breakdownVal, { color: THEME.colors.danger }]}>
                -₹{commissionAmount}
              </Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>5. Customer Tip (100% to Driver)</Text>
              <Text style={[styles.breakdownVal, { color: THEME.colors.success }]}>+₹0</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownTotalLabel}>6. Net Credited to Partner Ledger</Text>
              <Text style={styles.breakdownTotalVal}>₹{netEarnings}</Text>
            </View>
          </View>

          {/* Settlement Status Pill */}
          <View style={styles.paymentStatus}>
            <Ionicons name="wallet-outline" size={18} color={THEME.colors.success} />
            <Text style={styles.paymentStatusText}>
              Credited to Partner Ledger · Auto-Payout on Tuesday
            </Text>
          </View>
        </BlurView>
      </ScrollView>

      {/* 3. Docked Bottom Action Footer (Non-Absolute Flex Layout) */}
      <View style={[styles.footer, { paddingBottom: bottomInset }]}>
        <TouchableOpacity
          style={styles.completeBtnTouchable}
          onPress={handleComplete}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[THEME.colors.success, '#00CC7A']}
            style={styles.btn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.btnText}>COMPLETE JOB & RATE</Text>
            <Ionicons name="checkmark-done" size={22} color="#000" />
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 151, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 255, 151, 0.3)',
    borderRadius: THEME.borderRadius.lg,
    padding: 16,
    marginBottom: 14,
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
    borderRadius: THEME.borderRadius.lg,
    padding: 14,
    marginBottom: 14,
    overflow: 'hidden',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  summaryLabel: {
    fontFamily: THEME.fonts.inter.regular,
    color: THEME.colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    fontFamily: THEME.fonts.outfit.bold,
    color: THEME.colors.primary,
    fontSize: 15,
  },
  sectionCard: {
    backgroundColor: THEME.colors.glassBg,
    borderColor: THEME.colors.glassBorder,
    borderWidth: 1,
    borderRadius: THEME.borderRadius.lg,
    padding: 16,
    marginBottom: 14,
    overflow: 'hidden',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  sectionTitle: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 16,
    color: THEME.colors.text,
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 255, 151, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 151, 0.3)',
  },
  paidBadgeText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 11,
    color: THEME.colors.success,
    letterSpacing: 0.3,
  },
  breakdownBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: THEME.borderRadius.md,
    padding: 14,
    marginBottom: 14,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
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
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 8,
  },
  breakdownTotalLabel: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 14,
    color: '#FFF',
    flex: 1,
    paddingRight: 8,
  },
  breakdownTotalVal: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 18,
    color: THEME.colors.success,
    textAlign: 'right',
  },
  paymentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 255, 151, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 151, 0.25)',
    padding: 12,
    borderRadius: THEME.borderRadius.md,
    justifyContent: 'center',
  },
  paymentStatusText: {
    fontFamily: THEME.fonts.inter.medium,
    color: THEME.colors.success,
    fontSize: 12,
    textAlign: 'center',
  },
  footer: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: THEME.colors.background,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.glassBorder,
  },
  completeBtnTouchable: {
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

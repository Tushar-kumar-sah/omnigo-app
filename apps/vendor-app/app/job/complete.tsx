import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';

import { updateBookingStatus, getBookingById, Booking } from '@omnigo/api';
import { useLocalSearchParams } from 'expo-router';

export default function CompleteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobId = (params.id as string);
  const DRIVER_ID = 'b0000000-0000-0000-0000-000000000001'; // TODO: Replace with authenticated driver ID

  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const b = await getBookingById(jobId);
        setBooking(b);
      } catch (e) { console.error(e); }
    }
    loadData();
  }, [jobId]);

  const handleSubmit = async () => {
    try {
      await updateBookingStatus(jobId, 'completed', {
        driverRating: rating,
        notes: notes
      });
      router.replace('/(tabs)');
    } catch (e) {
      console.error(e);
      router.replace('/(tabs)');
    }
  };

  const jobData = booking ? {
    distance: booking.distance ? booking.distance + ' km' : '—',
    duration: booking.estimatedETA ? booking.estimatedETA + ' mins' : '—',
    driverEarnings: `₹${booking.finalPrice || booking.estimatedPrice || 0}`,
    customerPayment: `₹${booking.estimatedPrice || 0}`,
    baseFare: `₹${Math.round((booking.estimatedPrice || 0) * 0.7)}`,
    distanceFare: `₹${Math.round((booking.estimatedPrice || 0) * 0.2)}`,
    tip: '₹0',
    platformCommissionRate: '10%',
    platformFee: '₹0',
    customerName: 'Customer'
  } : null;

  if (!jobData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#fff' }}>Loading...</Text>
      </View>
    );
  }

  const getRatingLabel = (val: number) => {
    switch(val) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Great';
      case 5: return 'Excellent';
      default: return '';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.successArea}>
          <View style={styles.glowCircle}>
            <Ionicons name="checkmark" size={64} color={THEME.colors.success} />
          </View>
          <Text style={styles.title}>Job Completed!</Text>
        </View>

        <BlurView intensity={20} tint="dark" style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>Your Net Earnings (Take Home)</Text>
          <Text style={styles.earningsAmount}>{jobData.driverEarnings}</Text>

          <View style={styles.walletCreditBadge}>
            <Ionicons name="wallet" size={16} color={THEME.colors.success} />
            <Text style={styles.walletCreditText}>Credited to Driver Wallet Balance</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Customer Payment (Gross)</Text>
            <Text style={[styles.breakdownValue, { fontFamily: THEME.fonts.inter.bold }]}>{jobData.customerPayment}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Base Fare</Text>
            <Text style={styles.breakdownValue}>{jobData.baseFare}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Distance</Text>
            <Text style={styles.breakdownValue}>{jobData.distanceFare}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Direct Customer Tip</Text>
            <Text style={[styles.breakdownValue, { color: THEME.colors.success }]}>+{jobData.tip}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>OmniGo Platform Fee ({jobData.platformCommissionRate})</Text>
            <Text style={[styles.breakdownValue, { color: THEME.colors.danger }]}>-{jobData.platformFee}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color={THEME.colors.primary} />
              <Text style={styles.statText}>{jobData.duration} trip</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="swap-horizontal-outline" size={16} color={THEME.colors.primary} />
              <Text style={styles.statText}>{jobData.distance} towed</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="checkmark-done" size={16} color={THEME.colors.success} />
              <Text style={[styles.statText, { color: THEME.colors.success }]}>Paid via Gateway</Text>
            </View>
          </View>
        </BlurView>

        <BlurView intensity={20} tint="dark" style={styles.sectionCard}>
          <View style={styles.inspectionSummary}>
            <Ionicons name="shield-checkmark" size={24} color={THEME.colors.success} />
            <Text style={styles.inspectionText}>Pre-Tow vs Post-Tow Inspection Passed (0 New Damages)</Text>
          </View>
        </BlurView>

        <BlurView intensity={20} tint="dark" style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Rate Customer Experience</Text>
          <Text style={styles.subtitle}>How courteous and cooperative was {jobData.customerName}?</Text>
          
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
                <Ionicons 
                  name={star <= rating ? "star" : "star-outline"} 
                  size={36} 
                  color={star <= rating ? THEME.colors.warning : THEME.colors.textMuted} 
                />
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && <Text style={styles.ratingLabel}>{getRatingLabel(rating)}</Text>}
        </BlurView>

        <BlurView intensity={20} tint="dark" style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Incident & Trip Notes (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="E.g. Customer vehicle had pre-existing scratches on left door..."
            placeholderTextColor={THEME.colors.textMuted}
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={setNotes}
          />
        </BlurView>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleSubmit}>
          <LinearGradient
            colors={[THEME.colors.primary, THEME.colors.secondary]}
            style={styles.btn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.btnText}>SUBMIT & GO ONLINE</Text>
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
  successArea: {
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
    marginTop: THEME.spacing.md,
  },
  glowCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 255, 151, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: THEME.colors.success,
    shadowColor: THEME.colors.success,
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: THEME.spacing.md,
  },
  title: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 28,
    color: THEME.colors.success,
  },
  earningsCard: {
    backgroundColor: THEME.colors.glassBg,
    borderColor: THEME.colors.glassBorder,
    borderWidth: 1,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    alignItems: 'center',
    overflow: 'hidden',
  },
  earningsLabel: {
    fontFamily: THEME.fonts.inter.medium,
    color: THEME.colors.textSecondary,
    fontSize: 14,
  },
  earningsAmount: {
    fontFamily: THEME.fonts.outfit.bold,
    color: THEME.colors.success,
    fontSize: 38,
    marginVertical: THEME.spacing.xs,
  },
  walletCreditBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 151, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 151, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
    gap: 6,
    marginBottom: 8,
  },
  walletCreditText: {
    fontFamily: THEME.fonts.inter.medium,
    color: THEME.colors.success,
    fontSize: 12,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: THEME.colors.glassBorder,
    marginVertical: THEME.spacing.md,
  },
  breakdownRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.xs,
  },
  breakdownLabel: {
    fontFamily: THEME.fonts.inter.regular,
    color: THEME.colors.textSecondary,
    fontSize: 13,
    flex: 1,
  },
  breakdownValue: {
    fontFamily: THEME.fonts.inter.medium,
    color: THEME.colors.text,
    fontSize: 13,
    textAlign: 'right',
    flexShrink: 0,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    flexWrap: 'wrap',
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.xs,
  },
  statText: {
    fontFamily: THEME.fonts.inter.medium,
    color: THEME.colors.primary,
    fontSize: 12,
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
  inspectionSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
  },
  inspectionText: {
    fontFamily: THEME.fonts.inter.medium,
    color: THEME.colors.success,
    fontSize: 13,
    flex: 1,
    flexWrap: 'wrap',
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
    fontSize: 14,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: THEME.spacing.sm,
    marginBottom: THEME.spacing.xs,
  },
  ratingLabel: {
    fontFamily: THEME.fonts.outfit.medium,
    color: THEME.colors.warning,
    fontSize: 16,
    textAlign: 'center',
    marginTop: THEME.spacing.sm,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    borderRadius: THEME.borderRadius.sm,
    color: THEME.colors.text,
    padding: THEME.spacing.sm,
    fontFamily: THEME.fonts.inter.regular,
    textAlignVertical: 'top',
    height: 80,
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
  },
  btnText: {
    color: '#000',
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 16,
  }
});

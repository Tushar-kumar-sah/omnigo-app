import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { THEME } from '../../constants/theme';
import { BlurView } from 'expo-blur';
import { mockIncomingJob, VEHICLE_TYPES } from '../../constants/mock-data';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function IncomingJobScreen() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(20);
  const [showEarningsBreakdown, setShowEarningsBreakdown] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      router.back();
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, router]);

  const handleAccept = () => {
    router.replace('/job/navigation');
  };

  const handleDecline = () => {
    router.back();
  };

  const vType = VEHICLE_TYPES.find(v => v.label.toLowerCase() === mockIncomingJob.vehicleType.toLowerCase());
  const vehicleIcon = vType ? vType.icon : 'car-outline';

  return (
    <View style={styles.container}>
      <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
      
      <View style={styles.content}>
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{timeLeft}s</Text>
        </View>
        
        <View style={styles.card}>
          <View style={styles.header}>
            <View>
              <Text style={styles.etaText}>Pickup in {mockIncomingJob.eta}</Text>
              <Text style={styles.pickupDistText}>{mockIncomingJob.pickupDistance} away</Text>
            </View>
            <Pressable onPress={() => setShowEarningsBreakdown(!showEarningsBreakdown)}>
              <View style={styles.priceContainer}>
                <Text style={styles.priceText}>{mockIncomingJob.driverEarnings}</Text>
                <Ionicons name="information-circle-outline" size={16} color={THEME.colors.textSecondary} style={{ marginLeft: 4 }} />
              </View>
            </Pressable>
          </View>

          {showEarningsBreakdown && (
            <View style={styles.breakdownBox}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Base Fare</Text>
                <Text style={styles.breakdownVal}>{mockIncomingJob.baseFare}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Distance Fare</Text>
                <Text style={styles.breakdownVal}>{mockIncomingJob.distanceFare}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Platform Fee</Text>
                <Text style={styles.breakdownVal}>-{mockIncomingJob.platformFee}</Text>
              </View>
              <View style={styles.breakdownDivider} />
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownTotalLabel}>Estimated Earnings</Text>
                <Text style={styles.breakdownTotalVal}>{mockIncomingJob.driverEarnings}</Text>
              </View>
            </View>
          )}
          
          <View style={styles.divider} />
          
          <View style={styles.customerRow}>
            <View>
              <Text style={styles.customerName}>{mockIncomingJob.customerName}</Text>
              <Text style={styles.vehicleDetails}>
                {mockIncomingJob.vehicleMake} {mockIncomingJob.vehicleModel} • {mockIncomingJob.vehicleColor}
              </Text>
              <Text style={styles.vehiclePlate}>{mockIncomingJob.vehiclePlate}</Text>
            </View>
            <View style={styles.vehicleTypeBadge}>
              <Ionicons name={vehicleIcon as any} size={20} color={THEME.colors.primary} />
            </View>
          </View>
          
          <View style={styles.locationContainer}>
            <View style={styles.locRow}>
              <Ionicons name="radio-button-on" size={20} color={THEME.colors.primary} />
              <Text style={styles.locText} numberOfLines={1}>{mockIncomingJob.pickup}</Text>
            </View>
            <View style={styles.locLineContainer}>
              <View style={styles.locDot} />
              <View style={styles.locDot} />
              <View style={styles.locDot} />
            </View>
            <View style={styles.locRow}>
              <Ionicons name="location" size={20} color={THEME.colors.danger} />
              <Text style={styles.locText} numberOfLines={1}>{mockIncomingJob.drop}</Text>
            </View>
          </View>
          
          <View style={styles.distanceBox}>
            <Ionicons name="navigate-outline" size={16} color={THEME.colors.textSecondary} />
            <Text style={styles.distanceText}>Total Trip Distance: {mockIncomingJob.distance}</Text>
          </View>
          
          <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
            <LinearGradient
              colors={[THEME.colors.success, '#00CC7A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btnGradient}
            >
              <Text style={styles.acceptBtnText}>ACCEPT JOB</Text>
              <Ionicons name="chevron-forward-outline" size={24} color="#000" />
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.declineBtn} onPress={handleDecline}>
            <Text style={styles.declineBtnText}>DECLINE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#050810',
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
    padding: 24,
    paddingTop: 44,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
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
    fontSize: 16,
    color: THEME.colors.danger,
    letterSpacing: 1,
  }
});

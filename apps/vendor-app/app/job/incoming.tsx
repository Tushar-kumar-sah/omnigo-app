import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME } from '../../constants/theme';
import { BlurView } from 'expo-blur';
import { mockIncomingJob } from '../../constants/mock-data';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function IncomingJobScreen() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(30);

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

  return (
    <View style={styles.container}>
      <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
      
      <View style={styles.content}>
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{timeLeft}s</Text>
        </View>
        
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.etaText}>Pickup in {mockIncomingJob.eta}</Text>
            <Text style={styles.priceText}>{mockIncomingJob.price}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.customerName}>{mockIncomingJob.customerName}</Text>
          <Text style={styles.vehicleType}>{mockIncomingJob.vehicleType}</Text>
          
          <View style={styles.locationContainer}>
            <View style={styles.locRow}>
              <Ionicons name="radio-button-on" size={20} color={THEME.colors.primary} />
              <Text style={styles.locText} numberOfLines={1}>{mockIncomingJob.pickup}</Text>
            </View>
            <View style={styles.locLine} />
            <View style={styles.locRow}>
              <Ionicons name="location" size={20} color={THEME.colors.danger} />
              <Text style={styles.locText} numberOfLines={1}>{mockIncomingJob.drop}</Text>
            </View>
          </View>
          
          <View style={styles.distanceBox}>
            <Ionicons name="navigate-outline" size={16} color={THEME.colors.textSecondary} />
            <Text style={styles.distanceText}>Total Distance: {mockIncomingJob.distance}</Text>
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
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  timerContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: THEME.colors.glassBg,
    borderWidth: 2,
    borderColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -30,
    zIndex: 10,
  },
  timerText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 20,
    color: THEME.colors.text,
  },
  card: {
    width: '100%',
    backgroundColor: THEME.colors.glassBg,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    padding: 24,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  etaText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 20,
    color: THEME.colors.primary,
  },
  priceText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 24,
    color: THEME.colors.success,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
  },
  customerName: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 22,
    color: THEME.colors.text,
    marginBottom: 4,
  },
  vehicleType: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 16,
    color: THEME.colors.textSecondary,
    marginBottom: 24,
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
  locLine: {
    width: 2,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginLeft: 9,
    marginVertical: 4,
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
  },
  declineBtnText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 16,
    color: THEME.colors.danger,
    letterSpacing: 1,
  }
});

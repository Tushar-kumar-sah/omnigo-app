import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME } from '../../constants/theme';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { mockIncomingJob } from '../../constants/mock-data';

export default function CompleteScreen() {
  const router = useRouter();

  const handleDone = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.successIconBox}>
        <Ionicons name="checkmark-circle" size={80} color={THEME.colors.success} />
      </View>
      <Text style={styles.title}>Job Completed!</Text>
      
      <BlurView intensity={20} tint="dark" style={styles.card}>
        <Text style={styles.cardTitle}>Earnings Summary</Text>
        
        <View style={styles.amountContainer}>
          <Text style={styles.amountText}>{mockIncomingJob.price}</Text>
        </View>

        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Base Fare</Text>
          <Text style={styles.breakdownValue}>₹250.00</Text>
        </View>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Distance ({mockIncomingJob.distance})</Text>
          <Text style={styles.breakdownValue}>₹200.00</Text>
        </View>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Tip</Text>
          <Text style={styles.breakdownValue}>₹100.00</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Ionicons name="time-outline" size={20} color={THEME.colors.primary} />
            <Text style={styles.statLabel}>Duration</Text>
            <Text style={styles.statValue}>24 mins</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="navigate-outline" size={20} color={THEME.colors.secondary} />
            <Text style={styles.statLabel}>Distance</Text>
            <Text style={styles.statValue}>{mockIncomingJob.distance}</Text>
          </View>
        </View>
      </BlurView>

      <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
        <Text style={styles.doneBtnText}>DONE</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconBox: {
    marginBottom: 24,
    shadowColor: THEME.colors.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  title: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 32,
    color: THEME.colors.text,
    marginBottom: 40,
  },
  card: {
    width: '100%',
    backgroundColor: THEME.colors.glassBg,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    padding: 24,
    marginBottom: 32,
  },
  cardTitle: {
    fontFamily: THEME.fonts.outfit.medium,
    fontSize: 18,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  amountText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 48,
    color: THEME.colors.success,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  breakdownLabel: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 14,
    color: THEME.colors.textSecondary,
  },
  breakdownValue: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 14,
    color: THEME.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 8,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 16,
    color: THEME.colors.text,
  },
  doneBtn: {
    width: '100%',
    height: 56,
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneBtnText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 16,
    color: '#000',
    letterSpacing: 1,
  }
});

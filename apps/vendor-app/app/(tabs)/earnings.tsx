import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { THEME } from '../../constants/theme';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { mockEarnings } from '../../constants/mock-data';

export default function EarningsScreen() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

  const currentData = mockEarnings[period];

  const periods = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
  ] as const;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Earnings</Text>

      <View style={styles.periodSelector}>
        {periods.map((p) => {
          const isActive = period === p.id;
          return (
            <TouchableOpacity 
              key={p.id} 
              onPress={() => setPeriod(p.id)}
              style={[styles.periodPill, isActive ? styles.periodPillActive : null]}
            >
              <Text style={[styles.periodText, isActive ? styles.periodTextActive : null]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <BlurView intensity={20} tint="dark" style={styles.mainCard}>
        <Text style={styles.periodLabel}>{periods.find(p => p.id === period)?.label}</Text>
        <Text style={styles.amountText}>{currentData.amount}</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Ionicons name="car-outline" size={20} color={THEME.colors.primary} />
            <Text style={styles.statBoxValue}>{currentData.trips}</Text>
            <Text style={styles.statBoxLabel}>Trips</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="time-outline" size={20} color={THEME.colors.secondary} />
            <Text style={styles.statBoxValue}>{currentData.online}</Text>
            <Text style={styles.statBoxLabel}>Online</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="navigate-outline" size={20} color={THEME.colors.success} />
            <Text style={styles.statBoxValue}>{currentData.distance}</Text>
            <Text style={styles.statBoxLabel}>Distance</Text>
          </View>
        </View>
      </BlurView>

      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      
      {[1, 2, 3].map((item) => (
        <BlurView key={item} intensity={20} tint="dark" style={styles.txCard}>
          <View style={styles.txLeft}>
            <View style={styles.txIconBox}>
              <Ionicons name="checkmark-done" size={20} color={THEME.colors.success} />
            </View>
            <View>
              <Text style={styles.txName}>Trip {item}</Text>
              <Text style={styles.txTime}>Today, 2:30 PM</Text>
            </View>
          </View>
          <Text style={styles.txAmount}>+₹475.00</Text>
        </BlurView>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  content: {
    padding: 24,
    paddingTop: 64,
    paddingBottom: 100,
  },
  title: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 32,
    color: THEME.colors.text,
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: THEME.borderRadius.full,
    padding: 4,
  },
  periodPill: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: THEME.borderRadius.full,
  },
  periodPillActive: {
    backgroundColor: 'rgba(0, 207, 255, 0.2)',
  },
  periodText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 14,
    color: THEME.colors.textSecondary,
  },
  periodTextActive: {
    color: THEME.colors.primary,
    fontFamily: THEME.fonts.inter.bold,
  },
  mainCard: {
    backgroundColor: THEME.colors.glassBg,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  periodLabel: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 16,
    color: THEME.colors.textSecondary,
    marginBottom: 8,
  },
  amountText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 48,
    color: THEME.colors.text,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statBoxValue: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 18,
    color: THEME.colors.text,
    marginTop: 8,
  },
  statBoxLabel: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 20,
    color: THEME.colors.text,
    marginBottom: 16,
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.glassBg,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    marginBottom: 12,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,255,151,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txName: {
    fontFamily: THEME.fonts.outfit.medium,
    fontSize: 16,
    color: THEME.colors.text,
  },
  txTime: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 4,
  },
  txAmount: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 18,
    color: THEME.colors.success,
  }
});

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { THEME } from '../../constants/theme';
import { BlurView } from 'expo-blur';
import { mockJobs } from '../../constants/mock-data';
import { Ionicons } from '@expo/vector-icons';

export default function HistoryScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Job History</Text>

      {mockJobs.map(job => (
        <BlurView key={job.id} intensity={20} tint="dark" style={styles.jobCard}>
          <View style={styles.jobHeader}>
            <Text style={styles.jobDate}>{job.date}</Text>
            <Text style={styles.jobPrice}>{job.price}</Text>
          </View>
          
          <Text style={styles.customerName}>{job.customerName}</Text>
          <Text style={styles.vehicleInfo}>{job.vehicleType}</Text>
          
          <View style={styles.locationContainer}>
            <View style={styles.locRow}>
              <Ionicons name="radio-button-on" size={16} color={THEME.colors.primary} />
              <Text style={styles.locText}>{job.pickup}</Text>
            </View>
            <View style={styles.locLine} />
            <View style={styles.locRow}>
              <Ionicons name="location" size={16} color={THEME.colors.danger} />
              <Text style={styles.locText}>{job.drop}</Text>
            </View>
          </View>
          
          <View style={styles.jobFooter}>
            <Text style={styles.ratingText}>⭐ {job.rating}.0</Text>
            <Text style={styles.distanceText}>{job.distance}</Text>
          </View>
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
    marginBottom: 24,
  },
  jobCard: {
    backgroundColor: THEME.colors.glassBg,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    padding: 20,
    marginBottom: 16,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobDate: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 14,
    color: THEME.colors.textSecondary,
  },
  jobPrice: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 18,
    color: THEME.colors.success,
  },
  customerName: {
    fontFamily: THEME.fonts.outfit.medium,
    fontSize: 18,
    color: THEME.colors.text,
  },
  vehicleInfo: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 14,
    color: THEME.colors.textSecondary,
    marginBottom: 16,
  },
  locationContainer: {
    marginBottom: 16,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locText: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 14,
    color: THEME.colors.text,
    marginLeft: 8,
  },
  locLine: {
    width: 2,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginLeft: 7,
    marginVertical: 4,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 16,
  },
  ratingText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 14,
    color: THEME.colors.text,
  },
  distanceText: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 14,
    color: THEME.colors.textSecondary,
  }
});

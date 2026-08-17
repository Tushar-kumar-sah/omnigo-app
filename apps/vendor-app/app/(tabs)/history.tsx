import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation, UIManager, Platform } from 'react-native';
import { THEME } from '../../constants/theme';
import { BlurView } from 'expo-blur';
import { getBookingsByDriver, Booking } from '@omnigo/api';
import { Ionicons } from '@expo/vector-icons';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function HistoryScreen() {
  const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [apiJobs, setApiJobs] = useState<Booking[]>([]);
  const DRIVER_ID = 'b0000000-0000-0000-0000-000000000001'; // TODO: Replace with authenticated driver ID

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getBookingsByDriver(DRIVER_ID);
        setApiJobs(data);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, [DRIVER_ID]);

  const jobsData = apiJobs.map(job => ({
    id: job.id,
    date: new Date(job.createdAt).toLocaleDateString(),
    price: `₹${job.finalPrice || job.estimatedPrice || 0}`,
    customerName: 'Customer',
    vehicleMake: job.customerVehicle?.brand || '',
    vehicleModel: job.customerVehicle?.model || '',
    vehicleColor: 'White',
    vehiclePlate: job.customerVehicle?.number || '',
    pickup: job.pickup?.address || 'Pickup',
    drop: job.dropoff?.address || 'Dropoff',
    baseFare: `₹${Math.round((job.estimatedPrice || 0) * 0.7)}`,
    distanceFare: `₹${Math.round((job.estimatedPrice || 0) * 0.2)}`,
    tip: '—',
    platformFee: '—',
    rating: job.driverRating || 0,
    distance: job.distance ? job.distance + ' km' : '—',
    duration: job.estimatedETA ? job.estimatedETA + ' mins' : '—',
    status: job.status === 'completed' ? 'completed' : (job.status === 'cancelled' ? 'cancelled' : 'completed')
  }));

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' }
  ] as const;

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredJobs = jobsData.filter(job => {
    if (filter === 'all') return true;
    return job.status === filter;
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Job History</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {filters.map((f) => {
            const isActive = filter === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setFilter(f.id)}
              >
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {filteredJobs.map(job => {
          const isExpanded = expandedId === job.id;
          return (
            <TouchableOpacity activeOpacity={0.8} key={job.id} onPress={() => toggleExpand(job.id)}>
              <BlurView intensity={20} tint="dark" style={styles.jobCard}>
                <View style={styles.jobHeader}>
                  <Text style={styles.jobDate}>{job.date}</Text>
                  <Text style={styles.jobPrice}>{job.price}</Text>
                </View>
                
                <Text style={styles.customerName}>{job.customerName}</Text>
                <Text style={styles.vehicleInfo}>
                  {job.vehicleMake} {job.vehicleModel} ({job.vehicleColor}) • {job.vehiclePlate}
                </Text>
                
                {isExpanded && (
                  <View style={styles.expandedDetails}>
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
                    
                    <View style={styles.detailsGrid}>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Base Fare</Text>
                        <Text style={styles.detailValue}>{job.baseFare}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Distance Fare</Text>
                        <Text style={styles.detailValue}>{job.distanceFare}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Tip</Text>
                        <Text style={styles.detailValue}>{job.tip}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Platform Fee</Text>
                        <Text style={styles.detailValue}>-{job.platformFee}</Text>
                      </View>
                    </View>
                  </View>
                )}
                
                <View style={styles.jobFooter}>
                  <Text style={styles.ratingText}>⭐ {job.rating}.0</Text>
                  <Text style={styles.distanceText}>{job.distance} • {job.duration}</Text>
                </View>
              </BlurView>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
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
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    maxHeight: 40,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 12,
    height: 36,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  filterChipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  filterText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 14,
    color: THEME.colors.textSecondary,
  },
  filterTextActive: {
    color: THEME.colors.background,
    fontFamily: THEME.fonts.inter.bold,
  },
  jobCard: {
    backgroundColor: THEME.colors.glassBg,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    marginBottom: 4,
  },
  vehicleInfo: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 14,
    color: THEME.colors.textSecondary,
    marginBottom: 16,
  },
  expandedDetails: {
    marginTop: 8,
    marginBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 16,
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
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 12,
    borderRadius: THEME.borderRadius.md,
  },
  detailItem: {
    width: '48%',
    marginBottom: 8,
  },
  detailLabel: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  detailValue: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 14,
    color: THEME.colors.text,
    marginTop: 2,
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

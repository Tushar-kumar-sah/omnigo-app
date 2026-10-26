import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  RefreshControl,
} from 'react-native';
import { THEME } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { BlurView } from 'expo-blur';
import { getBookingsByDriver, Booking } from '@omnigo/api';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAuthenticatedDriverId } from '@/lib/auth';

const cleanDistance = (dist: any) => {
  if (!dist && dist !== 0) return '—';
  const s = String(dist).trim();
  if (s.toLowerCase().includes('km')) {
    return s.replace(/(\s*km)+/gi, ' km').trim();
  }
  return `${s} km`;
};

const cleanDuration = (dur: any) => {
  if (!dur && dur !== 0) return '—';
  const s = String(dur).trim();
  if (s.toLowerCase().includes('min')) {
    return s.replace(/(\s*mins?)+/gi, ' mins').trim();
  }
  return `${s} mins`;
};

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();
  const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [apiJobs, setApiJobs] = useState<Booking[]>([]);

  const DRIVER_ID = getAuthenticatedDriverId();

  const loadData = useCallback(async () => {
    try {
      const data = await getBookingsByDriver(DRIVER_ID);
      setApiJobs(data || []);
    } catch (err) {
      console.error('[History] loadData error:', err);
    }
  }, [DRIVER_ID]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const jobsData = apiJobs.map((rawJob) => {
    const job = rawJob as any;
    const rawStatus = String(job.status || '').toLowerCase();
    const normalizedStatus = rawStatus.includes('cancel')
      ? 'cancelled'
      : rawStatus.includes('complete')
      ? 'completed'
      : 'active';

    return {
      id: job.id,
      date: job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-IN') : 'Recent',
      price: `₹${job.finalPrice || job.estimatedPrice || 0}`,
      customerName: job.customerName || job.userName || 'Customer',
      vehicleMake: job.customerVehicle?.brand || '',
      vehicleModel: job.customerVehicle?.model || '',
      vehicleColor: job.customerVehicle?.color || 'White',
      vehiclePlate: job.customerVehicle?.number || '',
      pickup: job.pickup?.address || 'Pickup location',
      drop: job.dropoff?.address || 'Dropoff location',
      baseFare: `₹${Math.round((job.estimatedPrice || 0) * 0.7)}`,
      distanceFare: `₹${Math.round((job.estimatedPrice || 0) * 0.2)}`,
      tip: '—',
      platformFee: '—',
      rating: job.driverRating ? Number(job.driverRating) : 0,
      distance: cleanDistance(job.distance),
      duration: cleanDuration(job.estimatedETA),
      status: normalizedStatus,
    };
  });

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ] as const;

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredJobs = jobsData.filter((job) => {
    if (filter === 'all') return true;
    return job.status === filter;
  });

  const CardWrapper = ({ children, style }: { children: React.ReactNode; style: any }) => {
    if (Platform.OS === 'android') {
      return <View style={[style, { backgroundColor: isDark ? '#0d1428' : '#FFFFFF', borderColor: colors.cardBorder }]}>{children}</View>;
    }
    return (
      <BlurView intensity={25} tint={isDark ? "dark" : "light"} style={[style, !isDark && { backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: colors.cardBorder }]}>
        {children}
      </BlurView>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top + 10, 50),
            paddingBottom: Math.max(insets.bottom + 140, 160),
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={THEME.colors.primary}
            colors={[THEME.colors.primary]}
          />
        }
      >
        {/* Header Row */}
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.text }]}>Job History</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Track completed rides, earnings and trip routes</Text>
        </View>

        {/* Segmented Filter Control (Equal-width tabs, full container) */}
        <View style={styles.segmentContainer}>
          {filters.map((f) => {
            const isActive = filter === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                style={[styles.segmentTab, isActive && styles.segmentTabActive]}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setFilter(f.id);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Empty State */}
        {filteredJobs.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="car-sport-outline" size={48} color="rgba(255,255,255,0.18)" />
            <Text style={styles.emptyTitle}>
              No {filter === 'all' ? '' : filter} jobs
            </Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'completed'
                ? 'Completed jobs will appear here once you finish a ride.'
                : filter === 'cancelled'
                ? 'Cancelled requests will be archived here.'
                : 'Accepted and completed jobs will show up in this list.'}
            </Text>
          </View>
        )}

        {/* Job Cards */}
        {filteredJobs.map((job) => {
          const isExpanded = expandedId === job.id;
          const vehicleDesc = [
            job.vehicleMake,
            job.vehicleModel,
            job.vehicleColor ? `(${job.vehicleColor})` : '',
            job.vehiclePlate ? `• ${job.vehiclePlate}` : '',
          ]
            .filter(Boolean)
            .join(' ')
            .trim() || 'Vehicle';

          return (
            <TouchableOpacity
              activeOpacity={0.85}
              key={job.id}
              onPress={() => toggleExpand(job.id)}
            >
              <CardWrapper style={styles.jobCard}>
                <View style={styles.jobHeader}>
                  <Text style={styles.jobDate}>{job.date}</Text>
                  <Text style={styles.jobPrice}>{job.price}</Text>
                </View>

                <Text style={styles.customerName}>{job.customerName}</Text>
                <Text style={styles.vehicleInfo} numberOfLines={1}>
                  {vehicleDesc}
                </Text>

                {isExpanded && (
                  <View style={styles.expandedDetails}>
                    <View style={styles.locationContainer}>
                      <View style={styles.locRow}>
                        <Ionicons name="radio-button-on" size={16} color={THEME.colors.primary} />
                        <Text style={styles.locText} numberOfLines={1}>{job.pickup}</Text>
                      </View>
                      <View style={styles.locLine} />
                      <View style={styles.locRow}>
                        <Ionicons name="location" size={16} color={THEME.colors.danger} />
                        <Text style={styles.locText} numberOfLines={1}>{job.drop}</Text>
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
                  <Text style={[styles.ratingText, !job.rating && { color: 'rgba(255,255,255,0.45)' }]}>
                    {job.rating > 0 ? `⭐ ${Number(job.rating).toFixed(1)}` : '⭐ Unrated'}
                  </Text>
                  <Text style={styles.distanceText}>
                    {job.distance} • {job.duration}
                  </Text>
                </View>
              </CardWrapper>
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
    paddingHorizontal: 20,
  },
  headerRow: {
    marginBottom: 16,
  },
  title: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 28,
    color: THEME.colors.text,
  },
  subtitle: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 13,
    color: THEME.colors.textSecondary,
    marginTop: 4,
  },
  segmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  segmentTabActive: {
    backgroundColor: THEME.colors.primary,
  },
  segmentText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.65)',
  },
  segmentTextActive: {
    fontFamily: THEME.fonts.outfit.bold,
    color: '#050810',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  emptyTitle: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
  },
  emptySubtitle: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  jobCard: {
    backgroundColor: THEME.colors.glassBg,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  jobCardAndroid: {
    backgroundColor: '#0d1428',
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
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
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
    flex: 1,
  },
  locLine: {
    width: 2,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginLeft: 7,
    marginVertical: 4,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
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
  },
});

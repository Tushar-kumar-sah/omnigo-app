import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getBookingById, updateBookingStatus, Booking } from '@omnigo/api';
import * as Location from 'expo-location';
import DriverNavigationMap from '@/components/DriverNavigationMap';

type JobState = 'LOADING' | 'IN_TRANSIT' | 'ARRIVED';

export default function TowingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobId = params.id as string;

  const [jobState, setJobState] = useState<JobState>('LOADING');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [driverCoords, setDriverCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: 22.5726,
    longitude: 88.3639,
  });
  const [etaText, setEtaText] = useState('15 mins');
  const [distanceText, setDistanceText] = useState('4.8 km');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!jobId) return;
      try {
        const b = await getBookingById(jobId);
        if (isMounted) setBooking(b);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();

    // Request GPS location for the live navigation map
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          if (isMounted && loc?.coords) {
            setDriverCoords({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            });
          }
        }
      } catch (e) {
        console.warn('[TowingScreen] location error:', e);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [jobId]);

  // Destination dropoff coordinates from booking
  const dropoffCoords = React.useMemo(() => {
    const bAny = booking as any;
    if (bAny?.dropoffCoords && (bAny.dropoffCoords.latitude !== 0 || bAny.dropoffCoords.longitude !== 0)) {
      return bAny.dropoffCoords;
    }
    if (bAny?.dropoffLocation?.coordinates) {
      return bAny.dropoffLocation.coordinates;
    }
    if (bAny?.dropoff_location?.coordinates) {
      return {
        latitude: bAny.dropoff_location.coordinates[1],
        longitude: bAny.dropoff_location.coordinates[0],
      };
    }
    // Default Kolkata location if not set yet
    return { latitude: 22.5855, longitude: 88.3712 };
  }, [booking]);

  const handleNextState = async () => {
    if (jobState === 'LOADING') {
      await updateBookingStatus(jobId, 'towing');
      setJobState('IN_TRANSIT');
    } else if (jobState === 'IN_TRANSIT') {
      await updateBookingStatus(jobId, 'arriving_dropoff');
      setJobState('ARRIVED');
    } else if (jobState === 'ARRIVED') {
      router.push({ pathname: '/job/post-inspection', params: { id: jobId } });
    }
  };

  const handleOpenGoogleMaps = () => {
    const dest = booking?.dropoff?.address || 'Destination';
    const lat = dropoffCoords.latitude;
    const lng = dropoffCoords.longitude;
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(dest)}`,
      android: `google.navigation:q=${lat},${lng}&mode=d`,
    }) || `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest)}`);
    });
  };

  const getStateConfig = () => {
    switch (jobState) {
      case 'LOADING':
        return {
          bannerMsg: 'Loading Vehicle onto Tow Truck',
          bannerColors: [THEME.colors.warning, '#FF8C00'] as const,
          btnMsg: 'VEHICLE LOADED',
          btnColors: [THEME.colors.warning, '#FF8C00'] as const,
          icon: 'car-sport',
        };
      case 'IN_TRANSIT':
        return {
          bannerMsg: 'En Route to Destination',
          bannerColors: [THEME.colors.primary, THEME.colors.secondary] as const,
          btnMsg: 'ARRIVED AT DESTINATION',
          btnColors: [THEME.colors.primary, THEME.colors.secondary] as const,
          icon: 'navigate',
        };
      case 'ARRIVED':
        return {
          bannerMsg: 'Arrived at Destination',
          bannerColors: [THEME.colors.success, '#00CC7A'] as const,
          btnMsg: 'PROCEED TO UNLOADING',
          btnColors: [THEME.colors.success, '#00CC7A'] as const,
          icon: 'checkmark-circle',
        };
    }
  };

  const config = getStateConfig();

  return (
    <View style={styles.container}>
      {/* Live Driving Navigation Map showing route to dropoff destination */}
      <DriverNavigationMap
        driverCoords={driverCoords}
        userCoords={dropoffCoords}
        customerName={(booking as any)?.customer || 'Customer'}
        customerVehicle={
          `${(booking as any)?.customerVehicle?.brand || ''} ${(booking as any)?.customerVehicle?.model || ''}`.trim() ||
          'Towed Vehicle'
        }
        pickupAddress={booking?.dropoff?.address || 'Dropoff Destination'}
        driverSpeed={jobState === 'IN_TRANSIT' ? 36 : 0}
        onRouteCalculated={(route) => {
          if (route?.durationMinutes) setEtaText(`${route.durationMinutes} mins`);
          if (route?.distanceKm) setDistanceText(`${route.distanceKm.toFixed(1)} km`);
        }}
      />

      {/* Top Banner with Safe Area Inset */}
      <View style={[styles.topBannerWrapper, { top: Math.max(insets.top + 8, 48) }]}>
        <LinearGradient colors={config.bannerColors} style={styles.topBanner}>
          <Ionicons name={config.icon as any} size={22} color="#000" />
          <Text style={styles.bannerText}>{config.bannerMsg}</Text>
        </LinearGradient>
      </View>

      {/* Floating External Navigation Button */}
      <TouchableOpacity
        style={[styles.floatingNavBtn, { top: Math.max(insets.top + 68, 108) }]}
        onPress={handleOpenGoogleMaps}
        activeOpacity={0.8}
      >
        <Ionicons name="navigate-circle" size={20} color="#00CFFF" />
        <Text style={styles.floatingNavText}>Open in Google Maps</Text>
      </TouchableOpacity>

      {/* Bottom Floating Control Card with Proper System Bar Spacing */}
      <View
        style={[
          styles.bottomSection,
          { paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 36 : 16) + 14 },
        ]}
      >
        <BlurView intensity={45} tint="dark" style={styles.bottomCard}>
          {/* Destination Header with Maps launch icon */}
          <View style={styles.destHeaderRow}>
            <Text style={styles.cardTitle}>Destination</Text>
            <TouchableOpacity onPress={handleOpenGoogleMaps} activeOpacity={0.7} style={styles.mapsShortcut}>
              <Ionicons name="map-outline" size={14} color={THEME.colors.primary} />
              <Text style={styles.mapsShortcutText}>Directions</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location" size={22} color={THEME.colors.danger} style={{ marginTop: 2 }} />
            <Text style={styles.locationText} numberOfLines={2}>
              {booking?.dropoff?.address || '4A, Manicktala, Goa Bagan, Ward Number 16, Kolkata'}
            </Text>
          </View>

          {/* Live ETA and Distance stats row */}
          {jobState === 'IN_TRANSIT' && (
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>ESTIMATED ETA</Text>
                <Text style={styles.statValue}>{etaText}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>DISTANCE</Text>
                <Text style={styles.statValue}>{distanceText}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>SPEED</Text>
                <Text style={styles.statValue}>36 km/h</Text>
              </View>
            </View>
          )}

          {/* Stepper Timeline with Proper Single-Line Text Alignment */}
          <View style={styles.stepperContainer}>
            {/* Step 1: Loading */}
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepDot,
                  jobState === 'LOADING' && styles.stepDotCurrent,
                  (jobState === 'IN_TRANSIT' || jobState === 'ARRIVED') && styles.stepDotDone,
                ]}
              >
                {jobState === 'IN_TRANSIT' || jobState === 'ARRIVED' ? (
                  <Ionicons name="checkmark" size={12} color="#000" />
                ) : (
                  <View style={styles.stepDotInner} />
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  jobState === 'LOADING' && styles.stepLabelActive,
                  (jobState === 'IN_TRANSIT' || jobState === 'ARRIVED') && styles.stepLabelDone,
                ]}
              >
                Loading
              </Text>
            </View>

            {/* Connector Line 1 */}
            <View
              style={[
                styles.stepLine,
                (jobState === 'IN_TRANSIT' || jobState === 'ARRIVED') && styles.stepLineActive,
              ]}
            />

            {/* Step 2: In Transit */}
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepDot,
                  jobState === 'IN_TRANSIT' && styles.stepDotCurrent,
                  jobState === 'ARRIVED' && styles.stepDotDone,
                ]}
              >
                {jobState === 'ARRIVED' ? (
                  <Ionicons name="checkmark" size={12} color="#000" />
                ) : jobState === 'IN_TRANSIT' ? (
                  <View style={styles.stepDotInner} />
                ) : null}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  jobState === 'IN_TRANSIT' && styles.stepLabelActive,
                  jobState === 'ARRIVED' && styles.stepLabelDone,
                ]}
              >
                In Transit
              </Text>
            </View>

            {/* Connector Line 2 */}
            <View style={[styles.stepLine, jobState === 'ARRIVED' && styles.stepLineActive]} />

            {/* Step 3: Arrived */}
            <View style={styles.stepItem}>
              <View style={[styles.stepDot, jobState === 'ARRIVED' && styles.stepDotCurrent]}>
                {jobState === 'ARRIVED' ? <View style={styles.stepDotInner} /> : null}
              </View>
              <Text style={[styles.stepLabel, jobState === 'ARRIVED' && styles.stepLabelActive]}>
                Arrived
              </Text>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity onPress={handleNextState} style={styles.btnWrapper} activeOpacity={0.8}>
            <LinearGradient
              colors={config.btnColors}
              style={styles.btn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.btnText}>{config.btnMsg}</Text>
              <Ionicons name="arrow-forward" size={20} color="#000" />
            </LinearGradient>
          </TouchableOpacity>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  topBannerWrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 15,
  },
  topBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: THEME.borderRadius.md,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  bannerText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 15,
    color: '#000',
    letterSpacing: 0.3,
  },
  floatingNavBtn: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 14, 23, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.4)',
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
    zIndex: 15,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6,
  },
  floatingNavText: {
    fontFamily: THEME.fonts.inter.medium,
    color: '#FFF',
    fontSize: 12,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    zIndex: 20,
  },
  bottomCard: {
    backgroundColor: 'rgba(10, 14, 23, 0.94)',
    borderColor: THEME.colors.glassBorder,
    borderWidth: 1,
    borderRadius: THEME.borderRadius.lg,
    padding: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 12,
  },
  destHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontFamily: THEME.fonts.inter.medium,
    color: THEME.colors.textSecondary,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mapsShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 207, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  mapsShortcutText: {
    fontFamily: THEME.fonts.inter.medium,
    color: THEME.colors.primary,
    fontSize: 11,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 14,
  },
  locationText: {
    fontFamily: THEME.fonts.outfit.medium,
    color: THEME.colors.text,
    fontSize: 15,
    lineHeight: 20,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  statItem: {
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  statLabel: {
    fontFamily: THEME.fonts.inter.regular,
    color: THEME.colors.textSecondary,
    fontSize: 10,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  statValue: {
    fontFamily: THEME.fonts.outfit.bold,
    color: THEME.colors.primary,
    fontSize: 15,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  stepItem: {
    alignItems: 'center',
    width: 75,
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepDotCurrent: {
    backgroundColor: 'rgba(0, 207, 255, 0.25)',
    borderColor: THEME.colors.primary,
    borderWidth: 2,
  },
  stepDotDone: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  stepDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.primary,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 2,
    marginBottom: 18,
  },
  stepLineActive: {
    backgroundColor: THEME.colors.primary,
  },
  stepLabel: {
    fontFamily: THEME.fonts.inter.regular,
    color: THEME.colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  stepLabelActive: {
    fontFamily: THEME.fonts.outfit.bold,
    color: THEME.colors.text,
  },
  stepLabelDone: {
    color: THEME.colors.textSecondary,
  },
  btnWrapper: {
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

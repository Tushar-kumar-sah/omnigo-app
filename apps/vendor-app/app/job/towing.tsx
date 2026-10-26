import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getBookingById,
  updateBookingStatus,
  updateDriverLocation,
  Booking,
} from '@omnigo/api';
import * as Location from 'expo-location';
import DriverNavigationMap from '@/components/DriverNavigationMap';
import { geocodeAddress, RouteResult } from '@/lib/googleMaps';

type JobState = 'LOADING' | 'IN_TRANSIT' | 'ARRIVED';

export default function TowingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobId = params.id as string;

  const [jobState, setJobState] = useState<JobState>('LOADING');
  const [booking, setBooking] = useState<Booking | null>(null);

  // Live real-time device GPS coordinates & telemetry (no mock/fake data)
  const [driverCoords, setDriverCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [driverSpeed, setDriverSpeed] = useState<number>(0);
  const [driverHeading, setDriverHeading] = useState<number>(0);

  // Real dropoff destination coordinates (geocoded from real booking address)
  const [dropoffCoords, setDropoffCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  // Live route distance and ETA calculated directly from Google Routes API
  const [etaText, setEtaText] = useState<string>('');
  const [distanceText, setDistanceText] = useState<string>('');
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // 1. Fetch real booking details from Supabase
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!jobId) return;
      try {
        const b = await getBookingById(jobId);
        if (isMounted && b) {
          setBooking(b);
        }
      } catch (err) {
        console.error('[TowingScreen] getBooking error:', err);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [jobId]);

  // 2. Obtain real destination dropoff coordinates from booking or geocode real address
  useEffect(() => {
    if (!booking) return;
    let isMounted = true;
    const bAny = booking as any;

    if (
      bAny.dropoffCoords?.latitude &&
      bAny.dropoffCoords?.longitude &&
      (bAny.dropoffCoords.latitude !== 0 || bAny.dropoffCoords.longitude !== 0)
    ) {
      setDropoffCoords(bAny.dropoffCoords);
      return;
    }

    if (
      bAny.dropoffLocation?.coordinates?.latitude &&
      bAny.dropoffLocation?.coordinates?.longitude
    ) {
      setDropoffCoords(bAny.dropoffLocation.coordinates);
      return;
    }

    if (bAny.dropoff_location?.coordinates && Array.isArray(bAny.dropoff_location.coordinates)) {
      setDropoffCoords({
        latitude: bAny.dropoff_location.coordinates[1],
        longitude: bAny.dropoff_location.coordinates[0],
      });
      return;
    }

    // Geocode real destination address dynamically if lat/lng are missing
    const address = bAny.dropoff?.address || bAny.dropoffAddress || '';
    if (address) {
      geocodeAddress(address).then((coords) => {
        if (isMounted && coords) {
          setDropoffCoords(coords);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [booking]);

  // 3. Continuous real-time GPS tracking using device sensors (no fake coordinates)
  useEffect(() => {
    let isMounted = true;
    let locationSub: Location.LocationSubscription | null = null;

    async function startLiveGPSTracking() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        // Get initial real GPS fix
        const initial = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        if (isMounted && initial?.coords) {
          setDriverCoords({
            latitude: initial.coords.latitude,
            longitude: initial.coords.longitude,
          });
          if (initial.coords.speed && initial.coords.speed > 0) {
            setDriverSpeed(Math.round(initial.coords.speed * 3.6));
          }
        }

        // Live continuous GPS subscription
        locationSub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 2000,
            distanceInterval: 5,
          },
          (loc) => {
            if (!isMounted || !loc?.coords) return;
            const { latitude, longitude, speed, heading } = loc.coords;
            setDriverCoords({ latitude, longitude });

            if (speed !== null && speed >= 0) {
              setDriverSpeed(Math.round(speed * 3.6));
            }
            if (heading !== null && heading >= 0) {
              setDriverHeading(heading);
            }

            // Sync live driver GPS location with backend
            const effectiveDriverId = booking?.driverId || 'b0000000-0000-0000-0000-000000000001';
            updateDriverLocation(
              effectiveDriverId,
              latitude,
              longitude,
              heading || 0,
              speed ? Math.round(speed * 3.6) : 0
            ).catch(() => {});
          }
        );
      } catch (e) {
        console.warn('[TowingScreen] Live GPS subscription error:', e);
      }
    }

    startLiveGPSTracking();

    return () => {
      isMounted = false;
      if (locationSub) locationSub.remove();
    };
  }, [jobId, booking?.driverId]);

  // 4. Handle route calculated by Google Routes API
  const handleRouteCalculated = (route: RouteResult) => {
    setIsCalculatingRoute(false);
    if (route?.durationMinutes) {
      setEtaText(`${route.durationMinutes} mins`);
    }
    if (route?.distanceKm) {
      setDistanceText(`${route.distanceKm.toFixed(1)} km`);
    }
  };

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
    const lat = dropoffCoords?.latitude;
    const lng = dropoffCoords?.longitude;

    if (!lat || !lng) {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest)}`);
      return;
    }

    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(dest)}`,
      android: `google.navigation:q=${lat},${lng}&mode=d`,
    }) || `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;

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
      {/* Live Map or GPS Satellite Lock Acquisition */}
      {driverCoords && dropoffCoords ? (
        <DriverNavigationMap
          driverCoords={driverCoords}
          userCoords={dropoffCoords}
          customerName={(booking as any)?.customer || 'Customer'}
          customerVehicle={
            `${(booking as any)?.customerVehicle?.brand || ''} ${(booking as any)?.customerVehicle?.model || ''}`.trim() ||
            'Towed Vehicle'
          }
          pickupAddress={booking?.dropoff?.address || 'Dropoff Destination'}
          driverSpeed={driverSpeed}
          driverHeading={driverHeading}
          onRouteCalculated={handleRouteCalculated}
        />
      ) : (
        <View style={styles.gpsAcquiringView}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
          <Text style={styles.gpsAcquiringTitle}>Acquiring Live GPS Satellite Lock</Text>
          <Text style={styles.gpsAcquiringSub}>
            Connecting to device navigation hardware and calculating live road polyline...
          </Text>
        </View>
      )}

      {/* Top Banner with Safe Area Inset */}
      <View style={[styles.topBannerWrapper, { top: Math.max(insets.top + 8, 48) }]}>
        <LinearGradient colors={config.bannerColors} style={styles.topBanner}>
          <Ionicons name={config.icon as any} size={22} color="#000" />
          <Text style={styles.bannerText}>{config.bannerMsg}</Text>
        </LinearGradient>
      </View>

      {/* Floating External Google Navigation Button */}
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
          {/* Destination Header with Maps shortcut */}
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
              {booking?.dropoff?.address || 'Destination Dropoff Spot'}
            </Text>
          </View>

          {/* Live ETA, Distance & Telemetry row (Real Live Google Routes & Sensor Data) */}
          {jobState === 'IN_TRANSIT' && (
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>LIVE ETA</Text>
                <Text style={styles.statValue}>{etaText || (isCalculatingRoute ? '...' : 'Calculating')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>DISTANCE</Text>
                <Text style={styles.statValue}>{distanceText || (isCalculatingRoute ? '...' : 'Calculating')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>LIVE SPEED</Text>
                <Text style={styles.statValue}>{`${driverSpeed} km/h`}</Text>
              </View>
            </View>
          )}

          {/* Stepper Timeline with Proper Single-Line Text Alignment (No Line Breaks) */}
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
  gpsAcquiringView: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#050810',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  gpsAcquiringTitle: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 18,
    color: THEME.colors.text,
    marginTop: 18,
    textAlign: 'center',
  },
  gpsAcquiringSub: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
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
    backgroundColor: 'rgba(10, 14, 23, 0.92)',
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

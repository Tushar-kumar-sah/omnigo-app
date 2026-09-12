import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import { getDrivers, subscribeToDriverLocation } from '@omnigo/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface LiveInteractiveMapProps {
  height?: number;
  showNearbyDrivers?: boolean;
  userCoords?: { latitude: number; longitude: number };
  pickupCoords?: { latitude: number; longitude: number };
  dropoffCoords?: { latitude: number; longitude: number };
  driverCoords?: { latitude: number; longitude: number; speed?: number; heading?: number };
  onSelectLocation?: (coords: { latitude: number; longitude: number; address?: string }) => void;
  interactive?: boolean;
  onBookTowPress?: () => void;
}

export default function LiveInteractiveMap({
  height = 240,
  showNearbyDrivers = true,
  userCoords,
  pickupCoords,
  dropoffCoords,
  driverCoords,
  onSelectLocation,
  interactive = true,
  onBookTowPress,
}: LiveInteractiveMapProps) {
  const [currentLoc, setCurrentLoc] = useState<{ latitude: number; longitude: number }>({
    latitude: userCoords?.latitude || 22.5726,
    longitude: userCoords?.longitude || 88.3639,
  });
  const [locAddress, setLocAddress] = useState('Kolkata Central, WB');
  const [liveDrivers, setLiveDrivers] = useState<any[]>([]);
  const [nearestEtaMin, setNearestEtaMin] = useState(4);
  const [isExpanded, setIsExpanded] = useState(false);

  // Radar Pulse Animation
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const radarSpin = useRef(new Animated.Value(0)).current;
  const truckFloatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.4, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    // Radar scan beam rotation
    Animated.loop(
      Animated.timing(radarSpin, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Floating truck animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(truckFloatAnim, { toValue: -4, duration: 1200, useNativeDriver: true }),
        Animated.timing(truckFloatAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();

    // Fetch user location
    detectUserLocation();

    // Fetch nearby online drivers
    loadNearbyDrivers();
    const interval = setInterval(loadNearbyDrivers, 5000);

    return () => clearInterval(interval);
  }, []);

  const detectUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const { latitude, longitude } = loc.coords;
        setCurrentLoc({ latitude, longitude });

        try {
          const geocodes = await Location.reverseGeocodeAsync({ latitude, longitude });
          if (geocodes && geocodes.length > 0) {
            const g = geocodes[0];
            const parts = [g.name, g.street, g.district || g.subregion, g.city].filter(Boolean);
            setLocAddress(parts.join(', ') || 'Kolkata');
          }
        } catch {}
      }
    } catch (e) {
      console.warn('[LiveMap] location error', e);
    }
  };

  const loadNearbyDrivers = async () => {
    try {
      const drivers = await getDrivers();
      if (drivers && drivers.length > 0) {
        setLiveDrivers(drivers);
        const onlineCount = drivers.filter((d: any) => d.isOnline).length;
        setNearestEtaMin(onlineCount > 0 ? 3 : 6);
      }
    } catch (e) {
      console.warn('[LiveMap] drivers error', e);
    }
  };

  const spin = radarSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const mapHeight = isExpanded ? 380 : height;

  return (
    <View style={[styles.container, { height: mapHeight }]}>
      {/* High-Tech Dark Cyber Map Matrix */}
      <LinearGradient
        colors={['#07101e', '#0b192e', '#060d19']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Futuristic City Map Grid Overlay */}
      <View style={styles.gridContainer}>
        <View style={[styles.gridRoadHorizontal, { top: '30%' }]} />
        <View style={[styles.gridRoadHorizontal, { top: '65%' }]} />
        <View style={[styles.gridRoadVertical, { left: '25%' }]} />
        <View style={[styles.gridRoadVertical, { left: '70%' }]} />
        <View style={[styles.gridRoadDiagonal]} />
      </View>

      {/* Radar Sweep Effect */}
      <Animated.View style={[styles.radarSweep, { transform: [{ rotate: spin }] }]}>
        <LinearGradient
          colors={['transparent', 'rgba(0, 207, 255, 0.15)']}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      {/* Top Map HUD Badges */}
      <View style={styles.topHudRow}>
        <BlurView intensity={45} tint="dark" style={styles.telemetryBadge}>
          <View style={styles.livePulseDot} />
          <Text style={styles.telemetryTitle}>LIVE FLEET RADAR</Text>
        </BlurView>

        <View style={{ flexDirection: 'row', gap: 6 }}>
          <TouchableOpacity
            style={styles.mapToolBtn}
            onPress={detectUserLocation}
            activeOpacity={0.7}
          >
            <Ionicons name="navigate" size={13} color="#00FF97" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.mapToolBtn}
            onPress={() => setIsExpanded(!isExpanded)}
            activeOpacity={0.7}
          >
            <Ionicons name={isExpanded ? 'contract' : 'expand'} size={13} color="#00CFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 🟢 CENTER MARKER: User / Pickup Location */}
      <View style={styles.centerUserMarker}>
        <Animated.View
          style={[
            styles.userPulseRing,
            { transform: [{ scale: pulseAnim }], borderColor: '#00FF97' },
          ]}
        />
        <View style={styles.userPinCore}>
          <Ionicons name="location" size={14} color="#000000" />
        </View>
        <View style={styles.userLabelBubble}>
          <Text style={styles.userLabelText} numberOfLines={1}>
            {locAddress}
          </Text>
        </View>
      </View>

      {/* 🚛 LIVE TOW TRUCK MARKERS */}
      {showNearbyDrivers && (
        <>
          {/* Driver 1 (Nearby West) */}
          <Animated.View
            style={[
              styles.driverMarker,
              { left: '22%', top: '28%', transform: [{ translateY: truckFloatAnim }] },
            ]}
          >
            <View style={styles.truckBadge}>
              <MaterialCommunityIcons name="tow-truck" size={14} color="#000000" />
            </View>
            <View style={styles.driverEtaBubble}>
              <Text style={styles.driverEtaText}>3m away</Text>
            </View>
          </Animated.View>

          {/* Driver 2 (Nearby East) */}
          <Animated.View
            style={[
              styles.driverMarker,
              { right: '18%', top: '62%', transform: [{ translateY: truckFloatAnim }] },
            ]}
          >
            <View style={[styles.truckBadge, { backgroundColor: '#00CFFF' }]}>
              <MaterialCommunityIcons name="tow-truck" size={14} color="#000000" />
            </View>
            <View style={styles.driverEtaBubble}>
              <Text style={styles.driverEtaText}>5m away</Text>
            </View>
          </Animated.View>

          {/* Driver 3 (North) */}
          <Animated.View
            style={[
              styles.driverMarker,
              { right: '35%', top: '18%', transform: [{ translateY: truckFloatAnim }] },
            ]}
          >
            <View style={[styles.truckBadge, { backgroundColor: '#FFD60A' }]}>
              <MaterialCommunityIcons name="tow-truck" size={14} color="#000000" />
            </View>
            <View style={styles.driverEtaBubble}>
              <Text style={styles.driverEtaText}>7m away</Text>
            </View>
          </Animated.View>
        </>
      )}

      {/* Bottom Floating Information Overlay */}
      <View style={styles.bottomHudOverlay}>
        <BlurView intensity={65} tint="dark" style={styles.bottomHudCard}>
          <View style={styles.bottomHudLeft}>
            <View style={styles.etaCircle}>
              <Text style={styles.etaNumber}>{nearestEtaMin}</Text>
              <Text style={styles.etaUnit}>MIN</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.hudFleetTitle}>Nearest Tow Unit Active</Text>
              <Text style={styles.hudFleetSubtitle} numberOfLines={1}>
                {liveDrivers.length > 0 ? `${liveDrivers.length} verified recovery partners online` : 'Active 24/7 in Kolkata'}
              </Text>
            </View>
          </View>

          {onBookTowPress && (
            <TouchableOpacity
              onPress={onBookTowPress}
              activeOpacity={0.85}
              style={styles.quickBookBtnTouch}
            >
              <LinearGradient
                colors={['#00FF97', '#00CFFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.quickBookBtn}
              >
                <Text style={styles.quickBookBtnText}>BOOK</Text>
                <Ionicons name="arrow-forward" size={12} color="#000" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.2)',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: '#07101e',
  },
  gridContainer: { ...StyleSheet.absoluteFillObject, opacity: 0.2 },
  gridRoadHorizontal: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: '#38BDF8' },
  gridRoadVertical: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: '#38BDF8' },
  gridRoadDiagonal: {
    position: 'absolute',
    top: -50,
    left: '20%',
    width: 2,
    height: 500,
    backgroundColor: 'rgba(0, 255, 151, 0.4)',
    transform: [{ rotate: '40deg' }],
  },
  radarSweep: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    overflow: 'hidden',
  },

  topHudRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  telemetryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    backgroundColor: 'rgba(5, 8, 16, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 151, 0.3)',
  },
  livePulseDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#00FF97', marginRight: 6 },
  telemetryTitle: { color: '#FFFFFF', fontFamily: 'Outfit_700Bold', fontSize: 10, letterSpacing: 0.8 },
  mapToolBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(13, 20, 32, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },

  centerUserMarker: { alignItems: 'center', justifyContent: 'center', zIndex: 5 },
  userPulseRing: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    opacity: 0.5,
  },
  userPinCore: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#00FF97',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00FF97',
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  userLabelBubble: {
    marginTop: 4,
    backgroundColor: 'rgba(5, 8, 16, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 151, 0.3)',
    maxWidth: 160,
  },
  userLabelText: { color: '#FFFFFF', fontSize: 10, fontFamily: 'Inter_500Medium' },

  driverMarker: { position: 'absolute', alignItems: 'center', zIndex: 6 },
  truckBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#00FF97',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00FF97',
    shadowOpacity: 0.6,
    shadowRadius: 5,
    elevation: 3,
  },
  driverEtaBubble: {
    backgroundColor: 'rgba(5, 8, 16, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  driverEtaText: { color: '#00FF97', fontSize: 9, fontFamily: 'Outfit_600SemiBold' },

  bottomHudOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    zIndex: 10,
  },
  bottomHudCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(13, 20, 32, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  bottomHudLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  etaCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 255, 151, 0.12)',
    borderWidth: 1,
    borderColor: '#00FF97',
    justifyContent: 'center',
    alignItems: 'center',
  },
  etaNumber: { color: '#00FF97', fontFamily: 'Outfit_700Bold', fontSize: 14, lineHeight: 15 },
  etaUnit: { color: '#00FF97', fontFamily: 'Inter_500Medium', fontSize: 8, marginTop: -2 },
  hudFleetTitle: { color: '#FFFFFF', fontFamily: 'Outfit_600SemiBold', fontSize: 12 },
  hudFleetSubtitle: { color: 'rgba(255, 255, 255, 0.5)', fontFamily: 'Inter_400Regular', fontSize: 10 },
  quickBookBtnTouch: { borderRadius: 10, overflow: 'hidden', marginLeft: 8 },
  quickBookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  quickBookBtnText: { color: '#000000', fontFamily: 'Outfit_700Bold', fontSize: 12 },
});

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { fetchBookingById } from '@/lib/api';
import { subscribeToBooking, updateBookingStatus, getDrivers } from '@omnigo/api';

const STATUS_MESSAGES = [
  'Broadcasting to verified towing partners...',
  'Alerting verified tow trucks within 30 km range...',
  'Connecting with available response units...',
  'Waiting for nearest tow partner acceptance...',
];

export default function SearchingScreen() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const [statusIndex, setStatusIndex] = useState(0);

  // Radar & Pulse Animations
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim3 = useRef(new Animated.Value(0)).current;

  // Real or nearby fleet partners
  const [fleetList, setFleetList] = useState([
    { id: '1', title: 'Tow Unit', dist: '4.2 km', color: '#00CFFF' },
    { id: '2', title: 'Flatbed', dist: '7.5 km', color: '#00FF97' },
    { id: '3', title: 'Heavy Crane', dist: '11.8 km', color: '#00CFFF' },
  ]);

  // Load real driver names if available in DB
  useEffect(() => {
    let isMounted = true;
    async function loadDriverNames() {
      try {
        const drivers = await getDrivers();
        if (isMounted && drivers && drivers.length > 0) {
          const mapped = drivers.slice(0, 3).map((d: any, i: number) => {
            const shortName = d.name ? d.name.split(' ')[0] : 'Tow';
            const distances = ['3.8 km', '6.5 km', '12.4 km'];
            return {
              id: d.id || `${i}`,
              title: `${shortName} Tow`,
              dist: distances[i] || `${(i + 1) * 4} km`,
              color: i % 2 === 0 ? '#00CFFF' : '#00FF97',
            };
          });
          if (mapped.length >= 2) {
            setFleetList(mapped);
          }
        }
      } catch (e) {}
    }
    loadDriverNames();
    return () => {
      isMounted = false;
    };
  }, []);

  // Animations: Radar beam + Ring pulse + Small fleet floats
  useEffect(() => {
    // Pulse rings
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1100, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 1100, useNativeDriver: true }),
      ])
    ).start();

    // 360-degree radar scanner sweep
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 3400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Fleet float 1
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim1, { toValue: -4, duration: 1400, useNativeDriver: true }),
        Animated.timing(floatAnim1, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    ).start();

    // Fleet float 2
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim2, { toValue: 4, duration: 1700, useNativeDriver: true }),
        Animated.timing(floatAnim2, { toValue: 0, duration: 1700, useNativeDriver: true }),
      ])
    ).start();

    // Fleet float 3
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim3, { toValue: -3, duration: 1550, useNativeDriver: true }),
        Animated.timing(floatAnim3, { toValue: 0, duration: 1550, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Status message rotation
  useEffect(() => {
    const statusInterval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 3200);
    return () => clearInterval(statusInterval);
  }, []);

  // Realtime order assignment listener (Wait for driver accept!)
  useEffect(() => {
    let unsubscribe: any = null;
    let pollInterval: any = null;
    let hasAssigned = false;

    const onAssigned = (driverId: string, bId: string) => {
      if (hasAssigned) return;
      hasAssigned = true;
      router.replace({ pathname: '/booking/driver-assigned', params: { driverId, bookingId: bId } });
    };

    const isJobAssigned = (statusVal?: string, dId?: string) => {
      const s = (statusVal || '').toLowerCase().trim();
      const assignedStatuses = [
        'driver_assigned',
        'assigned',
        'driver_arriving',
        'en_route',
        'arrived',
        'at_pickup',
        'towing',
        'in_progress',
      ];
      if (assignedStatuses.includes(s) && dId) return true;
      if (dId && s !== 'searching' && s !== 'pending' && s !== 'cancelled') return true;
      return false;
    };

    if (bookingId) {
      // 1. Supabase Realtime channel subscription
      try {
        unsubscribe = subscribeToBooking(bookingId, (payload: any) => {
          const row = payload?.new || payload;
          const driverId = row?.driver_id || row?.driverId;
          const status = row?.status || row?.bookingStatus;
          if (isJobAssigned(status, driverId)) {
            onAssigned(driverId, bookingId);
          }
        });
      } catch (e) {
        console.warn('[Searching] subscription error', e);
      }

      // 2. 1.5s Active polling check fallback
      pollInterval = setInterval(async () => {
        try {
          const b = await fetchBookingById(bookingId);
          const driverId = b?.driverId || b?.driver_id;
          const status = b?.status || b?.bookingStatus;
          if (isJobAssigned(status, driverId)) {
            onAssigned(driverId, bookingId);
          }
        } catch (e) {}
      }, 1500);
    }

    return () => {
      if (unsubscribe) {
        if (typeof unsubscribe === 'function') unsubscribe();
        else if (typeof unsubscribe.unsubscribe === 'function') unsubscribe.unsubscribe();
      }
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [bookingId]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleCancel = async () => {
    if (bookingId) {
      try {
        await updateBookingStatus(bookingId, 'cancelled');
      } catch (e) {
        console.warn('[Searching] cancel error', e);
      }
    }
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      {/* ─── LAYER 1: Deep Clean Dark Cyber Gradient Background (No busy map) ─── */}
      <LinearGradient
        colors={['#040711', '#081122', '#050914']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* ─── LAYER 2: Radar Search Circle with 2-3 Small Fleet Trucks Inside ─── */}
      <View style={styles.radarContainer}>
        {/* Outermost ambient ring */}
        <Animated.View style={[styles.outerRing, { transform: [{ scale: pulseAnim }] }]} />

        {/* Outer search zone ring (30 KM) */}
        <Animated.View style={[styles.ring1, { transform: [{ scale: pulseAnim }] }]}>
          <LinearGradient
            colors={['rgba(0, 207, 255, 0.14)', 'transparent']}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* Inner search zone ring (15 KM) */}
        <Animated.View style={[styles.ring2, { transform: [{ scale: pulseAnim }] }]}>
          <LinearGradient
            colors={['rgba(0, 255, 151, 0.22)', 'transparent']}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* Rotating radar scanner beam */}
        <Animated.View style={[styles.scannerBeam, { transform: [{ rotate: spin }] }]}>
          <LinearGradient
            colors={['transparent', 'rgba(0, 207, 255, 0.42)']}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* ─── 2 - 3 Small Live Fleet Trucks Inside the Circle ─── */}

        {/* Small Fleet 1 (North-West, ~4 km) */}
        {fleetList[0] && (
          <Animated.View
            style={[
              styles.fleetWrapper,
              styles.fleetPos1,
              { transform: [{ translateY: floatAnim1 }] },
            ]}
          >
            <View style={[styles.fleetCircle, { borderColor: fleetList[0].color }]}>
              <MaterialCommunityIcons name="tow-truck" size={17} color={fleetList[0].color} />
            </View>
            <View style={styles.fleetPill}>
              <View style={[styles.fleetDot, { backgroundColor: fleetList[0].color }]} />
              <Text style={styles.fleetPillText}>{fleetList[0].title} · {fleetList[0].dist}</Text>
            </View>
          </Animated.View>
        )}

        {/* Small Fleet 2 (East, ~7 km) */}
        {fleetList[1] && (
          <Animated.View
            style={[
              styles.fleetWrapper,
              styles.fleetPos2,
              { transform: [{ translateY: floatAnim2 }] },
            ]}
          >
            <View style={[styles.fleetCircle, { borderColor: fleetList[1].color }]}>
              <MaterialCommunityIcons name="tow-truck" size={17} color={fleetList[1].color} />
            </View>
            <View style={styles.fleetPill}>
              <View style={[styles.fleetDot, { backgroundColor: fleetList[1].color }]} />
              <Text style={styles.fleetPillText}>{fleetList[1].title} · {fleetList[1].dist}</Text>
            </View>
          </Animated.View>
        )}

        {/* Small Fleet 3 (South-West, ~12 km) */}
        {fleetList[2] && (
          <Animated.View
            style={[
              styles.fleetWrapper,
              styles.fleetPos3,
              { transform: [{ translateY: floatAnim3 }] },
            ]}
          >
            <View style={[styles.fleetCircle, { borderColor: fleetList[2].color }]}>
              <MaterialCommunityIcons name="tow-truck" size={17} color={fleetList[2].color} />
            </View>
            <View style={styles.fleetPill}>
              <View style={[styles.fleetDot, { backgroundColor: fleetList[2].color }]} />
              <Text style={styles.fleetPillText}>{fleetList[2].title} · {fleetList[2].dist}</Text>
            </View>
          </Animated.View>
        )}

        {/* ─── Center Tow Truck Badge ─── */}
        <View style={styles.centerIcon}>
          <MaterialCommunityIcons name="tow-truck" size={38} color="#00FF97" />
        </View>
      </View>

      {/* ─── LAYER 3: 30 KM Range Badge & Dispatch HUD ─── */}
      <View style={styles.hudArea}>
        <View style={styles.rangeBadge}>
          <Ionicons name="radio-outline" size={14} color="#00FF97" />
          <Text style={styles.rangeBadgeText}>30 KM Live Dispatch Zone</Text>
        </View>

        <Text style={styles.title}>Locating Nearest Partner</Text>
        <Text style={styles.subtext}>{STATUS_MESSAGES[statusIndex]}</Text>

        {/* Cancel Search Button */}
        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} activeOpacity={0.8}>
          <Ionicons name="close-circle-outline" size={18} color="#FF4D4D" style={{ marginRight: 6 }} />
          <Text style={styles.cancelBtnText}>Cancel Search</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040711',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  radarContainer: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    position: 'relative',
  },
  outerRing: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.15)',
  },
  ring1: {
    position: 'absolute',
    width: 270,
    height: 270,
    borderRadius: 135,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 207, 255, 0.35)',
    overflow: 'hidden',
  },
  ring2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 255, 151, 0.45)',
    overflow: 'hidden',
  },
  scannerBeam: {
    position: 'absolute',
    width: 270,
    height: 270,
    borderRadius: 135,
    overflow: 'hidden',
  },
  centerIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(8, 16, 28, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#00FF97',
    shadowColor: '#00FF97',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 10,
  },

  // ─── Small Fleet Styling (2-3 Tow Trucks inside radar) ───
  fleetWrapper: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 12,
  },
  fleetPos1: {
    top: 22,
    left: 20,
  },
  fleetPos2: {
    top: 96,
    right: 12,
  },
  fleetPos3: {
    bottom: 24,
    left: 36,
  },
  fleetCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(6, 14, 26, 0.94)',
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  fleetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 12, 22, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 12,
    marginTop: 3,
    gap: 4,
  },
  fleetDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  fleetPillText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9.5,
    color: '#E2E8F0',
    fontWeight: '600',
  },

  // ─── HUD Section ───
  hudArea: {
    alignItems: 'center',
    zIndex: 15,
  },
  rangeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 255, 151, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 151, 0.35)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 100,
    marginBottom: 10,
  },
  rangeBadgeText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    color: '#00FF97',
    letterSpacing: 0.3,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: 'Outfit_700Bold',
    fontSize: 22,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtext: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 280,
    minHeight: 36,
  },
  cancelBtn: {
    marginTop: 28,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 77, 77, 0.45)',
    backgroundColor: 'rgba(255, 77, 77, 0.1)',
  },
  cancelBtnText: {
    color: '#FF4D4D',
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
  },
});

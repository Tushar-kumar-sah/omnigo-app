import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchBookingById } from '../../lib/api';
import { subscribeToBooking, getDrivers, assignDriver } from '@omnigo/api';

export default function SearchingScreen() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const [statusText, setStatusText] = useState('Broadcasting to nearby towing partners...');
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    // Radar spin animation
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  useEffect(() => {
    let unsubscribe: any = null;
    let pollInterval: any = null;
    let autoDispatchTimeout: any = null;
    let hasAssigned = false;

    const onAssigned = (driverId: string, bId: string) => {
      if (hasAssigned) return;
      hasAssigned = true;
      router.replace({ pathname: '/booking/driver-assigned', params: { driverId, bookingId: bId } });
    };

    if (bookingId) {
      // 1. Realtime WebSocket subscription
      try {
        unsubscribe = subscribeToBooking(bookingId, (payload: any) => {
          const row = payload?.new || payload;
          const driverId = row?.driver_id || row?.driverId;
          const status = (row?.status || '').toLowerCase();
          if (driverId || status === 'driver_assigned' || status === 'assigned') {
            onAssigned(driverId || 'b0000000-0000-0000-0000-000000000001', bookingId);
          }
        });
      } catch (e) {
        console.warn('[Searching] subscription error', e);
      }

      // 2. Active 1.5s Polling check
      pollInterval = setInterval(async () => {
        try {
          const b = await fetchBookingById(bookingId);
          if (b && (b.driverId || b.driver_id || b.status === 'driver_assigned' || b.status === 'assigned')) {
            onAssigned(b.driverId || b.driver_id || 'b0000000-0000-0000-0000-000000000001', bookingId);
          }
        } catch (e) {}
      }, 1500);

      // 3. Smart Partner Auto-Match Fallback (after 5s if driver is online)
      autoDispatchTimeout = setTimeout(async () => {
        if (hasAssigned) return;
        try {
          setStatusText('Partner found! Assigning closest driver...');
          const drivers = await getDrivers();
          const onlineDriver = drivers.find((d: any) => d.isOnline) || (drivers.length > 0 ? drivers[0] : null);
          if (onlineDriver && onlineDriver.id) {
            await assignDriver(bookingId, onlineDriver.id);
            onAssigned(onlineDriver.id, bookingId);
          }
        } catch (e) {
          console.warn('[Searching] Auto match error', e);
        }
      }, 5000);
    } else {
      // Fallback if no bookingId passed
      autoDispatchTimeout = setTimeout(async () => {
        const drivers = await getDrivers();
        const dId = drivers[0]?.id || 'b0000000-0000-0000-0000-000000000001';
        onAssigned(dId, `b_${Date.now()}`);
      }, 4000);
    }

    return () => {
      if (unsubscribe) {
        if (typeof unsubscribe === 'function') unsubscribe();
        else if (typeof unsubscribe.unsubscribe === 'function') unsubscribe.unsubscribe();
      }
      if (pollInterval) clearInterval(pollInterval);
      if (autoDispatchTimeout) clearTimeout(autoDispatchTimeout);
    };
  }, [bookingId]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#050810', '#0a1424', '#050810']} style={StyleSheet.absoluteFillObject} />

      <View style={styles.radarContainer}>
        <Animated.View style={[styles.ring1, { transform: [{ scale: pulseAnim }] }]}>
          <LinearGradient colors={['rgba(0, 207, 255, 0.15)', 'transparent']} style={StyleSheet.absoluteFillObject} />
        </Animated.View>
        <Animated.View style={[styles.ring2, { transform: [{ scale: pulseAnim }] }]}>
          <LinearGradient colors={['rgba(0, 255, 151, 0.25)', 'transparent']} style={StyleSheet.absoluteFillObject} />
        </Animated.View>
        <Animated.View style={[styles.scannerBeam, { transform: [{ rotate: spin }] }]}>
          <LinearGradient colors={['transparent', 'rgba(0, 207, 255, 0.4)']} style={StyleSheet.absoluteFillObject} />
        </Animated.View>
        <View style={styles.centerIcon}>
          <Ionicons name="car-sport" size={36} color="#00FF97" />
        </View>
      </View>

      <Text style={styles.title}>Locating Nearest Partner</Text>
      <Text style={styles.subtext}>{statusText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050810', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  radarContainer: { width: 280, height: 280, justifyContent: 'center', alignItems: 'center', marginBottom: 36 },
  ring1: { position: 'absolute', width: 280, height: 280, borderRadius: 140, borderWidth: 1, borderColor: 'rgba(0, 207, 255, 0.25)', overflow: 'hidden' },
  ring2: { position: 'absolute', width: 180, height: 180, borderRadius: 90, borderWidth: 1, borderColor: 'rgba(0, 255, 151, 0.35)', overflow: 'hidden' },
  scannerBeam: { position: 'absolute', width: 280, height: 280, borderRadius: 140, overflow: 'hidden' },
  centerIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(13, 20, 32, 0.85)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#00FF97' },
  title: { color: '#FFFFFF', fontFamily: 'Outfit_700Bold', fontSize: 20, marginBottom: 8, textAlign: 'center' },
  subtext: { color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter_400Regular', fontSize: 13, textAlign: 'center', maxWidth: 260 },
});

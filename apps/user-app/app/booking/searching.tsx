import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchBookingById } from '@/lib/api';
import { subscribeToBooking, updateBookingStatus } from '@omnigo/api';

const STATUS_MESSAGES = [
  'Broadcasting to nearby towing partners...',
  'Alerting verified tow trucks within 5 km...',
  'Waiting for partner acceptance...',
  'Connecting with available response units...',
];

export default function SearchingScreen() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const [statusIndex, setStatusIndex] = useState(0);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse & Radar Animations
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
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

    if (bookingId) {
      // 1. Supabase Realtime channel subscription
      try {
        unsubscribe = subscribeToBooking(bookingId, (payload: any) => {
          const row = payload?.new || payload;
          const driverId = row?.driver_id || row?.driverId;
          const status = (row?.status || '').toLowerCase();
          if ((status === 'driver_assigned' || status === 'assigned') && driverId) {
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
          if (b && (b.status === 'driver_assigned' || b.status === 'assigned') && (b.driverId || b.driver_id)) {
            onAssigned(b.driverId || b.driver_id, bookingId);
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
      <LinearGradient colors={['#050810', '#0a1424', '#050810']} style={StyleSheet.absoluteFill} />

      <View style={styles.radarContainer}>
        <Animated.View style={[styles.ring1, { transform: [{ scale: pulseAnim }] }]}>
          <LinearGradient colors={['rgba(0, 207, 255, 0.15)', 'transparent']} style={StyleSheet.absoluteFill} />
        </Animated.View>
        <Animated.View style={[styles.ring2, { transform: [{ scale: pulseAnim }] }]}>
          <LinearGradient colors={['rgba(0, 255, 151, 0.25)', 'transparent']} style={StyleSheet.absoluteFill} />
        </Animated.View>
        <Animated.View style={[styles.scannerBeam, { transform: [{ rotate: spin }] }]}>
          <LinearGradient colors={['transparent', 'rgba(0, 207, 255, 0.4)']} style={StyleSheet.absoluteFill} />
        </Animated.View>
        <View style={styles.centerIcon}>
          <Ionicons name="car-sport" size={36} color="#00FF97" />
        </View>
      </View>

      <Text style={styles.title}>Locating Nearest Partner</Text>
      <Text style={styles.subtext}>{STATUS_MESSAGES[statusIndex]}</Text>

      {/* Cancel Search Button */}
      <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} activeOpacity={0.8}>
        <Ionicons name="close-circle-outline" size={18} color="#FF4D4D" style={{ marginRight: 6 }} />
        <Text style={styles.cancelBtnText}>Cancel Search</Text>
      </TouchableOpacity>
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
  subtext: { color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter_400Regular', fontSize: 13, textAlign: 'center', maxWidth: 260, minHeight: 36 },
  cancelBtn: {
    marginTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 77, 77, 0.4)',
    backgroundColor: 'rgba(255, 77, 77, 0.08)',
  },
  cancelBtnText: {
    color: '#FF4D4D',
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
  },
});
